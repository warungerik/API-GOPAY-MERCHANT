<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-brand">
          <img src="/logo.png?v=2" alt="WARUNGERIKPAY Logo" class="auth-logo" />
        </div>
        <h2 class="auth-title">{{ showOtpState ? 'Verifikasi Email Akun' : 'Daftar Akun WARUNGERIKPAY' }}</h2>
        <p class="auth-sub">
          {{ showOtpState ? `Kode 6-digit OTP telah dikirim ke ${otpEmail}. Silakan periksa inbox/spam.` : 'Dapatkan Secret Key instan tanpa syarat rumit' }}
        </p>
      </div>

      <form v-if="!showOtpState" novalidate @submit.prevent="handleReg">
        <div class="fg">
          <label class="fl">Nama Pemilik / Toko</label>
          <input type="text" class="fi" v-model="form.name" placeholder="Warung Kopi Erik" />
        </div>

        <div class="fg">
          <label class="fl">Email (Gmail / Outlook / Yahoo / iCloud)</label>
          <input type="email" class="fi" v-model="form.email" placeholder="erik@gmail.com" />
        </div>

        <div class="fg">
          <label class="fl">Password (Min 6 Karakter)</label>
          <div class="pwd-wrap">
            <input :type="showPwd ? 'text' : 'password'" class="fi" v-model="form.password" placeholder="••••••••" />
            <button type="button" class="pwd-btn" @click="showPwd = !showPwd" title="Tampilkan/Sembunyikan Password">
              <svg v-if="!showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <div class="fg fg-cb">
          <label class="cb-label">
            <input type="checkbox" class="cb-input-real" v-model="form.agreeTerms" />
            <span class="custom-checkbox" :class="{ checked: form.agreeTerms }">
              <svg v-if="form.agreeTerms" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span class="cb-text">
              Saya menyetujui <NuxtLink to="/terms" target="_blank" class="al">Syarat & Ketentuan</NuxtLink> serta <NuxtLink to="/privacy" target="_blank" class="al">Kebijakan Privasi</NuxtLink>
            </span>
          </label>
        </div>

        <div class="turnstile-box">
          <div
            ref="turnstileContainer"
            class="cf-turnstile"
            data-sitekey="0x4AAAAAAEJP7uZb-h2_lKGE"
            data-theme="light"
          ></div>
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Mendaftarkan...' : 'Buat Akun Merchant' }}
        </button>
      </form>

      <form v-else novalidate @submit.prevent="handleVerifyOtp">
        <div class="fg">
          <label class="fl">Kode OTP 6-Digit</label>
          <input
            type="text"
            class="fi otp-input"
            v-model="otpCode"
            maxlength="6"
            placeholder="123456"
            autocomplete="one-time-code"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-full mb-xs" :disabled="loading || otpCode.length < 6">
          {{ loading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan Akun' }}
        </button>

        <div class="resend-box">
          <button
            type="button"
            class="btn-text"
            :disabled="resendCountdown > 0 || resendLoading"
            @click="handleResend"
          >
            {{ resendCountdown > 0 ? `Kirim ulang OTP dalam ${resendCountdown}s` : 'Kirim Ulang Kode OTP' }}
          </button>
        </div>
      </form>

      <div class="auth-foot">
        Sudah punya akun? <NuxtLink to="/login" class="al">Masuk</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const { register, verifyOtp, resendOtp } = useAuth();
const swal = useSwal();

const form = ref({ name: '', email: '', password: '', agreeTerms: false });
const showPwd = ref(false);
const loading = ref(false);
const turnstileContainer = ref(null);

const showOtpState = ref(false);
const otpUserId = ref(null);
const otpEmail = ref('');
const otpCode = ref('');
const resendCountdown = ref(0);
const resendLoading = ref(false);
let timer = null;

function startTimer() {
  resendCountdown.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    if (resendCountdown.value > 0) {
      resendCountdown.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
}

onMounted(() => {
  if (process.client) {
    nextTick(() => {
      if (window.turnstile && turnstileContainer.value) {
        try {
          window.turnstile.render(turnstileContainer.value, {
            sitekey: '0x4AAAAAAEJP7uZb-h2_lKGE',
            theme: 'light'
          });
        } catch (e) {}
      }
    });
  }
});

const ALLOWED_DOMAINS = ['gmail.com', 'googlemail.com', 'outlook.com', 'outlook.co.id', 'hotmail.com', 'hotmail.co.id', 'yahoo.com', 'yahoo.co.id', 'yahoo.com.id', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'live.com', 'live.com.id'];
const TEMP_KEYWORDS = ['temp', 'disposable', 'trash', 'fake', 'guerrilla', 'mailinator', '10minute', 'yopmail', 'getnada', 'mohmal', 'generator', 'burner', 'sharklasers', 'dispostable', 'dropmail', 'throwaway', 'crazymailing'];

function isAllowedEmailDomain(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  for (const kw of TEMP_KEYWORDS) {
    if (domain.includes(kw)) return false;
  }
  return ALLOWED_DOMAINS.includes(domain);
}

async function handleReg() {
  if (!form.value.name || !form.value.name.trim()) {
    swal.error('Nama Wajib Diisi', 'Silakan masukkan nama pemilik / toko Anda.');
    return;
  }
  if (!form.value.email || !form.value.email.trim()) {
    swal.error('Email Wajib Diisi', 'Silakan masukkan alamat email Anda.');
    return;
  }
  if (!isAllowedEmailDomain(form.value.email)) {
    swal.error('Email Tidak Diizinkan', 'Gunakan provider email resmi (Gmail, Outlook, Yahoo, atau iCloud). Email sementara / tempmail tidak diizinkan.');
    return;
  }
  if (!form.value.password || form.value.password.length < 6) {
    swal.error('Password Kurang', 'Password minimal 6 karakter.');
    return;
  }
  if (!form.value.agreeTerms) {
    swal.error('Persetujuan Wajib', 'Anda wajib mencentang persetujuan Syarat & Ketentuan serta Kebijakan Privasi untuk mendaftar.');
    return;
  }

  let turnstileToken = '';
  if (process.client && window.turnstile && turnstileContainer.value) {
    try {
      turnstileToken = window.turnstile.getResponse(turnstileContainer.value) || window.turnstile.getResponse() || '';
    } catch (e) {}
  }

  if (!turnstileToken) {
    swal.error('CAPTCHA Wajib Dicentang', 'Silakan centang verifikasi CAPTCHA terlebih dahulu sebelum mendaftar.');
    return;
  }

  loading.value = true;
  const r = await register(form.value.name.trim(), form.value.email.trim(), form.value.password, turnstileToken);
  loading.value = false;

  if (r.success) {
    if (r.requireOtp) {
      navigateTo(`/verify-email?userId=${r.userId}&email=${encodeURIComponent(r.email)}`);
    } else {
      swal.success('Pendaftaran Berhasil!', 'Akun merchant Anda telah aktif.');
      navigateTo('/dashboard');
    }
  } else {
    swal.error('Gagal Mendaftar', r.message);
    if (process.client && window.turnstile && turnstileContainer.value) {
      try { window.turnstile.reset(turnstileContainer.value); } catch (e) {}
    }
  }
}

async function handleVerifyOtp() {
  if (!otpCode.value || otpCode.value.length < 6) {
    swal.error('Kode OTP Kurang', 'Masukkan 6 digit kode OTP yang tertera di email Anda.');
    return;
  }

  loading.value = true;
  const res = await verifyOtp(otpUserId.value, otpCode.value.trim());
  loading.value = false;

  if (res.success) {
    swal.success('Email Terverifikasi!', 'Selamat! Akun Anda telah aktif dan siap digunakan.');
    navigateTo('/dashboard');
  } else {
    swal.error('Verifikasi Gagal', res.message);
  }
}

async function handleResend() {
  resendLoading.value = true;
  const res = await resendOtp(otpUserId.value);
  resendLoading.value = false;
  if (res.success) {
    startTimer();
    swal.success('OTP Terkirim!', 'Kode OTP baru telah dikirimkan ke email Anda.');
  } else {
    swal.error('Gagal Kirim Ulang', res.message);
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; padding: 48px 16px; min-height: 60vh; }
.auth-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px 28px; width: 100%; max-width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.auth-header { text-align: center; margin-bottom: 24px; }
.auth-brand { display: flex; justify-content: center; margin-bottom: 14px; }
.auth-logo { width: 64px; height: 64px; border-radius: 50%; border: 3px solid #00AED6; box-shadow: 0 4px 16px rgba(0,174,214,0.25); object-fit: cover; }
.auth-title { font-size: 1.3rem; font-weight: 800; color: #0F172A; margin-bottom: 4px; }
.auth-sub { font-size: 0.8rem; color: #64748B; }

.fg { margin-bottom: 16px; }
.fl { display: block; font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.fi { width: 100%; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.88rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }

.pwd-wrap { position: relative; display: flex; align-items: center; }
.pwd-wrap .fi { padding-right: 44px; }
.pwd-btn { position: absolute; right: 10px; background: transparent; border: none; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: 0.2s; }
.pwd-btn:hover { color: #0F172A; background: #E2E8F0; }

.fg-cb { margin-top: 18px; margin-bottom: 20px; }
.cb-label { display: flex; align-items: flex-start; gap: 10px; font-size: 0.8rem; color: #475569; cursor: pointer; user-select: none; line-height: 1.45; }
.cb-input-real { display: none; }
.custom-checkbox { width: 20px; height: 20px; border: 2px solid #CBD5E1; border-radius: 6px; background: #F8FAFC; display: flex; align-items: center; justify-content: center; color: #fff; transition: all 0.2s ease; flex-shrink: 0; margin-top: 1px; }
.cb-label:hover .custom-checkbox { border-color: #00AED6; }
.custom-checkbox.checked { background: #00AED6; border-color: #00AED6; box-shadow: 0 2px 6px rgba(0,174,214,0.3); }
.cb-text { flex: 1; }

.turnstile-box { display: flex; justify-content: center; margin: 16px 0 12px; min-height: 65px; width: 100%; overflow: hidden; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-full { width: 100%; margin-top: 8px; }

.otp-input { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; font-weight: 800; text-align: center; letter-spacing: 8px; color: #00AED6; background: #F0F9FF; border: 2px solid #00AED6; }
.mb-xs { margin-bottom: 12px; }
.resend-box { text-align: center; margin-top: 10px; }
.btn-text { background: transparent; border: none; color: #00AED6; font-weight: 700; font-size: 0.8rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.btn-text:disabled { color: #94A3B8; cursor: not-allowed; }
.btn-text:not(:disabled):hover { text-decoration: underline; background: #F1F5F9; }

.auth-foot { text-align: center; margin-top: 18px; font-size: 0.8rem; color: #64748B; }
.al { color: #00AED6; font-weight: 700; text-decoration: none; }
.al:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .auth-page { padding: 24px 12px; }
  .auth-card { padding: 24px 18px; }
  .auth-logo { width: 56px; height: 56px; }
  .auth-title { font-size: 1.1rem; }
}
</style>
