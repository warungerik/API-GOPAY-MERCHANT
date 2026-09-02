<template>
  <div>
    <div class="card">
      <div class="card-h">
        <h2 class="ct">Riwayat Transaksi</h2>
        <div class="btn-group-h">
          <button class="btn btn-primary btn-sm" @click="handleExportCsv">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Excel / CSV
          </button>
          <button class="btn btn-outline btn-sm" @click="resetAndLoad">Refresh</button>
        </div>
      </div>

      <div class="retention-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="notice-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Catatan: Riwayat transaksi disimpan otomatis selama <strong>3 hari</strong>. Data berumur lebih dari 3 hari akan dibersihkan sistem berkala.</span>
      </div>

      <div class="fr">
        <input type="text" class="fi fs" v-model="search" @input="onSearchInput" placeholder="Cari Order ID / Pelanggan..." />
        <div class="date-filter-group">
          <input type="date" class="fi fdate" v-model="startDate" @change="resetAndLoad" title="Tanggal Mulai" />
          <span class="date-sep">s/d</span>
          <input type="date" class="fi fdate" v-model="endDate" @change="resetAndLoad" title="Tanggal Akhir" />
        </div>
        <select class="fi fsel" v-model="sf" @change="resetAndLoad">
          <option value="">Semua Status</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>TOTAL BAYAR</th>
              <th>FEE</th>
              <th>BERSIH DITERIMA</th>
              <th>PELANGGAN</th>
              <th>STATUS</th>
              <th>TANGGAL</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in transactionsList" :key="t.orderId">
              <td class="mono bold prim">{{ t.orderId }}</td>
              <td class="mono bold">Rp {{ t.totalAmount.toLocaleString('id-ID') }}</td>
              <td class="mono">
                <span class="fee-val">Rp {{ getTotalFee(t).toLocaleString('id-ID') }}</span>
                <div class="fee-sub text-muted sm">
                  <span>Fee: Rp {{ getFeeAmount(t).toLocaleString('id-ID') }}</span>
                  <span v-if="t.uniqueCode"> + Kode: {{ t.uniqueCode }}</span>
                </div>
                <span class="tag-bearer cust" v-if="t.feeBearer === 'CUSTOMER'">Dibebankan ke Customer</span>
                <span class="tag-bearer merch" v-else>Dipotong Merchant</span>
              </td>
              <td class="mono bold green-text">Rp {{ getNetAmount(t).toLocaleString('id-ID') }}</td>
              <td>{{ t.customerName }}</td>
              <td><span class="sb" :class="'s-'+t.status.toLowerCase()">{{ t.status }}</span></td>
              <td class="muted sm">{{ fmt(t.createdAt) }}</td>
              <td>
                <div class="btn-action-wrap" style="display:flex; gap:6px; align-items:center;">
                  <button class="btn btn-outline btn-xs" @click="openDetailModal(t)" title="Lihat Rincian Transaksi">
                    Detail
                  </button>
                  <button v-if="t.status === 'PAID'" class="btn-print-sm" @click="openStruk(t)" title="Cetak Struk Transaksi">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    Struk
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="transactionsList.length===0">
              <td colspan="8" class="empty">Tidak ada data transaksi.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <button class="btn btn-outline btn-sm" :disabled="currentPage === 1" @click="prevPage">
          ← Prev
        </button>
        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages || 1 }} (Total {{ totalTransactions }} data)</span>
        <button class="btn btn-outline btn-sm" :disabled="currentPage >= totalPages" @click="nextPage">
          Next →
        </button>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-title-wrap">
            <h3 class="detail-title">Rincian Transaksi</h3>
            <span class="detail-sub">Order ID: <strong class="mono">{{ selectedOrder.orderId }}</strong></span>
          </div>
          <button class="detail-close-btn" @click="showDetailModal = false">&times;</button>
        </div>

        <div class="detail-status-banner" :class="'banner-'+(selectedOrder.status || 'pending').toLowerCase()">
          <div class="banner-status-text">STATUS: {{ selectedOrder.status }}</div>
          <div class="banner-status-desc" v-if="selectedOrder.status === 'PAID'">
            Pembayaran Lunas via QRIS
          </div>
          <div class="banner-status-desc" v-else-if="selectedOrder.status === 'PENDING'">
            Menunggu Pembayaran Pelanggan
          </div>
          <div class="banner-status-desc" v-else>
            Transaksi Kadaluarsa / Dibatalkan
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <label>Pelanggan</label>
            <strong class="bold">{{ selectedOrder.customerName || 'Customer' }}</strong>
          </div>
          <div class="detail-item">
            <label>Catatan Order</label>
            <span>{{ selectedOrder.note || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>Nominal Produk (Base)</label>
            <span class="mono">Rp {{ (selectedOrder.baseAmount || 0).toLocaleString('id-ID') }}</span>
          </div>
          <div class="detail-item">
            <label>Kode Unik Transaksi</label>
            <span class="mono amber bold">+{{ selectedOrder.uniqueCode || 0 }}</span>
          </div>
          <div class="detail-item">
            <label>Fee Layanan Platform</label>
            <span class="mono">Rp {{ getFeeAmount(selectedOrder).toLocaleString('id-ID') }} ({{ selectedOrder.feeBearer === 'CUSTOMER' ? 'Dibebankan Customer' : 'Dipotong Merchant' }})</span>
          </div>
          <div class="detail-item highlight-item">
            <label>TOTAL NOMINAL DIBAYAR</label>
            <strong class="mono green-text lg">Rp {{ (selectedOrder.totalAmount || 0).toLocaleString('id-ID') }}</strong>
          </div>
          <div class="detail-item highlight-item">
            <label>BERSIH DITERIMA KAMU</label>
            <strong class="mono blue-text lg">Rp {{ getNetAmount(selectedOrder).toLocaleString('id-ID') }}</strong>
          </div>
          <div class="detail-item">
            <label>Waktu Dibuat</label>
            <span class="mono sm">{{ fmt(selectedOrder.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <label>Waktu Kadaluarsa</label>
            <span class="mono sm">{{ fmt(selectedOrder.expiredAt) }}</span>
          </div>
          <div class="detail-item">
            <label>Waktu Terbayar (Paid At)</label>
            <span class="mono sm green-text bold">{{ selectedOrder.paidAt ? fmt(selectedOrder.paidAt) : '-' }}</span>
          </div>
        </div>

        <div class="gobiz-ref-box">
          <div class="ref-row">
            <span>No. Ref Mutasi (Tx ID):</span>
            <strong v-if="selectedOrder.txId" class="mono green-text bold font-1rem">{{ selectedOrder.txId }}</strong>
            <span v-else class="muted italic">Belum ada mutasi terdeteksi</span>
          </div>
        </div>

        <div class="detail-actions" style="display:flex; gap:10px; margin-top:16px;">
          <button v-if="selectedOrder.status === 'PAID'" class="btn btn-primary btn-full" @click="openStruk(selectedOrder); showDetailModal = false;">
            Cetak Struk Pembayaran
          </button>
          <button class="btn btn-outline btn-full" @click="showDetailModal = false">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="showStrukModal" class="modal-overlay" @click.self="showStrukModal = false">
      <div class="struk-card">
        <div class="struk-header">
          <img src="/logo.png?v=2" class="struk-logo" alt="WARUNGERIKPAY" />
          <h3 class="struk-title">WARUNGERIKPAY</h3>
          <p class="struk-subtitle">Payment Gateway QRIS Auto Settlement</p>
        </div>

        <div class="struk-divider">--------------------------------</div>

        <div class="struk-badge-success">PEMBAYARAN LUNAS (PAID)</div>

        <div class="struk-details">
          <div class="struk-row"><span>Order ID:</span> <strong class="mono">{{ selectedStruk.orderId }}</strong></div>
          <div class="struk-row"><span>Waktu:</span> <span>{{ fmt(selectedStruk.paidAt || selectedStruk.createdAt) }}</span></div>
          <div class="struk-row"><span>Pelanggan:</span> <span>{{ selectedStruk.customerName || 'Customer' }}</span></div>
          <div class="struk-row"><span>Catatan:</span> <span>{{ selectedStruk.note || '-' }}</span></div>
          <div class="struk-row"><span>Tx ID:</span> <span class="mono sm">{{ selectedStruk.txId || '-' }}</span></div>
        </div>

        <div class="struk-divider">--------------------------------</div>

        <div class="struk-details">
          <div class="struk-row"><span>Nominal Asli:</span> <span>Rp {{ (selectedStruk.baseAmount || 0).toLocaleString('id-ID') }}</span></div>
          <div class="struk-row"><span>Kode Unik:</span> <span>{{ selectedStruk.uniqueCode || 0 }}</span></div>
          <div class="struk-row"><span>Fee Transaksi:</span> <span>Rp {{ getFeeAmount(selectedStruk).toLocaleString('id-ID') }}</span></div>
          <div class="struk-row total-row">
            <span>TOTAL DIBAYAR:</span>
            <strong class="mono">Rp {{ (selectedStruk.totalAmount || 0).toLocaleString('id-ID') }}</strong>
          </div>
        </div>

        <div class="struk-divider">--------------------------------</div>

        <div class="struk-footer">
          <p>Terima kasih telah melakukan pembayaran via QRIS WARUNGERIKPAY.</p>
          <span class="sm text-muted">Simpan struk ini sebagai bukti pembayaran sah.</span>
        </div>

        <div class="struk-actions no-print">
          <button class="btn btn-primary btn-full" @click="printStruk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Cetak Struk / Download
          </button>
          <button class="btn btn-outline btn-full" @click="showStrukModal = false">Tutup</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { transactionsList, totalTransactions, fetchTransactions, exportTransactionsCsv } = useMerchant();
const swal = useSwal();
const search = ref('');
const sf = ref('');
const startDate = ref('');
const endDate = ref('');
const currentPage = ref(1);
const limit = 10;

const showStrukModal = ref(false);
const selectedStruk = ref({});
const showDetailModal = ref(false);
const selectedOrder = ref({});

function openDetailModal(t) {
  selectedOrder.value = t;
  showDetailModal.value = true;
}

const totalPages = computed(() => {
  return Math.ceil((totalTransactions.value || 0) / limit) || 1;
});

async function load(showPopup = false) {
  if (showPopup && process.client) {
    swal.showLoading('Memuat Transaksi...', 'Mengambil data transaksi...');
  }
  const offset = (currentPage.value - 1) * limit;
  try {
    await fetchTransactions(search.value, sf.value, startDate.value, endDate.value, limit, offset);
  } finally {
    if (showPopup && process.client) {
      swal.hideLoading();
    }
  }
}

function resetAndLoad() {
  currentPage.value = 1;
  load(true);
}

function handleExportCsv() {
  exportTransactionsCsv(search.value, sf.value, startDate.value, endDate.value);
}

function openStruk(t) {
  selectedStruk.value = t;
  showStrukModal.value = true;
}

async function printStruk() {
  const el = document.querySelector('.struk-card');
  if (!el) return;
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = dataURL;
    a.download = `struk_${ts}.png`;
    a.click();
  } catch (e) {
    console.error('Failed to generate PNG:', e);
    window.print();
  }
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
    load(true);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    load(true);
  }
}

function getFeeAmount(t) {
  if (t.feeAmount !== undefined && t.feeAmount !== null && t.feeAmount > 0) {
    return t.feeAmount;
  }
  return Math.round((t.baseAmount || 0) * 0.005);
}

function getTotalFee(t) {
  const fee05 = getFeeAmount(t);
  const unique = t.uniqueCode || 0;
  return fee05 + unique;
}

function getNetAmount(t) {
  if (t.netAmount !== undefined && t.netAmount !== null && t.netAmount > 0) {
    return t.netAmount;
  }
  const fee = getFeeAmount(t);
  if (t.feeBearer === 'MERCHANT') {
    return Math.max(0, (t.baseAmount || 0) - fee);
  }
  return t.baseAmount || 0;
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.card-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; }
.fr { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.fi { padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.fs { flex: 1; min-width: 180px; }
.fsel { min-width: 140px; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover:not(:disabled) { background: #F8FAFC; border-color: #94A3B8; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 780px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
tr:hover td { background: #F8FAFC; }

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

.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.bold { font-weight: 700; }
.prim { color: #0891B2; }
.green-text { color: #059669; }
.sm { font-size: 0.72rem; }
.muted { color: #94A3B8; }
.empty { text-align: center; color: #94A3B8; padding: 30px; }

.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-expired { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

.fee-val { display: block; font-weight: 600; }
.tag-bearer { display: inline-block; font-size: 0.62rem; font-weight: 800; padding: 1px 6px; border-radius: 6px; margin-top: 2px; }
.tag-bearer.cust { background: #E0F2FE; color: #0284C7; border: 1px solid #BAE6FD; }
.tag-bearer.merch { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #E2E8F0; }
.page-info { font-size: 0.8rem; color: #64748B; font-weight: 600; }

.btn-group-h { display: flex; gap: 8px; align-items: center; }
.date-filter-group { display: flex; align-items: center; gap: 6px; }
.fdate { padding: 8px 10px; font-size: 0.78rem; width: 135px; }
.date-sep { font-size: 0.75rem; color: #64748B; font-weight: 600; }

.btn-primary { background: #00AED6; color: #fff; border: none; }
.btn-primary:hover { background: #0096B8; }

.btn-print-sm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #059669;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-print-sm:hover {
  background: #D1FAE5;
  border-color: #059669;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99999;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 16px 10px; box-sizing: border-box;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
}

.struk-card {
  background: #ffffff;
  color: #0f172a;
  width: 100%; max-width: 360px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  font-family: 'JetBrains Mono', monospace;
  box-sizing: border-box;
  margin: auto;
}

.struk-header { text-align: center; margin-bottom: 12px; }
.struk-logo { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; margin-bottom: 6px; }
.struk-title { font-size: 1.1rem; font-weight: 800; color: #00AED6; margin: 0; }
.struk-subtitle { font-size: 0.68rem; color: #64748B; font-family: 'Plus Jakarta Sans', sans-serif; }

.struk-divider { text-align: center; color: #CBD5E1; letter-spacing: 2px; margin: 10px 0; font-size: 0.8rem; overflow: hidden; }

.struk-badge-success {
  background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669;
  text-align: center; padding: 6px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; margin-bottom: 12px;
}

.struk-details { display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; }
.struk-row { display: flex; justify-content: space-between; gap: 8px; }
.total-row { font-size: 0.9rem; font-weight: 800; margin-top: 4px; padding-top: 4px; color: #0F172A; }

.struk-footer { text-align: center; margin: 14px 0; font-size: 0.72rem; color: #64748B; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.4; }
.struk-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; font-family: 'Plus Jakarta Sans', sans-serif; }
.btn-full { width: 100%; }

.detail-card { width: 100%; max-width: 540px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); padding: 20px; box-sizing: border-box; margin: auto; max-height: calc(100vh - 32px); overflow-y: auto; color: #0F172A; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px; }
.detail-title { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0; }
.detail-sub { font-size: 0.8rem; color: #64748B; }
.detail-close-btn { background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1; }

.detail-status-banner { padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; text-align: center; }
.banner-paid { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; }
.banner-pending { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
.banner-expired, .banner-cancelled { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
.banner-status-text { font-size: 0.9rem; font-weight: 900; letter-spacing: 0.5px; }
.banner-status-desc { font-size: 0.78rem; margin-top: 2px; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; background: #F8FAFC; padding: 14px; border-radius: 12px; border: 1px solid #E2E8F0; }
.detail-item { display: flex; flex-direction: column; gap: 2px; font-size: 0.82rem; word-break: break-word; }
.detail-item label { font-size: 0.68rem; font-weight: 700; color: #64748B; text-transform: uppercase; }
.highlight-item { background: #fff; padding: 8px 12px; border-radius: 8px; border: 1px solid #E2E8F0; }
.lg { font-size: 1.02rem; }

.gobiz-ref-box { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px; border-radius: 12px; margin-bottom: 16px; }
.ref-row { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; font-size: 0.82rem; }
.ref-row span { color: #475569; font-weight: 600; }
.ref-row strong { word-break: break-all; width: 100%; font-size: 0.92rem; }

@media print {
  body * { visibility: hidden; }
  .modal-overlay, .struk-card, .struk-card * { visibility: visible; }
  .modal-overlay { position: absolute; left: 0; top: 0; background: none; }
  .struk-card { box-shadow: none; border: none; padding: 0; margin: 0 auto; width: 100%; }
  .no-print { display: none !important; }
}

@media (max-width: 768px) {
  .modal-overlay { padding: 10px 8px; }
  .card { padding: 14px 12px; }
  .fr { flex-direction: column; gap: 8px; }
  .fs, .fsel, .date-filter-group { min-width: unset; width: 100%; }
  .date-filter-group { justify-content: space-between; }
  .fdate { flex: 1; width: auto; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }

  .detail-card { padding: 16px 12px; border-radius: 14px; max-height: calc(100vh - 20px); }
  .detail-header { margin-bottom: 12px; padding-bottom: 10px; }
  .detail-title { font-size: 1rem; }
  .detail-status-banner { padding: 10px 12px; margin-bottom: 12px; }
  .banner-status-text { font-size: 0.85rem; }
  .banner-status-desc { font-size: 0.74rem; }
  .detail-grid { grid-template-columns: 1fr; gap: 10px; padding: 12px; margin-bottom: 12px; }
  .detail-item { font-size: 0.78rem; }
  .lg { font-size: 0.95rem; }
  .gobiz-ref-box { padding: 12px; margin-bottom: 12px; }
  .detail-actions { flex-direction: column; gap: 8px; margin-top: 12px; }
}
</style>
