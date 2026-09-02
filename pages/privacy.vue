<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <h1 class="legal-title">Kebijakan Privasi</h1>
        <p class="legal-sub">Terakhir diperbarui: {{ new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="legal-card">
        <section class="sec">
          <h2>1. Pengumpulan Informasi</h2>
          <p>Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat mendaftar akun WARUNGERIKPAY, termasuk nama pemilik/toko, alamat email, kata sandi terenkripsi, serta data rekening Bank/E-Wallet untuk keperluan penarikan saldo (withdraw).</p>
        </section>

        <section class="sec">
          <h2>2. Penggunaan Informasi</h2>
          <p>Informasi yang kami kumpulkan digunakan untuk:</p>
          <ul>
            <li>Menyediakan, mengoperasikan, dan memelihara layanan payment gateway.</li>
            <li>Memproses dan memverifikasi permintaan penarikan saldo (withdraw).</li>
            <li>Mengirimkan notifikasi pembayaran otomatis via Webhook / Telegram.</li>
            <li>Mencegah aktivitas penipuan dan menjaga keamanan jaringan platform.</li>
          </ul>
        </section>

        <section class="sec">
          <h2>3. Keamanan Data</h2>
          <p>Keamanan data Anda sangat penting bagi kami. Kami mengimplementasikan enkripsi password berbasis <code>Bcrypt</code>, perlindungan token JWT, serta HTTPS SSL untuk melindungi transaksi dan data pribadi Anda dari akses yang tidak sah.</p>
        </section>

        <section class="sec">
          <h2>4. Kerahasiaan Data Merchant</h2>
          <p>WARUNGERIKPAY tidak akan memperjualbelikan, menyewakan, atau membagikan informasi pribadi atau transaksi Merchant kepada pihak ketiga mana pun tanpa persetujuan Merchant, kecuali diwajibkan oleh hukum dan regulasi yang berlaku di Indonesia.</p>
        </section>

        <div class="legal-foot">
          <NuxtLink to="/register" class="btn btn-primary">Kembali ke Pendaftaran</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
</script>

<style scoped>
.legal-page { padding: 40px 16px; min-height: 70vh; background: #F1F5F9; }
.legal-container { max-width: 800px; margin: 0 auto; }
.legal-header { text-align: center; margin-bottom: 24px; }
.legal-title { font-size: 1.6rem; font-weight: 800; color: #0F172A; }
.legal-sub { font-size: 0.82rem; color: #64748B; margin-top: 4px; }

.legal-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
.sec { margin-bottom: 24px; }
.sec h2 { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; border-bottom: 2px solid #E0F7FA; padding-bottom: 6px; }
.sec p, .sec li { font-size: 0.88rem; color: #334155; line-height: 1.6; }
.sec ul { padding-left: 20px; margin-top: 6px; }
.sec li { margin-bottom: 6px; }
.sec code { background: #E0F7FA; color: #00838F; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }

.legal-foot { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E2E8F0; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer; text-decoration: none; border: none; }
.btn-primary { background: #00AED6; color: #fff; }
.btn-primary:hover { background: #0096B8; }

@media (max-width: 768px) {
  .legal-card { padding: 20px; }
  .legal-title { font-size: 1.3rem; }
}
</style>
