import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createUser, getUserByEmail, createApiKey, setMerchantOTP, verifyMerchantOTP, getApiKeysByUser, getUserById } from '../db.js';
import { authenticateUserToken, JWT_SECRET } from '../middleware/auth.js';
import { sendOtpEmail } from '../services/emailService.js';

const router = express.Router();
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

async function verifyTurnstile(token, remoteip) {
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', TURNSTILE_SECRET_KEY);
    params.append('response', token);
    if (remoteip) params.append('remoteip', remoteip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('[Turnstile Verification Failed]', err.message);
    return false;
  }
}

const ALLOWED_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'outlook.co.id',
  'hotmail.com',
  'hotmail.co.id',
  'yahoo.com',
  'yahoo.co.id',
  'yahoo.com.id',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'live.com',
  'live.com.id'
]);

const DISPOSABLE_KEYWORDS = [
  'temp', 'disposable', 'trash', 'fake', 'guerrilla', 'mailinator',
  '10minute', 'yopmail', 'getnada', 'mohmal', 'generator', 'burner',
  'sharklasers', 'dispostable', 'dropmail', 'throwaway', 'crazymailing'
];

function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1].trim();

  for (const kw of DISPOSABLE_KEYWORDS) {
    if (domain.includes(kw)) return false;
  }

  return ALLOWED_EMAIL_DOMAINS.has(domain);
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, turnstileToken } = req.body;

    const cfToken = req.body['cf-turnstile-response'] || turnstileToken;
    if (!cfToken) {
      return res.status(400).json({
        success: false,
        message: 'Silakan centang verifikasi CAPTCHA Cloudflare Turnstile terlebih dahulu.'
      });
    }

    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const isHuman = await verifyTurnstile(cfToken, remoteIp);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: 'Verifikasi CAPTCHA gagal atau kadaluarsa. Silakan centang kembali CAPTCHA.'
      });
    }

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nama, Email, dan Password (minimal 6 karakter) wajib diisi.'
      });
    }

    if (!isAllowedEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran hanya diperbolehkan menggunakan provider email resmi (seperti @gmail.com, @outlook.com, @yahoo.com, atau @icloud.com). Email sementara / tempmail tidak diizinkan.'
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'MERCHANT',
      emailVerified: 0
    });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await setMerchantOTP(user.id, otpCode);
    sendOtpEmail(user.email, otpCode, user.name);

    return res.status(201).json({
      success: true,
      requireOtp: true,
      userId: user.id,
      email: user.email,
      message: 'Pendaftaran berhasil! Kode 6-digit OTP telah dikirim ke email Anda. Silakan verifikasi email Anda.'
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses pendaftaran.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    if (!userId || !otpCode) {
      return res.status(400).json({ success: false, message: 'ID Pengguna dan Kode OTP wajib diisi.' });
    }

    const result = await verifyMerchantOTP(userId, otpCode);
    const user = result.user;

    let keys = await getApiKeysByUser(user.id);
    let apiKey = keys[0]?.api_key;
    let secretKey = keys[0]?.secret_key;

    if (!apiKey) {
      apiKey = `pk_live_${crypto.randomBytes(12).toString('hex')}`;
      secretKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
      await createApiKey({
        userId: user.id,
        apiKey,
        secretKey,
        label: `Key Produksi - ${user.name}`
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Verifikasi email berhasil! Selamat datang di WARUNGERIKPAY.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        initialKeys: { apiKey, secretKey }
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await setMerchantOTP(user.id, otpCode);
    sendOtpEmail(user.email, otpCode, user.name);

    return res.json({
      success: true,
      message: 'Kode OTP baru telah dikirim ke email Anda. Silakan periksa inbox/spam.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal mengirim ulang OTP.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;

    const cfToken = req.body['cf-turnstile-response'] || turnstileToken;
    if (!cfToken) {
      return res.status(400).json({
        success: false,
        message: 'Silakan centang verifikasi CAPTCHA Cloudflare Turnstile terlebih dahulu.'
      });
    }

    const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const isHuman = await verifyTurnstile(cfToken, remoteIp);
    if (!isHuman) {
      return res.status(400).json({
        success: false,
        message: 'Verifikasi CAPTCHA gagal atau kadaluarsa. Silakan centang kembali CAPTCHA.'
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    if (user.role !== 'ADMIN') {
      if (!isAllowedEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Login hanya diperbolehkan menggunakan provider email resmi (Gmail, Outlook, Yahoo, atau iCloud). Email sementara / tempmail tidak diizinkan.'
        });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await setMerchantOTP(user.id, otpCode);
      sendOtpEmail(user.email, otpCode, user.name);

      return res.json({
        success: false,
        requireOtp: true,
        userId: user.id,
        email: user.email,
        message: 'Password benar! Kode 6-digit OTP telah dikirimkan ke email Anda. Silakan verifikasi untuk menyelesaikan login.'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Gagal memproses login.' });
  }
});

router.get('/me', authenticateUserToken, (req, res) => {
  return res.json({
    success: true,
    data: req.user
  });
});

export default router;
