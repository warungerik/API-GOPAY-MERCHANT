<template>
  <div class="app-shell">

    <nav class="navbar">
      <NuxtLink to="/" class="nav-brand">
        <img src="/logo.png?v=2" alt="WARUNGERIKPAY" class="brand-logo" />
        <div class="brand-info">
          <div class="brand-row">
            <span class="brand-title">WARUNGERIKPAY</span>
          </div>
          <span class="brand-sub">Payment Gateway QRIS Auto Settlement</span>
        </div>
      </NuxtLink>

      <div class="nav-menu">
        <NuxtLink to="/" class="nav-link">Beranda</NuxtLink>
        <NuxtLink to="/dashboard/docs" class="nav-link">Dokumentasi</NuxtLink>
      </div>

      <div class="nav-actions">
        <template v-if="currentUser">
          <NuxtLink to="/dashboard" class="btn btn-primary btn-sm">Dashboard</NuxtLink>
          <button class="btn btn-outline btn-sm" @click="logout()">Keluar</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn btn-outline btn-sm">Masuk</NuxtLink>
          <NuxtLink to="/register" class="btn btn-primary btn-sm">Daftar</NuxtLink>
        </template>
      </div>
    </nav>

    <Transition name="toast-fade">
      <div class="toast" v-if="toastMessage">
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <main class="main-container">
      <slot />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-brand-row">
              <img src="/logo.png?v=2" alt="WARUNGERIKPAY" class="footer-logo" />
              <span class="footer-brand-name">WARUNGERIKPAY</span>
            </div>
            <p class="footer-desc">Platform Payment Gateway QRIS otomatis untuk semua orang. Tanpa ribet, langsung pakai.</p>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Navigasi</h4>
            <NuxtLink to="/" class="footer-link">Beranda</NuxtLink>
            <NuxtLink to="/register" class="footer-link">Daftar Akun</NuxtLink>
            <NuxtLink to="/login" class="footer-link">Login</NuxtLink>
            <NuxtLink to="/dashboard/docs" class="footer-link">Dokumentasi API</NuxtLink>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Merchant Portal</h4>
            <NuxtLink to="/dashboard" class="footer-link">Dashboard</NuxtLink>
            <NuxtLink to="/dashboard/keys" class="footer-link">Kelola API Key</NuxtLink>
            <NuxtLink to="/dashboard/settings" class="footer-link">Webhook Settings</NuxtLink>
            <NuxtLink to="/dashboard/transactions" class="footer-link">Riwayat Transaksi</NuxtLink>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Legal & Ketentuan</h4>
            <NuxtLink to="/terms" class="footer-link">Syarat & Ketentuan</NuxtLink>
            <NuxtLink to="/privacy" class="footer-link">Kebijakan Privasi</NuxtLink>
          </div>
          <div class="footer-col">
            <h4 class="footer-heading">Kontak & Dukungan</h4>
            <a href="https://wa.me/6285183129647" target="_blank" class="footer-link">WhatsApp CS (085183129647)</a>
            <a href="https://whatsapp.com/channel/0029Vb6OUD2BlHpU2JFUtQ1y" target="_blank" class="footer-link">Channel WhatsApp Official</a>
            <a href="https://t.me/warung_erik" target="_blank" class="footer-link">Telegram (@warung_erik)</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; {{ new Date().getFullYear() }} WARUNGERIKPAY. All rights reserved.</span>
          <span class="footer-powered">Powered by <strong>WARUNGERIK</strong></span>
        </div>
      </div>
    </footer>

    <ScrollToTop />
  </div>
</template>

<script setup>
const { currentUser, toastMessage, logout, initToken } = useAuth();

onMounted(() => {
  initToken();
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  overflow-x: clip;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.06);
  padding: 10px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #1E293B;
  flex-shrink: 0;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #00AED6;
  flex-shrink: 0;
}

.brand-info { display: flex; flex-direction: column; }
.brand-row { display: flex; align-items: center; gap: 6px; }

.brand-title {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #0F172A;
}

.brand-badge {
  background: #E0F7FA;
  color: #00838F;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 12px;
  border: 1px solid #B2EBF2;
}

.brand-sub { font-size: 0.68rem; color: #64748B; }

.nav-menu { display: flex; align-items: center; gap: 8px; }

.nav-link {
  color: #64748B;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: 0.2s;
}

.nav-link:hover, .nav-link.router-link-active {
  color: #0F172A;
  background: #F1F5F9;
}

.nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease; border: none; outline: none;
  text-decoration: none; white-space: nowrap;
}

.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; transform: translateY(-1px); }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; border-color: #94A3B8; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; border-radius: 8px; }

.toast {
  position: fixed; bottom: 16px; right: 16px; left: 16px; z-index: 1000;
  padding: 12px 18px; background: #fff; border: 1px solid #10B981;
  color: #1E293B; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 10px;
}

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(20px); }

.main-container { max-width: 1200px; width: 100%; box-sizing: border-box; overflow-x: hidden; margin: 0 auto; padding: 24px 16px; flex: 1; }

.footer {
  background: #0F172A;
  color: #CBD5E1;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.footer-logo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid #00AED6;
  box-shadow: 0 4px 14px rgba(0, 174, 214, 0.4);
  object-fit: cover;
}

.footer-brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: #FFF;
}

.footer-desc {
  font-size: 0.82rem;
  color: #94A3B8;
  line-height: 1.6;
  max-width: 280px;
}

.footer-heading {
  font-size: 0.78rem;
  font-weight: 800;
  color: #FFF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: #94A3B8;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-link:hover { color: #00AED6; }

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  color: #64748B;
}

.footer-powered strong { color: #00AED6; }

@media (max-width: 768px) {
  .navbar { padding: 8px 12px; gap: 8px; }
  .brand-logo { width: 30px; height: 30px; }
  .brand-title { font-size: 0.82rem; }
  .brand-badge, .brand-sub { display: none; }
  .nav-menu { display: none; }
  .btn-sm { padding: 5px 9px; font-size: 0.72rem; }
  .main-container { padding: 14px 10px; }
  .toast { bottom: 10px; left: 8px; right: 8px; font-size: 0.8rem; padding: 10px 14px; }

  .footer-inner { padding: 32px 16px 20px; }
  .footer-grid { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .nav-link { font-size: 0.78rem; padding: 4px 8px; }
  .toast { left: auto; right: 16px; max-width: 360px; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
}

@media (min-width: 1025px) {
  .toast { left: auto; right: 20px; max-width: 400px; }
}
</style>
