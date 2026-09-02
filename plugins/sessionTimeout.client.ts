export default defineNuxtPlugin(() => {
  if (!process.client) return;

  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;
  let inactivityTimer: any = null;
  let lastResetTime = 0;

  function checkInactivityOnLoad() {
    const token = localStorage.getItem('wepay_token');
    if (!token) return false;

    const lastActiveStr = localStorage.getItem('wepay_last_active');
    const now = Date.now();

    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (!isNaN(lastActive) && now - lastActive >= INACTIVITY_LIMIT_MS) {
        handleAutoLogout();
        return true;
      }
    }
    localStorage.setItem('wepay_last_active', String(now));
    return false;
  }

  function resetInactivityTimer() {
    const now = Date.now();
    const token = localStorage.getItem('wepay_token');
    if (!token) return;

    const lastActiveStr = localStorage.getItem('wepay_last_active');
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (!isNaN(lastActive) && now - lastActive >= INACTIVITY_LIMIT_MS) {
        handleAutoLogout();
        return;
      }
    }

    if (now - lastResetTime < 4000) return;
    lastResetTime = now;
    localStorage.setItem('wepay_last_active', String(now));

    if (inactivityTimer) clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      handleAutoLogout();
    }, INACTIVITY_LIMIT_MS);
  }

  function handleAutoLogout() {
    const token = localStorage.getItem('wepay_token');
    if (!token) return;

    localStorage.removeItem('wepay_token');
    localStorage.removeItem('wepay_last_active');

    const { logout } = useAuth();
    logout('Demi keamanan akun merchant Anda, sesi login otomatis ditutup karena tidak ada aktivitas selama 15 menit.');

    const swal = useSwal();
    swal.warning(
      'Sesi Login Berakhir (15 Menit)',
      'Demi keamanan akun merchant Anda, sesi login otomatis ditutup karena tidak ada aktivitas selama 15 menit. Silakan login kembali.'
    );
  }

  const isExpired = checkInactivityOnLoad();
  if (isExpired) return;

  const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, resetInactivityTimer, { passive: true });
  });

  window.addEventListener('focus', () => {
    checkInactivityOnLoad();
  });

  resetInactivityTimer();
});
