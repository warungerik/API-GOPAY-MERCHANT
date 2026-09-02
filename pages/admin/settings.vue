<template>
  <div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Profil Akun Admin</h2>
          <p class="cs">Kelola informasi nama dan email Administrator sistem.</p>
        </div>
      </div>

      <form novalidate @submit.prevent="handleUpdateProfile">
        <div class="form-grid">
          <div class="fg">
            <label class="fl">Nama Admin</label>
            <input type="text" class="fi" v-model="profileForm.name" placeholder="WARUNGERIK Admin" />
          </div>

          <div class="fg">
            <label class="fl">Alamat Email Login Admin</label>
            <input type="email" class="fi mono" v-model="profileForm.email" placeholder="admin@warungerik.com" />
          </div>
        </div>

        <div class="fa">
          <button type="submit" class="btn btn-danger" :disabled="profileLoading">
            {{ profileLoading ? 'Memperbarui...' : 'Simpan Profil Admin' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h2 class="ct">Ubah Password Akun Admin</h2>
          <p class="cs">Perbarui kata sandi akun Admin untuk menjaga keamanan tertinggi platform.</p>
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
          <button type="submit" class="btn btn-danger" :disabled="pwdLoading">
            {{ pwdLoading ? 'Memperbarui...' : 'Perbarui Password Admin' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-h">
        <h3 class="ct">Ringkasan Sistem Server Payment Gateway</h3>
      </div>
      <div class="sys-grid">
        <div class="sys-item">
          <span class="sys-label">Versi Engine</span>
          <span class="sys-val mono">WARUNGERIKPAY v2.4.0</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">Database Backend</span>
          <span class="sys-val green mono">Supabase PostgreSQL (Active)</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">Mode Notifikasi Telegram</span>
          <span class="sys-val blue mono">Per-Merchant Isolated Bot</span>
        </div>
        <div class="sys-item">
          <span class="sys-label">Pilihan Penanggung Fee</span>
          <span class="sys-val mono">0.5% QRIS (Customer / Merchant)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' });

const { currentUser } = useAuth();
const { updateProfile, changePassword } = useMerchant();
const swal = useSwal();

const profileForm = ref({ name: '', email: '' });
const profileLoading = ref(false);

const pwdForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const showPwd = ref({ old: false, new: false, confirm: false });
const pwdLoading = ref(false);

async function handleUpdateProfile() {
  if (!profileForm.value.name || !profileForm.value.name.trim()) {
    swal.error('Nama Wajib Diisi', 'Silakan masukkan nama akun admin.');
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
    swal.success('Profil Admin Diperbarui', 'Alamat email dan nama akun Admin berhasil disimpan.');
  } else {
    swal.error('Gagal Memperbarui', res.message);
  }
}

async function handleChangePassword() {
  if (!pwdForm.value.oldPassword) {
    swal.error('Password Saat Ini Wajib Diisi', 'Silakan masukkan password admin saat ini.');
    return;
  }
  if (!pwdForm.value.newPassword || pwdForm.value.newPassword.length < 6) {
    swal.error('Password Baru Kurang', 'Password baru minimal 6 karakter.');
    return;
  }
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    swal.error('Konfirmasi Tidak Cocok', 'Konfirmasi password baru tidak cocok.');
    return;
  }

  pwdLoading.value = true;
  const res = await changePassword(pwdForm.value.oldPassword, pwdForm.value.newPassword);
  pwdLoading.value = false;

  if (res.success) {
    swal.success('Password Admin Diperbarui', 'Gunakan password baru Anda untuk login selanjutnya.');
    pwdForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
  } else {
    swal.error('Gagal Ubah Password', res.message);
  }
}

onMounted(() => {
  if (currentUser.value) {
    profileForm.value.name = currentUser.value.name || '';
    profileForm.value.email = currentUser.value.email || '';
  }
});
</script>

<style scoped>
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; }
.mb { margin-bottom: 20px; }
.card-h { margin-bottom: 16px; }
.ct { font-size: 1rem; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
.cs { font-size: 0.78rem; color: #64748B; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 16px; width: 100%; box-sizing: border-box; }
.fg { margin-bottom: 14px; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
.full-width { grid-column: span 2; }
.fl { display: block; font-size: 0.78rem; font-weight: 700; color: #64748B; margin-bottom: 6px; }
.fi { width: 100%; padding: 12px 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; color: #1E293B; font-size: 0.85rem; outline: none; transition: 0.2s; box-sizing: border-box; }
.fi:focus { border-color: #DC2626; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12); }
.mono { font-family: 'JetBrains Mono', monospace; }

.pwd-wrap { position: relative; display: flex; align-items: center; width: 100%; }
.pwd-wrap .fi { padding-right: 44px; }
.pwd-btn { position: absolute; right: 10px; background: transparent; border: none; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 6px; border-radius: 6px; transition: 0.2s; }
.pwd-btn:hover { color: #0F172A; background: #E2E8F0; }

.fa { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-danger { background: #DC2626; color: #fff; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25); }
.btn-danger:hover { background: #B91C1C; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.sys-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.sys-item { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px; }
.sys-label { font-size: 0.72rem; color: #64748B; font-weight: 700; }
.sys-val { font-size: 0.84rem; font-weight: 700; color: #0F172A; }
.green { color: #059669; }
.blue { color: #0284C7; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  .form-grid { grid-template-columns: 1fr; gap: 10px; }
  .full-width { grid-column: span 1; }
  .sys-grid { grid-template-columns: 1fr; }
}
</style>
