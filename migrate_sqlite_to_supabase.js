import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ HARAP ATUR SUPABASE_URL DAN SUPABASE_KEY DI FILE .env SEBELUM MEMULAI MIGRASI!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const dbPath = path.join(__dirname, 'database', 'transactions.db');

if (!fs.existsSync(dbPath)) {
  console.log('ℹ️ Tidak ditemukan database/transactions.db lokal. Migrasi dibatalkan.');
  process.exit(0);
}

console.log('🚀 Memulai migrasi data SQLite (transactions.db) ke Supabase PostgreSQL...');
const db = new Database(dbPath, { readonly: true });

async function migrateTable(tableName, primaryKey, transformFn = (row) => row) {
  try {
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    if (rows.length === 0) {
      console.log(`- Tabel '${tableName}': 0 data (kosong).`);
      return;
    }

    const transformedRows = rows.map(transformFn);

    const BATCH_SIZE = 500;
    for (let i = 0; i < transformedRows.length; i += BATCH_SIZE) {
      const batch = transformedRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(tableName).upsert(batch, { onConflict: primaryKey });
      if (error) {
        console.error(`❌ Gagal mengunggah batch ke '${tableName}':`, error.message);
        throw error;
      }
    }
    console.log(`✅ Tabel '${tableName}': Sukses mengunggah ${transformedRows.length} record.`);
  } catch (err) {
    if (err.message.includes('no such table')) {
      console.log(`- Tabel '${tableName}': tidak ditemukan di SQLite.`);
    } else {
      console.error(`❌ Error migrasi '${tableName}':`, err.message);
    }
  }
}

async function runMigration() {
  console.log('\n--- PROSES MIGRASI START ---');

  await migrateTable('users', 'id', (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role || 'MERCHANT',
    status: row.status || 'ACTIVE',
    email_verified: row.email_verified || 0,
    otp_code: row.otp_code || null,
    otp_expires_at: row.otp_expires_at || null,
    created_at: row.created_at || new Date().toISOString()
  }));

  await migrateTable('api_keys', 'id', (row) => ({
    id: row.id,
    user_id: row.user_id,
    api_key: row.api_key,
    secret_key: row.secret_key,
    label: row.label || 'Default Key',
    status: row.status || 'ACTIVE',
    created_at: row.created_at || new Date().toISOString()
  }));

  await migrateTable('merchant_settings', 'user_id', (row) => ({
    user_id: row.user_id,
    webhook_url: row.webhook_url || '',
    webhook_secret: row.webhook_secret || '',
    fee_type: row.fee_type || 'UNIQUE_CODE',
    fee_value: row.fee_value || 0,
    fee_bearer: row.fee_bearer || 'CUSTOMER',
    payout_type: row.payout_type || '',
    payout_provider: row.payout_provider || '',
    payout_name: row.payout_name || '',
    payout_number: row.payout_number || '',
    payout_updated_at: row.payout_updated_at || '',
    updated_at: row.updated_at || new Date().toISOString()
  }));

  await migrateTable('webhook_logs', 'id', (row) => ({
    id: row.id,
    user_id: row.user_id,
    order_id: row.order_id,
    url: row.url,
    payload: row.payload,
    response_status: row.response_status || 0,
    response_body: row.response_body || '',
    created_at: row.created_at || new Date().toISOString()
  }));

  await migrateTable('transactions', 'order_id', (row) => ({
    order_id: row.order_id,
    user_id: row.user_id || 1,
    base_amount: row.base_amount,
    unique_code: row.unique_code,
    fee_type: row.fee_type || 'UNIQUE_CODE',
    fee_amount: row.fee_amount || 0,
    fee_bearer: row.fee_bearer || 'CUSTOMER',
    total_amount: row.total_amount,
    net_amount: row.net_amount || row.base_amount,
    customer_name: row.customer_name || 'Customer',
    note: row.note || '',
    status: row.status || 'PENDING',
    payment_url: row.payment_url || '',
    dynamic_qris: row.dynamic_qris || '',
    qr_code_data_url: row.qr_code_data_url || '',
    tx_id: row.tx_id || null,
    is_released: row.is_released || 0,
    created_at: row.created_at || new Date().toISOString(),
    paid_at: row.paid_at || null,
    expired_at: row.expired_at || new Date().toISOString()
  }));

  await migrateTable('withdrawals', 'id', (row) => ({
    id: row.id,
    user_id: row.user_id,
    amount: row.amount,
    fee: row.fee || 5000,
    net_amount: row.net_amount,
    account_type: row.account_type,
    account_name: row.account_name,
    account_number: row.account_number,
    account_provider: row.account_provider,
    status: row.status || 'PENDING',
    note: row.note || '',
    admin_note: row.admin_note || '',
    created_at: row.created_at || new Date().toISOString(),
    processed_at: row.processed_at || null
  }));

  console.log('\n🎉 PROSES MIGRASI SELESAI DENGAN SUKSES!');
  db.close();
}

runMigration().catch((err) => {
  console.error('❌ Gagal menjalankan migrasi:', err);
  process.exit(1);
});
