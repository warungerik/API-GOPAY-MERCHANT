<template>
  <div>

    <div v-if="isDataLoading" class="card mb loader-card">
      <div class="loader-inner">
        <div class="db-spinner"></div>
        <div class="loader-text-wrap">
          <strong class="loader-title">Memuat Data Admin Portal...</strong>
          <span class="loader-sub">Mengambil daftar merchant, saldo, & statistik sistem dari database...</span>
        </div>
      </div>
    </div>

    <div v-else class="dashboard-fade-in">

      <div class="sg mb">
        <div class="sc">
          <div class="sl">TOTAL MERCHANT</div>
          <div class="sv blue">{{ adminStats.totalMerchants || 0 }}</div>
        </div>
        <div class="sc">
          <div class="sl">WITHDRAW PENDING</div>
          <div class="sv amber">{{ adminStats.pendingWithdrawals || 0 }}</div>
        </div>
        <div class="sc">
          <div class="sl">TOTAL OMSET PLATFORM</div>
          <div class="sv green">Rp {{ (adminStats.totalPaidVolume || 0).toLocaleString('id-ID') }}</div>
        </div>
        <div class="sc">
          <div class="sl">TOTAL SALDO SELURUH MERCHANT</div>
          <div class="sv purple">Rp {{ (adminStats.totalPlatformMerchantBalance || 0).toLocaleString('id-ID') }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-h">
          <h3 class="ct">Kelola Akun & Saldo Seluruh Merchant</h3>
          <div class="btn-group-h" style="display:flex; gap:8px;">
            <NuxtLink to="/admin/transactions" class="btn btn-primary btn-sm">
              Lihat Riwayat Transaksi Merchant
            </NuxtLink>
            <button class="btn btn-outline btn-sm" @click="refreshUsersData">Refresh Data</button>
          </div>
        </div>

        <div class="tw">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAMA TOKO / MERCHANT</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>SALDO TERTAHAN (24 JAM)</th>
                <th>SALDO SIAP TARIK</th>
                <th>TOTAL SALDO MERCHANT</th>
                <th>AKSI ADMIN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usersList" :key="u.id">
                <td class="mono bold">#{{ u.id }}</td>
                <td class="bold">{{ u.name }}</td>
                <td class="mono sm">{{ u.email }}</td>
                <td>
                  <span class="sb" :class="u.role==='ADMIN'?'s-admin':'s-merchant'">{{ u.role }}</span>
                </td>
                <td class="mono amber bold">
                  Rp {{ (u.holding_balance || 0).toLocaleString('id-ID') }}
                </td>
                <td class="mono green bold">
                  Rp {{ (u.available_balance || 0).toLocaleString('id-ID') }}
                </td>
                <td class="mono blue bold bg-total">
                  Rp {{ ((u.total_balance ?? ((u.holding_balance || 0) + (u.available_balance || 0))) || 0).toLocaleString('id-ID') }}
                </td>
                <td>
                  <div class="action-row" v-if="u.role !== 'ADMIN'">
                    <button
                      class="btn btn-primary btn-xs"
                      @click="openAdjustModal(u)"
                      title="Tambah atau kurangi saldo merchant secara manual"
                    >
                      Edit Saldo
                    </button>
                    <button
                      v-if="(u.holding_balance || 0) > 0"
                      class="btn btn-success btn-xs"
                      @click="confirmRelease(u)"
                      title="Rilis saldo tertahan menjadi siap tarik instan"
                    >
                      Rilis Saldo Instan
                    </button>
                    <button
                      class="btn btn-danger btn-xs"
                      @click="confirmDelete(u)"
                    >
                      Hapus Akun
                    </button>
                  </div>
                  <span v-else class="muted sm">System Admin</span>
                </td>
              </tr>
              <tr v-if="usersList.length === 0">
                <td colspan="8" class="empty">Belum ada akun merchant terdaftar.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar" style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:14px; border-top:1px solid #F1F5F9;">
          <button class="btn btn-outline btn-sm" :disabled="currentUsersPage === 1" @click="prevUsersPage">
            &larr; Prev
          </button>
          <span class="page-info" style="font-size:0.8rem; color:#64748B; font-weight:600;">
            Halaman {{ currentUsersPage }} dari {{ totalUsersPages || 1 }} (Total {{ usersTotal }} Merchant)
          </span>
          <button class="btn btn-outline btn-sm" :disabled="currentUsersPage >= totalUsersPages" @click="nextUsersPage">
            Next &rarr;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Swal from 'sweetalert2';

definePageMeta({ layout: 'admin' });

const { usersList, usersTotal, usersLimit, usersOffset, adminStats, fetchUsers, releaseBalance, adjustBalance, deleteUser, fetchAdminStats } = useAdmin();
const swal = useSwal();
const isDataLoading = ref(true);

const currentUsersPage = computed(() => {
  const limit = usersLimit.value || 10;
  const offset = usersOffset.value || 0;
  return Math.floor(offset / limit) + 1;
});

const totalUsersPages = computed(() => {
  const limit = usersLimit.value || 10;
  const total = usersTotal.value || 0;
  return Math.ceil(total / limit) || 1;
});

async function loadUsers(params = {}, showPopup = false) {
  if (showPopup && process.client) {
    swal.showLoading('Memuat Merchant...', 'Sedang mengambil data merchant...');
  }
  try {
    await fetchUsers(params);
  } finally {
    if (showPopup && process.client) {
      swal.hideLoading();
    }
  }
}

function refreshUsersData() {
  const limit = usersLimit.value || 10;
  const offset = usersOffset.value || 0;
  loadUsers({ limit, offset }, true);
}

function prevUsersPage() {
  if (currentUsersPage.value > 1) {
    const limit = usersLimit.value || 10;
    const newOffset = (currentUsersPage.value - 2) * limit;
    loadUsers({ limit, offset: newOffset }, true);
  }
}

function nextUsersPage() {
  if (currentUsersPage.value < totalUsersPages.value) {
    const limit = usersLimit.value || 10;
    const newOffset = currentUsersPage.value * limit;
    loadUsers({ limit, offset: newOffset }, true);
  }
}

async function openAdjustModal(u) {
  const { value: formValues } = await Swal.fire({
    title: `Edit Saldo - ${u.name}`,
    html: `
      <div style="text-align:left; font-size:0.85rem; color:#475569; margin-bottom:14px; background:#F1F5F9; padding:10px; border-radius:8px;">
        <div>Saldo Siap Tarik Saat Ini: <b style="color:#059669">Rp ${(u.available_balance || 0).toLocaleString('id-ID')}</b></div>
        <div>Saldo Tertahan Saat Ini: <b style="color:#D97706">Rp ${(u.holding_balance || 0).toLocaleString('id-ID')}</b></div>
      </div>
      <div style="text-align:left; margin-bottom:12px;">
        <label style="font-size:0.78rem; font-weight:700; color:#334155; display:block; margin-bottom:4px;">Jenis Penyesuaian Saldo:</label>
        <select id="swal-adj-type" class="swal2-select" style="width:100%; margin:0; box-sizing:border-box; padding:8px 12px; border-radius:8px; border:1px solid #CBD5E1; font-size:0.85rem;">
          <option value="ADD">Tambah Saldo (Kredit / Bonus)</option>
          <option value="DEDUCT">Kurangi Saldo (Debet / Potongan)</option>
        </select>
      </div>
      <div style="text-align:left; margin-bottom:12px;">
        <label style="font-size:0.78rem; font-weight:700; color:#334155; display:block; margin-bottom:4px;">Nominal Saldo (Rp):</label>
        <input id="swal-adj-amount" type="number" min="1" placeholder="Contoh: 50000" class="swal2-input" style="width:100%; margin:0; box-sizing:border-box; padding:8px 12px; border-radius:8px; font-size:0.85rem;">
      </div>
      <div style="text-align:left;">
        <label style="font-size:0.78rem; font-weight:700; color:#334155; display:block; margin-bottom:4px;">Catatan Admin (Opsional):</label>
        <input id="swal-adj-note" type="text" placeholder="Contoh: Penyesuaian saldo manual admin" class="swal2-input" style="width:100%; margin:0; box-sizing:border-box; padding:8px 12px; border-radius:8px; font-size:0.85rem;">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Simpan Saldo',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#00AED6',
    cancelButtonColor: '#64748B',
    preConfirm: () => {
      const typeElem = document.getElementById('swal-adj-type');
      const amountElem = document.getElementById('swal-adj-amount');
      const noteElem = document.getElementById('swal-adj-note');

      const type = typeElem ? typeElem.value : 'ADD';
      const amount = amountElem ? Number(amountElem.value) : 0;
      const note = noteElem ? noteElem.value : '';

      if (!amount || isNaN(amount) || amount <= 0) {
        Swal.showValidationMessage('Masukkan nominal saldo yang valid (minimal Rp 1)');
        return false;
      }
      return { type, amount, note };
    }
  });

  if (formValues) {
    adjustBalance(u.id, formValues);
  }
}

async function confirmRelease(u) {
  const isConfirmed = await swal.confirm(
    `Rilis Saldo Merchant ${u.name}?`,
    `Apakah Anda yakin ingin merilis saldo tertahan (Rp ${(u.holding_balance || 0).toLocaleString('id-ID')}) milik "${u.name}" menjadi Saldo Siap Tarik secara instan?`,
    'Ya, Rilis Saldo Sekarang'
  );
  if (isConfirmed) {
    releaseBalance(u.id);
  }
}

async function confirmDelete(u) {
  const isConfirmed = await swal.confirm(
    `Hapus Akun ${u.name}?`,
    `Apakah Anda yakin ingin menghapus akun merchant "${u.name}" (${u.email})? Seluruh API key, webhook log, dan transaksi merchant ini akan terhapus permanen.`,
    'Ya, Hapus Akun'
  );
  if (isConfirmed) {
    deleteUser(u.id);
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchUsers(),
      fetchAdminStats()
    ]);
  } finally {
    isDataLoading.value = false;
  }
});
</script>

<style scoped>
.loader-card {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.03);
}

.loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.db-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #E2E8F0;
  border-top-color: #00AED6;
  border-right-color: #10B981;
  border-radius: 50%;
  animation: dbSpin 0.75s linear infinite;
}

@keyframes dbSpin {
  to { transform: rotate(360deg); }
}

.loader-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.loader-title {
  font-size: 0.95rem;
  color: #0F172A;
  font-weight: 800;
}

.loader-sub {
  font-size: 0.78rem;
  color: #64748B;
}

.dashboard-fade-in {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mb { margin-bottom: 20px; }
.card-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; }

.sg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.sc { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
.sl { font-size: 0.65rem; color: #94A3B8; font-weight: 700; }
.sv { font-size: 1.3rem; font-weight: 800; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
.sv.green { color: #059669; } .sv.blue { color: #0891B2; } .sv.amber { color: #D97706; } .sv.purple { color: #7C3AED; }

.action-row { display: flex; flex-direction: column; gap: 4px; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-primary { background: #00AED6; color: #fff; }
.btn-primary:hover { background: #0096B8; }
.btn-danger { background: #DC2626; color: #fff; }
.btn-danger:hover { background: #B91C1C; }
.btn-success { background: #059669; color: #fff; }
.btn-success:hover { background: #047857; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }
.btn-xs { padding: 5px 10px; font-size: 0.72rem; border-radius: 6px; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 750px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
tr:hover td { background: #F8FAFC; }

.bold { font-weight: 700; }
.mono { font-family: 'JetBrains Mono', monospace; }
.green { color: #059669; }
.amber { color: #D97706; }
.muted { color: #94A3B8; }
.sm { font-size: 0.72rem; }
.center { text-align: center; }
.empty { text-align: center; color: #94A3B8; padding: 30px; }

.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-merchant { background: #E0F7FA; color: #00838F; border: 1px solid #B2EBF2; }
.s-admin { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  .sg { grid-template-columns: 1fr; gap: 8px; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }
}
</style>
