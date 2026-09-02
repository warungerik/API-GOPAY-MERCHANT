<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <h1 class="legal-title">Syarat & Ketentuan Layanan</h1>
        <p class="legal-sub">Terakhir diperbarui: {{ new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="legal-card">
        <section class="sec">
          <h2>1. Ketentuan Umum</h2>
          <p>Dengan mendaftar, mengakses, atau menggunakan layanan <strong>WARUNGERIKPAY</strong> ("Layanan"), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, Anda tidak diperkenankan menggunakan Layanan ini.</p>
        </section>

        <section class="sec">
          <h2>2. Deskripsi Layanan</h2>
          <p>WARUNGERIKPAY menyediakan platform integrasi pembayaran QRIS dan otomatisasi mutasi pembayaran untuk merchant/pemilik toko. Layanan kami memungkinkan merchant menerbitkan dynamic QRIS dan memverifikasi pembayaran secara otomatis.</p>
        </section>

        <section class="sec">
          <h2>3. Akun Merchant & Keamanan API Key</h2>
          <ul>
            <li>Merchant wajib memberikan informasi yang akurat, jelas, dan dapat dipertanggungjawabkan saat melakukan pendaftaran.</li>
            <li>Merchant bertanggung jawab penuh atas kerahasiaan <code>Secret Key</code> dan <code>API Key</code> yang diterbitkan. Semua transaksi atau permintaan API yang menggunakan Secret Key milik Merchant dianggap sebagai tindakan sah oleh Merchant.</li>
            <li>Dilarang membocorkan atau mempublikasikan Secret Key ke publik atau repository terbuka.</li>
          </ul>
        </section>

        <section class="sec">
          <h2>4. Penarikan Saldo (Withdrawal) & Biaya Layanan</h2>
          <ul>
            <li>Minimal penarikan saldo adalah <strong>Rp 15.000</strong> per transaksi penarikan.</li>
            <li>Biaya penarikan (fee) ditetapkan sebesar:
              <ul>
                <li><strong>Rp 3.000</strong> untuk nominal penarikan di bawah Rp 100.000.</li>
                <li><strong>Rp 4.000</strong> untuk nominal penarikan Rp 100.000 s.d. Rp 1.000.000.</li>
                <li><strong>Rp 6.000</strong> untuk nominal penarikan di atas Rp 1.000.000.</li>
              </ul>
            </li>
            <li>Merchant wajib memastikan nomor rekening Bank atau E-Wallet yang dimasukkan benar dan sesuai dengan nama pemilik akun. WARUNGERIKPAY tidak bertanggung jawab atas kesalahan transfer akibat salah input nomor rekening oleh Merchant.</li>
          </ul>
        </section>

        <section class="sec">
          <h2>5. Penggunaan Yang Dilarang</h2>
          <p>Merchant dilarang keras menggunakan Layanan WARUNGERIKPAY untuk kegiatan pencucian uang (money laundering), perjudian online, penipuan, jual beli barang haram/ilegal, serta aktivitas melanggar hukum Negara Kesatuan Republik Indonesia. Akun yang terindikasi melakukan pelanggaran akan dinonaktifkan permanen tanpa pemberitahuan.</p>
        </section>

        <section class="sec">
          <h2>6. Penutupan & Penghapusan Akun</h2>
          <p>WARUNGERIKPAY berhak menyuspend atau menghapus akun Merchant sewaktu-waktu apabila ditemukan bukti pelanggaran terhadap Syarat & Ketentuan ini atau penyalahgunaan API Key.</p>
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
