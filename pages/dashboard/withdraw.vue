<template>
  <div>

    <div class="balance-grid mb">
      <div class="b-card b-avail">
        <span class="b-lbl">SALDO SIAP TARIK</span>
        <strong class="b-val green">Rp {{ (merchantBalances.availableBalance || 0).toLocaleString('id-ID') }}</strong>
        <span class="b-sub">Dapat ditarik ke rekening / E-Wallet sekarang</span>
      </div>
      <div class="b-card b-hold">
        <span class="b-lbl">SALDO TERTAHAN</span>
        <strong class="b-val amber">Rp {{ (merchantBalances.holdingBalance || 0).toLocaleString('id-ID') }}</strong>
        <span class="b-sub">Otomatis siap tarik dalam 24 jam dari transaksi</span>
      </div>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Rekening & E-Wallet Penarikan Tersimpan</h2>
          <p class="cs">Data rekening ini akan digunakan otomatis saat pengajuan penarikan dana.</p>
        </div>
        <button class="btn btn-outline btn-sm" @click="openModal" :disabled="!payoutAccount.canUpdate">
          {{ payoutAccount.hasPayout ? (payoutAccount.canUpdate ? 'Ubah Rekening' : `Terkunci (${payoutAccount.daysRemaining} Hari)`) : 'Setel Rekening Baru' }}
        </button>
      </div>

      <div v-if="payoutAccount.hasPayout" class="payout-box">
        <div class="pb-left">
          <div class="pb-provider">{{ payoutAccount.payoutProvider }} ({{ payoutAccount.payoutType }})</div>
          <div class="pb-number mono">{{ payoutAccount.payoutNumber }}</div>
          <div class="pb-name">a.n {{ payoutAccount.payoutName }}</div>
        </div>
        <div class="pb-right">
          <span class="badge-status" :class="payoutAccount.canUpdate ? 'b-active' : 'b-locked'">
            {{ payoutAccount.canUpdate ? 'Siap Diubah' : `Terkunci ${payoutAccount.daysRemaining} Hari` }}
          </span>
          <span class="pb-note">Perubahan rekening dibatasi 1x dalam 3 hari.</span>
        </div>
      </div>

      <div v-else class="empty-payout">
        <p>Anda belum menyimpan rekening atau E-Wallet penarikan. Klik <strong>"Setel Rekening Baru"</strong> untuk menyimpan data rekening Anda.</p>
      </div>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Pengajuan Penarikan Saldo (Withdraw)</h2>
          <p class="cs">Tarik saldo siap tarik ke rekening penarikan tersimpan Anda.</p>
        </div>
      </div>

      <div class="schedule-notice mb-sm">
        <div class="sn-header">
          <span class="sn-title">JAM OPERASIONAL PENARIKAN ADMIN</span>
          <span class="sn-badge">Senin - Jumat | 07:00 - 21:00 WIB</span>
        </div>
        <p class="sn-text">
          Penarikan diproses admin pada hari <strong>Senin s.d. Jumat pukul 07:00 – 21:00 WIB</strong>.<br/>
          <span class="sn-highlight">Sabtu & Minggu LIBUR</span> — Pengajuan di luar jam operasional atau hari libur akan diproses pada hari kerja berikutnya.
        </p>
      </div>

      <div class="info-grid mb-sm">
        <div class="info-card">
          <span class="info-lbl">MINIMAL WITHDRAW</span>
          <strong class="info-val">Rp 15.000</strong>
        </div>
        <div class="info-card">
          <span class="info-lbl">FEE &lt; Rp 100.000</span>
          <strong class="info-val amber">Rp 3.000</strong>
        </div>
        <div class="info-card">
          <span class="info-lbl">FEE Rp 100K - 1 JUTA</span>
          <strong class="info-val amber">Rp 4.000</strong>
        </div>
        <div class="info-card">
          <span class="info-lbl">FEE &gt; Rp 1.000.000</span>
          <strong class="info-val amber">Rp 6.000</strong>
        </div>
      </div>

      <form novalidate @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="fg">
            <label class="fl">Nominal Penarikan (Rp)</label>
            <input type="number" class="fi mono" v-model.number="form.amount" placeholder="Contoh: 50000" />
            <div class="fee-hint" v-if="form.amount >= 15000">
              Fee: <strong>Rp {{ fee.toLocaleString('id-ID') }}</strong> | Diterima: <strong class="green">Rp {{ netAmount.toLocaleString('id-ID') }}</strong>
            </div>
          </div>

          <div class="fg">
            <label class="fl">Tipe Tujuan Penarikan</label>
            <input type="text" class="fi readonly" :value="payoutAccount.hasPayout ? `${payoutAccount.payoutProvider} (${payoutAccount.payoutType})` : 'Belum Disetel'" readonly />
          </div>

          <div class="fg">
            <label class="fl">Nama Pemilik Rekening / Akun</label>
            <input type="text" class="fi readonly" :value="payoutAccount.payoutName || '-'" readonly />
          </div>

          <div class="fg">
            <label class="fl">Nomor Rekening / Nomor HP E-Wallet</label>
            <input type="text" class="fi mono readonly" :value="payoutAccount.payoutNumber || '-'" readonly />
          </div>

          <div class="fg full-width">
            <label class="fl">Catatan Penarikan (Opsional)</label>
            <input type="text" class="fi" v-model="form.note" placeholder="Contoh: Penarikan omset..." />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-full-mobile" :disabled="loading || !payoutAccount.hasPayout">
            {{ loading ? 'Memproses...' : 'Kirim Permintaan Penarikan' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Setel / Ubah Rekening Penarikan</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="modal-warning mb-sm">
            <strong>Perhatian:</strong> Rekening penarikan hanya bisa diubah <strong>1 kali dalam 3 Hari</strong>. Pastikan data yang dimasukkan sudah benar!
          </div>

          <div class="fg mb-sm">
            <label class="fl">Tipe Tujuan</label>
            <div class="type-selector">
              <label class="radio-lbl" :class="{active: modalForm.payoutType==='BANK'}">
                <input type="radio" v-model="modalForm.payoutType" value="BANK" @change="onModalTypeChange" /> Transfer Bank
              </label>
              <label class="radio-lbl" :class="{active: modalForm.payoutType==='EWALLET'}">
                <input type="radio" v-model="modalForm.payoutType" value="EWALLET" @change="onModalTypeChange" /> E-Wallet
              </label>
            </div>
          </div>

          <div class="fg mb-sm">
            <label class="fl">Penyedia / Provider</label>
            <select class="fi" v-model="modalForm.payoutProvider">
              <option v-for="p in modalAvailableProviders" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div class="fg mb-sm">
            <label class="fl">Nama Pemilik Rekening / Akun</label>
            <input type="text" class="fi" v-model="modalForm.payoutName" placeholder="Contoh: Budi Santoso" />
          </div>

          <div class="fg mb-sm">
            <label class="fl">Nomor Rekening / Nomor HP E-Wallet</label>
            <input type="text" class="fi mono" v-model="modalForm.payoutNumber" placeholder="Contoh: 1234567890 atau 08123456789" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" @click="closeModal">Batal</button>
          <button class="btn btn-primary btn-sm" @click="handleSavePayout" :disabled="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan Rekening (Kunci 3 Hari)' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-h">
        <h3 class="ct">Riwayat Penarikan Saldo</h3>
        <button class="btn btn-outline btn-sm" @click="refreshData">Refresh</button>
      </div>

      <div class="retention-notice mb-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="notice-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Catatan: Riwayat penarikan disimpan otomatis selama <strong>3 hari</strong>. Data berumur lebih dari 3 hari akan dibersihkan sistem berkala.</span>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>NOMINAL</th>
              <th>FEE</th>
              <th>DITERIMA</th>
              <th>TUJUAN</th>
              <th>STATUS</th>
              <th>CATATAN ADMIN</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in paginatedWithdrawals" :key="w.id">
              <td class="muted sm">{{ fmt(w.created_at) }}</td>
              <td class="mono bold">Rp {{ w.amount.toLocaleString('id-ID') }}</td>
              <td class="mono amber sm">Rp {{ w.fee.toLocaleString('id-ID') }}</td>
              <td class="mono green bold">Rp {{ w.net_amount.toLocaleString('id-ID') }}</td>
              <td>
                <div class="acc-info">
                  <strong>{{ w.account_provider }}</strong> ({{ w.account_type }})
                  <span class="sm mono text-muted">{{ w.account_number }} a.n {{ w.account_name }}</span>
                </div>
              </td>
              <td>
                <span class="sb" :class="'s-'+w.status.toLowerCase()">{{ w.status }}</span>
              </td>
              <td class="sm muted">{{ w.admin_note || '-' }}</td>
            </tr>
            <tr v-if="withdrawalsList.length === 0">
              <td colspan="7" class="empty">Belum ada riwayat penarikan saldo.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <button class="btn btn-outline btn-sm" :disabled="currentWithdrawPage === 1" @click="prevWithdrawPage">
          ← Prev
        </button>
        <span class="page-info">Halaman {{ currentWithdrawPage }} dari {{ totalWithdrawPages }}</span>
        <button class="btn btn-outline btn-sm" :disabled="currentWithdrawPage >= totalWithdrawPages" @click="nextWithdrawPage">
          Next →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { withdrawalsList, merchantBalances, payoutAccount, fetchBalances, fetchPayoutAccount, savePayoutAccount, fetchWithdrawals, requestWithdraw } = useMerchant();
const swal = useSwal();

const form = ref({
  amount: 50000,
  note: ''
});

const showModal = ref(false);
const saving = ref(false);
const loading = ref(false);

const currentWithdrawPage = ref(1);
const withdrawItemsPerPage = 10;

const totalWithdrawPages = computed(() => {
  return Math.ceil(withdrawalsList.value.length / withdrawItemsPerPage) || 1;
});

const paginatedWithdrawals = computed(() => {
  const start = (currentWithdrawPage.value - 1) * withdrawItemsPerPage;
  return withdrawalsList.value.slice(start, start + withdrawItemsPerPage);
});

function prevWithdrawPage() {
  if (currentWithdrawPage.value > 1) {
    currentWithdrawPage.value--;
  }
}

function nextWithdrawPage() {
  if (currentWithdrawPage.value < totalWithdrawPages.value) {
    currentWithdrawPage.value++;
  }
}

const modalForm = ref({
  payoutType: 'BANK',
  payoutProvider: 'BCA',
  payoutName: '',
  payoutNumber: ''
});

const bankProviders = ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'CIMB NIAGA', 'DANAMON', 'BANK JAGO'];
const ewalletProviders = ['DANA', 'OVO', 'GO-PAY', 'SHOPEEPAY', 'LINKAJA'];

const modalAvailableProviders = computed(() => {
  return modalForm.value.payoutType === 'BANK' ? bankProviders : ewalletProviders;
});

function onModalTypeChange() {
  modalForm.value.payoutProvider = modalAvailableProviders.value[0];
}

function openModal() {
  if (!payoutAccount.value.canUpdate) {
    swal.error('Terkunci', `Rekening penarikan baru diubah. Anda baru dapat mengubahnya kembali dalam ${payoutAccount.value.daysRemaining} hari.`);
    return;
  }
  modalForm.value = {
    payoutType: payoutAccount.value.payoutType || 'BANK',
    payoutProvider: payoutAccount.value.payoutProvider || 'BCA',
    payoutName: payoutAccount.value.payoutName || '',
    payoutNumber: payoutAccount.value.payoutNumber || ''
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function handleSavePayout() {
  if (!modalForm.value.payoutName || !modalForm.value.payoutName.trim()) {
    swal.error('Form Belum Lengkap', 'Silakan masukkan Nama Pemilik Rekening.');
    return;
  }
  if (!modalForm.value.payoutNumber || !modalForm.value.payoutNumber.trim()) {
    swal.error('Form Belum Lengkap', 'Silakan masukkan Nomor Rekening / HP.');
    return;
  }

  const ok = await swal.confirm(
    'Konfirmasi Kunci Rekening',
    `Apakah Anda yakin data rekening (${modalForm.value.payoutProvider} - ${modalForm.value.payoutNumber} a.n ${modalForm.value.payoutName}) sudah benar?\nData ini HANYA BISA DIUBAH LAGI DALAM 3 HARI.`,
    'Ya, Simpan & Kunci 3 Hari'
  );

  if (!ok) return;

  saving.value = true;
  const res = await savePayoutAccount(modalForm.value);
  saving.value = false;

  if (res.success) {
    swal.success('Berhasil Disimpan', 'Data rekening penarikan Anda telah disimpan dan terkunci selama 3 hari.');
    closeModal();
    fetchPayoutAccount();
  } else {
    swal.error('Gagal Menyimpan', res.message);
  }
}

const fee = computed(() => {
  const amt = Number(form.value.amount) || 0;
  if (amt < 100000) return 3000;
  if (amt > 1000000) return 6000;
  return 4000;
});

const netAmount = computed(() => {
  const amt = Number(form.value.amount) || 0;
  return Math.max(0, amt - fee.value);
});

function refreshData() {
  fetchBalances();
  fetchPayoutAccount();
  fetchWithdrawals();
}

async function handleSubmit() {
  if (!payoutAccount.value.hasPayout) {
    swal.error('Rekening Belum Disetel', 'Silakan simpan rekening penarikan Anda terlebih dahulu sebelum melakukan penarikan.');
    return;
  }
  if (!form.value.amount || isNaN(form.value.amount) || form.value.amount < 15000) {
    swal.error('Nominal Tidak Valid', 'Minimal penarikan saldo adalah Rp 15.000');
    return;
  }
  if (form.value.amount > merchantBalances.value.availableBalance) {
    swal.error(
      'Saldo Siap Tarik Kurang',
      `Saldo siap tarik Anda: Rp ${(merchantBalances.value.availableBalance || 0).toLocaleString('id-ID')}.\nSaldo tertahan (24 jam): Rp ${(merchantBalances.value.holdingBalance || 0).toLocaleString('id-ID')}.`
    );
    return;
  }

  loading.value = true;
  const res = await requestWithdraw({
    amount: form.value.amount,
    accountType: payoutAccount.value.payoutType,
    accountName: payoutAccount.value.payoutName,
    accountNumber: payoutAccount.value.payoutNumber,
    accountProvider: payoutAccount.value.payoutProvider,
    note: form.value.note
  });
  loading.value = false;

  if (res.success) {
    swal.success('Berhasil Diajukan', `Permintaan penarikan Rp ${form.value.amount.toLocaleString('id-ID')} berhasil diajukan.`);
    refreshData();
  } else {
    swal.error('Gagal Penarikan', res.message);
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped>
.balance-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; width: 100%; box-sizing: border-box; }
.b-card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; box-shadow: 0 2px 8px rgba(0,0,0,0.03); width: 100%; box-sizing: border-box; }
.b-avail { border-left: 4px solid #059669; }
.b-hold { border-left: 4px solid #D97706; }
.b-lbl { font-size: 0.68rem; font-weight: 800; color: #64748B; letter-spacing: 0.3px; }
.b-val { font-size: 1.4rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-top: 4px; word-break: break-all; }
.b-val.green { color: #059669; } .b-val.amber { color: #D97706; }
.b-sub { font-size: 0.72rem; color: #94A3B8; margin-top: 4px; }

.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.mb { margin-bottom: 20px; }
.mb-sm { margin-bottom: 14px; }
.card-h { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; width: 100%; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; }
.cs { font-size: 0.78rem; color: #64748B; margin-top: 2px; }

.payout-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; width: 100%; box-sizing: border-box; }
.pb-provider { font-size: 0.78rem; font-weight: 800; color: #0891B2; text-transform: uppercase; }
.pb-number { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 2px 0; word-break: break-all; }
.pb-name { font-size: 0.8rem; color: #475569; font-weight: 600; }
.pb-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.badge-status { font-size: 0.68rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.b-active { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.b-locked { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.pb-note { font-size: 0.7rem; color: #94A3B8; }

.empty-payout { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 16px; font-size: 0.8rem; color: #78350F; line-height: 1.5; width: 100%; box-sizing: border-box; }

.schedule-notice { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 14px 16px; width: 100%; box-sizing: border-box; }
.sn-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
.sn-title { font-size: 0.72rem; font-weight: 800; color: #B45309; letter-spacing: 0.3px; }
.sn-badge { background: #FEF3C7; color: #92400E; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #FCD34D; }
.sn-text { font-size: 0.8rem; color: #78350F; line-height: 1.5; }
.sn-highlight { color: #DC2626; font-weight: 800; }

.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; box-sizing: border-box; }
.info-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.info-lbl { font-size: 0.65rem; font-weight: 700; color: #64748B; letter-spacing: 0.3px; }
.info-val { font-size: 1.05rem; font-weight: 800; color: #0F172A; font-family: 'JetBrains Mono', monospace; margin-top: 2px; word-break: break-all; }
.info-val.amber { color: #D97706; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; width: 100%; box-sizing: border-box; }
.fg { display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.full-width { grid-column: span 2; }
.fl { font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.fi { padding: 10px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; width: 100%; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.fi.readonly { background: #E2E8F0; color: #334155; font-weight: 600; cursor: not-allowed; }
.mono { font-family: 'JetBrains Mono', monospace; }

.fee-hint { font-size: 0.75rem; color: #64748B; margin-top: 4px; }
.fee-hint .green { color: #059669; }

.type-selector { display: flex; gap: 8px; width: 100%; box-sizing: border-box; }
.radio-lbl { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #64748B; transition: 0.2s; }
.radio-lbl.active { background: #E0F7FA; border-color: #00AED6; color: #00838F; font-weight: 700; }
.radio-lbl input { display: none; }

.form-actions { display: flex; justify-content: flex-end; width: 100%; }
.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 18px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; }
.btn-sm { padding: 6px 12px; font-size: 0.78rem; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
.modal-card { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); animation: popIn 0.2s ease-out; box-sizing: border-box; }
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { font-size: 1rem; font-weight: 800; color: #0F172A; }
.close-btn { background: transparent; border: none; font-size: 1.4rem; color: #94A3B8; cursor: pointer; }
.modal-warning { background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 10px; padding: 10px 12px; font-size: 0.78rem; color: #78350F; line-height: 1.4; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 650px; }
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

.bold { font-weight: 700; }
.amber { color: #D97706; }
.green { color: #059669; }
.muted { color: #94A3B8; }
.sm { font-size: 0.72rem; }
.empty { text-align: center; color: #94A3B8; padding: 30px; }

.acc-info { display: flex; flex-direction: column; gap: 2px; }
.text-muted { color: #64748B; }

.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-approved { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-rejected { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #E2E8F0; }
.page-info { font-size: 0.8rem; color: #64748B; font-weight: 600; }
.btn-outline:hover:not(:disabled) { background: #F8FAFC; border-color: #94A3B8; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .balance-grid { grid-template-columns: 1fr; gap: 10px; }
  .b-card { padding: 14px 16px; }
  .b-val { font-size: 1.2rem; }
  .card { padding: 16px 12px; }
  .info-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .info-card { padding: 10px 8px; }
  .info-val { font-size: 0.88rem; }
  .info-lbl { font-size: 0.6rem; }
  .form-grid { grid-template-columns: 1fr; gap: 12px; }
  .full-width { grid-column: span 1; }
  .btn-full-mobile { width: 100%; }
  .pb-right { align-items: flex-start; margin-top: 4px; }
  .modal-card { padding: 16px; width: 95%; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }
}
</style>
