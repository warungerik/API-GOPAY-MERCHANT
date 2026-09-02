import express from 'express';
import crypto from 'crypto';
import {
  getApiKeysByUser,
  createApiKey,
  deleteApiKey,
  getMerchantSettings,
  saveMerchantSettings,
  getWebhookLogs,
  searchOrdersByUser,
  getStatsByUser,
  createWithdrawal,
  getWithdrawalsByUser,
  calculateWithdrawalFee,
  getMerchantBalances,
  getMerchantSettlements,
  getMerchantPayout,
  saveMerchantPayout,
  updateUserPassword,
  updateUserProfile
} from '../db.js';
import { authenticateUserToken } from '../middleware/auth.js';
import { dispatchWebhookNotification } from '../services/webhookService.js';
import { sendTelegramNotification } from '../services/telegramService.js';
import { notifyAdminNewWithdrawal } from '../services/adminTelegramBotService.js';

const router = express.Router();

router.use(authenticateUserToken);

router.post('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await updateUserProfile(req.user.id, { name, email });
    return res.json({
      success: true,
      message: 'Profil (Nama & Email) berhasil diperbarui.',
      data: updatedUser
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Gagal memperbarui profil.'
    });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru wajib diisi.'
      });
    }

    await updateUserPassword(req.user.id, oldPassword, newPassword);

    return res.json({
      success: true,
      message: 'Password akun Anda berhasil diperbarui.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Gagal memperbarui password.'
    });
  }
});

router.get('/keys', async (req, res) => {
  const keys = await getApiKeysByUser(req.user.id);
  return res.json({
    success: true,
    data: keys
  });
});

router.post('/keys/generate', async (req, res) => {
  const userLabel = (req.body.label || 'Produksi').trim().substring(0, 40);
  const fullLabel = `Key - ${req.user.name} (${userLabel})`;
  const apiKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
  const secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;

  const updatedKeys = await createApiKey({
    userId: req.user.id,
    apiKey,
    secretKey,
    label: fullLabel
  });

  return res.status(201).json({
    success: true,
    message: 'Kunci API baru berhasil dibuat.',
    data: updatedKeys
  });
});

router.delete('/keys/:id', async (req, res) => {
  const keyId = Number(req.params.id);
  const updatedKeys = await deleteApiKey(req.user.id, keyId);
  return res.json({
    success: true,
    message: 'Kunci API berhasil dihapus.',
    data: updatedKeys
  });
});

router.get('/settings', async (req, res) => {
  const settings = await getMerchantSettings(req.user.id);
  return res.json({
    success: true,
    data: settings
  });
});

router.post('/settings', async (req, res) => {
  const { webhookUrl, webhookSecret, feeType, feeValue, feeBearer, telegramBotToken, telegramChatId, telegramNotifActive } = req.body;
  const updated = await saveMerchantSettings(req.user.id, {
    webhookUrl: webhookUrl !== undefined ? webhookUrl : '',
    webhookSecret: webhookSecret !== undefined ? webhookSecret : '',
    feeType: feeType || 'UNIQUE_CODE',
    feeValue: feeValue || 0,
    feeBearer: feeBearer || 'CUSTOMER',
    telegramBotToken: telegramBotToken !== undefined ? telegramBotToken : '',
    telegramChatId: telegramChatId !== undefined ? telegramChatId : '',
    telegramNotifActive: telegramNotifActive !== undefined ? telegramNotifActive : 1
  });

  return res.json({
    success: true,
    message: 'Pengaturan merchant berhasil disimpan.',
    data: updated
  });
});

router.post('/telegram/test', async (req, res) => {
  const { telegramBotToken, telegramChatId } = req.body;
  const settings = await getMerchantSettings(req.user.id);

  const token = (telegramBotToken !== undefined ? telegramBotToken : (settings.telegramBotToken || '')).trim();
  const chatId = (telegramChatId !== undefined ? telegramChatId : (settings.telegramChatId || '')).trim();

  if (!token || !chatId) {
    return res.status(400).json({
      success: false,
      message: 'Bot Token dan Chat ID Telegram wajib diisi terlebih dahulu untuk melakukan tes.'
    });
  }

  const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const testText = `<b>[TES NOTIFIKASI TELEGRAM BOT]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>Merchant:</b> ${req.user.name || 'Merchant'}
<b>Status:</b> TERHUBUNG SANGAT BAIK ✅
<b>Waktu:</b> ${dateStr} WIB

<i>Pesan ini mengonfirmasi bahwa Bot Telegram merchant Anda telah dikonfigurasi dengan benar dan siap menerima notifikasi transfer masuk otomatis!</i>
━━━━━━━━━━━━━━━━━━━━━━`;

  const sent = await sendTelegramNotification(testText, token, chatId);

  if (sent) {
    return res.json({
      success: true,
      message: 'Tes notifikasi Telegram berhasil dikirim ke chat Telegram Anda!'
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Gagal mengirim pesan ke Telegram. Pastikan Token Bot & Chat ID benar, dan Anda sudah menekan /start pada Bot tersebut.'
    });
  }
});

router.get('/payout-account', async (req, res) => {
  const payout = await getMerchantPayout(req.user.id);
  return res.json({
    success: true,
    data: payout
  });
});

router.post('/payout-account', async (req, res) => {
  try {
    const { payoutType, payoutProvider, payoutName, payoutNumber } = req.body;

    if (!payoutType || !payoutProvider || !payoutName || !payoutNumber) {
      return res.status(400).json({
        success: false,
        message: 'Semua bidang (Tipe, Provider, Nama Pemilik, No. Rekening/HP) wajib diisi.'
      });
    }

    const updated = await saveMerchantPayout(req.user.id, {
      payoutType: String(payoutType),
      payoutProvider: String(payoutProvider),
      payoutName: String(payoutName),
      payoutNumber: String(payoutNumber)
    });

    return res.json({
      success: true,
      message: 'Rekening penarikan berhasil disimpan.',
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

router.post('/webhooks/test', async (req, res) => {
  const settings = await getMerchantSettings(req.user.id);
  if (!settings.webhookUrl) {
    return res.status(400).json({
      success: false,
      message: 'Webhook URL belum diisi. Silakan isi Webhook URL di pengaturan terlebih dahulu.'
    });
  }

  const dummyOrder = {
    orderId: `TEST-${Date.now()}`,
    userId: req.user.id,
    baseAmount: 10000,
    uniqueCode: 88,
    totalAmount: 10088,
    customerName: 'Test Customer',
    note: 'Pengujian Webhook Callback WARUNGERIKPAY',
    status: 'PAID',
    txId: `SIMULATED-TX-${Date.now()}`,
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  await dispatchWebhookNotification(dummyOrder);

  const logs = await getWebhookLogs(req.user.id, 1);

  return res.json({
    success: true,
    message: 'Tes Webhook berhasil dikirim!',
    latestLog: logs[0] || null
  });
});

router.get('/webhooks/logs', async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const logs = await getWebhookLogs(req.user.id, limit);
  return res.json({
    success: true,
    data: logs
  });
});

router.get('/transactions', async (req, res) => {
  const { q = '', status = '', startDate = '', endDate = '', limit = 50, offset = 0 } = req.query;
  const result = await searchOrdersByUser({
    userId: req.user.id,
    search: q,
    status,
    startDate,
    endDate,
    limit,
    offset
  });

  return res.json({
    success: true,
    data: result
  });
});

router.get('/transactions/export', async (req, res) => {
  try {
    const { q = '', status = '', startDate = '', endDate = '' } = req.query;
    const result = await searchOrdersByUser({
      userId: req.user.id,
      search: q,
      status,
      startDate,
      endDate,
      limit: 10000,
      offset: 0
    });

    const txs = result.transactions || [];
    let csv = 'Order ID,Tanggal Transaksi,Pelanggan,Nominal Total (Rp),Fee (Rp),Bersih Diterima (Rp),Status,Nomor Tx ID,Catatan\n';

    for (const t of txs) {
      const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/,/g, '') : '-';
      const orderId = `"${(t.orderId || '').replace(/"/g, '""')}"`;
      const customer = `"${(t.customerName || 'Customer').replace(/"/g, '""')}"`;
      const total = t.totalAmount || 0;
      const fee = (t.feeAmount || 0) + (t.uniqueCode || 0);
      const net = t.netAmount || (total - fee);
      const statusStr = `"${t.status || 'PENDING'}"`;
      const txId = `"${(t.txId || '-').replace(/"/g, '""')}"`;
      const note = `"${(t.note || '-').replace(/"/g, '""')}"`;

      csv += `${orderId},${dateStr},${customer},${total},${fee},${net},${statusStr},${txId},${note}\n`;
    }

    const filename = `Laporan_Transaksi_WARUNGERIKPAY_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);

  } catch (err) {
    console.error('[CSV Export Error]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengunduh laporan CSV.' });
  }
});

router.get('/settlements', async (req, res) => {
  const { q = '', settlementStatus = '', limit = 10, offset = 0 } = req.query;
  const result = await getMerchantSettlements({
    userId: req.user.id,
    search: q,
    settlementStatus,
    limit: Number(limit) || 10,
    offset: Number(offset) || 0
  });

  return res.json({
    success: true,
    data: result
  });
});

router.get('/stats', async (req, res) => {
  const stats = await getStatsByUser(req.user.id);
  return res.json({
    success: true,
    data: stats
  });
});

router.get('/balances', async (req, res) => {
  const balances = await getMerchantBalances(req.user.id);
  return res.json({
    success: true,
    data: balances
  });
});

router.post('/withdraw', async (req, res) => {
  try {
    const { amount, accountType, accountName, accountNumber, accountProvider, note } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 15000) {
      return res.status(400).json({
        success: false,
        message: 'Minimal penarikan adalah Rp 15.000'
      });
    }

    if (!accountType || !accountName || !accountNumber || !accountProvider) {
      return res.status(400).json({
        success: false,
        message: 'Informasi rekening penarikan (Tipe, Provider, Nama Pemilik, No. Rekening/HP) wajib diisi lengkap.'
      });
    }

    const balances = await getMerchantBalances(req.user.id, true);
    if (numAmount > balances.availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Saldo siap tarik Anda tidak mencukupi. (Saldo Siap Tarik: Rp ${balances.availableBalance.toLocaleString('id-ID')}, Saldo Tertahan: Rp ${balances.holdingBalance.toLocaleString('id-ID')})`
      });
    }

    const fee = calculateWithdrawalFee(numAmount);

    const withdrawal = await createWithdrawal({
      userId: req.user.id,
      amount: numAmount,
      accountType: String(accountType).trim().toUpperCase(),
      accountName: String(accountName).trim(),
      accountNumber: String(accountNumber).trim(),
      accountProvider: String(accountProvider).trim().toUpperCase(),
      note: String(note || '').trim()
    });

    notifyAdminNewWithdrawal(withdrawal, req.user).catch(err => {
      console.warn('[Admin WD Notif Warning]', err.message);
    });

    return res.status(201).json({
      success: true,
      message: `Permintaan penarikan Rp ${numAmount.toLocaleString('id-ID')} berhasil diajukan. (Fee: Rp ${fee.toLocaleString('id-ID')})`,
      data: withdrawal
    });
  } catch (err) {
    console.error('[Withdraw Request Error]', err);
    return res.status(500).json({ success: false, message: 'Gagal mengajukan permintaan penarikan.' });
  }
});

router.get('/withdrawals', async (req, res) => {
  const withdrawals = await getWithdrawalsByUser(req.user.id);
  return res.json({
    success: true,
    data: withdrawals
  });
});

export default router;
