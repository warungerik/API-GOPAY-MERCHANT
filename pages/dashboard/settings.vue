<template>
  <div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Profil Akun (Nama Toko & Email)</h2>
          <p class="cs">Ubah nama pemilik/toko dan alamat email akun kamu kapan saja.</p>
        </div>
      </div>

      <form novalidate @submit.prevent="handleUpdateProfile">
        <div class="form-grid">
          <div class="fg">
            <label class="fl">Nama Toko / Pemilik Akun</label>
            <input type="text" class="fi" v-model="profileForm.name" placeholder="Contoh: WARUNGERIK STORE" />
          </div>

          <div class="fg">
            <label class="fl">Alamat Email Login Akun</label>
            <input type="email" class="fi mono" v-model="profileForm.email" placeholder="admin@warungerik.com" />
          </div>
        </div>

        <div class="fa">
          <button type="submit" class="btn btn-primary" :disabled="profileLoading">
            {{ profileLoading ? 'Memperbarui...' : 'Simpan Perubahan Profil' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Ubah Password Akun</h2>
          <p class="cs">Perbarui kata sandi akun merchant Anda secara berkala untuk menjaga keamanan.</p>
        </div>
      </div>

      <form novalidate @submit.prevent="handleChangePassword">
        <div class="form-grid">
          <div class="fg">
            <label class="fl">Password Saat Ini</label>
            <div class="pwd-wrap">
              <input :type="showPwd.old ? 'text' : 'password'" class="fi" v-model="pwdForm.oldPassword" placeholder="••••••••" />
              <button type="button" class="pwd-btn" @click="showPwd.old = !showPwd.old">
                <svg v-if="!showPwd.old" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div class="fg">
            <label class="fl">Password Baru (Min 6 Karakter)</label>
            <div class="pwd-wrap">
              <input :type="showPwd.new ? 'text' : 'password'" class="fi" v-model="pwdForm.newPassword" placeholder="••••••••" />
              <button type="button" class="pwd-btn" @click="showPwd.new = !showPwd.new">
                <svg v-if="!showPwd.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>

          <div class="fg full-width">
            <label class="fl">Konfirmasi Password Baru</label>
            <div class="pwd-wrap">
              <input :type="showPwd.confirm ? 'text' : 'password'" class="fi" v-model="pwdForm.confirmPassword" placeholder="••••••••" />
              <button type="button" class="pwd-btn" @click="showPwd.confirm = !showPwd.confirm">
                <svg v-if="!showPwd.confirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="fa">
          <button type="submit" class="btn btn-primary" :disabled="pwdLoading">
            {{ pwdLoading ? 'Memperbarui...' : 'Perbarui Password' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Pengaturan Tanggungan Fee 0.5% (Fee Bearer)</h2>
          <p class="cs">Fee standar transaksi QRIS adalah <strong>0.5%</strong>. Tentukan siapa yang menanggung biayanya (Pelanggan atau Merchant).</p>
        </div>
      </div>
      <form novalidate @submit.prevent="handleSaveFeeSettings">
        <div class="form-grid">

          <div class="fg full-width">
            <label class="fl">Penanggung Fee Transaksi (0.5%)</label>
            <select class="fi" v-model="feeForm.feeBearer">
              <option value="CUSTOMER">Pelanggan (Fee 0.5% + Kode Unik ditambahkan ke total bayar pelanggan)</option>
              <option value="MERCHANT">Merchant (Fee 0.5% dipotong dari saldo bersih yang diterima merchant)</option>
            </select>
            <span class="hint-text" v-if="feeForm.feeBearer === 'CUSTOMER'">
              Contoh: Pembelian Rp 100.000 + Fee 0.5% (Rp 500) + Kode Unik (misal Rp 42) = Total bayar pelanggan <strong>Rp 100.542</strong>. Merchant terima <strong>Rp 100.000</strong>.
            </span>
            <span class="hint-text" v-else>
              Contoh: Pembelian Rp 100.000 + Kode Unik (misal Rp 42) = Total bayar pelanggan <strong>Rp 100.042</strong>. Fee 0.5% (Rp 500) dipotong, merchant terima <strong>Rp 99.500</strong>.
            </span>
          </div>
        </div>

        <div class="fa">
          <button type="submit" class="btn btn-primary" :disabled="feeLoading">
            {{ feeLoading ? 'Menyimpan...' : 'Simpan Tanggungan Fee' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Webhook Callback Settings</h2>
          <p class="cs">Server akan otomatis mengirim HTTP POST ke URL ini saat pembayaran lunas.</p>
        </div>
      </div>
      <form novalidate @submit.prevent="handleSave">
        <div class="fg"><label class="fl">Webhook Callback URL</label><input type="url" class="fi mono" v-model="form.webhookUrl" placeholder="https://toko-kamu.com/api/callback" /></div>
        <div class="fg"><label class="fl">Webhook Secret (Opsional - HMAC SHA256)</label><input type="text" class="fi mono" v-model="form.webhookSecret" placeholder="whsec_1234567890" /></div>
        <div class="fa">
          <button type="submit" class="btn btn-primary" :disabled="loading">Simpan Pengaturan Webhook</button>
          <button type="button" class="btn btn-outline" @click="testWebhook" :disabled="loading||!form.webhookUrl">Tes Webhook</button>
        </div>
      </form>
    </div>

    <div class="card">
      <h3 class="ct" style="margin-bottom:8px;">Log Webhook Callback</h3>

      <div class="retention-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="notice-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Catatan: Log webhook disimpan otomatis selama <strong>3 hari</strong>. Log berumur lebih dari 3 hari akan dibersihkan berkala.</span>
      </div>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>URL</th>
              <th>HTTP</th>
              <th>RESPON</th>
              <th>WAKTU</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in webhookLogs" :key="l.id">
              <td class="mono bold">{{ l.order_id }}</td>
              <td class="mono sm">{{ l.url }}</td>
              <td><span class="sb" :class="l.response_status===200?'s-paid':'s-expired'">{{ l.response_status }}</span></td>
              <td class="trunc">{{ l.response_body }}</td>
              <td class="muted sm">{{ fmt(l.created_at) }}</td>
            </tr>
            <tr v-if="webhookLogs.length===0">
              <td colspan="5" class="empty">Belum ada log webhook.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { currentUser } = useAuth();
const { settingsData, webhookLogs, fetchSettings, saveSettings, testWebhook, changePassword, updateProfile } = useMerchant();
const swal = useSwal();

const profileForm = ref({ name: '', email: '' });
const profileLoading = ref(false);

const form = ref({ webhookUrl: '', webhookSecret: '' });
const loading = ref(false);

const feeForm = ref({ feeType: 'UNIQUE_CODE', feeValue: 0, feeBearer: 'CUSTOMER' });
const feeLoading = ref(false);

const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const showPwd = ref({ old: false, new: false, confirm: false });
const pwdLoading = ref(false);

async function handleUpdateProfile() {
  if (!profileForm.value.name || !profileForm.value.name.trim()) {
    swal.error('Nama/Toko Wajib Diisi', 'Silakan masukkan nama pemilik atau nama toko.');
    return;
  }
  if (!profileForm.value.email || !profileForm.value.email.includes('@')) {
    swal.error('Email Tidak Valid', 'Silakan masukkan alamat email yang valid.');
    return;
  }

  profileLoading.value = true;
  const res = await updateProfile(profileForm.value.name, profileForm.value.email);
  profileLoading.value = false;

  if (res.success) {
    swal.success('Profil Berhasil Diperbarui', 'Alamat email dan nama akun Anda telah berhasil diperbarui.');
  } else {
    swal.error('Gagal Memperbarui Profil', res.message);
  }
}

async function handleSave() {
  loading.value = true;
  await saveSettings({
    webhookUrl: form.value.webhookUrl,
    webhookSecret: form.value.webhookSecret,
    feeType: feeForm.value.feeType,
    feeValue: feeForm.value.feeValue,
    feeBearer: feeForm.value.feeBearer
  });
  loading.value = false;
}

async function handleSaveFeeSettings() {
  feeLoading.value = true;
  await saveSettings({
    webhookUrl: form.value.webhookUrl,
    webhookSecret: form.value.webhookSecret,
    feeType: feeForm.value.feeType,
    feeValue: feeForm.value.feeValue,
    feeBearer: feeForm.value.feeBearer
  });
  feeLoading.value = false;
  swal.success('Skema Fee Berhasil Disimpan', `Penanggung fee: ${feeForm.value.feeBearer === 'CUSTOMER' ? 'Pelanggan' : 'Merchant'}`);
}

async function handleChangePassword() {
  if (!pwdForm.value.oldPassword) {
    swal.error('Password Saat Ini Wajib Diisi', 'Silakan masukkan password saat ini Anda.');
    return;
  }
  if (!pwdForm.value.newPassword || pwdForm.value.newPassword.length < 6) {
    swal.error('Password Baru Kurang', 'Password baru minimal 6 karakter.');
    return;
  }
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    swal.error('Konfirmasi Tidak Cocok', 'Konfirmasi password baru tidak cocok dengan password baru.');
    return;
  }

  pwdLoading.value = true;
  const res = await changePassword(pwdForm.value.oldPassword, pwdForm.value.newPassword);
  pwdLoading.value = false;

  if (res.success) {
    swal.success('Password Berhasil Diperbarui', 'Gunakan password baru Anda untuk masuk kembali di masa mendatang.');
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
  } else {
    swal.error('Gagal Ubah Password', res.message);
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

watch(
  () => settingsData.value,
  (val) => {
    if (val) {
      if (val.webhookUrl !== undefined) form.value.webhookUrl = val.webhookUrl || '';
      if (val.webhookSecret !== undefined) form.value.webhookSecret = val.webhookSecret || '';
      if (val.feeType !== undefined) feeForm.value.feeType = val.feeType || 'UNIQUE_CODE';
      if (val.feeValue !== undefined) feeForm.value.feeValue = val.feeValue || 0;
      if (val.feeBearer !== undefined) feeForm.value.feeBearer = val.feeBearer || 'CUSTOMER';
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (currentUser.value) {
    profileForm.value.name = currentUser.value.name || '';
    profileForm.value.email = currentUser.value.email || '';
  }
  await fetchSettings();
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.mb { margin-bottom: 20px; }
.card-h { margin-bottom: 16px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.cs { font-size: 0.78rem; color: #64748B; }

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

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; width: 100%; box-sizing: border-box; }
.fg { margin-bottom: 14px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.full-width { grid-column: span 2; }
.fl { display: block; font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.fi { width: 100%; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #00AED6; box-shadow: 0 0 0 3px rgba(0,174,214,0.12); }
.hint-text { font-size: 0.72rem; color: #64748B; margin-top: 4px; font-weight: 500; }
.mono { font-family: 'JetBrains Mono', monospace; }

.pwd-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.pwd-wrap .fi { padding-right: 44px; }
.pwd-btn { position: absolute; right: 10px; background: transparent; border: none; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: 0.2s; }
.pwd-btn:hover { color: #0F172A; background: #E2E8F0; }

.fa { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-primary { background: #00AED6; color: #fff; box-shadow: 0 2px 8px rgba(0,174,214,0.25); }
.btn-primary:hover { background: #0096B8; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover { background: #F8FAFC; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; box-sizing: border-box; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 520px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
.bold { font-weight: 700; } .sm { font-size: 0.72rem; } .muted { color: #94A3B8; }
.trunc { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.72rem; }
.empty { text-align: center; color: #94A3B8; padding: 24px; }
.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-expired { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
  .full-width { grid-column: span 1; }
  .fi { font-size: 0.82rem; padding: 10px 12px; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.72rem; }
}
</style>
