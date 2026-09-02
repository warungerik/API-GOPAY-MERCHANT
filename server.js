import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import GoPayMerchant, { getGoPayWatcher } from './gobiz.js';
import {
  saveOrder,
  getOrderById,
  getPendingOrders,
  markOrderAsPaid,
  isTxIdUsed,
  markOrderAsExpired,
  markOrderAsCancelled,
  searchOrders,
  getStats,
  getUserByEmail,
  getUserById,
  createUser,
  getMerchantSettings,
  cleanupOldRecords
} from './db.js';
import authRoutes from './routes/authRoutes.js';
import merchantRoutes from './routes/merchantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { authenticateMerchantApiKey } from './middleware/auth.js';
import { dispatchWebhookNotification } from './services/webhookService.js';
import { sendTelegramNotification } from './services/telegramService.js';
import { setupAdminTelegramWebhook, processAdminTelegramUpdate } from './services/adminTelegramBotService.js';

dotenv.config();

async function seedAdminAccount() {
  try {
    const adminEmail = 'admin@example.com';
    const existing = await getUserByEmail(adminEmail);
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('admin123', salt);
      await createUser({
        name: 'Admin Gateway',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN'
      });
      console.log('[SupabaseDB] Admin account seeded: admin@example.com / admin123');
    }
  } catch (e) {
    console.warn('[SupabaseDB] Admin seed notice:', e.message);
  }
}
seedAdminAccount();

cleanupOldRecords(3);
setInterval(() => {
  cleanupOldRecords(3);
}, 6 * 60 * 60 * 1000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_SECRET_KEY = process.env.API_SECRET_KEY || process.env.API_KEY || null;

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const rateLimitStore = new Map();

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
    } else {
      record.count += 1;
    }

    rateLimitStore.set(key, record);

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message
      });
    }

    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

app.use('/api/v1/auth/login', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Terlalu banyak percobaan login gagal. Silakan tunggu 15 menit.' }));
app.use('/api/v1/auth/register', createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Terlalu banyak pendaftaran dari IP ini. Silakan tunggu 15 menit.' }));
app.use(['/api/checkout', '/api/v1/checkout'], createRateLimiter({ windowMs: 1 * 60 * 1000, max: 60, message: 'Batas frekuensi pembuatan tagihan terlampaui (maks 60/menit).' }));

const nuxtOutputDir = path.join(__dirname, '.output', 'public');
if (fs.existsSync(nuxtOutputDir)) {
  app.use(express.static(nuxtOutputDir));
  console.log('[Nuxt 3 Engine] Serving Nuxt 3 frontend from .output/public');
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/v1/admin', adminRoutes);

const ordersDB = new Map();
const ORDERS_FILE = path.join(__dirname, '.orders_cache.json');

async function saveOrders(specificOrder) {
  try {
    if (specificOrder) {
      ordersDB.set(specificOrder.orderId, specificOrder);
      await saveOrder(specificOrder);
    } else {
      for (const order of ordersDB.values()) {
        await saveOrder(order);
      }
    }
  } catch (e) {
    console.warn('[SupabaseDB] Failed to save order:', e.message);
  }
}

async function loadOrders() {
  try {

    if (fs.existsSync(ORDERS_FILE)) {
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const obj = JSON.parse(raw);
      let count = 0;
      for (const [id, data] of Object.entries(obj)) {
        await saveOrder(data);
        ordersDB.set(id, data);
        count++;
      }
      console.log(`[SupabaseDB] Migrated ${count} legacy orders from JSON cache to Supabase.`);
    }

    const activeOrders = await getPendingOrders();
    for (const order of activeOrders) {
      ordersDB.set(order.orderId, order);
    }
    console.log(`[SupabaseDB] Loaded ${activeOrders.length} pending orders into memory engine.`);
  } catch (e) {
    console.warn('[SupabaseDB] Failed to initialize Supabase orders:', e.message);
  }
}

loadOrders();
const merchant = new GoPayMerchant();

async function isTxAlreadyMatched(txId) {
  if (!txId) return false;
  const strId = String(txId);
  for (const order of ordersDB.values()) {
    if (order.status === 'PAID' && String(order.txId) === strId) {
      return true;
    }
  }
  return await isTxIdUsed(strId);
}

function isAmountMatch(incomingAmount, targetTotal) {
  if (incomingAmount === undefined || incomingAmount === null) return false;
  const num = Number(incomingAmount);
  if (isNaN(num)) return false;

  if (Math.round(num) === targetTotal) return true;
  if (Math.round(num / 100) === targetTotal) return true;

  return false;
}

function getBaseUrl(req) {
  if (process.env.APP_URL && process.env.APP_URL.trim() !== '' && !process.env.APP_URL.includes('localhost')) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (!req) return `http://localhost:${PORT}`;
  const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
  const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

function generateUniqueCode(baseAmount, feeAmount = 0, feeBearer = 'CUSTOMER') {
  const activeTotals = new Set();
  const now = new Date();

  for (const order of ordersDB.values()) {
    if (order.status === 'PENDING' && now < new Date(order.expiredAt)) {
      activeTotals.add(order.totalAmount);
    }
  }

  const feeAdd = feeBearer === 'CUSTOMER' ? feeAmount : 0;

  let uniqueCode;
  let attempts = 0;
  do {

    uniqueCode = Math.floor(100 + Math.random() * 401);
    attempts++;
    if (attempts > 350) {

      uniqueCode = Math.floor(501 + Math.random() * 499);
      break;
    }
  } while (activeTotals.has(baseAmount + feeAdd + uniqueCode));

  return uniqueCode;
}

function generateDynamicQRIS(baseQris, amount) {
  let str = (baseQris || '').trim();
  const crcIndex = str.indexOf('6304');
  if (crcIndex !== -1) {
    str = str.substring(0, crcIndex);
  }

  const amountStr = Math.round(amount).toString();
  const amountLengthStr = amountStr.length.toString().padStart(2, '0');
  const tag54 = `54${amountLengthStr}${amountStr}`;

  const existing54Match = str.match(/54\d{2}\d+/);
  if (existing54Match) {
    str = str.replace(existing54Match[0], '');
  }

  if (str.includes('010211')) {
    str = str.replace('010211', '010212');
  }

  let insertPosition = str.indexOf('5802ID');
  if (insertPosition === -1) {
    insertPosition = str.indexOf('59');
  }

  if (insertPosition !== -1) {
    str = str.slice(0, insertPosition) + tag54 + str.slice(insertPosition);
  } else {
    str += tag54;
  }

  str += '6304';

  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    crc ^= (c << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return str + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

async function sendOrderPaidNotif(order) {
  const dateStr = order.paidAt
    ? new Date(order.paidAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  let merchantName = 'WARUNGERIK STORE';
  let mSettings = null;

  if (order.userId) {
    try {
      const u = await getUserById(order.userId);
      if (u && u.name) merchantName = u.name;
      mSettings = await getMerchantSettings(order.userId);
    } catch (e) {}
  }

  const text = `<b>[PEMBAYARAN BERHASIL]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>Merchant:</b> ${merchantName}
<b>Nominal:</b> Rp ${order.totalAmount.toLocaleString('id-ID')}
<i>(Asli: Rp ${order.baseAmount.toLocaleString('id-ID')} + Kode: ${order.uniqueCode})</i>

<b>Order ID:</b> <code>${order.orderId}</code>
<b>Pelanggan:</b> ${order.customerName || 'Customer'}
<b>Catatan:</b> ${order.note || '-'}
<b>Tx ID:</b> <code>${order.txId || '-'}</code>
<b>Waktu:</b> ${dateStr} WIB
<b>Status:</b> LUNAS
━━━━━━━━━━━━━━━━━━━━━━`;

  if (mSettings && mSettings.telegramNotifActive !== 0 && mSettings.telegramBotToken && mSettings.telegramChatId) {
    await sendTelegramNotification(text, mSettings.telegramBotToken, mSettings.telegramChatId);
  } else {
    await sendTelegramNotification(text);
  }
}

function sendStandalonePaymentNotif(amount, txId) {
  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const text = `<b>[UANG MASUK QRIS]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>Nominal:</b> Rp ${amount.toLocaleString('id-ID')}
<b>Tx ID:</b> <code>${txId || '-'}</code>
<b>Waktu:</b> ${dateStr} WIB
<b>Info:</b> Transaksi QRIS
━━━━━━━━━━━━━━━━━━━━━━`;

  sendTelegramNotification(text);
}

const watcher = getGoPayWatcher(5000);
watcher._listeners = 1;
watcher._startPoller();

watcher.on('payment', async (data) => {
  const incomingAmount = data.amount;
  let matched = false;
  const now = new Date();

  const candidateOrders = Array.from(ordersDB.values())
    .filter(order => {
      if (order.status !== 'PENDING') return false;
      if (now > new Date(order.expiredAt)) {
        order.status = 'EXPIRED';
        markOrderAsExpired(order.orderId).catch(() => {});
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  for (const order of candidateOrders) {
    if (isAmountMatch(incomingAmount, order.totalAmount)) {
      order.status = 'PAID';
      order.paidAt = new Date().toISOString();
      order.txId = data.txId;
      ordersDB.set(order.orderId, order);
      await markOrderAsPaid(order.orderId, data.txId, order.paidAt);
      console.log(`[Settlement Verified] Order ${order.orderId} (Rp ${order.totalAmount}) -> PAID`);
      sendOrderPaidNotif(order);
      await dispatchWebhookNotification(order);
      matched = true;
      break;
    }
  }

  if (!matched) {
    console.log(`[Standalone Payment] Rp ${incomingAmount} -> TxID: ${data.txId}`);
    sendStandalonePaymentNotif(incomingAmount, data.txId);
  }
});

async function handleCheckout(req, res) {
  try {
    const rawAmount = req.body.amount || req.query.amount;
    const amount = Number(rawAmount);

    if (!amount || isNaN(amount) || amount < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is Rp 1,000'
      });
    }

    const customerName = String(req.body.customerName || req.query.customerName || 'Customer')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 50);

    const note = String(req.body.note || req.query.note || 'Payment')
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 100);

    const userId = req.merchantUser?.id || 1;
    const mSettings = await getMerchantSettings(userId);

    const rawFeeBearer = String(req.body.fee_bearer || req.body.feeBearer || req.query.fee_bearer || mSettings.feeBearer || 'CUSTOMER').toUpperCase();
    const feeBearer = rawFeeBearer === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER';

    const baseAmount = Math.round(amount);
    const feePercent = 0.5;
    const feeAmount = Math.round(baseAmount * (feePercent / 100));
    const uniqueCode = generateUniqueCode(baseAmount, feeAmount, feeBearer);

    let totalAmount = baseAmount;
    let netAmount = baseAmount;

    if (feeBearer === 'CUSTOMER') {
      totalAmount = baseAmount + feeAmount + uniqueCode;
      netAmount = baseAmount;
    } else {
      totalAmount = baseAmount + uniqueCode;
      netAmount = Math.max(0, baseAmount - feeAmount);
    }

    const customOrderId = String(
      req.body.orderId || req.body.order_id || req.body.trx_id || req.body.invoice || req.body.invoice_id || req.body.id ||
      req.query.orderId || req.query.order_id || req.query.trx_id || req.query.invoice || ''
    ).trim();
    const orderId = customOrderId || `ORD-${Date.now()}-${uniqueCode}`;

    const baseQris = process.env.QRIS_STRING || `00020101021126610014COM.GO-JEK.WWW01189360091430534995150210G0534995150303UMI51440014ID.CO.QRIS.WWW0215ID10264959830290303UMI5204581253033605802ID5910MERCHANT6013JAKARTA61053468262070703A016304C7D7`;
    const dynamicQris = generateDynamicQRIS(baseQris, totalAmount);
    const qrCodeDataUrl = await QRCode.toDataURL(dynamicQris, { margin: 2, width: 360 });

    const baseUrl = getBaseUrl(req);
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    const orderData = {
      orderId,
      userId,
      baseAmount,
      uniqueCode,
      feeType: 'PERCENTAGE',
      feePercent: 0.7,
      feeAmount,
      feeBearer,
      totalAmount,
      netAmount,
      customerName,
      note,
      status: 'PENDING',
      dynamicQris,
      qrCodeDataUrl,
      paymentUrl: `${baseUrl}/pay/${orderId}`,
      createdAt: new Date().toISOString(),
      expiredAt: expiredAt.toISOString()
    };

    ordersDB.set(orderId, orderData);
    await saveOrders(orderData);
    console.log(`[Order Created] Merchant: #${userId} | ID: ${orderId} | Base: Rp ${baseAmount} | Unique: ${uniqueCode} | Fee: Rp ${feeAmount} (${feeBearer}) | Total: Rp ${totalAmount} | Net: Rp ${netAmount}`);

    return res.json({
      success: true,
      data: {
        orderId: orderData.orderId,
        userId: orderData.userId,
        baseAmount: orderData.baseAmount,
        uniqueCode: orderData.uniqueCode,
        feeType: orderData.feeType,
        feeAmount: orderData.feeAmount,
        feeBearer: orderData.feeBearer,
        totalAmount: orderData.totalAmount,
        netAmount: orderData.netAmount,
        status: orderData.status,
        paymentUrl: orderData.paymentUrl,
        qrCodeDataUrl: orderData.qrCodeDataUrl,
        expiredAt: orderData.expiredAt
      }
    });

  } catch (err) {
    console.error('[Checkout Error]', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

async function handleCheckStatus(req, res) {
  const { orderId } = req.params;

  let order = ordersDB.get(orderId) || (await getOrderById(orderId));

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  }

  if (order.status === 'PENDING') {
    if (new Date() > new Date(order.expiredAt)) {
      order.status = 'EXPIRED';
      ordersDB.set(orderId, order);
      await markOrderAsExpired(orderId);
    } else {
      try {
        const historyRes = await merchant.getHistory({ days: 1, size: 20 });
        if (historyRes?.status && Array.isArray(historyRes.data?.histories)) {
          const orderCreatedMs = new Date(order.createdAt).getTime() - 30000;

          for (const item of historyRes.data.histories) {
            const raw = item.raw || {};
            const txObj = raw.metadata?.transaction || raw;
            const rawAmount = txObj.gross_amount ?? raw.amount;
            const txId = txObj.transaction_id || txObj.id || raw.id || raw.order_id;
            const txTimeRaw = txObj.transaction_time || raw.time;

            if (txId && (await isTxAlreadyMatched(txId))) continue;

            if (txTimeRaw) {
              const txTimeMs = new Date(txTimeRaw).getTime();
              if (!isNaN(txTimeMs) && txTimeMs < orderCreatedMs) {
                continue;
              }
            }

            if (isAmountMatch(rawAmount, order.totalAmount)) {
              order.status = 'PAID';
              order.paidAt = txTimeRaw ? new Date(txTimeRaw).toISOString() : new Date().toISOString();
              order.txId = txId || `HISTORY-${Date.now()}`;
              ordersDB.set(orderId, order);
              await markOrderAsPaid(orderId, order.txId, order.paidAt);
              console.log(`[Instant Verified via Status API] ${orderId} (Rp ${order.totalAmount}) -> PAID`);
              sendOrderPaidNotif(order);
              await dispatchWebhookNotification(order);
              break;
            }
          }
        }
      } catch (err) {}
    }
  }

  return res.json({
    success: true,
    data: {
      orderId: order.orderId,
      userId: order.userId || 1,
      status: order.status,
      baseAmount: order.baseAmount,
      uniqueCode: order.uniqueCode,
      totalAmount: order.totalAmount,
      feeAmount: order.feeAmount || 0,
      feeBearer: order.feeBearer || 'CUSTOMER',
      netAmount: order.netAmount || order.baseAmount,
      customerName: order.customerName || 'Customer',
      note: order.note || '',
      paymentUrl: order.paymentUrl,
      txId: order.txId || null,
      createdAt: order.createdAt,
      paidAt: order.paidAt || null,
      expiredAt: order.expiredAt
    }
  });
}

app.post('/api/checkout', authenticateMerchantApiKey, handleCheckout);
app.get('/api/create-qris', authenticateMerchantApiKey, handleCheckout);
app.post('/api/v1/checkout', authenticateMerchantApiKey, handleCheckout);
app.get('/api/status/:orderId', handleCheckStatus);
app.get('/api/v1/order/:orderId', handleCheckStatus);

app.get('/api/transactions', async (req, res) => {
  const { q = '', status = '', limit = 50, offset = 0 } = req.query;
  const result = await searchOrders({ search: q, status, limit, offset });

  return res.json({
    success: true,
    data: result
  });
});

app.get('/api/stats', async (req, res) => {
  const stats = await getStats();
  return res.json({
    success: true,
    data: stats
  });
});

app.get('/api/transactions/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = await getOrderById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
  }

  return res.json({
    success: true,
    data: order
  });
});

async function handleCancelOrder(req, res) {
  const { orderId } = req.params;
  let order = ordersDB.get(orderId) || (await getOrderById(orderId));

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  }

  if (order.status === 'PAID') {
    return res.status(400).json({ success: false, message: 'Pesanan sudah lunas dan tidak dapat dibatalkan' });
  }

  order.status = 'CANCELLED';
  ordersDB.set(orderId, order);
  await markOrderAsCancelled(orderId);
  console.log(`[Order Cancelled] Order ${orderId} has been cancelled by user.`);

  return res.json({ success: true, message: 'Pesanan berhasil dibatalkan', status: 'CANCELLED' });
}

app.post('/api/cancel/:orderId', handleCancelOrder);
app.post('/api/v1/order/:orderId/cancel', handleCancelOrder);

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'api-docs.html'));
});

app.get('/cek-order', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cek-order.html'));
});

app.get('/riwayat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'riwayat.html'));
});

app.get('/robots.txt', (req, res) => {
  const file = path.join(__dirname, 'public', 'robots.txt');
  if (fs.existsSync(file)) return res.type('text/plain').sendFile(file);
  const nuxtFile = path.join(__dirname, '.output', 'public', 'robots.txt');
  if (fs.existsSync(nuxtFile)) return res.type('text/plain').sendFile(nuxtFile);
  return res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://pg.warungerik.com/sitemap.xml');
});

app.get('/sitemap.xml', (req, res) => {
  const file = path.join(__dirname, 'public', 'sitemap.xml');
  if (fs.existsSync(file)) return res.type('application/xml').sendFile(file);
  const nuxtFile = path.join(__dirname, '.output', 'public', 'sitemap.xml');
  if (fs.existsSync(nuxtFile)) return res.type('application/xml').sendFile(nuxtFile);
  return res.status(404).send('Sitemap not found');
});

app.get('/pay/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = ordersDB.get(orderId) || (await getOrderById(orderId));
  if (!order) {
    return res.status(404).send('<h2 style="font-family:sans-serif; text-align:center; padding:50px; color:#F3F4F6; background:#0B0F17; min-height:100vh; margin:0;">404 - Payment Session Expired or Not Found</h2>');
  }

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran QRIS - WARUNGERIK</title>
  <link rel="icon" type="image/png" href="/logo.png?v=2">
  <link rel="shortcut icon" href="/favicon.ico?v=2">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0B0F17;
      --panel: #131B2E;
      --border: rgba(255, 255, 255, 0.1);
      --primary: #00AED6;
      --green: #10B981;
      --text: #F3F4F6;
      --muted: #9CA3AF;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: var(--bg); color: var(--text); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
    .card { width: 100%; max-width: 440px; background: var(--panel); border: 1px solid var(--border); border-radius: 24px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 1.2rem; font-weight: 800; color: var(--primary); }
    .header p { font-size: 0.8rem; color: var(--muted); margin-top: 4px; }

    .breakdown { background: rgba(0, 174, 214, 0.1); border: 1px solid rgba(0, 174, 214, 0.3); border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 20px; }
    .total { font-size: 1.6rem; font-weight: 800; color: #fff; margin-top: 4px; }
    .unique-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); color: #FBBF24; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; margin-top: 6px; }

    .qr-frame { background: #fff; padding: 16px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    .qr-frame img { width: 100%; height: auto; display: block; border-radius: 8px; }
    .qris-brand { font-size: 0.75rem; font-weight: 800; color: #333; margin-top: 10px; }

    .status-bar { display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--muted); margin-bottom: 16px; min-height: 24px; text-align: center; }
    .spinner { width: 16px; height: 16px; border: 2px solid rgba(0, 174, 214, 0.3); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .action-buttons { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
    .btn-action { width: 100%; padding: 12px 16px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; text-decoration: none; }
    .btn-check { background: var(--primary); color: #fff; border: none; box-shadow: 0 4px 14px rgba(0, 174, 214, 0.3); }
    .btn-check:hover { filter: brightness(1.1); transform: translateY(-1px); }
    .btn-cancel { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #FCA5A5; }
    .btn-cancel:hover { background: rgba(239, 68, 68, 0.25); border-color: rgba(239, 68, 68, 0.5); }

    .success-box { text-align: center; padding: 20px 0; }
    .checkmark { width: 70px; height: 70px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); border: 2px solid var(--green); color: var(--green); font-size: 2.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 30px rgba(16,185,129,0.3); }
    .hidden { display: none !important; }
  </style>
</head>
<body>

  <div class="card">
    <div class="header">
      <img src="/logo.png?v=2" alt="WARUNGERIK" style="width:52px; height:52px; border-radius:50%; object-fit:cover; margin:0 auto 10px; border:2px solid #00AED6; box-shadow: 0 4px 12px rgba(0,174,214,0.3);">
      <h1>WARUNGERIK</h1>
      <p>Pembayaran QRIS Auto Engine</p>
    </div>

    <!-- PENDING VIEW -->
    <div id="pendingView" class="${order.status !== 'PENDING' ? 'hidden' : ''}">
      <div class="breakdown">
        <span style="font-size:0.75rem; color:var(--muted)">Transfer Tepat Sesuai Nominal (Termasuk Kode Unik):</span>
        <div class="total">Rp ${order.totalAmount.toLocaleString('id-ID')}</div>
        <div class="unique-badge">Nominal Asli: Rp ${order.baseAmount.toLocaleString('id-ID')} + Kode Unik: ${order.uniqueCode}</div>
      </div>

      <div class="qr-frame">
        <img src="${order.qrCodeDataUrl}" alt="QRIS WARUNGERIK">
        <div class="qris-brand">QRIS • WARUNGERIK</div>
      </div>

      <div class="status-bar">
        <div class="spinner" id="statusSpinner"></div>
        <span id="statusText">Mengecek pembayaran otomatis real-time...</span>
      </div>

      <div class="action-buttons">
        <button id="btnCheckStatus" class="btn-action btn-check">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          Cek Status Pembayaran
        </button>

        <button id="btnCancelOrder" class="btn-action btn-cancel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Batalkan Pesanan
        </button>
      </div>
    </div>

    <!-- SUCCESS VIEW -->
    <div id="successView" class="success-box ${order.status === 'PAID' ? '' : 'hidden'}">
      <div class="checkmark">✓</div>
      <h2 style="font-weight:800; font-size:1.3rem; margin-bottom:8px;">Pembayaran Berhasil!</h2>
      <p style="font-size:0.85rem; color:var(--muted)">Terima kasih, pembayaran sebesar <strong style="color:var(--green)">Rp ${order.totalAmount.toLocaleString('id-ID')}</strong> telah diterima oleh toko WARUNGERIK.</p>
    </div>

    <!-- CANCELLED VIEW -->
    <div id="cancelledView" class="success-box ${['CANCELLED', 'EXPIRED'].includes(order.status) ? '' : 'hidden'}">
      <div class="checkmark" style="background:rgba(239, 68, 68, 0.2); border-color:#EF4444; color:#EF4444; box-shadow:0 0 30px rgba(239, 68, 68, 0.3);">✕</div>
      <h2 style="font-weight:800; font-size:1.3rem; margin-bottom:8px; color:#FCA5A5;">Pesanan Dibatalkan</h2>
      <p style="font-size:0.85rem; color:var(--muted)">Tagihan pembayaran ini telah dibatalkan atau kadaluarsa.</p>
    </div>
  </div>

  <script>
    const orderId = '${order.orderId}';
    let initialStatus = '${order.status}';

    async function checkStatus(isManual = false) {
      try {
        const statusText = document.getElementById('statusText');
        if (isManual && statusText) statusText.innerText = 'Memeriksa pembayaran...';

        const res = await fetch('/api/status/' + orderId);
        const json = await res.json();
        if (json.data) {
          if (json.data.status === 'PAID') {
            if (polling) clearInterval(polling);
            document.getElementById('pendingView').classList.add('hidden');
            document.getElementById('successView').classList.remove('hidden');
            document.getElementById('cancelledView').classList.add('hidden');
            playChime();
          } else if (json.data.status === 'CANCELLED' || json.data.status === 'EXPIRED') {
            if (polling) clearInterval(polling);
            document.getElementById('pendingView').classList.add('hidden');
            document.getElementById('successView').classList.add('hidden');
            document.getElementById('cancelledView').classList.remove('hidden');
          } else if (isManual) {
            if (statusText) statusText.innerText = 'Pembayaran belum terdeteksi. Silakan transfer tepat sesuai nominal.';
            setTimeout(() => {
              if (statusText) statusText.innerText = 'Mengecek pembayaran otomatis real-time...';
            }, 4000);
          }
        }
      } catch (e) {}
    }

    let polling = null;
    if (initialStatus === 'PENDING') {
      polling = setInterval(() => checkStatus(false), 3000);
    }

    document.getElementById('btnCheckStatus').addEventListener('click', () => {
      checkStatus(true);
    });

    document.getElementById('btnCancelOrder').addEventListener('click', async () => {
      if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
      try {
        const res = await fetch('/api/cancel/' + orderId, { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          if (polling) clearInterval(polling);
          document.getElementById('pendingView').classList.add('hidden');
          document.getElementById('cancelledView').classList.remove('hidden');
        } else {
          alert(json.message || 'Gagal membatalkan pesanan.');
        }
      } catch (e) {
        alert('Terjadi kesalahan jaringan.');
      }
    });

    function playChime() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.frequency.value = f;
          g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
          g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.45);
        });
      } catch (e) {}
    }
  </script>

</body>
</html>
  `;

  res.send(html);
});

const oldStaticIndex = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(oldStaticIndex)) {
  try {
    fs.unlinkSync(oldStaticIndex);
    console.log('[Server Cleanup] Removed legacy public/index.html to enforce Nuxt 3 Engine');
  } catch (e) {}
}
const oldAppJs = path.join(__dirname, 'public', 'app.js');
if (fs.existsSync(oldAppJs)) {
  try { fs.unlinkSync(oldAppJs); } catch (e) {}
}
const oldStyleCss = path.join(__dirname, 'public', 'style.css');
if (fs.existsSync(oldStyleCss)) {
  try { fs.unlinkSync(oldStyleCss); } catch (e) {}
}

app.post('/api/v1/telegram/admin-webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update) {
      processAdminTelegramUpdate(update).catch(err => {
        console.warn('[Admin Telegram Update Warning]', err.message);
      });
    }
    return res.status(200).send('OK');
  } catch (err) {
    return res.status(200).send('OK');
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/pay/')) return next();
  const nuxtIndex = path.join(__dirname, '.output', 'public', 'index.html');
  if (fs.existsSync(nuxtIndex)) {
    return res.sendFile(nuxtIndex);
  }
  const fallback200 = path.join(__dirname, '.output', 'public', '200.html');
  if (fs.existsSync(fallback200)) {
    return res.sendFile(fallback200);
  }
  next();
});

const server = app.listen(PORT, () => {
  const baseUrl = getBaseUrl();
  console.log(`====================================================`);
  console.log(`🚀 WARUNGERIK Payment Gateway Engine Active (Supabase DB)`);
  console.log(`🌐 Dynamic URL: ${baseUrl}`);
  console.log(`📖 API Documentation: ${baseUrl}/api-docs`);
  console.log(`====================================================`);

  setupAdminTelegramWebhook(baseUrl);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server Warning] Port ${PORT} is occupied by another process.`);
    console.error(`Please terminate the existing process or change PORT in .env\n`);
  } else {
    console.error('[Server Error]', err);
  }
});
