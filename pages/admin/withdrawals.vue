<template>
  <div>
    <div class="card">
      <div class="card-h">
        <div>
          <h2 class="ct">Kelola Permintaan Withdraw Merchant</h2>
          <p class="cs">Proses transfer dana penarikan saldo milik merchant dan beri catatan jika perlu.</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="fetchAdminWithdrawals">Refresh Data</button>
      </div>

      <div class="filter-tabs mb">
        <button class="ft" :class="{active: filter===''}" @click="filter=''">Semua</button>
        <button class="ft" :class="{active: filter==='PENDING'}" @click="filter='PENDING'">PENDING</button>
        <button class="ft" :class="{active: filter==='APPROVED'}" @click="filter='APPROVED'">APPROVED</button>
        <button class="ft" :class="{active: filter==='REJECTED'}" @click="filter='REJECTED'">REJECTED</button>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>MERCHANT</th>
              <th>NOMINAL</th>
              <th>FEE</th>
              <th>DITERIMA</th>
              <th>REKENING TUJUAN</th>
              <th>STATUS</th>
              <th>TANGGAL</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in filteredList" :key="w.id">
              <td class="mono bold">#{{ w.id }}</td>
              <td>
                <div class="acc-info">
                  <strong>{{ w.user_name || 'Merchant' }}</strong>
                  <span class="sm mono text-muted">{{ w.user_email }}</span>
                </div>
              </td>
              <td class="mono bold">Rp {{ w.amount.toLocaleString('id-ID') }}</td>
              <td class="mono amber sm">Rp {{ w.fee.toLocaleString('id-ID') }}</td>
              <td class="mono green bold">Rp {{ w.net_amount.toLocaleString('id-ID') }}</td>
              <td>
                <div class="acc-info">
                  <span class="badge-provider">{{ w.account_provider }}</span>
                  <span class="mono bold sm">{{ w.account_number }}</span>
                  <span class="sm text-muted">a.n {{ w.account_name }}</span>
                </div>
              </td>
              <td>
                <span class="sb" :class="'s-'+w.status.toLowerCase()">{{ w.status }}</span>
              </td>
              <td class="muted sm">{{ fmt(w.created_at) }}</td>
              <td>
                <div v-if="w.status === 'PENDING'" class="btn-group">
                  <button class="btn btn-success btn-xs" @click="handleApprove(w)">Setujui</button>
                  <button class="btn btn-danger btn-xs" @click="handleReject(w)">Tolak</button>
                </div>
                <span v-else class="sm muted">{{ w.admin_note || '-' }}</span>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="9" class="empty">Tidak ada data penarikan saldo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

const { adminWithdrawals, fetchAdminWithdrawals, approveWithdraw, rejectWithdraw } = useAdmin();
const swal = useSwal();
const filter = ref('');

const filteredList = computed(() => {
  if (!filter.value) return adminWithdrawals.value;
  return adminWithdrawals.value.filter(w => w.status === filter.value);
});

async function handleApprove(w) {
  const note = await swal.prompt(
    `Setujui Penarikan #${w.id}`,
    `Proses transfer Rp ${w.net_amount.toLocaleString('id-ID')} ke ${w.account_provider} ${w.account_number} a.n ${w.account_name}`,
    'Masukkan catatan admin...',
    'Transfer berhasil diproses',
    'question'
  );
  if (note !== null) {
    approveWithdraw(w.id, note);
  }
}

async function handleReject(w) {
  const note = await swal.prompt(
    `Tolak Penarikan #${w.id}`,
    `Masukkan alasan penolakan penarikan #${w.id}:`,
    'Alasan penolakan...',
    'Saldo tidak mencukupi atau data rekening salah',
    'warning'
  );
  if (note !== null) {
    rejectWithdraw(w.id, note);
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(() => {
  fetchAdminWithdrawals();
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mb { margin-bottom: 20px; }
.card-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; }
.cs { font-size: 0.78rem; color: #64748B; margin-top: 2px; }

.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.ft { background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; color: #64748B; padding: 6px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.ft.active { background: #00AED6; color: #fff; border-color: #00AED6; }
.ft:hover:not(.active) { background: #E2E8F0; color: #334155; }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 14px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; }
.btn-success { background: #059669; color: #fff; }
.btn-success:hover { background: #047857; }
.btn-danger { background: #DC2626; color: #fff; }
.btn-danger:hover { background: #B91C1C; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }
.btn-xs { padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; }

.btn-group { display: flex; gap: 4px; }

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
.empty { text-align: center; color: #94A3B8; padding: 30px; }

.acc-info { display: flex; flex-direction: column; gap: 2px; }
.text-muted { color: #64748B; }

.badge-provider { display: inline-block; background: #E0F7FA; color: #00838F; padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 0.65rem; width: fit-content; }

.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-approved { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-rejected { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }
}
</style>
