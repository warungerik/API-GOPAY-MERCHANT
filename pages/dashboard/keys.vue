<template>
  <div>
    <div class="card">
      <div class="card-h">
        <div>
          <h2 class="ct">Kelola Secret Key</h2>
          <p class="cs">Gunakan Secret Key di header HTTP <code>x-api-key</code> saat melakukan request checkout.</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="generateKey('Secret Key Utama')">Buat Secret Key Baru</button>
      </div>

      <div v-for="k in keysList" :key="k.id" class="kc">
        <div class="kh">
          <strong style="color:#0891B2">{{ k.label }}</strong>
          <span class="kd">Dibuat: {{ fmt(k.created_at) }}</span>
        </div>
        <div class="ks">
          <div class="kl">SECRET KEY (Privat - Jangan Dibocorkan)</div>
          <div class="kb">
            <span class="kv">{{ showMap[k.id] ? k.secret_key : hide(k.secret_key) }}</span>
            <div class="ka">
              <button class="bi" @click="showMap[k.id]=!showMap[k.id]">
                {{ showMap[k.id] ? 'Sembunyikan' : 'Tampilkan' }}
              </button>
              <button class="bi" @click="copy(k.secret_key)">Salin</button>
              <button class="bi bi-danger" @click="confirmDeleteKey(k)" title="Hapus Secret Key">Hapus</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="keysList.length === 0" class="empty-keys">
        <p>Belum ada Secret Key yang dibuat. Klik tombol di atas untuk membuat Secret Key baru.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { showToast } = useAuth();
const { keysList, fetchKeys, generateKey, deleteKey } = useMerchant();
const swal = useSwal();

const showMap = ref({});

function hide(s) {
  return !s || s.length < 10 ? '••••••••••' : s.substring(0, 7) + '••••••••' + s.substring(s.length - 4);
}

function copy(t) {
  navigator.clipboard.writeText(t);
  showToast('Secret Key berhasil disalin!');
}

async function confirmDeleteKey(k) {
  const isConfirmed = await swal.confirm(
    'Hapus Secret Key?',
    `Apakah Anda yakin ingin menghapus Secret Key "${k.label}"? API request dari web/aplikasi Anda yang menggunakan key ini tidak dapat memproses checkout lagi.`,
    'Ya, Hapus Secret Key'
  );
  if (isConfirmed) {
    deleteKey(k.id);
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(() => {
  fetchKeys();
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.card-h { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.cs { font-size: 0.78rem; color: #64748B; }
.cs code { background: #E0F7FA; color: #00838F; padding: 1px 5px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; }

.kc { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
.kh { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
.kd { font-size: 0.68rem; color: #94A3B8; }
.ks { margin-bottom: 4px; }
.kl { font-size: 0.68rem; color: #64748B; font-weight: 700; margin-bottom: 6px; letter-spacing: 0.3px; }
.kb { background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.kv { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #1E293B; word-break: break-all; flex: 1; min-width: 0; }
.ka { display: flex; gap: 6px; flex-shrink: 0; }

.bi { background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 6px; color: #334155; padding: 5px 10px; cursor: pointer; font-size: 0.75rem; transition: 0.2s; font-weight: 600; }
.bi:hover { background: #E2E8F0; color: #0F172A; }
.bi-danger { background: #FEF2F2; border-color: #FECACA; color: #DC2626; }
.bi-danger:hover { background: #FEE2E2; color: #991B1B; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }

.empty-keys { text-align: center; color: #94A3B8; padding: 30px; font-size: 0.82rem; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  .kc { padding: 12px 10px; }
  .kv { font-size: 0.65rem; }
  .kb { padding: 8px; flex-wrap: wrap; }
  .ka { width: 100%; justify-content: flex-end; margin-top: 4px; }
}
</style>
