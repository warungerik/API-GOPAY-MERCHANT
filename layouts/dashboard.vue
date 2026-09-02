<template>
  <div class="app-shell">

    <nav class="navbar">
      <NuxtLink to="/" class="nav-brand">
        <img src="/logo.png?v=2" alt="WARUNGERIKPAY" class="brand-logo" />
        <div class="brand-info">
          <div class="brand-row">
            <span class="brand-title">WARUNGERIKPAY</span>
            <span class="brand-badge">MERCHANT</span>
          </div>
          <span class="brand-sub">Welcome, {{ currentUser?.name }}</span>
        </div>
      </NuxtLink>

      <div class="nav-actions">
        <NuxtLink to="/" class="btn btn-ghost btn-sm desktop-only">Beranda</NuxtLink>
        <button class="btn btn-outline btn-sm desktop-only" @click="logout()">
          Keluar
        </button>

        <button class="hamburger-btn mobile-only" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Buka Menu Sidebar">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </nav>

    <Transition name="drawer">
      <div v-if="isMobileMenuOpen" class="mobile-drawer-backdrop" @click="isMobileMenuOpen = false">
        <div class="mobile-drawer-card" @click.stop>
          <div class="drawer-header">
            <div class="drawer-user-info">
              <img src="/logo.png?v=2" class="drawer-avatar" alt="WARUNGERIKPAY" />
              <div class="drawer-user-text">
                <strong>{{ currentUser?.name || 'Merchant' }}</strong>
                <span>{{ currentUser?.email }}</span>
              </div>
            </div>
            <button class="drawer-close-btn" @click="isMobileMenuOpen = false" title="Tutup Menu">&times;</button>
          </div>

          <ul class="drawer-menu-list">
            <li>
              <NuxtLink to="/dashboard" class="drawer-item" exact-active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Ringkasan Merchant</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/withdraw" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Kelola Withdraw</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/keys" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Kunci API</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/settings" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Pengaturan Akun</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/notifications" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Bot Telegram Notifikasi</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/transactions" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Riwayat Transaksi</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/settlements" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Riwayat Settlement</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/docs" class="drawer-item" active-class="active" @click="isMobileMenuOpen = false">
                <span class="drawer-label">Dokumentasi API</span>
              </NuxtLink>
            </li>
          </ul>

          <div class="drawer-footer">
            <NuxtLink to="/" class="btn btn-ghost btn-full" @click="isMobileMenuOpen = false">Beranda Utama</NuxtLink>
            <button class="btn btn-outline btn-full" @click="logout()">Keluar Akun</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast-fade">
      <div class="toast" v-if="toastMessage">
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <main class="main-container">
      <div class="dashboard-grid">

        <aside class="sidebar desktop-only">
          <ul class="sidebar-menu">
            <li>
              <NuxtLink to="/dashboard" class="sidebar-item" exact-active-class="active">
                <span class="sidebar-label">Ringkasan Merchant</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/withdraw" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Kelola Withdraw</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/keys" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Kunci API</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/settings" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Pengaturan Akun</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/notifications" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Bot Telegram Notifikasi</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/transactions" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Riwayat Transaksi</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/settlements" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Riwayat Settlement</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/dashboard/docs" class="sidebar-item" active-class="active">
                <span class="sidebar-label">Dokumentasi API</span>
              </NuxtLink>
            </li>
          </ul>
        </aside>

        <section class="content-area">
          <slot />
        </section>
      </div>
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
            <NuxtLink to="/dashboard/settings" class="footer-link">Pengaturan Akun</NuxtLink>
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
import { ref, onMounted } from 'vue';

definePageMeta({ layout: 'dashboard' });

const { currentUser, token, toastMessage, logout, initToken } = useAuth();
const isMobileMenuOpen = ref(false);

onMounted(() => {
  initToken();
  if (process.client) {
    if (!token.value) {
      navigateTo('/login');
    } else if (currentUser.value && currentUser.value.role === 'ADMIN') {
      navigateTo('/admin');
    }
  }
});
</script>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; overflow-x: clip; }

.navbar {
  position: sticky; top: 0; z-index: 1000;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #E2E8F0; box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.06); padding: 10px 24px;
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  width: 100%; box-sizing: border-box;
}

.nav-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: #1E293B; flex-shrink: 0; }
.brand-logo { width: 34px; height: 34px; border-radius: 50%; border: 2px solid #00AED6; flex-shrink: 0; }
.brand-info { display: flex; flex-direction: column; }
.brand-row { display: flex; align-items: center; gap: 6px; }
.brand-title { font-size: 0.95rem; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; }
.brand-badge { background: #F3E8FF; color: #7C3AED; font-size: 0.58rem; font-weight: 800; padding: 1px 7px; border-radius: 12px; border: 1px solid #DDD6FE; }
.brand-sub { font-size: 0.68rem; color: #64748B; }
.nav-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.hamburger-btn {
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  color: #0F172A;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.hamburger-btn:hover { background: #E0F7FA; color: #00AED6; border-color: #00AED6; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap;
}
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; border-color: #94A3B8; }
.btn-ghost { background: transparent; color: #64748B; }
.btn-ghost:hover { background: #F1F5F9; color: #0F172A; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; border-radius: 8px; }
.btn-full { width: 100%; margin-top: 6px; }

.mobile-drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex;
  justify-content: flex-start;
}

.mobile-drawer-card {
  width: 280px;
  max-width: 85vw;
  height: 100%;
  background: #ffffff;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #E2E8F0;
  margin-bottom: 16px;
}

.drawer-user-info { display: flex; align-items: center; gap: 10px; }
.drawer-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid #00AED6; }
.drawer-user-text { display: flex; flex-direction: column; max-width: 160px; }
.drawer-user-text strong { font-size: 0.85rem; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.drawer-user-text span { font-size: 0.72rem; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.drawer-close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #64748B;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.drawer-menu-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; flex: 1; }
.drawer-item {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px;
  color: #334155; font-weight: 600; font-size: 0.88rem; text-decoration: none; transition: 0.2s;
}
.drawer-item:hover { background: #F1F5F9; color: #00AED6; }
.drawer-item.active { background: #E0F7FA; color: #00838F; font-weight: 800; }
.drawer-item.item-admin { color: #DC2626; }
.drawer-item.item-admin.active { background: #FEF2F2; color: #B91C1C; }

.drawer-footer { padding-top: 16px; border-top: 1px solid #E2E8F0; margin-top: auto; display: flex; flex-direction: column; gap: 6px; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .mobile-drawer-card, .drawer-leave-active .mobile-drawer-card { transition: transform 0.25s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .mobile-drawer-card, .drawer-leave-to .mobile-drawer-card { transform: translateX(-100%); }

.desktop-only { display: flex; }
.mobile-only { display: none; }

.toast {
  position: fixed; bottom: 16px; right: 16px; left: 16px; z-index: 1000;
  padding: 12px 18px; background: #fff; border: 1px solid #10B981; color: #1E293B;
  border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 10px;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(20px); }

.main-container { max-width: 1200px; margin: 0 auto; padding: 20px 16px; flex: 1; width: 100%; box-sizing: border-box; }

.dashboard-grid { display: grid; grid-template-columns: 210px 1fr; gap: 20px; min-height: 70vh; width: 100%; box-sizing: border-box; }

.sidebar {
  background: #fff; border: 1px solid #E2E8F0; border-radius: 14px;
  padding: 12px; height: fit-content; position: sticky; top: 70px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box;
}
.sidebar-menu { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.sidebar-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px;
  color: #64748B; font-weight: 600; font-size: 0.84rem; cursor: pointer;
  transition: 0.2s; text-decoration: none; white-space: nowrap;
}
.sidebar-item:hover { background: #F1F5F9; color: #334155; }
.sidebar-item.active { background: #E0F7FA; color: #00838F; font-weight: 700; }
.item-admin { color: #DC2626; font-weight: 800; }
.item-admin.active { background: #FEF2F2; color: #B91C1C; }

.content-area { min-width: 0; width: 100%; box-sizing: border-box; }

.footer { background: #0F172A; color: #CBD5E1; margin-top: auto; width: 100%; }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 48px 24px 24px; box-sizing: border-box; }
.footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 24px; margin-bottom: 32px; }
.footer-brand-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.footer-logo { width: 52px; height: 52px; border-radius: 50%; border: 2px solid #00AED6; box-shadow: 0 4px 14px rgba(0, 174, 214, 0.4); object-fit: cover; }
.footer-brand-name { font-size: 1.1rem; font-weight: 800; color: #FFF; }
.footer-desc { font-size: 0.82rem; color: #94A3B8; line-height: 1.6; max-width: 280px; }
.footer-heading { font-size: 0.78rem; font-weight: 800; color: #FFF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
.footer-col { display: flex; flex-direction: column; gap: 8px; }
.footer-link { color: #94A3B8; text-decoration: none; font-size: 0.82rem; font-weight: 500; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
.footer-link:hover { color: #00AED6; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 0.75rem; color: #64748B; }
.footer-powered strong { color: #00AED6; }

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }

  .navbar { padding: 8px 12px; gap: 6px; }
  .brand-logo { width: 28px; height: 28px; }
  .brand-title { font-size: 0.82rem; }
  .brand-badge, .brand-sub { display: none; }
  .btn-sm { padding: 5px 10px; font-size: 0.75rem; }
  .main-container { padding: 12px 10px; }
  .dashboard-grid { grid-template-columns: 1fr; gap: 12px; }

  .toast { bottom: 10px; left: 8px; right: 8px; font-size: 0.8rem; padding: 10px 14px; }
  .footer-inner { padding: 32px 16px 20px; }
  .footer-grid { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; text-align: center; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 170px 1fr; gap: 16px; }
  .sidebar-item { padding: 8px 12px; font-size: 0.8rem; }
  .toast { left: auto; right: 16px; max-width: 360px; }
  .footer-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
}
</style>
