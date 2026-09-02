<template>
  <div>

    <NuxtLoadingIndicator color="linear-gradient(90deg, #00AED6 0%, #10B981 100%)" :height="3" />

    <Transition name="fade-loader">
      <div v-if="isLoading" class="global-page-loader">
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <img src="/logo.png?v=2" class="loader-logo" alt="WARUNGERIKPAY" />
          <div class="loader-text">Memuat Halaman...</div>
        </div>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <CookieConsent />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isLoading = ref(true);

onMounted(() => {

  setTimeout(() => {
    isLoading.value = false;
  }, 250);

  if (process.client) {
    const router = useRouter();
    router.beforeEach((to, from, next) => {
      if (to.path !== from.path) {
        isLoading.value = true;
      }
      next();
    });
    router.afterEach(() => {
      setTimeout(() => {
        isLoading.value = false;
      }, 200);
    });
  }
});
</script>

<style>

.page-enter-active,
.page-leave-active,
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from,
.page-leave-to,
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.global-page-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.loader-spinner {
  width: 68px;
  height: 68px;
  border: 3px solid #E2E8F0;
  border-top-color: #00AED6;
  border-right-color: #10B981;
  border-radius: 50%;
  animation: spinLoader 0.75s linear infinite;
}

.loader-logo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: absolute;
  top: 12px;
  box-shadow: 0 4px 12px rgba(0,174,214,0.3);
  object-fit: cover;
}

.loader-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748B;
  letter-spacing: 0.3px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-top: 4px;
}

@keyframes spinLoader {
  to { transform: rotate(360deg); }
}

.fade-loader-enter-active,
.fade-loader-leave-active {
  transition: opacity 0.25s ease;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
  opacity: 0;
}
</style>
