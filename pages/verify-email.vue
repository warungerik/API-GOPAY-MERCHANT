<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-brand">
          <img src="/logo.png?v=2" alt="WARUNGERIKPAY Logo" class="auth-logo" />
        </div>
        <h2 class="auth-title">Verifikasi Email Akun</h2>
        <p class="auth-sub">
          Kode 6-digit OTP telah dikirimkan ke <strong>{{ userEmail || 'email Anda' }}</strong>. Silakan masukkan kode di bawah untuk mengaktifkan akun.
        </p>
      </div>

      <form novalidate @submit.prevent="handleVerifyOtp">
        <div class="fg">
          <label class="fl">Kode OTP 6-Digit</label>
          <input
            type="text"
            class="fi otp-input"
            v-model="otpCode"
            maxlength="6"
            placeholder="123456"
            autocomplete="one-time-code"
            ref="otpInputRef"
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
        Kembali ke <NuxtLink to="/login" class="al">Halaman Login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const route = useRoute();
const { verifyOtp, resendOtp } = useAuth();
const swal = useSwal();

const userId = ref(route.query.userId || '');
const userEmail = ref(route.query.email || '');
const otpCode = ref('');
const loading = ref(false);
const resendCountdown = ref(60);
const resendLoading = ref(false);
const otpInputRef = ref(null);
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
  startTimer();
  if (process.client && otpInputRef.value) {
    otpInputRef.value.focus();
  }
});

async function handleVerifyOtp() {
  if (!userId.value) {
    swal.error('ID Pengguna Hilang', 'Silakan login ulang untuk mendapatkan OTP.');
    navigateTo('/login');
    return;
  }
  if (!otpCode.value || otpCode.value.length < 6) {
    swal.error('Kode OTP Kurang', 'Masukkan 6 digit kode OTP yang tertera di email Anda.');
    return;
  }

  loading.value = true;
  const res = await verifyOtp(Number(userId.value), otpCode.value.trim());
  loading.value = false;

  if (res.success) {
    swal.success('Email Terverifikasi!', 'Selamat! Akun Anda telah aktif dan siap digunakan.');
    if (res.role === 'ADMIN') navigateTo('/admin');
    else navigateTo('/dashboard');
  } else {
    swal.error('Verifikasi Gagal', res.message);
  }
}

async function handleResend() {
  if (!userId.value) return;
  resendLoading.value = true;
  const res = await resendOtp(Number(userId.value));
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
.auth-sub { font-size: 0.8rem; color: #64748B; line-height: 1.5; }

.fg { margin-bottom: 16px; }
.fl { display: block; font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.fi { width: 100%; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.88rem; outline: none; transition: 0.2s; box-sizing: border-box; }

.otp-input { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; font-weight: 800; text-align: center; letter-spacing: 8px; color: #00AED6; background: #F0F9FF; border: 2px solid #00AED6; }
.mb-xs { margin-bottom: 12px; }
.resend-box { text-align: center; margin-top: 10px; }
.btn-text { background: transparent; border: none; color: #00AED6; font-weight: 700; font-size: 0.8rem; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.btn-text:disabled { color: #94A3B8; cursor: not-allowed; }
.btn-text:not(:disabled):hover { text-decoration: underline; background: #F1F5F9; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; border-radius: 12px; font-size: 0.88rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-full { width: 100%; margin-top: 8px; }

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
