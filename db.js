import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ SUPABASE_URL dan SUPABASE_KEY belum diatur di file .env!');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_KEY || 'placeholder',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    realtime: {
      transport: WebSocket
    }
  }
);

function rowToOrder(row) {
  if (!row) return null;
  return {
    orderId: row.order_id,
    userId: Number(row.user_id) || 1,
    baseAmount: Number(row.base_amount),
    uniqueCode: Number(row.unique_code),
    feeType: row.fee_type || 'UNIQUE_CODE',
    feeAmount: Number(row.fee_amount || 0),
    feeBearer: row.fee_bearer || 'CUSTOMER',
    totalAmount: Number(row.total_amount),
    netAmount: Number(row.net_amount || row.base_amount),
    customerName: row.customer_name || 'Customer',
    note: row.note || '',
    status: row.status,
    paymentUrl: row.payment_url,
    dynamicQris: row.dynamic_qris,
    qrCodeDataUrl: row.qr_code_data_url,
    txId: row.tx_id || null,
    isReleased: Number(row.is_released || 0),
    createdAt: row.created_at,
    paidAt: row.paid_at || null,
    expiredAt: row.expired_at
  };
}

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 10) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  clear() {
    this.store.clear();
  }
}

export const dbCache = new MemoryCache();

export async function saveOrder(order) {
  const payload = {
    order_id: order.orderId,
    user_id: order.userId || 1,
    base_amount: order.baseAmount,
    unique_code: order.uniqueCode,
    fee_type: order.feeType || 'UNIQUE_CODE',
    fee_amount: order.feeAmount || 0,
    fee_bearer: order.feeBearer || 'CUSTOMER',
    total_amount: order.totalAmount,
    net_amount: order.netAmount || order.baseAmount,
    customer_name: order.customerName || 'Customer',
    note: order.note || '',
    status: order.status || 'PENDING',
    payment_url: order.paymentUrl || '',
    dynamic_qris: order.dynamicQris || '',
    qr_code_data_url: order.qrCodeDataUrl || '',
    tx_id: order.txId || null,
    created_at: order.createdAt || new Date().toISOString(),
    paid_at: order.paidAt || null,
    expired_at: order.expiredAt || new Date().toISOString()
  };

  const { error } = await supabase
    .from('transactions')
    .upsert(payload, { onConflict: 'order_id' });

  if (error) {
    throw new Error(`Gagal menyimpan transaksi: ${error.message}`);
  }
  dbCache.clear();
}

export async function getOrderById(orderId) {
  if (!orderId) return null;
  const cleanId = String(orderId).trim();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .ilike('order_id', cleanId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToOrder(data);
}

export async function getPendingOrders() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'PENDING');

  if (error || !data) return [];
  return data.map(rowToOrder);
}

export async function markOrderAsPaid(orderId, txId, paidAt = new Date().toISOString()) {
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'PAID',
      tx_id: txId,
      paid_at: paidAt
    })
    .eq('order_id', orderId);

  if (error) {
    throw new Error(`Gagal memperbarui status order: ${error.message}`);
  }
  dbCache.clear();
  return await getOrderById(orderId);
}

export async function isTxIdUsed(txId) {
  if (!txId) return false;
  const { data } = await supabase
    .from('transactions')
    .select('order_id')
    .eq('tx_id', String(txId))
    .eq('status', 'PAID')
    .limit(1)
    .maybeSingle();

  return !!data;
}

export async function markOrderAsExpired(orderId) {
  await supabase
    .from('transactions')
    .update({ status: 'EXPIRED' })
    .eq('order_id', orderId)
    .eq('status', 'PENDING');
}

export async function markOrderAsCancelled(orderId) {
  await supabase
    .from('transactions')
    .update({ status: 'CANCELLED' })
    .eq('order_id', orderId)
    .eq('status', 'PENDING');
}

export async function searchOrdersByUser({ userId, search = '', status = '', startDate = '', endDate = '', limit = 50, offset = 0 } = {}) {
  const cacheKey = `user_txs:${userId}:${search}:${status}:${startDate}:${endDate}:${limit}:${offset}`;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (search && search.trim() !== '') {
    const s = `%${search.trim()}%`;
    query = query.or(`order_id.ilike.${s},customer_name.ilike.${s},note.ilike.${s},tx_id.ilike.${s}`);
  }

  if (status && status.trim() !== '') {
    query = query.eq('status', status.trim().toUpperCase());
  }

  if (startDate && typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(startDate.trim())) {
    query = query.gte('created_at', `${startDate.trim().slice(0, 10)}T00:00:00.000Z`);
  }

  if (endDate && typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(endDate.trim())) {
    query = query.lte('created_at', `${endDate.trim().slice(0, 10)}T23:59:59.999Z`);
  }

  const limitNum = Number(limit);
  const offsetNum = Number(offset);

  query = query
    .order('created_at', { ascending: false })
    .range(offsetNum, offsetNum + limitNum - 1);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Gagal mengambil data transaksi merchant: ${error.message}`);
  }

  const result = {
    transactions: (data || []).map(rowToOrder),
    total: count || 0,
    limit: limitNum,
    offset: offsetNum
  };

  dbCache.set(cacheKey, result, 8);
  return result;
}

export async function searchOrders({ search = '', status = '', merchantId = '', startDate = '', endDate = '', limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' });

  if (search && search.trim() !== '') {
    const s = `%${search.trim()}%`;
    query = query.or(`order_id.ilike.${s},customer_name.ilike.${s},note.ilike.${s},tx_id.ilike.${s}`);
  }

  if (status && status.trim() !== '') {
    query = query.eq('status', status.trim().toUpperCase());
  }

  if (merchantId && String(merchantId).trim() !== '') {
    query = query.eq('user_id', Number(merchantId));
  }

  if (startDate && typeof startDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(startDate.trim())) {
    query = query.gte('created_at', `${startDate.trim().slice(0, 10)}T00:00:00.000Z`);
  }

  if (endDate && typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(endDate.trim())) {
    query = query.lte('created_at', `${endDate.trim().slice(0, 10)}T23:59:59.999Z`);
  }

  const limitNum = Number(limit);
  const offsetNum = Number(offset);

  query = query
    .order('created_at', { ascending: false })
    .range(offsetNum, offsetNum + limitNum - 1);

  const { data, count, error } = await query;
  if (error) {
    throw new Error(`Gagal mengambil data transaksi: ${error.message}`);
  }

  const rawOrders = data || [];
  const userIds = [...new Set(rawOrders.map(r => r.user_id).filter(Boolean))];

  let userMap = {};
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', userIds);
    if (usersData) {
      usersData.forEach(u => {
        userMap[u.id] = u;
      });
    }
  }

  const transactions = rawOrders.map(row => {
    const order = rowToOrder(row);
    const u = userMap[order.userId];
    order.merchantName = u ? u.name : `Merchant #${order.userId}`;
    order.merchantEmail = u ? u.email : '-';
    return order;
  });

  return {
    transactions,
    total: count || 0,
    limit: limitNum,
    offset: offsetNum
  };
}

export async function getStatsByUser(userId) {
  const cacheKey = `user_stats:${userId}`;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  const [paidRes, pendingRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('status', 'PAID')
      .eq('user_id', userId),
    supabase
      .from('transactions')
      .select('order_id', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .eq('user_id', userId)
  ]);

  const paidData = paidRes.data;
  const pendingCount = pendingRes.count;

  const totalPaidCount = paidData ? paidData.length : 0;
  const totalPaidVolume = paidData ? paidData.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;

  const result = {
    totalPaidCount,
    totalPaidVolume,
    totalPendingCount: pendingCount || 0
  };

  dbCache.set(cacheKey, result, 10);
  return result;
}

export async function getStats() {
  const { data: paidData } = await supabase
    .from('transactions')
    .select('total_amount')
    .eq('status', 'PAID');

  const totalPaidCount = paidData ? paidData.length : 0;
  const totalPaidVolume = paidData ? paidData.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;

  return {
    totalPaidCount,
    totalPaidVolume
  };
}

export async function createUser({ name, email, passwordHash, role = 'MERCHANT', emailVerified = 0 }) {
  const isVerified = role === 'ADMIN' ? 1 : emailVerified;
  const initialStatus = role === 'ADMIN' ? 'ACTIVE' : (isVerified ? 'ACTIVE' : 'UNVERIFIED');
  const createdAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .insert([{
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      status: initialStatus,
      email_verified: isVerified,
      created_at: createdAt
    }])
    .select('id, name, email, role, status, email_verified, created_at')
    .single();

  if (error) {
    throw new Error(`Gagal mendaftarkan pengguna: ${error.message}`);
  }
  return data;
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  return data || null;
}

export async function getUserById(id) {
  if (!id) return null;
  const { data } = await supabase
    .from('users')
    .select('id, name, email, role, status, email_verified, available_balance, holding_balance, created_at')
    .eq('id', id)
    .maybeSingle();

  return data || null;
}

export async function setMerchantOTP(userId, otpCode) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await supabase
    .from('users')
    .update({
      otp_code: otpCode,
      otp_expires_at: expiresAt
    })
    .eq('id', userId);

  return { userId, otpCode, expiresAt };
}

export async function verifyMerchantOTP(userId, otpCode) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('Pengguna tidak ditemukan.');

  if (!user.otp_code || user.otp_code !== String(otpCode).trim()) {
    throw new Error('Kode OTP yang Anda masukkan salah. Silakan periksa kembali email Anda.');
  }

  if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at)) {
    throw new Error('Kode OTP telah kadaluarsa. Silakan klik kirim ulang OTP.');
  }

  await supabase
    .from('users')
    .update({
      email_verified: 1,
      status: 'ACTIVE',
      otp_code: null,
      otp_expires_at: null
    })
    .eq('id', userId);

  const updatedUser = await getUserById(userId);
  return { success: true, user: updatedUser };
}

export async function updateUserPassword(userId, oldPassword, newPassword) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error('Pengguna tidak ditemukan.');
  }

  const isValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Password saat ini yang Anda masukkan salah.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password baru minimal 6 karakter.');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', userId);

  return { success: true };
}

export async function updateUserProfile(userId, { name, email }) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) throw new Error('Pengguna tidak ditemukan.');

  const trimmedEmail = String(email || '').trim().toLowerCase();
  const trimmedName = String(name || '').trim();

  if (!trimmedName) throw new Error('Nama/Toko wajib diisi.');
  if (!trimmedEmail || !trimmedEmail.includes('@')) throw new Error('Alamat email tidak valid.');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .ilike('email', trimmedEmail)
    .neq('id', userId)
    .maybeSingle();

  if (existing) throw new Error('Email tersebut sudah digunakan oleh akun lain.');

  await supabase
    .from('users')
    .update({ name: trimmedName, email: trimmedEmail })
    .eq('id', userId);

  return await getUserById(userId);
}

export async function createApiKey({ userId, apiKey, secretKey, label = 'Default Key' }) {
  const createdAt = new Date().toISOString();
  let { error } = await supabase
    .from('api_keys')
    .insert([{
      user_id: userId,
      api_key: apiKey,
      secret_key: secretKey,
      label,
      status: 'ACTIVE',
      created_at: createdAt
    }]);

  if (error) {
    if (error.message && error.message.includes('api_keys_pkey')) {
      const { data: maxRow } = await supabase
        .from('api_keys')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextId = (maxRow?.id ? Number(maxRow.id) : 0) + 1;
      const res = await supabase
        .from('api_keys')
        .insert([{
          id: nextId,
          user_id: userId,
          api_key: apiKey,
          secret_key: secretKey,
          label,
          status: 'ACTIVE',
          created_at: createdAt
        }]);

      if (res.error) {
        throw new Error(`Gagal membuat API key: ${res.error.message}`);
      }
    } else {
      throw new Error(`Gagal membuat API key: ${error.message}`);
    }
  }

  dbCache.clear();
  return await getApiKeysByUser(userId);
}

export async function getApiKeysByUser(userId) {
  const { data } = await supabase
    .from('api_keys')
    .select('id, user_id, api_key, secret_key, label, status, created_at')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  return data || [];
}

export async function getApiKeyBySecret(secretKey) {
  if (!secretKey) return null;
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('secret_key', secretKey.trim())
    .eq('status', 'ACTIVE')
    .maybeSingle();

  return data || null;
}

export async function getApiKeyByPublic(apiKey) {
  if (!apiKey) return null;
  const { data } = await supabase
    .from('api_keys')
    .select('*')
    .eq('api_key', apiKey.trim())
    .eq('status', 'ACTIVE')
    .maybeSingle();

  return data || null;
}

export async function deleteApiKey(userId, keyId) {
  await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId);

  return await getApiKeysByUser(userId);
}

export async function getMerchantSettings(userId) {
  const { data: row } = await supabase
    .from('merchant_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!row) {
    return {
      userId,
      webhookUrl: '',
      webhookSecret: '',
      feeType: 'UNIQUE_CODE',
      feeValue: 0,
      feeBearer: 'CUSTOMER',
      telegramBotToken: '',
      telegramChatId: '',
      telegramNotifActive: 1
    };
  }
  return {
    userId: row.user_id,
    webhookUrl: row.webhook_url || '',
    webhookSecret: row.webhook_secret || '',
    feeType: row.fee_type || 'UNIQUE_CODE',
    feeValue: Number(row.fee_value || 0),
    feeBearer: row.fee_bearer || 'CUSTOMER',
    telegramBotToken: row.telegram_bot_token || '',
    telegramChatId: row.telegram_chat_id || '',
    telegramNotifActive: row.telegram_notif_active !== undefined && row.telegram_notif_active !== null ? Number(row.telegram_notif_active) : 1
  };
}

export async function saveMerchantSettings(userId, { webhookUrl = '', webhookSecret = '', feeType = 'UNIQUE_CODE', feeValue = 0, feeBearer = 'CUSTOMER', telegramBotToken = '', telegramChatId = '', telegramNotifActive = 1 }) {
  const updatedAt = new Date().toISOString();
  const cleanFeeType = ['UNIQUE_CODE', 'FLAT', 'PERCENTAGE'].includes(String(feeType).toUpperCase()) ? String(feeType).toUpperCase() : 'UNIQUE_CODE';
  const cleanFeeValue = Math.max(0, Number(feeValue) || 0);
  const cleanFeeBearer = String(feeBearer).toUpperCase() === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER';
  const cleanTgBotToken = String(telegramBotToken || '').trim();
  const cleanTgChatId = String(telegramChatId || '').trim();
  const cleanTgNotifActive = Number(telegramNotifActive) === 0 ? 0 : 1;

  const { error } = await supabase
    .from('merchant_settings')
    .upsert({
      user_id: userId,
      webhook_url: String(webhookUrl || '').trim(),
      webhook_secret: String(webhookSecret || '').trim(),
      fee_type: cleanFeeType,
      fee_value: cleanFeeValue,
      fee_bearer: cleanFeeBearer,
      telegram_bot_token: cleanTgBotToken,
      telegram_chat_id: cleanTgChatId,
      telegram_notif_active: cleanTgNotifActive,
      updated_at: updatedAt
    }, { onConflict: 'user_id' });

  if (error) throw new Error(`Gagal menyimpan pengaturan merchant: ${error.message}`);
  return await getMerchantSettings(userId);
}

export async function getMerchantPayout(userId) {
  const { data: row } = await supabase
    .from('merchant_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!row || !row.payout_number) {
    return {
      hasPayout: false,
      payoutType: 'BANK',
      payoutProvider: 'BCA',
      payoutName: '',
      payoutNumber: '',
      payoutUpdatedAt: null,
      canUpdate: true,
      nextUpdateDate: null,
      daysRemaining: 0
    };
  }

  const lastUpdate = row.payout_updated_at ? new Date(row.payout_updated_at).getTime() : 0;
  const now = Date.now();
  const cooldownMs = 3 * 24 * 60 * 60 * 1000;
  const nextUpdateMs = lastUpdate + cooldownMs;
  const canUpdate = now >= nextUpdateMs;
  const msRemaining = Math.max(0, nextUpdateMs - now);
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return {
    hasPayout: true,
    payoutType: row.payout_type || 'BANK',
    payoutProvider: row.payout_provider || 'BCA',
    payoutName: row.payout_name || '',
    payoutNumber: row.payout_number || '',
    payoutUpdatedAt: row.payout_updated_at || null,
    canUpdate,
    nextUpdateDate: new Date(nextUpdateMs).toISOString(),
    daysRemaining
  };
}

export async function saveMerchantPayout(userId, { payoutType, payoutProvider, payoutName, payoutNumber }) {
  const current = await getMerchantPayout(userId);
  if (current.hasPayout && !current.canUpdate) {
    throw new Error(`Perubahan data rekening dibatasi 1x seminggu. Anda baru dapat mengedit data rekening kembali dalam ${current.daysRemaining} hari.`);
  }

  const updatedAt = new Date().toISOString();
  const { error } = await supabase
    .from('merchant_settings')
    .upsert({
      user_id: userId,
      payout_type: payoutType.trim().toUpperCase(),
      payout_provider: payoutProvider.trim().toUpperCase(),
      payout_name: payoutName.trim(),
      payout_number: payoutNumber.trim(),
      payout_updated_at: updatedAt,
      updated_at: updatedAt
    }, { onConflict: 'user_id' });

  if (error) throw new Error(`Gagal menyimpan rekening penarikan: ${error.message}`);
  return await getMerchantPayout(userId);
}

export async function saveWebhookLog({ userId, orderId, url, payload, responseStatus = 0, responseBody = '' }) {
  const createdAt = new Date().toISOString();
  await supabase
    .from('webhook_logs')
    .insert([{
      user_id: userId,
      order_id: orderId,
      url,
      payload: typeof payload === 'object' ? JSON.stringify(payload) : payload,
      response_status: responseStatus,
      response_body: typeof responseBody === 'object' ? JSON.stringify(responseBody) : String(responseBody),
      created_at: createdAt
    }]);
}

export async function getWebhookLogs(userId, limit = 20) {
  const { data } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .limit(limit);

  return data || [];
}

export function calculateWithdrawalFee(amount) {
  const num = Number(amount) || 0;
  if (num < 100000) {
    return 3000;
  } else if (num > 1000000) {
    return 6000;
  }
  return 4000;
}

export async function getMerchantSettlements({ userId, search = '', settlementStatus = '', limit = 10, offset = 0 }) {
  const cacheKey = `user_settlements:${userId}:${search}:${settlementStatus}:${limit}:${offset}`;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'PAID');

  if (search) {
    query = query.or(`order_id.ilike.%${search}%,customer_name.ilike.%${search}%`);
  }

  if (settlementStatus === 'SETTLED') {
    query = query.or(`is_released.eq.1,paid_at.lte.${oneDayAgo}`);
  } else if (settlementStatus === 'HOLDING') {
    query = query.or('is_released.eq.0,is_released.is.null').gt('paid_at', oneDayAgo);
  }

  query = query.order('paid_at', { ascending: false }).range(offset, offset + Number(limit) - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[Supabase getMerchantSettlements Error]', error);
    return { items: [], total: 0 };
  }

  const items = (data || []).map(row => {
    const order = rowToOrder(row);
    const paidAtTime = order.paidAt ? new Date(order.paidAt).getTime() : new Date(order.createdAt).getTime();
    const releaseAtTime = paidAtTime + 24 * 60 * 60 * 1000;
    const releaseAt = new Date(releaseAtTime).toISOString();
    const isSettled = order.isReleased === 1 || Date.now() >= releaseAtTime;

    return {
      ...order,
      releaseAt,
      settlementStatus: isSettled ? 'SETTLED' : 'HOLDING',
      settledAmount: order.netAmount || order.baseAmount
    };
  });

  const result = { items, total: count || items.length };
  dbCache.set(cacheKey, result, 10);
  return result;
}

export async function getMerchantBalances(userId, forceRefresh = false) {
  const cacheKey = `user_balances:${userId}`;
  if (!forceRefresh) {
    const cached = dbCache.get(cacheKey);
    if (cached) return cached;
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [holdingRes, availRes, wdRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'PAID')
      .or('is_released.eq.0,is_released.is.null')
      .gt('paid_at', oneDayAgo),
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'PAID')
      .or(`is_released.eq.1,paid_at.lte.${oneDayAgo}`),
    supabase
      .from('withdrawals')
      .select('amount')
      .eq('user_id', userId)
      .in('status', ['PENDING', 'APPROVED'])
  ]);

  const holdingTx = holdingRes.data;
  const availTx = availRes.data;
  const wdData = wdRes.data;

  const holdingBalance = holdingTx ? holdingTx.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;
  const availGross = availTx ? availTx.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;
  const totalWithdrawn = wdData ? wdData.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0;
  const availableBalance = Math.max(0, availGross - totalWithdrawn);

  const result = {
    holdingBalance: holdingBalance || 0,
    availableBalance: availableBalance || 0,
    totalWithdrawn: totalWithdrawn || 0,
    totalEarned: (holdingBalance || 0) + (availGross || 0)
  };

  dbCache.set(cacheKey, result, 10);

  supabase
    .from('users')
    .update({
      available_balance: availableBalance || 0,
      holding_balance: holdingBalance || 0
    })
    .eq('id', userId)
    .then(({ error }) => {
      if (error) console.warn('[Persist User Balance Notice]', error.message);
    });

  return result;
}

export async function releaseMerchantHoldingBalance(userId) {
  await supabase
    .from('transactions')
    .update({ is_released: 1 })
    .eq('user_id', userId)
    .eq('status', 'PAID');

  return await getMerchantBalances(userId);
}

export async function adjustMerchantBalance(userId, { type = 'ADD', amount = 0, note = '' }) {
  const numAmount = Math.abs(Number(amount) || 0);
  if (numAmount <= 0) {
    throw new Error('Nominal penyesuaian saldo harus lebih dari 0.');
  }

  const isDeduct = String(type).toUpperCase() === 'DEDUCT';
  const finalAmount = isDeduct ? -numAmount : numAmount;
  const orderId = `ADJ-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`;
  const now = new Date().toISOString();
  const defaultNote = isDeduct ? 'Pengurangan Saldo Manual Admin' : 'Penambahan Saldo Manual Admin';

  await saveOrder({
    orderId,
    userId,
    baseAmount: finalAmount,
    uniqueCode: 0,
    feeType: 'FLAT',
    feeAmount: 0,
    feeBearer: 'MERCHANT',
    totalAmount: finalAmount,
    netAmount: finalAmount,
    customerName: 'SISTEM ADMIN',
    note: String(note || '').trim() || defaultNote,
    status: 'PAID',
    paymentUrl: '',
    dynamicQris: '',
    qrCodeDataUrl: '',
    txId: orderId,
    createdAt: now,
    paidAt: now,
    expiredAt: now
  });

  await supabase
    .from('transactions')
    .update({ is_released: 1 })
    .eq('order_id', orderId);

  return await getMerchantBalances(userId);
}

export async function createWithdrawal({ userId, amount, accountType, accountName, accountNumber, accountProvider, note = '' }) {

  const freshBalances = await getMerchantBalances(userId, true);
  if (amount > freshBalances.availableBalance) {
    throw new Error(`Saldo siap tarik Anda tidak mencukupi. (Saldo Siap Tarik: Rp ${freshBalances.availableBalance.toLocaleString('id-ID')})`);
  }

  const fee = calculateWithdrawalFee(amount);
  const netAmount = amount - fee;
  const createdAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('withdrawals')
    .insert([{
      user_id: userId,
      amount,
      fee,
      net_amount: netAmount,
      account_type: accountType,
      account_name: accountName,
      account_number: accountNumber,
      account_provider: accountProvider,
      status: 'PENDING',
      note,
      created_at: createdAt
    }])
    .select('*')
    .single();

  if (error) throw new Error(`Gagal membuat pengajuan penarikan: ${error.message}`);

  dbCache.clear();
  return data;
}

export async function getWithdrawalById(id) {
  const { data } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  return data || null;
}

export async function getWithdrawalsByUser(userId) {
  const { data } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  return data || [];
}

export async function getAllWithdrawals() {
  const { data } = await supabase
    .from('withdrawals')
    .select('*, users(name, email)')
    .order('id', { ascending: false });

  return (data || []).map(w => ({
    ...w,
    user_name: w.users ? w.users.name : null,
    user_email: w.users ? w.users.email : null
  }));
}

export async function updateWithdrawalStatus(id, status, adminNote = '') {
  const processedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('withdrawals')
    .update({
      status,
      admin_note: adminNote,
      processed_at: processedAt
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(`Gagal memperbarui status withdrawal: ${error.message}`);
  dbCache.clear();
  return data;
}

export async function getAllUsers({ search = '', limit = 10, offset = 0 } = {}) {
  const cacheKey = `admin_all_users:${search}:${limit}:${offset}`;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('users')
    .select('id, name, email, role, status, available_balance, holding_balance, created_at', { count: 'exact' });

  if (search && search.trim() !== '') {
    const s = `%${search.trim()}%`;
    query = query.or(`name.ilike.${s},email.ilike.${s}`);
  }

  const limitNum = Number(limit);
  const offsetNum = Number(offset);

  query = query.order('id', { ascending: false });

  if (limitNum > 0) {
    query = query.range(offsetNum, offsetNum + limitNum - 1);
  }

  const { data: users, count, error } = await query;
  if (error || !users) return { users: [], total: 0, limit: limitNum, offset: offsetNum };

  const resultUsers = await Promise.all(
    users.map(async (u) => {
      const [balances, paidRes] = await Promise.all([
        getMerchantBalances(u.id),
        supabase
          .from('transactions')
          .select('total_amount')
          .eq('user_id', u.id)
          .eq('status', 'PAID')
      ]);

      const paidTx = paidRes.data;
      const totalPaidTx = paidTx ? paidTx.length : 0;
      const totalPaidVolume = paidTx ? paidTx.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;

      return {
        ...u,
        total_paid_tx: totalPaidTx,
        total_paid_volume: totalPaidVolume,
        holding_balance: balances.holdingBalance,
        available_balance: balances.availableBalance,
        total_balance: (balances.holdingBalance || 0) + (balances.availableBalance || 0)
      };
    })
  );

  const resObj = {
    users: resultUsers,
    total: count || resultUsers.length,
    limit: limitNum,
    offset: offsetNum
  };

  dbCache.set(cacheKey, resObj, 10);
  return resObj;
}

export async function deleteUserById(userId) {
  await supabase.from('api_keys').delete().eq('user_id', userId);
  await supabase.from('merchant_settings').delete().eq('user_id', userId);
  await supabase.from('webhook_logs').delete().eq('user_id', userId);
  await supabase.from('transactions').delete().eq('user_id', userId);
  await supabase.from('withdrawals').delete().eq('user_id', userId);
  await supabase.from('users').delete().eq('id', userId);
}

export async function getAdminStats() {
  const cacheKey = `admin_stats`;
  const cached = dbCache.get(cacheKey);
  if (cached) return cached;

  const [merchantsRes, wdRes, paidRes, usersData] = await Promise.all([
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'MERCHANT'),
    supabase
      .from('withdrawals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('transactions')
      .select('total_amount')
      .eq('status', 'PAID'),
    getAllUsers({ limit: 0 })
  ]);

  const totalMerchants = merchantsRes.count;
  const pendingWithdrawals = wdRes.count;
  const paidTx = paidRes.data;

  const totalPaidCount = paidTx ? paidTx.length : 0;
  const totalPaidVolume = paidTx ? paidTx.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) : 0;

  const usersArr = Array.isArray(usersData) ? usersData : (usersData?.users || []);
  const totalPlatformAvailableBalance = usersArr.reduce((sum, u) => sum + (u.available_balance || 0), 0);
  const totalPlatformHoldingBalance = usersArr.reduce((sum, u) => sum + (u.holding_balance || 0), 0);
  const totalPlatformMerchantBalance = totalPlatformAvailableBalance + totalPlatformHoldingBalance;

  const result = {
    totalMerchants: totalMerchants || 0,
    pendingWithdrawals: pendingWithdrawals || 0,
    totalPaidCount,
    totalPaidVolume,
    totalPlatformAvailableBalance,
    totalPlatformHoldingBalance,
    totalPlatformMerchantBalance
  };

  dbCache.set(cacheKey, result, 10);
  return result;
}

export async function cleanupOldRecords(days = 3) {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { error: txErr } = await supabase
      .from('transactions')
      .delete()
      .neq('status', 'PAID')
      .lt('created_at', cutoffDate);

    const { error: logErr } = await supabase
      .from('webhook_logs')
      .delete()
      .lt('created_at', cutoffDate);

    if (txErr) console.warn('[Auto-Cleanup Tx Notice]', txErr.message);
    if (logErr) console.warn('[Auto-Cleanup Log Notice]', logErr.message);

    console.log(`[Supabase Auto-Cleanup] Cleared non-PAID transactions & logs older than ${days} days.`);
  } catch (e) {
    console.error('[Supabase Auto-Cleanup Error]', e.message);
  }
}

export default supabase;
