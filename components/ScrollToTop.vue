<template>
  <div class="floating-widget-container">

    <Transition name="cs-pop">
      <div v-if="isCsOpen" class="cs-card">
        <div class="cs-card-header">
          <div class="cs-avatar-box">
            <svg class="cs-headset-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
            <span class="online-indicator"></span>
          </div>
          <div class="cs-header-info">
            <strong>Pusat Bantuan CS</strong>
            <span class="cs-online-txt">Online • Balasan &lt; 5 Menit</span>
          </div>
          <button class="cs-close-btn" @click="isCsOpen = false" title="Tutup Menu">&times;</button>
        </div>

        <div class="cs-options-container">
          <a :href="whatsappUrl" target="_blank" class="cs-opt-card wa-card" @click="isCsOpen = false">
            <div class="cs-brand-icon wa-brand">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div class="cs-opt-body">
              <strong>WhatsApp Live Chat</strong>
              <span>Respon Cepat via WhatsApp</span>
            </div>
            <svg class="cs-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </a>

          <a :href="whatsappChannelUrl" target="_blank" class="cs-opt-card wachannel-card" @click="isCsOpen = false">
            <div class="cs-brand-icon wachannel-brand">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.957-1.393A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/>
              </svg>
            </div>
            <div class="cs-opt-body">
              <strong>Channel WhatsApp Official</strong>
              <span>Info Update & Pengumuman</span>
            </div>
            <svg class="cs-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </a>

          <a :href="telegramUrl" target="_blank" class="cs-opt-card tg-card" @click="isCsOpen = false">
            <div class="cs-brand-icon tg-brand">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div class="cs-opt-body">
              <strong>Telegram Official</strong>
              <span>Chat Admin</span>
            </div>
            <svg class="cs-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </a>
        </div>

        <div class="cs-footer">
          <span class="cs-footer-text">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:3px;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            Layanan Bantuan Resmi WARUNGERIKPAY
          </span>
        </div>
      </div>
    </Transition>

    <button
      @click="isCsOpen = !isCsOpen"
      class="cs-main-btn"
      :class="{ 'with-scroll-active': isVisible, 'is-open': isCsOpen }"
      aria-label="Layanan Bantuan CS"
      title="Bantuan CS (WhatsApp & Telegram)"
    >
      <span class="cs-dot-pulse"></span>
      <svg class="cs-btn-headset" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
      </svg>
      <span class="cs-badge-text">CS</span>
    </button>

    <Transition name="fade-top">
      <button
        v-if="isVisible"
        @click="scrollToTop"
        class="scroll-to-top-btn"
        aria-label="Kembali ke Atas"
        title="Kembali ke Atas"
      >
        <svg class="top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const whatsappUrl = ref('https://wa.me/6285183129647');
const whatsappChannelUrl = ref('https://whatsapp.com/channel/0029Vb6OUD2BlHpU2JFUtQ1y');
const telegramUrl = ref('https://t.me/warung_erik');

const isVisible = ref(false);
const isCsOpen = ref(false);

const handleScroll = () => {
  if (typeof window !== 'undefined') {
    isVisible.value = window.scrollY > 250;
  }
};

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.floating-widget-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

.floating-widget-container > * {
  pointer-events: auto;
}

.cs-main-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 28px -6px rgba(13, 148, 136, 0.45), 0 6px 12px -4px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}

.cs-main-btn.with-scroll-active {
  bottom: 86px;
}

.cs-main-btn:hover {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 18px 36px -6px rgba(13, 148, 136, 0.55), 0 10px 16px -6px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #0369a1 0%, #0f766e 100%);
}

.cs-main-btn.is-open {
  background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cs-btn-headset {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.cs-main-btn:hover .cs-btn-headset {
  transform: scale(1.1);
}

.cs-badge-text {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.cs-dot-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #10B981;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 10px #10B981;
  animation: pulseDot 2.2s infinite;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.cs-card {
  position: fixed;
  bottom: 88px;
  right: 28px;
  width: 300px;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18), 0 10px 20px -5px rgba(0, 0, 0, 0.06);
  padding: 18px;
  z-index: 10000;
  box-sizing: border-box;
}

.cs-main-btn.with-scroll-active ~ .cs-card {
  bottom: 146px;
}

.cs-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #F1F5F9;
  margin-bottom: 14px;
  position: relative;
}

.cs-avatar-box {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00AED6 0%, #0891B2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cs-headset-icon {
  width: 22px;
  height: 22px;
}

.online-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #22C55E;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.cs-header-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cs-header-info strong {
  font-size: 0.88rem;
  color: #0F172A;
  font-weight: 800;
}

.cs-online-txt {
  font-size: 0.7rem;
  color: #059669;
  font-weight: 700;
  margin-top: 1px;
}

.cs-close-btn {
  background: #F1F5F9;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 1.2rem;
  color: #64748B;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cs-close-btn:hover {
  background: #E2E8F0;
  color: #0F172A;
}

.cs-options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cs-opt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.wa-card {
  background: #F0FDF4;
  border-color: #DCFCE7;
}

.wa-card:hover {
  background: #DCFCE7;
  border-color: #86EFAC;
  transform: translateX(-3px);
}

.wachannel-card {
  background: #ECFDF5;
  border-color: #A7F3D0;
}

.wachannel-card:hover {
  background: #D1FAE5;
  border-color: #6EE7B7;
  transform: translateX(-3px);
}

.tg-card {
  background: #F0F9FF;
  border-color: #E0F2FE;
}

.tg-card:hover {
  background: #E0F2FE;
  border-color: #7DD3FC;
  transform: translateX(-3px);
}

.cs-brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.wa-brand {
  background: #25D366;
}

.wachannel-brand {
  background: #059669;
}

.tg-brand {
  background: #0088CC;
}

.cs-opt-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.cs-opt-body strong {
  font-size: 0.82rem;
  color: #0F172A;
  font-weight: 700;
}

.cs-opt-body span {
  font-size: 0.7rem;
  color: #64748B;
  margin-top: 1px;
}

.cs-arrow {
  width: 18px;
  height: 18px;
  color: #94A3B8;
  transition: transform 0.2s ease;
}

.cs-opt-card:hover .cs-arrow {
  transform: translateX(3px);
  color: #0F172A;
}

.cs-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #F1F5F9;
  text-align: center;
  font-size: 0.68rem;
  color: #94A3B8;
  font-weight: 600;
}

.scroll-to-top-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 12px 28px -6px rgba(37, 99, 235, 0.45), 0 6px 12px -4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9998;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}

.scroll-to-top-btn:hover {
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 18px 36px -6px rgba(37, 99, 235, 0.55), 0 10px 16px -6px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #0369a1 0%, #1d4ed8 100%);
}

.scroll-to-top-btn:active {
  transform: translateY(-1px) scale(0.98);
}

.top-icon {
  width: 22px;
  height: 22px;
  transition: transform 0.2s ease;
}

.scroll-to-top-btn:hover .top-icon {
  transform: translateY(-2px);
}

.fade-top-enter-active,
.fade-top-leave-active,
.cs-pop-enter-active,
.cs-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-top-enter-from,
.fade-top-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.8);
}

.cs-pop-enter-from,
.cs-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

@media (max-width: 768px) {
  .cs-main-btn, .scroll-to-top-btn {
    right: 16px;
    width: 44px;
    height: 44px;
  }
  .cs-main-btn {
    bottom: 20px;
  }
  .cs-main-btn.with-scroll-active {
    bottom: 72px;
  }
  .scroll-to-top-btn {
    bottom: 20px;
  }
  .cs-card {
    right: 16px;
    bottom: 74px;
    width: calc(100vw - 32px);
    max-width: 300px;
  }
}
</style>
