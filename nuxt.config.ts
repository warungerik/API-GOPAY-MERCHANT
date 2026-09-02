
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'WARUNGERIKPAY - Payment Gateway QRIS Multi-Tenant Auto Settlement 24/7',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Platform Payment Gateway QRIS Instan Indonesia. Terima pembayaran otomatis 24/7 di web/aplikasi dengan API Key mudah & auto settlement 24 jam.' },
        { name: 'keywords', content: 'payment gateway qris, qris otomatis, payment gateway indonesia, warungerikpay, qris merchant, api qris, auto settlement qris, gateway pembayaran' },
        { name: 'author', content: 'WARUNGERIKPAY' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#00AED6' },

        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://pg.warungerik.com/' },
        { property: 'og:title', content: 'WARUNGERIKPAY - Payment Gateway QRIS Multi-Tenant Auto Settlement' },
        { property: 'og:description', content: 'Platform Payment Gateway QRIS Instan Indonesia. Terima pembayaran otomatis 24/7 di web & aplikasi dengan API Key mudah.' },
        { property: 'og:image', content: 'https://pg.warungerik.com/logo.png' },
        { property: 'og:site_name', content: 'WARUNGERIKPAY' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://pg.warungerik.com/' },
        { name: 'twitter:title', content: 'WARUNGERIKPAY - Payment Gateway QRIS Otomatis 24/7' },
        { name: 'twitter:description', content: 'Platform Payment Gateway QRIS Instan Indonesia dengan Auto Settlement 24 Jam.' },
        { name: 'twitter:image', content: 'https://pg.warungerik.com/logo.png' }
      ],
      link: [
        { rel: 'shortcut icon', href: '/favicon.ico?v=2' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=2' },
        { rel: 'icon', type: 'image/png', href: '/logo.png?v=2' },
        { rel: 'apple-touch-icon', href: '/logo.png?v=2' },
        { rel: 'canonical', href: 'https://pg.warungerik.com/' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap' }
      ],
      script: [
        { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js', async: true, defer: true },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'WARUNGERIKPAY',
            'url': 'https://pg.warungerik.com/',
            'logo': 'https://pg.warungerik.com/logo.png',
            'image': 'https://pg.warungerik.com/logo.png'
          })
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'WARUNGERIKPAY',
            'url': 'https://pg.warungerik.com/'
          })
        }
      ]
    }
  },
  css: [
    'sweetalert2/dist/sweetalert2.min.css',
    '~/assets/css/main.css'
  ]
});
