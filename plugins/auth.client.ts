export default defineNuxtPlugin((nuxtApp) => {
  const { initToken } = useAuth();
  initToken();
});
