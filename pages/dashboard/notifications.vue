<template>
  <div>

    <div class="card mb">
      <div class="card-h">
        <div class="header-content">
          <div class="header-title-row">
            <div class="icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            </div>
            <div>
              <h2 class="ct">Integrasi Bot Telegram Notifikasi Transfer</h2>
              <p class="cs">Terima notifikasi pembayaran QRIS lunas secara langsung di Telegram pribadi atau Grup Toko Anda.</p>
            </div>
          </div>

          <div class="status-badge" :class="statusClass">
            <span class="status-dot"></span>
            <span>{{ statusText }}</span>
          </div>
        </div>
      </div>

      <form novalidate @submit.prevent="handleSaveTelegram">

        <div class="edit-mode-bar mb-sm" :class="{ 'is-editing': isEditing }">
          <div class="edit-mode-info">
            <span v-if="!isEditing" class="lock-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Pengaturan Terkunci (Aman dari Perubahan Tidak Sengaja)
            </span>
            <span v-else class="edit-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Mode Edit Aktif - Silakan Perbarui Konfigurasi Bot
            </span>
          </div>
        </div>

        <div class="toggle-card mb-sm">
          <div class="toggle-info">
            <strong>Status Notifikasi Otomatis</strong>
            <span>Aktifkan untuk menerima notifikasi pesan instan tiap ada transfer masuk lunas.</span>
          </div>
          <label class="switch" :class="{ disabled: !isEditing }">
            <input type="checkbox" v-model="form.telegramNotifActive" :true-value="1" :false-value="0" :disabled="!isEditing || saveLoading" />
            <span class="slider round"></span>
          </label>
        </div>

        <div class="form-grid">

          <div class="fg full-width">
            <label class="fl">
              Telegram Bot Token
              <span class="required">*</span>
            </label>
            <div class="pwd-wrap">
              <input
                :type="showToken ? 'text' : 'password'"
                class="fi mono"
                v-model="form.telegramBotToken"
                :disabled="!isEditing || saveLoading"
                placeholder="Contoh: 7123456789:AAFxX-xxxx_YYYYzzzz123456"
              />
              <button type="button" class="pwd-btn" @click="showToken = !showToken" title="Tampilkan / Sembunyikan Token">
                <svg v-if="!showToken" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="hint-text">Dapatkan Token Bot unik dari Bot Telegram official <strong>@BotFather</strong>.</span>
          </div>

          <div class="fg full-width">
            <label class="fl">
              Telegram Chat ID / Group ID
              <span class="required">*</span>
            </label>
            <input
              type="text"
              class="fi mono"
              v-model="form.telegramChatId"
              :disabled="!isEditing || saveLoading"
              placeholder="Contoh: 123456789 (Pribadi) atau -100123456789 (Grup)"
            />
            <span class="hint-text">ID obrolan Telegram Anda. Bisa ID obrolan pribadi (angka positif) atau ID grup Telegram (diawali tanda minus <code>-</code>).</span>
          </div>
        </div>

        <div class="fa">
          <template v-if="!isEditing">
            <button type="button" class="btn btn-primary" @click="enableEditing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Pengaturan Bot
            </button>
          </template>

          <template v-else>
            <button type="submit" class="btn btn-primary" :disabled="saveLoading">
              <svg v-if="!saveLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              {{ saveLoading ? 'Menyimpan...' : 'Simpan Pengaturan Telegram' }}
            </button>
            <button type="button" class="btn btn-outline" @click="cancelEditing" :disabled="saveLoading">
              Batal
            </button>
          </template>

          <button
            type="button"
            class="btn btn-outline"
            @click="handleTestTelegram"
            :disabled="testLoading || !form.telegramBotToken || !form.telegramChatId"
          >
            <svg v-if="!testLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            {{ testLoading ? 'Mengirim Tes...' : 'Tes Notifikasi Telegram' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mb">
      <div class="card-h">
        <h3 class="ct">Pratinjau Format Pesan Telegram</h3>
        <p class="cs">Tampilan pesan otomatis yang akan dikirimkan oleh Bot Telegram Anda saat ada pembayaran QRIS lunas:</p>
      </div>

      <div class="preview-box">
        <div class="preview-header">
          <div class="tg-avatar">🤖</div>
          <div class="tg-bot-info">
            <strong>Bot Notifikasi Merchant</strong>
            <span>bot • hari ini</span>
          </div>
        </div>
        <div class="preview-body mono">
          <div class="p-title">[PEMBAYARAN BERHASIL]</div>
          <div class="p-divider">━━━━━━━━━━━━━━━━━━━━━━</div>
          <div><strong>Merchant:</strong> {{ currentUser?.name || 'WARUNGERIK STORE' }}</div>
          <div><strong>Nominal:</strong> Rp 50.042</div>
          <div class="p-italic">(Asli: Rp 50.000 + Kode: 42)</div>
          <br />
          <div><strong>Order ID:</strong> <code>ORD-1723284912-42</code></div>
          <div><strong>Pelanggan:</strong> Pelanggan Toko</div>
          <div><strong>Catatan:</strong> Pembelian Produk</div>
          <div><strong>Tx ID:</strong> <code>938472910481</code></div>
          <div><strong>Waktu:</strong> {{ currentFormattedTime }} WIB</div>
          <div><strong>Status:</strong> <span class="p-paid">LUNAS</span></div>
          <div class="p-divider">━━━━━━━━━━━━━━━━━━━━━━</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-h">
        <h3 class="ct">Panduan 3 Langkah Cara Menghubungkan Bot Telegram</h3>
        <p class="cs">Ikuti langkah mudah di bawah ini jika Anda belum memiliki Bot Telegram pribadi:</p>
      </div>

      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Buat Bot & Ambil Token</h4>
            <p>Buka Telegram lalu cari bot official <a href="https://t.me/BotFather" target="_blank" class="step-link">@BotFather</a>. Kirim perintah <code>/newbot</code> dan ikuti petunjuk untuk membuat bot baru. Setelah selesai, salin <strong>API Token</strong> yang diberikan.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>Cari Chat ID / Group ID</h4>
            <p>Untuk obrolan pribadi, buka bot <a href="https://t.me/userinfobot" target="_blank" class="step-link">@userinfobot</a> di Telegram dan tekan <strong>Start</strong> untuk melihat <code>Id</code> Anda. Untuk Grup, masukkan bot ke dalam grup lalu gunakan <a href="https://t.me/getidsbot" target="_blank" class="step-link">@getidsbot</a>.</p>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Tekan /start & Uji Coba</h4>
            <p><strong>Sangat Penting:</strong> Buka bot Telegram yang telah Anda buat pada langkah 1, lalu tekan tombol <strong>/start</strong> agar bot diizinkan mengirim pesan ke Anda. Setelah itu isi form di atas dan klik <strong>Tes Notifikasi Telegram</strong>!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { currentUser } = useAuth();
const { settingsData, fetchSettings, saveSettings, testTelegramNotif } = useMerchant();
const swal = useSwal();

const form = ref({
  telegramBotToken: '',
  telegramChatId: '',
  telegramNotifActive: 1
});

const isEditing = ref(false);
const showToken = ref(false);
const saveLoading = ref(false);
const testLoading = ref(false);

const statusText = computed(() => {
  if (form.value.telegramNotifActive === 0) return 'NOTIFIKASI NONAKTIF';
  if (form.value.telegramBotToken && form.value.telegramChatId) return 'BOT TERHUBUNG & AKTIF';
  return 'BELUM DIHUBUNGKAN';
});

const statusClass = computed(() => {
  if (form.value.telegramNotifActive === 0) return 's-off';
  if (form.value.telegramBotToken && form.value.telegramChatId) return 's-active';
  return 's-pending';
});

const currentFormattedTime = computed(() => {
  return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
});

function syncFormFromSettings() {
  if (settingsData.value) {
    if (settingsData.value.telegramBotToken !== undefined) form.value.telegramBotToken = settingsData.value.telegramBotToken || '';
    if (settingsData.value.telegramChatId !== undefined) form.value.telegramChatId = settingsData.value.telegramChatId || '';
    if (settingsData.value.telegramNotifActive !== undefined) form.value.telegramNotifActive = Number(settingsData.value.telegramNotifActive);
  }
}

function enableEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  syncFormFromSettings();
  isEditing.value = false;
}

async function handleSaveTelegram() {
  if (form.value.telegramNotifActive === 1) {
    if (!form.value.telegramBotToken || !form.value.telegramBotToken.trim()) {
      swal.error('Bot Token Wajib Diisi', 'Silakan masukkan Telegram Bot Token dari @BotFather.');
      return;
    }
    if (!form.value.telegramChatId || !form.value.telegramChatId.trim()) {
      swal.error('Chat ID Wajib Diisi', 'Silakan masukkan Chat ID Telegram Anda (misal dari @userinfobot).');
      return;
    }
  }

  saveLoading.value = true;
  const res = await saveSettings({
    webhookUrl: settingsData.value?.webhookUrl || '',
    webhookSecret: settingsData.value?.webhookSecret || '',
    feeType: settingsData.value?.feeType || 'UNIQUE_CODE',
    feeValue: settingsData.value?.feeValue || 0,
    feeBearer: settingsData.value?.feeBearer || 'CUSTOMER',
    telegramBotToken: form.value.telegramBotToken,
    telegramChatId: form.value.telegramChatId,
    telegramNotifActive: form.value.telegramNotifActive
  });
  saveLoading.value = false;

  if (res.success) {
    isEditing.value = false;
    swal.success('Pengaturan Telegram Disimpan', 'Konfigurasi Telegram Bot merchant Anda telah berhasil diperbarui!');
  } else {
    swal.error('Gagal Menyimpan', res.message || 'Terjadi kesalahan saat menyimpan pengaturan.');
  }
}

async function handleTestTelegram() {
  testLoading.value = true;
  const res = await testTelegramNotif({
    telegramBotToken: form.value.telegramBotToken,
    telegramChatId: form.value.telegramChatId
  });
  testLoading.value = false;

  if (res.success) {
    swal.success('Pesan Tes Terkirim! 🎉', 'Silakan periksa obrolan Telegram Anda. Pesan notifikasi percobaan telah berhasil masuk!');
  } else {
    swal.error('Gagal Tes Telegram', res.message || 'Pastikan Bot Token & Chat ID sudah sesuai dan Anda sudah menekan /start pada bot.');
  }
}

watch(
  () => settingsData.value,
  () => {
    if (!isEditing.value) {
      syncFormFromSettings();
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await fetchSettings();
  syncFormFromSettings();
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.mb { margin-bottom: 20px; }
.mb-sm { margin-bottom: 16px; }

.card-h { margin-bottom: 20px; }
.header-content { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.header-title-row { display: flex; align-items: center; gap: 12px; }
.icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: #E0F7FA; color: #00AED6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.ct { font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 2px; }
.cs { font-size: 0.8rem; color: #64748B; }

.status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 30px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.s-active { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-active .status-dot { background: #10B981; box-shadow: 0 0 8px rgba(16,185,129,0.8); }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-pending .status-dot { background: #F59E0B; }
.s-off { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.s-off .status-dot { background: #EF4444; }

.toggle-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.toggle-info { display: flex; flex-direction: column; gap: 2px; }
.toggle-info strong { font-size: 0.88rem; color: #0F172A; }
.toggle-info span { font-size: 0.75rem; color: #64748B; }

.switch { position: relative; display: inline-block; width: 46px; height: 26px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #CBD5E1; transition: .3s; border-radius: 34px; }
.slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: #00AED6; }
input:checked + .slider:before { transform: translateX(20px); }

.edit-mode-bar { background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; transition: 0.3s; }
.edit-mode-bar.is-editing { background: #EFF6FF; border-color: #93C5FD; }
.edit-mode-info { display: flex; align-items: center; font-size: 0.8rem; font-weight: 700; }
.lock-tag { display: inline-flex; align-items: center; gap: 8px; color: #475569; }
.edit-tag { display: inline-flex; align-items: center; gap: 8px; color: #1D4ED8; }

.switch.disabled { opacity: 0.6; cursor: not-allowed; }
.switch.disabled .slider { cursor: not-allowed; background-color: #E2E8F0; }

.fi:disabled { background: #F1F5F9; color: #64748B; cursor: not-allowed; border-color: #CBD5E1; opacity: 0.85; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 18px; width: 100%; box-sizing: border-box; }
.fg { margin-bottom: 14px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.full-width { grid-column: span 2; }
.fl { display: block; font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.required { color: #EF4444; }
.fi { width: 100%; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.hint-text { font-size: 0.72rem; color: #64748B; margin-top: 6px; font-weight: 500; line-height: 1.4; }
.mono { font-family: 'JetBrains Mono', monospace; }

.pwd-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.pwd-wrap .fi { padding-right: 44px; }
.pwd-btn { position: absolute; right: 10px; background: transparent; border: none; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: 0.2s; }
.pwd-btn:hover { color: #0F172A; background: #E2E8F0; }

.fa { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: #fff; border: 1px solid #00AED6; color: #00AED6; }
.btn-outline:hover { background: #E0F7FA; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; border-color: #CBD5E1; color: #94A3B8; }

.preview-box { background: #1E293B; border-radius: 14px; padding: 18px; color: #F8FAFC; max-width: 480px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2); border: 1px solid #334155; }
.preview-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid #334155; padding-bottom: 12px; }
.tg-avatar { width: 36px; height: 36px; background: #0088CC; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.tg-bot-info { display: flex; flex-direction: column; }
.tg-bot-info strong { font-size: 0.88rem; color: #FFF; }
.tg-bot-info span { font-size: 0.7rem; color: #94A3B8; }

.preview-body { font-size: 0.8rem; line-height: 1.6; color: #E2E8F0; }
.p-title { font-weight: 800; color: #38BDF8; }
.p-divider { color: #475569; letter-spacing: -1px; }
.p-italic { font-size: 0.75rem; color: #94A3B8; font-style: italic; }
.p-paid { color: #4ADE80; font-weight: 800; background: rgba(74, 222, 128, 0.15); padding: 1px 6px; border-radius: 4px; }
.preview-body code { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; color: #F472B6; font-size: 0.78rem; }

.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 10px; }
.step-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; transition: 0.2s; }
.step-card:hover { border-color: #00AED6; box-shadow: 0 4px 12px rgba(0,174,214,0.08); }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: #00AED6; color: #fff; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; }
.step-content h4 { font-size: 0.88rem; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
.step-content p { font-size: 0.78rem; color: #64748B; line-height: 1.5; margin: 0; }
.step-content code { background: #E2E8F0; color: #0F172A; padding: 1px 5px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
.step-link { color: #00AED6; font-weight: 700; text-decoration: underline; }

@media (max-width: 768px) {
  .card { padding: 16px 14px; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
  .full-width { grid-column: span 1; }
  .steps-grid { grid-template-columns: 1fr; gap: 12px; }
  .btn { width: 100%; justify-content: center; }
  .header-content { flex-direction: column; align-items: flex-start; }
}
</style>
