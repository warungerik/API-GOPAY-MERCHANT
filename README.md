<div align="center">

  <h1>GoPay Merchant Payment Gateway Engine</h1>
  <p><strong>Sistem Payment Gateway Mandiri & Integrasi QRIS Dinamis Terotomatisasi</strong></p>

  <p>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" /></a>
    <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt_3-00DC82?style=for-the-badge&logo=nuxtdotjs&logoColor=white" alt="Nuxt3" /></a>
    <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" /></a>
    <a href="https://warungerik.com/payment"><img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" /></a>
  </p>

</div>

---

## Teknologi & Stack Utama

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Telegram_Bot-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot" />
</p>

---

## Fitur Utama

- **Otomatisasi Mutasi & Polling QRIS**: Verifikasi transaksi masuk dari GoBiz / GoPay secara otomatis tanpa perlu input manual.
- **Dynamic QRIS Generator**: Pembuatan kode QRIS dinamis presisi tinggi berdasar nominal unik (menggunakan algoritma checksum CRC16).
- **Merchant & Admin Dashboard**: Dashboard Nuxt 3 responsif untuk manajemen API Keys, monitoring saldo, laporan transaksi, dan klaim withdrawal.
- **Notifikasi Webhook Keamanan Tinggi**: Callback HTTP POST otomatis yang dilengkapi verifikasi tanda tangan **SHA256 HMAC Signature**.
- **Bot Telegram Interaktif**: Fitur notifikasi instan dan kontrol persetujuan penarikan saldo (Withdrawal Approval) langsung dari Telegram Admin & Merchant.
- **Cloud Database (Supabase PostgreSQL)**: Penyimpanan aman terenkripsi untuk data user, API credentials, log transaksi, dan riwayat payout.
- **Verifikasi Email OTP**: Keamanan pendaftaran akun dengan enkripsi password bcrypt dan OTP via SMTP Gmail.
- **Portal Dokumentasi & Checkout**: Halaman siap pakai untuk portal integrasi API (`/public/api-docs.html`), cek status invoice (`/public/cek-order.html`), dan riwayat pembayaran (`/public/riwayat.html`).

---

## Arsitektur Sistem

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────┐
│  Client App /    │ ─────> │  GoPay Engine Server   │ ─────> │  GoBiz / GoPay   │
│  Merchant Site   │ <───── │  (Express + Nuxt 3)    │ <───── │  API Engine      │
└──────────────────┘        └────────────────────────┘        └──────────────────┘
                                     │      │
                           ┌─────────┘      └─────────┐
                           ▼                          ▼
                 ┌──────────────────┐       ┌───────────────────┐
                 │  Supabase Cloud  │       │  Telegram Bot &   │
                 │  (PostgreSQL)    │       │  Merchant Webhook │
                 └──────────────────┘       └───────────────────┘
```

---

## Prasyarat Lingkungan (Prerequisites)

- **Node.js**: Versi `v18.x` atau lebih baru
- **Package Manager**: `npm`, `pnpm`, atau `yarn`
- **Supabase Account**: Database PostgreSQL di [Supabase.com](https://supabase.com)
- **Merchant Account**: Akun GoBiz / GoPay aktif
- **Telegram Bot Token** (Opsional): Diperoleh dari [@BotFather](https://t.me/BotFather)

---

## Panduan Instalasi & Pengaturan

### 1. Clone Repositori

```bash
git clone https://github.com/warungerik/API-GOPAY-MERCHANT.git
cd API-GOPAY-MERCHANT
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi File Environment

Buat berkas `.env` dari sampel template:

```bash
cp .env.example .env
```

Isi konfigurasi pada berkas `.env`:

```env
# GoBiz / GoPay Credentials
GOPAY_EMAIL=email-gobiz-kamu@example.com
GOPAY_PASSWORD=password-gobiz-kamu

# Server Configuration
APP_URL=http://localhost:3000
PORT=3000

# QRIS Base String (Didapat dari QRIS GoPay Merchant)
QRIS_STRING=00020101021126610014COM.GO-JEK.WWW...

# Master Secret Key
API_SECRET_KEY=your_secure_api_secret_key

# Telegram Bot (Opsional)
ADMIN_TELEGRAM_BOT_TOKEN=your-admin-telegram-bot-token
ADMIN_TELEGRAM_CHAT_ID=your-admin-telegram-chat-id

# Gmail SMTP OTP (Opsional)
SMTP_USER=email-kamu@gmail.com
SMTP_PASS=app-password-gmail

# Supabase PostgreSQL
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
```

---

## Inisialisasi Database Supabase

Jalankan skrip pembentukan struktur skema SQL Supabase:

```bash
node setup_supabase_schema.js
```

Atau jalankan skrip SQL [supabase_schema.sql](supabase_schema.sql) pada **SQL Editor** Supabase Dashboard Anda.

---

## Menjalankan Aplikasi

### Mode Pengembangan (Development)

```bash
npm run dev
```

Server backend & frontend Nuxt akan berjalan di `http://localhost:3000`.

### Mode Produksi (Production Build)

```bash
npm run build
npm start
```

---

## 🔌 Integrasi API (Merchant API Endpoint)

### 📤 1. Request Checkout / Pembayaran

- **Endpoint**: `POST /api/checkout`
- **Header**: `x-api-key: YOUR_MERCHANT_API_KEY`

```json
{
  "amount": 50000,
  "orderId": "INV-20260902-001"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "orderId": "INV-20260902-001",
    "baseAmount": 50000,
    "uniqueCode": 142,
    "totalAmount": 50142,
    "dynamicQris": "00020101021126610014COM.GO-JEK.WWW...",
    "qrCodeDataUrl": "data:image/png;base64,...",
    "paymentUrl": "http://localhost:3000/pay/INV-20260902-001",
    "status": "PENDING",
    "expiredAt": "2026-09-02T15:00:00.000Z"
  }
}
```

### 2. Cek Status Pembayaran

- **Endpoint**: `GET /api/check-status?orderId=INV-20260902-001`
- **Header**: `x-api-key: YOUR_MERCHANT_API_KEY`

```json
{
  "success": true,
  "data": {
    "orderId": "INV-20260902-001",
    "status": "PAID",
    "totalAmount": 50142,
    "paidAt": "2026-09-02T14:45:12.000Z"
  }
}
```

---

## Webhook Notification Payload

Saat pembayaran berhasil terdeteksi, server mengirim callback HTTP POST ke `webhook_url`:

```json
{
  "event": "payment.success",
  "data": {
    "orderId": "INV-20260902-001",
    "amount": 50000,
    "totalAmount": 50142,
    "status": "PAID",
    "txId": "GOPAY-TX-987654321",
    "paidAt": "2026-09-02T14:45:12.000Z"
  }
}
```

Header Keamanan:

- `X-WarungErikPay-Signature`: SHA256 HMAC Signature yang dihitung dari payload menggunakan `webhook_secret`.

## Dukungan & Donasi

Jika proyek ini bermanfaat bagi Anda, Anda dapat mendukung pengembangannya melalui tombol di bawah ini:

<p align="center">
  <a href="https://warungerik.com/payment">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
</p>

---

## Lisensi

Proyek ini terlisensi di bawah [MIT License](LICENSE).
