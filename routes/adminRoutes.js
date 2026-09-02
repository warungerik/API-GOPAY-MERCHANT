import express from 'express';
import {
  getAllUsers,
  deleteUserById,
  getAllWithdrawals,
  updateWithdrawalStatus,
  getAdminStats,
  releaseMerchantHoldingBalance,
  adjustMerchantBalance,
  searchOrders
} from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateAdmin);

router.get('/users', async (req, res) => {
  const { q = '', limit = 10, offset = 0 } = req.query;
  const result = await getAllUsers({ search: q, limit: Number(limit) || 10, offset: Number(offset) || 0 });
  return res.json({
    success: true,
    data: result.users,
    total: result.total,
    limit: result.limit,
    offset: result.offset
  });
});

router.post('/users/:id/release-balance', async (req, res) => {
  const userId = Number(req.params.id);
  const updatedBalances = await releaseMerchantHoldingBalance(userId);
  return res.json({
    success: true,
    message: `Seluruh saldo tertahan merchant #${userId} berhasil dirilis menjadi Saldo Siap Tarik.`,
    data: updatedBalances
  });
});

router.post('/users/:id/adjust-balance', async (req, res) => {
  const userId = Number(req.params.id);
  const { type, amount, note } = req.body;

  try {
    const updatedBalances = await adjustMerchantBalance(userId, { type, amount, note });
    return res.json({
      success: true,
      message: `Saldo merchant #${userId} berhasil disesuaikan.`,
      data: updatedBalances
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Gagal menyesuaikan saldo merchant.'
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Tidak dapat menghapus akun admin yang sedang Anda gunakan.'
    });
  }

  await deleteUserById(userId);

  return res.json({
    success: true,
    message: `Akun merchant #${userId} dan seluruh datanya berhasil dihapus.`
  });
});

router.get('/withdrawals', async (req, res) => {
  const withdrawals = await getAllWithdrawals();
  return res.json({
    success: true,
    data: withdrawals
  });
});

router.post('/withdrawals/:id/approve', async (req, res) => {
  const withdrawalId = Number(req.params.id);
  const adminNote = (req.body.adminNote || 'Transfer berhasil diproses').trim();

  const updated = await updateWithdrawalStatus(withdrawalId, 'APPROVED', adminNote);

  return res.json({
    success: true,
    message: `Penarikan #${withdrawalId} telah disetujui.`,
    data: updated
  });
});

router.post('/withdrawals/:id/reject', async (req, res) => {
  const withdrawalId = Number(req.params.id);
  const adminNote = (req.body.adminNote || 'Penarikan ditolak').trim();

  const updated = await updateWithdrawalStatus(withdrawalId, 'REJECTED', adminNote);

  return res.json({
    success: true,
    message: `Penarikan #${withdrawalId} telah ditolak.`,
    data: updated
  });
});

router.get('/stats', async (req, res) => {
  const stats = await getAdminStats();
  return res.json({
    success: true,
    data: stats
  });
});

router.get('/transactions', async (req, res) => {
  try {
    const { q = '', status = '', merchantId = '', startDate = '', endDate = '', limit = 50, offset = 0 } = req.query;
    const result = await searchOrders({
      search: q,
      status,
      merchantId,
      startDate,
      endDate,
      limit,
      offset
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal mengambil riwayat transaksi admin.'
    });
  }
});

router.get('/transactions/export', async (req, res) => {
  try {
    const { q = '', status = '', merchantId = '', startDate = '', endDate = '' } = req.query;
    const result = await searchOrders({
      search: q,
      status,
      merchantId,
      startDate,
      endDate,
      limit: 10000,
      offset: 0
    });

    const txs = result.transactions || [];
    let csv = 'Order ID,Merchant,Email Merchant,Tanggal Transaksi,Pelanggan,Nominal Total (Rp),Fee (Rp),Bersih Diterima (Rp),Status,Nomor Tx ID (Ref Mutasi),Catatan\n';

    for (const t of txs) {
      const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }).replace(/,/g, '') : '-';
      const orderId = `"${(t.orderId || '').replace(/"/g, '""')}"`;
      const merchant = `"${(t.merchantName || '-').replace(/"/g, '""')}"`;
      const merchantEmail = `"${(t.merchantEmail || '-').replace(/"/g, '""')}"`;
      const customer = `"${(t.customerName || 'Customer').replace(/"/g, '""')}"`;
      const total = t.totalAmount || 0;
      const fee = (t.feeAmount || 0) + (t.uniqueCode || 0);
      const net = t.netAmount || (total - fee);
      const statusStr = `"${t.status || 'PENDING'}"`;
      const txId = `"${(t.txId || '-').replace(/"/g, '""')}"`;
      const note = `"${(t.note || '-').replace(/"/g, '""')}"`;

      csv += `${orderId},${merchant},${merchantEmail},"${dateStr}",${customer},${total},${fee},${net},${statusStr},${txId},${note}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=Admin_Transactions_Export_${Date.now()}.csv`);
    return res.status(200).send('\uFEFF' + csv);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal merender ekspor CSV transaksi admin.'
    });
  }
});

export default router;
