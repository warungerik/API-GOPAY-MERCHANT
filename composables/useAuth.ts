export const useAuth = () => {
  const currentUser = useState<any>('currentUser', () => null);
  const token = useState<string>('token', () => '');
  const toastMessage = useState<string>('toastMessage', () => '');

  function showToast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    toastMessage.value = msg;
    if (process.client) {
      const swal = useSwal();
      swal.toast(msg, type);
    }
    setTimeout(() => {
      toastMessage.value = '';
    }, 3500);
  }

  function initToken() {
    if (process.client) {
      const savedToken = localStorage.getItem('wepay_token');
      if (savedToken) {
        token.value = savedToken;
        checkMe();
      }
    }
  }

  if (process.client && !token.value) {
    const savedToken = localStorage.getItem('wepay_token');
    if (savedToken) {
      token.value = savedToken;
    }
  }

  async function checkMe() {
    const t = token.value || (process.client ? localStorage.getItem('wepay_token') : '');
    if (!t) return;
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${t}` }
      });
      const json = await res.json();
      if (json.success) {
        currentUser.value = json.data;
      } else {
        logout();
      }
    } catch (e) {
      logout();
    }
  }

  async function login(email: string, pass: string, turnstileToken?: string) {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, turnstileToken })
    });
    const json = await res.json();
    if (json.success) {
      token.value = json.data.token;
      currentUser.value = json.data.user;
      if (process.client) {
        localStorage.setItem('wepay_token', json.data.token);
      }
      showToast('Login Berhasil! Selamat datang.', 'success');
      return { success: true, role: json.data.user.role };
    }
    if (json.requireOtp) {
      return { success: false, requireOtp: true, userId: json.userId, email: json.email, message: json.message };
    }
    return { success: false, message: json.message || 'Login gagal' };
  }

  async function register(name: string, email: string, pass: string, turnstileToken?: string) {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, turnstileToken })
    });
    const json = await res.json();
    if (json.success) {
      if (json.requireOtp) {
        showToast(json.message || 'Kode OTP telah dikirim ke email Anda!', 'info');
        return { success: true, requireOtp: true, userId: json.userId, email: json.email, message: json.message };
      }
      token.value = json.data.token;
      currentUser.value = json.data.user;
      if (process.client) {
        localStorage.setItem('wepay_token', json.data.token);
      }
      showToast('Pendaftaran akun merchant berhasil!', 'success');
      return { success: true };
    }
    return { success: false, message: json.message || 'Pendaftaran gagal' };
  }

  async function verifyOtp(userId: number, otpCode: string) {
    const res = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otpCode })
    });
    const json = await res.json();
    if (json.success) {
      token.value = json.data.token;
      currentUser.value = json.data.user;
      if (process.client) {
        localStorage.setItem('wepay_token', json.data.token);
      }
      showToast('Verifikasi email berhasil! Selamat datang.', 'success');
      return { success: true, role: json.data.user.role };
    }
    return { success: false, message: json.message || 'Verifikasi OTP gagal' };
  }

  async function resendOtp(userId: number) {
    const res = await fetch('/api/v1/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Kode OTP baru telah dikirim!', 'success');
      return { success: true };
    }
    return { success: false, message: json.message || 'Gagal mengirim OTP' };
  }

  function logout(msg?: string | any) {
    token.value = '';
    currentUser.value = null;
    if (process.client) {
      localStorage.removeItem('wepay_token');
    }
    const message = (typeof msg === 'string' && msg.trim() !== '') ? msg : 'Kamu telah keluar dari akun.';
    showToast(message, 'info');
    navigateTo('/login');
  }

  return {
    currentUser,
    token,
    toastMessage,
    showToast,
    initToken,
    checkMe,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout
  };
};
