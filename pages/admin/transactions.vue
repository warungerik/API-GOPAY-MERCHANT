<template>
  <div>

    <div class="card mb notice-card">
      <div class="notice-inner">
        <div class="notice-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <div class="notice-text">
          <strong class="notice-title">Pemeriksaan Keaslian Transaksi Merchant (Anti Transaksi Palsu)</strong>
          <span class="notice-sub">Gunakan No. Tx ID (Ref Mutasi) untuk mencocokkan mutasi asli. Bukti transaksi sah hanya yang memiliki status <strong class="green-text">PAID</strong> dan memiliki Ref Tx ID yang valid.</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-h">
        <div>
          <h2 class="ct">Riwayat Seluruh Transaksi Merchant</h2>
          <span class="sub-ct">Total Data: <strong>{{ adminTxTotal }}</strong> Transaksi</span>
        </div>
        <div class="btn-group-h">
          <button class="btn btn-primary btn-sm" @click="handleExportCsv">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV Transaksi
          </button>
          <button class="btn btn-outline btn-sm" @click="resetAndLoad">Refresh Data</button>
        </div>
      </div>

      <div class="fr">
        <div class="search-input-wrap">
          <input
            type="text"
            class="fi fs"
            v-model="search"
            @input="onSearchInput"
            placeholder="Cari Order ID, Pelanggan, Tx ID, Catatan..."
          />
        </div>

        <div class="date-filter-group">
          <input
            type="date"
            class="fi fdate"
            v-model="startDate"
            @change="resetAndLoad"
            title="Tanggal Mulai"
          />
          <span class="date-sep">s/d</span>
          <input
            type="date"
            class="fi fdate"
            v-model="endDate"
            @change="resetAndLoad"
            title="Tanggal Akhir"
          />
        </div>

        <select class="fi fsel" v-model="selectedMerchantId" @change="resetAndLoad">
          <option value="">Semua Merchant</option>
          <option v-for="m in usersList" :key="m.id" :value="m.id">
            {{ m.name }} (#{{ m.id }})
          </option>
        </select>

        <select class="fi fsel" v-model="sf" @change="resetAndLoad">
          <option value="">Semua Status</option>
          <option value="PAID">PAID (Lunas)</option>
          <option value="PENDING">PENDING (Menunggu)</option>
          <option value="EXPIRED">EXPIRED (Kadaluarsa)</option>
          <option value="CANCELLED">CANCELLED (Dibatalkan)</option>
        </select>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>MERCHANT</th>
              <th>TANGGAL & WAKTU</th>
              <th>PELANGGAN</th>
              <th>TOTAL DIBAYAR</th>
              <th>FEE & KODE UNIK</th>
              <th>NET DITERIMA</th>
              <th>STATUS</th>
              <th>REF TX ID</th>
              <th>AKSI ADMIN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in adminTransactions" :key="t.orderId">
              <td class="mono bold prim">{{ t.orderId }}</td>
              <td>
                <div class="merchant-cell">
                  <strong class="merchant-name">{{ t.merchantName }}</strong>
                  <span class="merchant-email sm muted mono">{{ t.merchantEmail }}</span>
                </div>
              </td>
              <td class="muted sm">
                <div>{{ fmt(t.createdAt) }}</div>
                <div v-if="t.paidAt" class="green-text xs">Lunas: {{ fmt(t.paidAt) }}</div>
              </td>
              <td>
                <div class="bold">{{ t.customerName || 'Customer' }}</div>
                <div class="xs muted" v-if="t.note">Catatan: {{ t.note }}</div>
              </td>
              <td class="mono bold">Rp {{ (t.totalAmount || 0).toLocaleString('id-ID') }}</td>
              <td class="mono sm">
                <span class="fee-val">Rp {{ getTotalFee(t).toLocaleString('id-ID') }}</span>
                <div class="xs muted">
                  Fee: Rp {{ (t.feeAmount || 0).toLocaleString('id-ID') }}
                  <span v-if="t.uniqueCode"> | Kode: +{{ t.uniqueCode }}</span>
                </div>
              </td>
              <td class="mono bold green-text">Rp {{ getNetAmount(t).toLocaleString('id-ID') }}</td>
              <td>
                <span class="sb" :class="'s-'+(t.status || 'PENDING').toLowerCase()">
                  {{ t.status }}
                </span>
              </td>
              <td class="mono sm">
                <span v-if="t.txId" class="tx-badge" title="Ref ID Mutasi Valid">
                  {{ t.txId }}
                </span>
                <span v-else class="muted sm">-</span>
              </td>
              <td>
                <button
                  class="btn btn-outline btn-xs"
                  @click="openDetailModal(t)"
                  title="Lihat Rincian Bukti & Data Lengkap Transaksi"
                >
                  Detail Bukti
                </button>
              </td>
            </tr>
            <tr v-if="adminTransactions.length === 0">
              <td colspan="10" class="empty">Tidak ada data transaksi merchant ditemukan.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <button class="btn btn-outline btn-sm" :disabled="currentPage === 1" @click="prevPage">
          &larr; Prev
        </button>
        <span class="page-info">
          Halaman {{ currentPage }} dari {{ totalPages || 1 }} (Total {{ adminTxTotal }} Data)
        </span>
        <button class="btn btn-outline btn-sm" :disabled="currentPage >= totalPages" @click="nextPage">
          Next &rarr;
        </button>
      </div>
    </div>

    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="detail-card">
        <div class="detail-header">
          <div class="detail-title-wrap">
            <h3 class="detail-title">Detail Verifikasi Transaksi</h3>
            <span class="detail-sub">Order ID: <strong class="mono">{{ selectedOrder.orderId }}</strong></span>
          </div>
          <button class="detail-close-btn" @click="showDetailModal = false">&times;</button>
        </div>

        <div class="detail-status-banner" :class="'banner-'+(selectedOrder.status || 'pending').toLowerCase()">
          <div class="banner-status-text">STATUS: {{ selectedOrder.status }}</div>
          <div class="banner-status-desc" v-if="selectedOrder.status === 'PAID'">
            Pembayaran Terverifikasi & Match dengan Mutasi Server
          </div>
          <div class="banner-status-desc" v-else-if="selectedOrder.status === 'PENDING'">
            Menunggu Pembayaran dari Pembeli (QRIS Aktif)
          </div>
          <div class="banner-status-desc" v-else>
            Transaksi Tidak Selesai / Kadaluarsa
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <label>Toko / Merchant</label>
            <strong class="merchant-name">{{ selectedOrder.merchantName }}</strong>
            <span class="sm muted mono">{{ selectedOrder.merchantEmail }}</span>
          </div>
          <div class="detail-item">
            <label>ID Merchant / User ID</label>
            <span class="mono">#{{ selectedOrder.userId }}</span>
          </div>
          <div class="detail-item">
            <label>Pelanggan</label>
            <span>{{ selectedOrder.customerName || 'Customer' }}</span>
          </div>
          <div class="detail-item">
            <label>Catatan Order</label>
            <span>{{ selectedOrder.note || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>Nominal Asli (Base)</label>
            <span class="mono">Rp {{ (selectedOrder.baseAmount || 0).toLocaleString('id-ID') }}</span>
          </div>
          <div class="detail-item">
            <label>Kode Unik Transaksi</label>
            <span class="mono amber bold">+{{ selectedOrder.uniqueCode || 0 }}</span>
          </div>
          <div class="detail-item">
            <label>Fee Layanan</label>
            <span class="mono">Rp {{ (selectedOrder.feeAmount || 0).toLocaleString('id-ID') }} ({{ selectedOrder.feeBearer === 'CUSTOMER' ? 'Dibebankan Customer' : 'Dipotong Merchant' }})</span>
          </div>
          <div class="detail-item highlight-item">
            <label>TOTAL NOMINAL DIBAYAR</label>
            <strong class="mono green-text lg">Rp {{ (selectedOrder.totalAmount || 0).toLocaleString('id-ID') }}</strong>
          </div>
          <div class="detail-item highlight-item">
            <label>BERSIH DITERIMA MERCHANT</label>
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

        <div class="detail-sec-title">Bukti & Ref ID Mutasi Pembayaran</div>
        <div class="gobiz-ref-box">
          <div class="ref-row">
            <span>No. Ref Mutasi (Tx ID):</span>
            <strong v-if="selectedOrder.txId" class="mono green-text bold font-1rem">{{ selectedOrder.txId }}</strong>
            <span v-else class="muted italic">Belum ada mutasi terdeteksi</span>
          </div>
          <p class="ref-note sm muted">
            *Nomor Ref ini dihasilkan langsung dari sistem verifikasi otomatis saat mutasi berhasil dicocokkan dengan kode unik transaksi.
          </p>
        </div>

        <div class="detail-actions">
          <button class="btn btn-outline btn-full" @click="showDetailModal = false">Tutup Modal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });

const {
  usersList,
  fetchUsers,
  adminTransactions,
  adminTxTotal,
  adminTxLimit,
  adminTxOffset,
  fetchAdminTransactions,
  exportAdminTransactionsCSV
} = useAdmin();
const swal = useSwal();

const search = ref('');
const sf = ref('');
const selectedMerchantId = ref('');
const startDate = ref('');
const endDate = ref('');
const showDetailModal = ref(false);
const selectedOrder = ref({});

let searchTimer = null;

const currentPage = computed(() => {
  const limit = adminTxLimit.value || 50;
  const offset = adminTxOffset.value || 0;
  return Math.floor(offset / limit) + 1;
});

const totalPages = computed(() => {
  const limit = adminTxLimit.value || 50;
  const total = adminTxTotal.value || 0;
  return Math.ceil(total / limit) || 1;
});

async function loadData(offset = 0, showPopup = false) {
  if (showPopup && process.client) {
    swal.showLoading('Memuat Transaksi Admin...', 'Sedang mengambil data transaksi...');
  }
  try {
    await fetchAdminTransactions({
      q: search.value,
      status: sf.value,
      merchantId: selectedMerchantId.value,
      startDate: startDate.value,
      endDate: endDate.value,
      limit: 50,
      offset
    });
  } finally {
    if (showPopup && process.client) {
      swal.hideLoading();
    }
  }
}

function resetAndLoad() {
  loadData(0, true);
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    resetAndLoad();
  }, 400);
}

function prevPage() {
  if (currentPage.value > 1) {
    const limit = adminTxLimit.value || 50;
    const newOffset = (currentPage.value - 2) * limit;
    loadData(newOffset, true);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    const limit = adminTxLimit.value || 50;
    const newOffset = currentPage.value * limit;
    loadData(newOffset, true);
  }
}

function handleExportCsv() {
  exportAdminTransactionsCSV({
    q: search.value,
    status: sf.value,
    merchantId: selectedMerchantId.value,
    startDate: startDate.value,
    endDate: endDate.value
  });
}

function openDetailModal(order) {
  selectedOrder.value = order;
  showDetailModal.value = true;
}

function getTotalFee(t) {
  return (t.feeAmount || 0) + (t.uniqueCode || 0);
}

function getNetAmount(t) {
  if (t.netAmount !== undefined && t.netAmount !== null) return t.netAmount;
  const fee = getTotalFee(t);
  return (t.totalAmount || 0) - fee;
}

function fmt(d) {
  if (!d) return '-';
  try {
    return new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  } catch (e) {
    return String(d);
  }
}

onMounted(() => {
  fetchUsers({ limit: 1000 });
  loadData(0);
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mb { margin-bottom: 20px; }
.card-h { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.ct { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0; }
.sub-ct { font-size: 0.78rem; color: #64748B; margin-top: 2px; display: block; }
.btn-group-h { display: flex; gap: 8px; align-items: center; }

.notice-card { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px 20px; }
.notice-inner { display: flex; align-items: center; gap: 14px; }
.notice-icon-wrap { color: #16A34A; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #DCFCE7; border-radius: 50%; }
.notice-text { display: flex; flex-direction: column; gap: 2px; }
.notice-title { font-size: 0.88rem; font-weight: 800; color: #14532D; }
.notice-sub { font-size: 0.78rem; color: #166534; line-height: 1.4; }

.fr { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.search-input-wrap { flex: 1; min-width: 240px; }
.fi { padding: 9px 14px; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 0.82rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0, 174, 214, 0.15); }
.fs { width: 100%; }
.date-filter-group { display: flex; align-items: center; gap: 6px; }
.fdate { width: 140px; }
.date-sep { font-size: 0.75rem; color: #64748B; font-weight: 700; }
.fsel { min-width: 150px; background: #fff; cursor: pointer; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 10px; border: 1px solid #E2E8F0; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 950px; }
th { padding: 12px 14px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px 14px; border-bottom: 1px solid #F1F5F9; color: #1E293B; vertical-align: middle; }
tr:hover td { background: #F8FAFC; }

.bold { font-weight: 700; }
.mono { font-family: 'JetBrains Mono', monospace; }
.prim { color: #00AED6; }
.green-text { color: #059669; }
.blue-text { color: #2563EB; }
.amber { color: #D97706; }
.muted { color: #64748B; }
.sm { font-size: 0.74rem; }
.xs { font-size: 0.68rem; }
.empty { text-align: center; color: #94A3B8; padding: 40px; }

.merchant-cell { display: flex; flex-direction: column; }
.merchant-name { font-weight: 800; color: #0F172A; font-size: 0.82rem; }
.merchant-email { color: #64748B; }

.fee-val { font-weight: 700; color: #D97706; }
.tx-badge { background: #EFF6FF; color: #1D4ED8; padding: 2px 8px; border-radius: 6px; border: 1px solid #BFDBFE; font-weight: 700; font-size: 0.72rem; display: inline-block; }

.sb { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; }
.s-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-expired { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.s-cancelled { background: #F1F5F9; color: #64748B; border: 1px solid #CBD5E1; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; border-color: #94A3B8; }
.btn-primary { background: #00AED6; color: #fff; }
.btn-primary:hover { background: #0096B8; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }
.btn-xs { padding: 5px 10px; font-size: 0.72rem; border-radius: 6px; }
.btn-full { width: 100%; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid #F1F5F9; }
.page-info { font-size: 0.8rem; color: #64748B; font-weight: 600; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 99999; display: flex; justify-content: center; align-items: flex-start; padding: 16px 10px; box-sizing: border-box; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.detail-card { width: 100%; max-width: 580px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); padding: 20px; box-sizing: border-box; margin: auto; max-height: calc(100vh - 32px); overflow-y: auto; color: #0F172A; }
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

.detail-sec-title { font-size: 0.85rem; font-weight: 800; color: #0F172A; margin-bottom: 8px; }
.gobiz-ref-box { background: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px; border-radius: 12px; margin-bottom: 16px; }
.ref-row { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; font-size: 0.82rem; }
.ref-row span { color: #475569; font-weight: 600; }
.ref-row strong { word-break: break-all; width: 100%; font-size: 0.92rem; }
.ref-note { margin-top: 8px; line-height: 1.4; }

@media (max-width: 768px) {
  .modal-overlay { padding: 10px 8px; }
  .card { padding: 14px 12px; }
  .fr { flex-direction: column; align-items: stretch; }
  .date-filter-group { width: 100%; }
  .fdate { flex: 1; }
  .fsel { width: 100%; }

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
