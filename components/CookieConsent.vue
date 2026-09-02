<template>
  <Transition name="cookie-slide">
    <div v-if="isVisible" class="cookie-banner-container">
      <div class="cookie-banner-card">
        <div class="cookie-banner-content">
          <div class="cookie-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="M9 12l2 2 4-4"></path>
            </svg>
          </div>
          <div class="cookie-text-box">
            <strong class="cookie-title">Privasi & Cookie Sesi</strong>
            <p class="cookie-desc">
              Kami menggunakan cookie dan penyimpanan lokal aman untuk menjaga sesi login, keamanan transaksi, dan kenyamanan navigasi Anda.
            </p>
          </div>
        </div>

        <div class="cookie-actions">
          <NuxtLink to="/privacy" class="cookie-link">Kebijakan Privasi</NuxtLink>
          <button class="cookie-accept-btn" @click="acceptCookies">Setuju & Lanjutkan</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isVisible = ref(false);

onMounted(() => {
  if (process.client) {
    const consent = localStorage.getItem('wepay_cookie_consent');
    if (!consent) {
      setTimeout(() => {
        isVisible.value = true;
      }, 1000);
    }
  }
});

function acceptCookies() {
  if (process.client) {
    localStorage.setItem('wepay_cookie_consent', 'true');
    isVisible.value = false;
  }
}
</script>

<style scoped>
.cookie-banner-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 99999;
  max-width: 440px;
  width: calc(100% - 48px);
  box-sizing: border-box;
}

.cookie-banner-card {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cookie-banner-content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.cookie-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(0, 174, 214, 0.15);
  border: 1px solid rgba(0, 174, 214, 0.3);
  color: #00AED6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cookie-text-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cookie-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.2px;
}

.cookie-desc {
  font-size: 0.78rem;
  color: #94A3B8;
  line-height: 1.45;
  margin: 0;
}

.cookie-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cookie-link {
  color: #94A3B8;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: 0.2s;
}
.cookie-link:hover {
  color: #00AED6;
}

.cookie-accept-btn {
  background: #00AED6;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 174, 214, 0.3);
}
.cookie-accept-btn:hover {
  background: #0096B8;
  transform: translateY(-1px);
}

.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cookie-slide-enter-from,
.cookie-slide-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.96);
}

@media (max-width: 768px) {
  .cookie-banner-container {
    bottom: 16px;
    left: 16px;
    width: calc(100% - 32px);
    max-width: 100%;
  }
  .cookie-banner-card {
    padding: 14px 16px;
    gap: 10px;
  }
  .cookie-title { font-size: 0.85rem; }
  .cookie-desc { font-size: 0.72rem; }
}
</style>
