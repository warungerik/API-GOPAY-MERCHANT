<template>
  <div>

    <div class="sg mb">
      <div class="sc">
        <div class="sl">SALDO SIAP TARIK (SETTLED)</div>
        <div class="sv green">Rp {{ (merchantBalances.availableBalance || 0).toLocaleString('id-ID') }}</div>
        <div class="sub-txt">Sudah dapat ditarik ke rekening / E-Wallet</div>
      </div>

      <div class="sc">
        <div class="sl">SALDO TERTAHAN (HOLDING 24 JAM)</div>
        <div class="sv amber">Rp {{ (merchantBalances.holdingBalance || 0).toLocaleString('id-ID') }}</div>
        <div class="sub-txt">Sedang dalam periode hold 24 jam</div>
      </div>

      <div class="sc">
        <div class="sl">TOTAL NET OMSET TERSETTLE</div>
        <div class="sv blue">Rp {{ (merchantBalances.totalEarned || 0).toLocaleString('id-ID') }}</div>
        <div class="sub-txt">Total akumulasi omset bersih merchant</div>
      </div>
    </div>

    <div class="card">
      <div class="card-h">
        <div>
          <h2 class="ct">Riwayat Settlement Transaksi</h2>
          <p class="cs">Status pencairan dana transaksi lunas ke saldo siap tarik (settlement 24 jam).</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="resetAndLoad">
          Refresh Data
        </button>
      </div>

      <div class="retention-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="notice-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Catatan: Riwayat settlement disimpan otomatis selama <strong>3 hari</strong>. Data berumur lebih dari 3 hari akan dibersihkan sistem berkala.</span>
      </div>

      <div class="fr">
        <input
          type="text"
          class="fi fs"
          v-model="search"
          @input="onSearchInput"
          placeholder="Cari Order ID / Pelanggan..."
        />
        <select class="fi fsel" v-model="sf" @change="resetAndLoad">
          <option value="">Semua Status Settlement</option>
          <option value="SETTLED">SETTLED (Sudah Cair ke Siap Tarik)</option>
          <option value="HOLDING">HOLDING (Saldo Tertahan 24 Jam)</option>
        </select>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>NOMINAL TOTAL</th>
              <th>NET SETTLEMENT</th>
              <th>WAKTU TRANSAKSI</th>
              <th>PERKIRAAN / WAKTU CAIR</th>
              <th>STATUS SETTLEMENT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in settlementsList" :key="s.orderId">
              <td class="mono bold prim">{{ s.orderId }}</td>
              <td class="mono bold">Rp {{ s.totalAmount.toLocaleString('id-ID') }}</td>
              <td class="mono bold green-text">Rp {{ (s.settledAmount || s.netAmount || s.baseAmount).toLocaleString('id-ID') }}</td>
              <td class="muted sm">{{ fmt(s.paidAt || s.createdAt) }}</td>
              <td class="mono sm font-medium">
                <span v-if="s.settlementStatus === 'SETTLED'" class="text-settled-time">
                  Cair pada {{ fmt(s.releaseAt) }}
                </span>
                <span v-else class="text-holding-time">
                  Cair ~ {{ fmt(s.releaseAt) }}
                </span>
              </td>
              <td>
                <span class="sb" :class="s.settlementStatus === 'SETTLED' ? 's-settled' : 's-holding'">
                  {{ s.settlementStatus === 'SETTLED' ? 'SETTLED' : 'HOLDING (24 Jam)' }}
                </span>
              </td>
            </tr>
            <tr v-if="settlementsList.length === 0">
              <td colspan="6" class="empty">Tidak ada riwayat settlement transaksi.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <button class="btn btn-outline btn-sm" :disabled="currentPage === 1" @click="prevPage">
          ← Prev
        </button>
        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages || 1 }} (Total {{ totalSettlements }} data)</span>
        <button class="btn btn-outline btn-sm" :disabled="currentPage >= totalPages" @click="nextPage">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { settlementsList, totalSettlements, merchantBalances, fetchBalances, fetchSettlements } = useMerchant();

const search = ref('');
const sf = ref('');
const currentPage = ref(1);
const limit = 10;

const totalPages = computed(() => {
  return Math.ceil((totalSettlements.value || 0) / limit) || 1;
});

function load() {
  const offset = (currentPage.value - 1) * limit;
  fetchSettlements(search.value, sf.value, limit, offset);
  fetchBalances();
}

function resetAndLoad() {
  currentPage.value = 1;
  load();
}

let searchTimer = null;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    resetAndLoad();
  }, 300);
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    load();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    load();
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.sg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.sc { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.sl { font-size: 0.65rem; color: #64748B; font-weight: 800; letter-spacing: 0.3px; }
.sv { font-size: 1.35rem; font-weight: 800; margin-top: 4px; font-family: 'JetBrains Mono', monospace; word-break: break-all; }
.sv.green { color: #059669; } .sv.amber { color: #D97706; } .sv.blue { color: #0891B2; }
.sub-txt { font-size: 0.72rem; color: #94A3B8; margin-top: 4px; }
.mb { margin-bottom: 20px; }

.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.card-h { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; }
.cs { font-size: 0.78rem; color: #64748B; margin-top: 2px; }

.retention-notice {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1E40AF;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.notice-icon { flex-shrink: 0; color: #2563EB; }

.fr { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.fi { padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.fs { flex: 1; min-width: 200px; }
.fsel { min-width: 180px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover:not(:disabled) { background: #F8FAFC; border-color: #94A3B8; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 720px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
tr:hover td { background: #F8FAFC; }

.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.bold { font-weight: 700; }
.prim { color: #0891B2; }
.green-text { color: #059669; }
.sm { font-size: 0.72rem; }
.muted { color: #94A3B8; }
.empty { text-align: center; color: #94A3B8; padding: 30px; }

.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-settled { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-holding { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }

.text-settled-time { color: #059669; font-weight: 600; }
.text-holding-time { color: #D97706; font-weight: 600; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #E2E8F0; }
.page-info { font-size: 0.8rem; color: #64748B; font-weight: 600; }

@media (max-width: 768px) {
  .sg { grid-template-columns: 1fr; gap: 10px; }
  .card { padding: 14px 12px; }
  .fr { flex-direction: column; gap: 8px; }
  .fs, .fsel { min-width: unset; width: 100%; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }
}
</style>
