export const useMerchant = () => {
  const { token, showToast } = useAuth();

  function getToken() {
    if (!token.value && process.client) {
      const saved = localStorage.getItem('wepay_token');
      if (saved) token.value = saved;
    }
    return token.value;
  }

  const keysList = useState<any[]>('merchantKeys', () => []);
  const settingsData = useState<any>('merchantSettings', () => ({ webhookUrl: '', webhookSecret: '', telegramBotToken: '', telegramChatId: '', telegramNotifActive: 1 }));
  const webhookLogs = useState<any[]>('webhookLogs', () => []);
  const transactionsList = useState<any[]>('merchantTransactions', () => []);
  const totalTransactions = useState<number>('merchantTotalTransactions', () => 0);
  const settlementsList = useState<any[]>('merchantSettlements', () => []);
  const totalSettlements = useState<number>('merchantTotalSettlements', () => 0);
  const withdrawalsList = useState<any[]>('merchantWithdrawals', () => []);
  const merchantStats = useState<any>('merchantStats', () => ({ totalPaidCount: 0, totalPaidVolume: 0, totalPendingCount: 0 }));
  const merchantBalances = useState<any>('merchantBalances', () => ({ holdingBalance: 0, availableBalance: 0, totalWithdrawn: 0, totalEarned: 0 }));
  const payoutAccount = useState<any>('merchantPayoutAccount', () => ({ hasPayout: false, payoutType: 'BANK', payoutProvider: 'BCA', payoutName: '', payoutNumber: '', canUpdate: true, daysRemaining: 0 }));
  const globalStats = useState<any>('globalStats', () => ({ totalPaidCount: 0, totalPaidVolume: 0 }));

  async function fetchGlobalStats() {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.success) globalStats.value = json.data;
    } catch (e) {}
  }

  async function fetchMerchantStats() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) merchantStats.value = json.data;
    } catch (e) {}
  }

  async function fetchBalances() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/balances', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) merchantBalances.value = json.data;
    } catch (e) {}
  }

  async function fetchPayoutAccount() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/payout-account', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) payoutAccount.value = json.data;
    } catch (e) {}
  }

  async function savePayoutAccount(payload: { payoutType: string, payoutProvider: string, payoutName: string, payoutNumber: string }) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/payout-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        payoutAccount.value = json.data;
        showToast(json.message);
        return { success: true };
      }
      return { success: false, message: json.message };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        return { success: true };
      }
      return { success: false, message: json.message };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function updateProfile(name: string, email: string) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });
      const json = await res.json();
      if (json.success) {
        const { currentUser } = useAuth();
        if (currentUser.value) {
          currentUser.value.name = json.data.name;
          currentUser.value.email = json.data.email;
        }
        showToast(json.message);
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function fetchKeys() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/keys', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) keysList.value = json.data;
    } catch (e) {}
  }

  async function generateKey(label: string = 'Secret Key Utama') {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/keys/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label })
      });
      const json = await res.json();
      if (json.success) {
        keysList.value = json.data;
        showToast('Secret Key baru berhasil dibuat!');
      }
    } catch (e) {}
  }

  async function deleteKey(id: number) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch(`/api/v1/merchant/keys/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        keysList.value = json.data;
        showToast('Secret Key berhasil dihapus!');
      } else {
        showToast('Gagal menghapus key: ' + json.message);
      }
    } catch (e) {}
  }

  async function fetchSettings() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/settings', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        settingsData.value = json.data;
        fetchWebhookLogs();
      }
    } catch (e) {}
  }

  async function saveSettings(payload: { webhookUrl?: string, webhookSecret?: string, feeType?: string, feeValue?: number, feeBearer?: string, telegramBotToken?: string, telegramChatId?: string, telegramNotifActive?: number }) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/settings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        settingsData.value = json.data;
        showToast('Pengaturan merchant berhasil disimpan!');
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function testTelegramNotif(payload?: { telegramBotToken?: string, telegramChatId?: string }) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/telegram/test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload || {})
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        return { success: true, message: json.message };
      } else {
        showToast('Gagal: ' + json.message);
        return { success: false, message: json.message };
      }
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function testWebhook() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/webhooks/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        showToast('Tes Webhook berhasil dikirim!');
        fetchWebhookLogs();
      } else {
        showToast('Gagal kirim webhook: ' + json.message);
      }
    } catch (e) {}
  }

  async function fetchWebhookLogs() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/webhooks/logs', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) webhookLogs.value = json.data;
    } catch (e) {}
  }

  async function fetchTransactions(search: string = '', status: string = '', startDate: string = '', endDate: string = '', limit: number = 50, offset: number = 0) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const url = `/api/v1/merchant/transactions?q=${encodeURIComponent(search)}&status=${status}&startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        transactionsList.value = json.data.transactions;
        totalTransactions.value = json.data.total;
        return json.data;
      }
    } catch (e) {}
  }

  async function exportTransactionsCsv(search: string = '', status: string = '', startDate: string = '', endDate: string = '') {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const url = `/api/v1/merchant/transactions/export?q=${encodeURIComponent(search)}&status=${status}&startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Laporan_Transaksi_WARUNGERIKPAY_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Laporan CSV berhasil diunduh!');
      } else {
        showToast('Gagal mengunduh laporan CSV');
      }
    } catch (e) {
      showToast('Gagal mengunduh laporan CSV');
    }
  }

  async function fetchWithdrawals() {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const res = await fetch('/api/v1/merchant/withdrawals', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) withdrawalsList.value = json.data;
    } catch (e) {}
  }

  async function requestWithdraw(payload: { amount: number, accountType: string, accountName: string, accountNumber: string, accountProvider: string, note?: string }) {
    const authToken = getToken();
    if (!authToken) return { success: false, message: 'Belum login' };
    try {
      const res = await fetch('/api/v1/merchant/withdraw', {
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
        fetchWithdrawals();
        fetchBalances();
        return { success: true };
      }
      return { success: false, message: json.message || 'Gagal mengajukan withdraw' };
    } catch (e) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  }

  async function fetchSettlements(search: string = '', settlementStatus: string = '', limit: number = 10, offset: number = 0) {
    const authToken = getToken();
    if (!authToken) return;
    try {
      const url = `/api/v1/merchant/settlements?q=${encodeURIComponent(search)}&settlementStatus=${settlementStatus}&limit=${limit}&offset=${offset}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const json = await res.json();
      if (json.success) {
        settlementsList.value = json.data.items;
        totalSettlements.value = json.data.total;
        return json.data;
      }
    } catch (e) {}
  }

  return {
    keysList,
    settingsData,
    webhookLogs,
    transactionsList,
    totalTransactions,
    settlementsList,
    totalSettlements,
    withdrawalsList,
    merchantStats,
    merchantBalances,
    payoutAccount,
    globalStats,
    fetchGlobalStats,
    fetchMerchantStats,
    fetchBalances,
    fetchPayoutAccount,
    savePayoutAccount,
    changePassword,
    updateProfile,
    fetchKeys,
    generateKey,
    deleteKey,
    fetchSettings,
    saveSettings,
    testTelegramNotif,
    testWebhook,
    fetchWebhookLogs,
    fetchTransactions,
    exportTransactionsCsv,
    fetchSettlements,
    fetchWithdrawals,
    requestWithdraw
  };
};
