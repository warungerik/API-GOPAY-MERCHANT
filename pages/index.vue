<template>
  <div class="landing">

    <div class="hero">
      <div class="hero-text">
        <div class="live-badge"><span class="pulse-dot"></span> Settlement Engine Active</div>
        <h1 class="hero-title">Payment Gateway QRIS <span class="gradient-text">Tanpa Ribet</span> untuk Semua Orang</h1>
        <p class="hero-desc">Daftar gratis, salin Secret Key, dan langsung terima pembayaran dari seluruh Bank & E-Wallet Indonesia di website atau aplikasi kamu.</p>
        <div class="hero-btns">
          <NuxtLink to="/register" class="btn btn-primary btn-lg" v-if="!currentUser">Mulai Pakai Sekarang</NuxtLink>
          <NuxtLink to="/dashboard" class="btn btn-primary btn-lg" v-else>Buka Dashboard</NuxtLink>
          <NuxtLink to="/dashboard/docs" class="btn btn-outline btn-lg">Dokumentasi API</NuxtLink>
        </div>
      </div>

      <div class="globe-visual-container">
        <div class="globe-wrapper">

          <div class="globe-sphere">
            <img src="/logo.png?v=2" alt="WARUNGERIKPAY" class="globe-img" />
          </div>

          <div class="orbit-container">

            <div class="orbit-path path-1">
              <div class="orbit-node node-qris" title="QRIS"><div class="chip-icon-wrap"><img src="/qris.jpeg" alt="QRIS" class="chip-icon" /></div></div>
              <div class="orbit-node node-bca" title="BCA"><div class="chip-icon-wrap"><img src="/bca.jpeg" alt="BCA" class="chip-icon" /></div></div>
              <div class="orbit-node node-gopay" title="GoPay"><div class="chip-icon-wrap"><img src="/gopay.jpeg" alt="GoPay" class="chip-icon" /></div></div>
              <div class="orbit-node node-bri" title="BRI"><div class="chip-icon-wrap"><img src="/bri.jpeg" alt="BRI" class="chip-icon" /></div></div>
            </div>

            <div class="orbit-path path-2">
              <div class="orbit-node node-dana" title="DANA"><div class="chip-icon-wrap"><img src="/dana.webp" alt="DANA" class="chip-icon" /></div></div>
              <div class="orbit-node node-mandiri" title="Mandiri"><div class="chip-icon-wrap"><img src="/mandiri.jpeg" alt="Mandiri" class="chip-icon" /></div></div>
              <div class="orbit-node node-ovo" title="OVO"><div class="chip-icon-wrap"><img src="/ovo.jpeg" alt="OVO" class="chip-icon" /></div></div>
              <div class="orbit-node node-bni" title="BNI"><div class="chip-icon-wrap"><img src="/bni.jpeg" alt="BNI" class="chip-icon" /></div></div>
            </div>

            <div class="orbit-path path-3">
              <div class="orbit-node node-shopeepay" title="ShopeePay"><div class="chip-icon-wrap"><img src="/shopeepay.jpeg" alt="ShopeePay" class="chip-icon" /></div></div>
              <div class="orbit-node node-permata" title="Permata"><div class="chip-icon-wrap"><img src="/permata.png" alt="Permata" class="chip-icon" /></div></div>
              <div class="orbit-node node-linkaja" title="LinkAja"><div class="chip-icon-wrap"><img src="/linkaja.png" alt="LinkAja" class="chip-icon" /></div></div>
              <div class="orbit-node node-jago" title="Bank Jago"><div class="chip-icon-wrap"><img src="/jago.jpeg" alt="Bank Jago" class="chip-icon" /></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="section-card about-section mb-xl animate-on-scroll">
      <div class="section-header">
        <span class="section-badge">TENTANG PLATFORM</span>
        <h2 class="section-title">Apa Itu WARUNGERIKPAY?</h2>
        <p class="section-subtitle">
          WARUNGERIKPAY adalah platform Payment Gateway QRIS otomatis yang dirancang untuk toko online, toko produk digital, SaaS, dan pengembang aplikasi di Indonesia. Kami menghadirkan solusi otomasi mutasi pembayaran real-time tanpa prosedur rumit.
        </p>
      </div>

      <div class="about-grid">
        <div class="about-card">
          <div class="about-icon-box cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h3 class="about-card-title">Integrasi Instan 5 Menit</h3>
          <p class="about-card-desc">Cukup daftar akun, salin Secret Key dari Dashboard, dan pasang API checkout di sistem kamu. Tidak ada verifikasi berkas yang menghambat bisnis kamu.</p>
        </div>

        <div class="about-card">
          <div class="about-icon-box emerald">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h3 class="about-card-title">Otomasi Mutasi & Webhook</h3>
          <p class="about-card-desc">Setiap kali pelanggan melakukan pembayaran QRIS, mesin mutasi pintar kami otomatis memverifikasi transaksi dan mengirimkan HTTP POST Webhook ke toko Anda dalam waktu &lt; 0.5 detik.</p>
        </div>

        <div class="about-card">
          <div class="about-icon-box purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 class="about-card-title">Keamanan Tingkat Tinggi</h3>
          <p class="about-card-desc">Dilengkapi enkripsi SSL/TLS, otentikasi API Key terisolasi, serta verifikasi Signature HMAC SHA-256 untuk memastikan callback data mutasi aman dan valid.</p>
        </div>
      </div>
    </section>

    <section class="section-card features-section mb-xl animate-on-scroll">
      <div class="section-header">
        <span class="section-badge">MENGAPA MEMILIH KAMI</span>
        <h2 class="section-title">Fitur & Keunggulan Kelas Industri</h2>
        <p class="section-subtitle">Didesain khusus untuk memberikan pengalaman pembayaran digital yang efisien dan andal bagi pemilik toko dan developer.</p>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Multi-Channel All-Bank & E-Wallet</h4>
            <p class="f-desc">Menerima pembayaran dari BCA, Mandiri, BRI, BNI, Permata, CIMB Niaga, Bank Jago, GoPay, DANA, OVO, ShopeePay, hingga LinkAja melalui satu barcode QRIS resmi.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Sistem Kode Unik Anti-Collision</h4>
            <p class="f-desc">Setiap transaksi PENDING diberikan kode unik acak sehingga tidak akan ada 2 pembayaran bernominal persis sama yang membingungkan sistem mutasi.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Pengaturan Tanggungan Fee 0.5% (Fee Bearer)</h4>
            <p class="f-desc">Anda memiliki kontrol penuh untuk menentukan apakah fee standar QRIS 0.5% ditanggung oleh Pelanggan (ditambahkan) atau ditanggung oleh Merchant (dipotong dari saldo).</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Penarikan Saldo (Withdrawal) Cepat</h4>
            <p class="f-desc">Tarik saldo terkumpul kapan saja ke rekening bank utama atau akun e-wallet Anda dengan biaya penarikan murah dan proses persetujuan yang transparan.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Multi SDK & Dokumentasi Lengkap</h4>
            <p class="f-desc">Tersedia panduan integrasi dan contoh kode siap pakai untuk PHP Native, Laravel, Node.js, Python, dan Flutter/Dart lengkap dengan respons simulasi.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="f-bullet"></div>
          <div>
            <h4 class="f-title">Sistem Proteksi Kunci Rekening 3 Hari</h4>
            <p class="f-desc">Nomor rekening penarikan yang telah disimpan akan terkunci otomatis selama 3 hari untuk mencegah perubahan unauthorized atau pengambilalihan akun.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-card workflow-section mb-xl animate-on-scroll">
      <div class="section-header">
        <span class="section-badge">PROSES MUDAH</span>
        <h2 class="section-title">3 Langkah Mudah Mulai Terima Pembayaran</h2>
        <p class="section-subtitle">Hanya butuh beberapa menit untuk mengintegrasikan sistem pembayaran QRIS otomatis ke platform Anda.</p>
      </div>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <h3 class="step-title">Daftar Akun Gratis</h3>
          <p class="step-desc">Registrasi akun merchant Anda dalam 30 detik tanpa syarat dokumen atau verifikasi KTP yang memakan waktu.</p>
        </div>

        <div class="step-card">
          <div class="step-num">02</div>
          <h3 class="step-title">Pasang REST API</h3>
          <p class="step-desc">Salin Secret Key Anda dari Dashboard dan panggil endpoint <code>/api/v1/checkout</code> di script toko atau aplikasi Anda.</p>
        </div>

        <div class="step-card">
          <div class="step-num">03</div>
          <h3 class="step-title">Terima Mutasi Otomatis</h3>
          <p class="step-desc">Pelanggan scan QRIS dan bayar. Mesin mutasi memverifikasi lunas & mengirimkan Webhook Callback otomatis ke server Anda.</p>
        </div>
      </div>
    </section>

    <section class="section-card faq-section mb-xl animate-on-scroll">
      <div class="section-header">
        <span class="section-badge">FAQ</span>
        <h2 class="section-title">Pertanyaan Yang Sering Diajukan</h2>
        <p class="section-subtitle">Temukan jawaban atas pertanyaan umum mengenai penggunaan layanan WARUNGERIKPAY.</p>
      </div>

      <div class="faq-list">
        <div class="faq-item" v-for="(f, i) in faqItems" :key="i" :class="{ open: openFaq === i }" @click="toggleFaq(i)">
          <div class="faq-question">
            <span>{{ f.q }}</span>
            <span class="faq-icon">{{ openFaq === i ? '−' : '+' }}</span>
          </div>
          <div class="faq-answer" v-if="openFaq === i">
            <p>{{ f.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-banner animate-on-scroll">
      <div class="cta-content">
        <h2 class="cta-title">Siap Mengotomatiskannya Pembayaran Toko Anda?</h2>
        <p class="cta-desc">Bergabunglah sekarang dan rasakan kemudahan proses pembayaran QRIS otomatis tanpa ribet.</p>
        <div class="cta-btns">
          <NuxtLink to="/register" class="btn btn-primary btn-lg" v-if="!currentUser">Daftar Akun Merchant Gratis</NuxtLink>
          <NuxtLink to="/dashboard" class="btn btn-primary btn-lg" v-else>Masuk ke Dashboard</NuxtLink>
          <NuxtLink to="/dashboard/docs" class="btn btn-outline btn-lg">Pelajari Dokumentasi API</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const { currentUser } = useAuth();
const { globalStats, fetchGlobalStats } = useMerchant();

const openFaq = ref(0);

const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index;
};

const faqItems = [
  {
    q: 'Apakah butuh izin merchant atau verifikasi berkas rumit untuk mendaftar?',
    a: 'Tidak. Anda dapat langsung mendaftar akun, menyalin Secret Key dari Dashboard, dan menggunakannya di website atau aplikasi Anda saat itu juga.'
  },
  {
    q: 'Bagaimana sistem memverifikasi pembayaran pelanggan secara otomatis?',
    a: 'Sistem otomatis menambahkan kode unik acak (100 – 500) pada nominal tagihan QRIS. Mesin mutasi pintar kami membaca transaksi masuk dan mencocokkannya secara otomatis dalam waktu < 0.5 detik.'
  },
  {
    q: 'Berapa biaya (fee) per transaksi dan bagaimana penarikan saldo dilakukan?',
    a: 'Fee transaksi otomatis 0.5% standar QRIS (dapat diatur ditanggung oleh Pelanggan atau Merchant). Saldo yang terkumpul dapat ditarik kapan saja ke rekening bank/e-wallet Anda dengan biaya penarikan murah mulai Rp 3.000.'
  },
  {
    q: 'Apakah tersedia Webhook Callback otomatis?',
    a: 'Ya, setiap kali pembayaran berhasil diverifikasi LUNAS, server kami akan langsung mengirimkan HTTP POST Webhook Callback berformat JSON lengkap dengan verifikasi HMAC SHA-256 Signature ke URL toko Anda.'
  }
];

onMounted(() => {
  fetchGlobalStats();

  if (process.client && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        } else {
          entry.target.classList.remove('animate-in');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }
});
</script>

<style scoped>
.landing {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.hero {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 36px 0 24px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.hero-text {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  width: fit-content;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 8px #10B981;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.6; }
}

.hero-title {
  font-size: 2.3rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.8px;
  margin-bottom: 14px;
  color: #0F172A;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  max-width: 100%;
  text-align: left;
}

.gradient-text {
  background: linear-gradient(135deg, #00AED6, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 0.96rem;
  color: #64748B;
  margin-bottom: 24px;
  max-width: 540px;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: left;
}

.hero-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  outline: none;
  text-decoration: none;
  box-sizing: border-box;
}

.btn-lg {
  padding: 14px 24px;
  font-size: 0.92rem;
}

.btn-primary {
  background: #00AED6;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 174, 214, 0.25);
}

.btn-primary:hover {
  background: #0096B8;
  transform: translateY(-1px);
}

.btn-outline {
  background: #fff;
  border: 1px solid #CBD5E1;
  color: #334155;
}

.btn-outline:hover {
  background: #F8FAFC;
  border-color: #94A3B8;
}

.globe-visual-container {
  flex: 0.9;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 340px;
  overflow: hidden;
  box-sizing: border-box;
}

.globe-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.globe-sphere {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 35px rgba(0, 174, 214, 0.4), 0 0 0 3px rgba(0, 174, 214, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  background: #ffffff;
  overflow: hidden;
  flex-shrink: 0;
}

.globe-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  opacity: 1;
}

.orbit-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.orbit-path {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.path-1 { width: 180px; height: 180px; animation: orbitRotate 18s linear infinite; }
.path-2 { width: 230px; height: 230px; animation: orbitRotate 26s linear infinite reverse; }
.path-3 { width: 280px; height: 280px; animation: orbitRotate 34s linear infinite; }

@keyframes orbitRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.orbit-node {
  position: absolute;
  width: 28px !important;
  height: 28px !important;
  margin-left: -14px !important;
  margin-top: -14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  animation: counterRotate 18s linear infinite;
  pointer-events: auto;
}
.path-2 .orbit-node { animation: counterRotate 26s linear infinite reverse; }
.path-3 .orbit-node { animation: counterRotate 34s linear infinite; }

@keyframes counterRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.node-qris { top: 0%; left: 50%; }
.node-bca { top: 100%; left: 50%; }
.node-gopay { top: 50%; left: 0%; }
.node-bri { top: 50%; left: 100%; }

.node-dana { top: 14.6%; left: 14.6%; }
.node-mandiri { top: 14.6%; left: 85.4%; }
.node-ovo { top: 85.4%; left: 14.6%; }
.node-bni { top: 85.4%; left: 85.4%; }

.node-shopeepay { top: 0%; left: 50%; }
.node-permata { top: 100%; left: 50%; }
.node-linkaja { top: 50%; left: 0%; }
.node-jago { top: 50%; left: 100%; }

.chip-icon-wrap {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  border: 1.5px solid #CBD5E1 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(255, 255, 255, 0.9) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  padding: 3px !important;
  box-sizing: border-box !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
  cursor: pointer;
}

.chip-icon-wrap:hover {
  transform: scale(1.3) !important;
  border-color: #00AED6 !important;
  box-shadow: 0 4px 14px rgba(0, 174, 214, 0.45) !important;
}

.chip-icon {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  border-radius: 50% !important;
  display: block !important;
  flex-shrink: 0 !important;
}

.chip-qris { background: #FEF2F2; color: #DC2626; border: 1.5px solid #FECACA; padding: 3px 8px; border-radius: 20px; font-size: 0.65rem; font-weight: 900; box-shadow: 0 4px 12px rgba(220,38,38,0.15); white-space: nowrap; }
.chip-bank { background: #E0F2FE; color: #0284C7; border: 1.5px solid #BAE6FD; padding: 3px 8px; border-radius: 20px; font-size: 0.62rem; font-weight: 800; box-shadow: 0 4px 12px rgba(2,132,199,0.15); white-space: nowrap; }
.chip-ewallet { background: #ECFDF5; color: #059669; border: 1.5px solid #A7F3D0; padding: 3px 8px; border-radius: 20px; font-size: 0.62rem; font-weight: 800; box-shadow: 0 4px 12px rgba(5,150,105,0.15); white-space: nowrap; }

.payment-marquee-wrap {
  margin-top: 24px;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 14px 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.marquee-label { font-size: 0.65rem; font-weight: 800; color: #94A3B8; letter-spacing: 0.5px; margin-bottom: 8px; text-align: center; }
.marquee-track { width: 100%; overflow: hidden; white-space: nowrap; display: flex; }
.marquee-content { display: flex; gap: 12px; animation: marqueeScroll 20s linear infinite; }

@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.m-item { font-size: 0.72rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; flex-shrink: 0; }
.m-qris { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.m-bank { background: #E0F2FE; color: #0284C7; border: 1px solid #BAE6FD; }
.m-ewallet { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.mb-lg { margin-bottom: 24px; }
.mb-xl { margin-bottom: 36px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.stat-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 20px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: 100%;
  box-sizing: border-box;
}

.stat-label { font-size: 0.68rem; color: #94A3B8; font-weight: 700; letter-spacing: 0.5px; }
.stat-value { font-size: 1.5rem; font-weight: 800; margin: 6px 0; font-family: 'JetBrains Mono', monospace; word-break: break-all; }
.stat-value.green { color: #059669; }
.stat-value.blue { color: #0891B2; }
.stat-value.purple { color: #7C3AED; }
.stat-value.amber { color: #D97706; }
.stat-sub { font-size: 0.68rem; color: #94A3B8; }

.section-card {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  padding: 36px 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  width: 100%;
  box-sizing: border-box;
}

.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 32px;
}

.section-badge {
  display: inline-block;
  background: #E0F2FE;
  color: #0284C7;
  border: 1px solid #BAE6FD;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0F172A;
  letter-spacing: -0.5px;
  margin-bottom: 10px;
}

.section-subtitle {
  font-size: 0.88rem;
  color: #64748B;
  line-height: 1.6;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.about-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 14px;
  padding: 24px 20px;
  transition: all 0.2s ease;
}

.about-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border-color: #CBD5E1;
}

.about-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.about-icon-box.cyan { background: #E0F2FE; color: #0284C7; }
.about-icon-box.emerald { background: #ECFDF5; color: #059669; }
.about-icon-box.purple { background: #F3E8FF; color: #7C3AED; }

.about-card-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}

.about-card-desc {
  font-size: 0.82rem;
  color: #64748B;
  line-height: 1.55;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feature-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 20px;
  border-radius: 14px;
}

.f-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00AED6;
  flex-shrink: 0;
  margin-top: 6px;
  box-shadow: 0 0 8px rgba(0,174,214,0.4);
}

.f-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 4px;
}

.f-desc {
  font-size: 0.82rem;
  color: #64748B;
  line-height: 1.55;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.step-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 28px 20px;
  position: relative;
}

.step-num {
  font-size: 2.2rem;
  font-weight: 900;
  color: #00AED6;
  opacity: 0.25;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 8px;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 8px;
}

.step-desc {
  font-size: 0.82rem;
  color: #64748B;
  line-height: 1.55;
}

.step-desc code {
  background: #E0F2FE;
  color: #0284C7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}

.faq-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.faq-item:hover {
  border-color: #00AED6;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 0.92rem;
  color: #0F172A;
  gap: 12px;
  cursor: pointer;
}

.faq-icon {
  font-size: 1.2rem;
  color: #00AED6;
  font-weight: 700;
}

.faq-answer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  font-size: 0.84rem;
  color: #64748B;
  line-height: 1.6;
}

.cta-banner {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  color: #fff;
  margin-bottom: 24px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.cta-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.cta-desc {
  font-size: 0.92rem;
  color: #94A3B8;
  max-width: 520px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.cta-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 16px !important;
    padding: 12px 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .hero-text {
    align-items: center !important;
    text-align: center !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .live-badge {
    margin: 0 auto 10px !important;
  }

  .hero-title {
    font-size: 1.35rem !important;
    line-height: 1.3 !important;
    letter-spacing: -0.3px !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
    margin-bottom: 10px !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }

  .hero-desc {
    font-size: 0.84rem !important;
    margin: 0 auto 16px !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: center !important;
    word-break: break-word !important;
  }

  .hero-btns {
    flex-direction: column !important;
    width: 100% !important;
    max-width: 100% !important;
    gap: 8px !important;
  }

  .btn {
    width: 100% !important;
    white-space: normal !important;
    box-sizing: border-box !important;
  }

  .btn-lg {
    width: 100% !important;
    padding: 12px !important;
    font-size: 0.88rem !important;
  }

  .globe-visual-container {
    height: 210px !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    margin-top: 8px !important;
  }

  .globe-wrapper {
    width: 200px !important;
    height: 200px !important;
    max-width: 100% !important;
  }

  .globe-sphere {
    width: 70px !important;
    height: 70px !important;
  }

  .path-1 { width: 110px !important; height: 110px !important; }
  .path-2 { width: 145px !important; height: 145px !important; }
  .path-3 { width: 180px !important; height: 180px !important; }
  .orbit-node {
    width: 20px !important;
    height: 20px !important;
    margin-left: -10px !important;
    margin-top: -10px !important;
  }
  .chip-icon-wrap {
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
    max-width: 20px !important;
    max-height: 20px !important;
    padding: 2px !important;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
  }

  .stat-card {
    padding: 12px 10px !important;
  }

  .stat-value {
    font-size: 1.1rem !important;
  }

  .stat-label {
    font-size: 0.6rem !important;
  }

  .section-card {
    padding: 24px 16px !important;
    border-radius: 16px !important;
  }

  .section-title {
    font-size: 1.35rem !important;
  }

  .section-subtitle {
    font-size: 0.8rem !important;
  }

  .about-grid, .steps-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .features-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .cta-banner {
    padding: 28px 16px !important;
  }

  .cta-title {
    font-size: 1.3rem !important;
  }

  .cta-desc {
    font-size: 0.82rem !important;
  }

  .cta-btns {
    flex-direction: column !important;
    width: 100% !important;
  }
}

.animate-on-scroll {
  opacity: 0;
  transform: translate3d(0, 24px, 0);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-on-scroll.animate-in {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.about-grid .about-card:nth-child(1) { transition-delay: 0.05s; }
.about-grid .about-card:nth-child(2) { transition-delay: 0.15s; }
.about-grid .about-card:nth-child(3) { transition-delay: 0.25s; }

.features-grid .feature-item:nth-child(1) { transition-delay: 0.05s; }
.features-grid .feature-item:nth-child(2) { transition-delay: 0.12s; }
.features-grid .feature-item:nth-child(3) { transition-delay: 0.19s; }
.features-grid .feature-item:nth-child(4) { transition-delay: 0.26s; }
.features-grid .feature-item:nth-child(5) { transition-delay: 0.33s; }
.features-grid .feature-item:nth-child(6) { transition-delay: 0.40s; }

.steps-grid .step-card:nth-child(1) { transition-delay: 0.05s; }
.steps-grid .step-card:nth-child(2) { transition-delay: 0.15s; }
.steps-grid .step-card:nth-child(3) { transition-delay: 0.25s; }

.about-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.about-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 174, 214, 0.12);
  border-color: #00AED6;
}
.about-card:hover .about-icon-box {
  transform: rotate(8deg) scale(1.1);
  transition: transform 0.3s ease;
}

.feature-item {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.feature-item:hover {
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 14px 28px rgba(2, 132, 199, 0.12);
  border-color: #0284C7;
}

.step-card {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}
.step-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 18px 36px rgba(124, 58, 237, 0.12);
  border-color: #7C3AED;
}
.step-card:hover .step-num {
  opacity: 0.75;
  transform: scale(1.1);
  transition: all 0.3s ease;
}

.faq-item {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.faq-item:hover {
  transform: translateX(6px);
  border-color: #00AED6;
  box-shadow: 0 4px 16px rgba(0, 174, 214, 0.08);
}
</style>
