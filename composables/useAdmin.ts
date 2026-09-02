export const useAdmin = () => {
  const { token, showToast } = useAuth();

  function getToken() {
    if (!token.value && process.client) {
      const saved = localStorage.getItem('wepay_token');
      if (saved) token.value = saved;
    }
    return token.value;
  }

  const usersList = useState<any[]>('adminUsers', () => []);
  const usersTotal = useState<number>('adminUsersTotal', () => 0);
  const usersLimit = useState<number>('adminUsersLimit', () => 10);
  const usersOffset = useState<number>('adminUsersOffset', () => 0);
  const adminWithdrawals = useState<any[]>('adminWithdrawals', () => []);
  const adminStats = useState<any>('adminStats', () => ({ totalMerchants: 0, pendingWithdrawals: 0, totalPaidCount: 0, totalPaidVolume: 0 }));
  const adminTransactions = useState<any[]>('adminTransactions', () => []);
  const adminTxTotal = useState<number>('adminTxTotal', () => 0);
  const adminTxLimit = useState<number>('adminTxLimit', () => 50);
  const adminTxOffset = useState<number>('adminTxOffset', () => 0);

  async function fetchUsers(params: { q?: string; limit?: number; offset?: number } = {}) {
    const authToken = getToken();
    if (!authToken) return;
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.limit !== undefined) query.append('limit', String(params.limit));
    if (params.offset !== undefined) query.append('offset', String(params.offset));

    try {
      const res = await fetch(`/api/v1/admin/users?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        if (Array.isArray(json.data)) {
          usersList.value = json.data;
          usersTotal.value = json.data.length;
        } else {
          usersList.value = json.data || [];
        }
        if (json.total !== undefined) usersTotal.value = json.total;
        if (json.limit !== undefined) usersLimit.value = json.limit;
        if (json.offset !== undefined) usersOffset.value = json.offset;
      }
    } catch (e) {}
  }

  async function releaseBalance(id: number) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}/release-balance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchUsers();
      } else {
        showToast('Gagal merilis saldo: ' + json.message);
      }
    } catch (e) {}
  }

  async function adjustBalance(id: number, payload: { type: string; amount: number; note?: string }) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}/adjust-balance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchUsers();
        fetchAdminStats();
      } else {
        showToast('Gagal menyesuaikan saldo: ' + json.message);
      }
    } catch (e) {}
  }

  async function deleteUser(id: number) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchUsers();
        fetchAdminStats();
      } else {
        showToast('Gagal menghapus user: ' + json.message);
      }
    } catch (e) {}
  }

  async function fetchAdminWithdrawals() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/admin/withdrawals', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) adminWithdrawals.value = json.data;
    } catch (e) {}
  }

  async function approveWithdraw(id: number, adminNote: string = '') {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNote })
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchAdminWithdrawals();
        fetchAdminStats();
      }
    } catch (e) {}
  }

  async function rejectWithdraw(id: number, adminNote: string = '') {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNote })
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        fetchAdminWithdrawals();
        fetchAdminStats();
      }
    } catch (e) {}
  }

  async function fetchAdminStats() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) adminStats.value = json.data;
    } catch (e) {}
  }

  async function fetchAdminTransactions(params: { q?: string; status?: string; merchantId?: string | number; startDate?: string; endDate?: string; limit?: number; offset?: number } = {}) {
    const authToken = getToken();
    if (!authToken) return;
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.status) query.append('status', params.status);
    if (params.merchantId) query.append('merchantId', String(params.merchantId));
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.limit !== undefined) query.append('limit', String(params.limit));
    if (params.offset !== undefined) query.append('offset', String(params.offset));

    try {
      const res = await fetch(`/api/v1/admin/transactions?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        adminTransactions.value = json.data.transactions || [];
        adminTxTotal.value = json.data.total || 0;
        adminTxLimit.value = json.data.limit || 50;
        adminTxOffset.value = json.data.offset || 0;
      }
    } catch (e) {}
  }

  async function exportAdminTransactionsCSV(params: { q?: string; status?: string; merchantId?: string | number; startDate?: string; endDate?: string } = {}) {
    const authToken = getToken();
    if (!authToken) return;
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.status) query.append('status', params.status);
    if (params.merchantId) query.append('merchantId', String(params.merchantId));
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);

    try {
      const res = await fetch(`/api/v1/admin/transactions/export?${query.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Gagal mendownload CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Admin_Transactions_Export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      showToast('Gagal ekspor CSV: ' + (e.message || e));
    }
  }

  return {
    usersList,
    usersTotal,
    usersLimit,
    usersOffset,
    adminWithdrawals,
    adminStats,
    adminTransactions,
    adminTxTotal,
    adminTxLimit,
    adminTxOffset,
    fetchUsers,
    releaseBalance,
    adjustBalance,
    deleteUser,
    fetchAdminWithdrawals,
    approveWithdraw,
    rejectWithdraw,
    fetchAdminStats,
    fetchAdminTransactions,
    exportAdminTransactionsCSV
  };
};
