import {
  getAllWithdrawals,
  getWithdrawalById,
  updateWithdrawalStatus,
  getStats
} from '../db.js';

function getAdminCredentials() {
  const token = (process.env.ADMIN_TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = (process.env.ADMIN_TELEGRAM_CHAT_ID || '').trim();
  return { token, chatId };
}

async function sendAdminMessage(payload) {
  const { token } = getAdminCredentials();
  if (!token) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...payload
      })
    });
    const data = await res.json();
    return data.ok ? data : false;
  } catch (err) {
    console.warn('[Admin Telegram Bot Error]', err.message);
    return false;
  }
}

async function editAdminMessage(payload) {
  const { token } = getAdminCredentials();
  if (!token) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...payload
      })
    });
    const data = await res.json();
    return data.ok ? data : false;
  } catch (err) {
    console.warn('[Admin Telegram Edit Error]', err.message);
    return false;
  }
}

async function answerCallbackQuery(callbackQueryId, text, showAlert = false) {
  const { token } = getAdminCredentials();
  if (!token) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert
      })
    });
  } catch (err) {}
}

export async function setupAdminTelegramWebhook(baseUrl) {
  const { token } = getAdminCredentials();
  if (!token || !baseUrl || baseUrl.includes('localhost')) return;

  const webhookUrl = `${baseUrl.replace(/\/+$/, '')}/api/v1/telegram/admin-webhook`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    if (data.ok) {
      console.log(`[Admin Telegram Bot] Webhook terpasang: ${webhookUrl}`);
    } else {
      console.warn(`[Admin Telegram Bot Webhook Warning]`, data.description);
    }
  } catch (err) {
    console.warn('[Admin Telegram Webhook Error]', err.message);
  }
}

export async function notifyAdminNewWithdrawal(withdrawal, merchantUser) {
  const { chatId } = getAdminCredentials();
  if (!chatId) return;

  const dateStr = withdrawal.created_at
    ? new Date(withdrawal.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
    : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const merchantName = merchantUser?.name || `Merchant #${withdrawal.user_id}`;
  const merchantEmail = merchantUser?.email || '-';

  const text = `<b>[PENGAJUAN PENARIKAN SALDO / WD]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>Merchant:</b> ${merchantName} <code>(#${withdrawal.user_id})</code>
<b>Email:</b> ${merchantEmail}

<b>Nominal WD:</b> Rp ${(withdrawal.amount || 0).toLocaleString('id-ID')}
<b>Fee WD:</b> Rp ${(withdrawal.fee || 0).toLocaleString('id-ID')}
<b>Net Diterima:</b> <b>Rp ${(withdrawal.net_amount || 0).toLocaleString('id-ID')}</b>

<b>Tipe Rekening:</b> ${withdrawal.account_type || 'BANK'}
<b>Provider:</b> ${withdrawal.account_provider || '-'}
<b>Nama Pemilik:</b> ${withdrawal.account_name || '-'}
<b>No. Rekening/HP:</b> <code>${withdrawal.account_number || '-'}</code>
<b>Catatan:</b> ${withdrawal.note || '-'}

<b>Waktu Pengajuan:</b> ${dateStr} WIB
<b>Status:</b> <b>PENDING (Butuh Persetujuan)</b>
━━━━━━━━━━━━━━━━━━━━━━`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ ACC (Setujui Penarikan)', callback_data: `acc_wd_${withdrawal.id}` }
      ],
      [
        { text: '❌ Tolak: No. Rekening Salah', callback_data: `rej_wd_${withdrawal.id}_rek` },
        { text: '❌ Tolak: Nama Tak Sesuai', callback_data: `rej_wd_${withdrawal.id}_nama` }
      ],
      [
        { text: '❌ Tolak: Saldo Kurang', callback_data: `rej_wd_${withdrawal.id}_saldo` },
        { text: '❌ Tolak: Lainnya', callback_data: `rej_wd_${withdrawal.id}_other` }
      ]
    ]
  };

  await sendAdminMessage({
    chat_id: chatId,
    text: text,
    reply_markup: inlineKeyboard
  });
}

function buildWdInlineKeyboard(wdId) {
  return {
    inline_keyboard: [
      [
        { text: '✅ ACC (Setujui Penarikan)', callback_data: `acc_wd_${wdId}` }
      ],
      [
        { text: '❌ Tolak: No. Rekening Salah', callback_data: `rej_wd_${wdId}_rek` },
        { text: '❌ Tolak: Nama Tak Sesuai', callback_data: `rej_wd_${wdId}_nama` }
      ],
      [
        { text: '❌ Tolak: Saldo Kurang', callback_data: `rej_wd_${wdId}_saldo` },
        { text: '❌ Tolak: Lainnya', callback_data: `rej_wd_${wdId}_other` }
      ]
    ]
  };
}

export async function processAdminTelegramUpdate(update) {
  const { chatId: adminChatId } = getAdminCredentials();

  if (update.callback_query) {
    const cb = update.callback_query;
    const fromId = String(cb.from?.id || cb.message?.chat?.id || '');

    if (adminChatId && fromId !== adminChatId) {

      await answerCallbackQuery(cb.id, '❌ Akses Ditolak', true);
      return;
    }

    const data = cb.data || '';

    if (data.startsWith('acc_wd_')) {
      const wdId = Number(data.replace('acc_wd_', ''));
      const wd = await getWithdrawalById(wdId);

      if (!wd) {
        await answerCallbackQuery(cb.id, 'WD tidak ditemukan.', true);
        return;
      }

      if (wd.status !== 'PENDING') {
        await answerCallbackQuery(cb.id, `Status WD #${wdId} sudah ${wd.status}.`, true);
        return;
      }

      const note = 'Withdraw disetujui';
      await updateWithdrawalStatus(wdId, 'APPROVED', note);
      await answerCallbackQuery(cb.id, `✅ WD Rp ${(wd.amount || 0).toLocaleString('id-ID')} (#${wdId}) DISETUJUI!`, false);

      const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const updatedText = `<b>[PENARIKAN SALDO - DISETUJUI ✅]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>ID WD:</b> <code>#${wd.id}</code>
<b>Merchant ID:</b> #${wd.user_id}
<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}
<b>Net Ditransfer:</b> <b>Rp ${(wd.net_amount || 0).toLocaleString('id-ID')}</b>

<b>Tipe Rekening:</b> ${wd.account_type || 'BANK'} (${wd.account_provider || '-'})
<b>Nama Pemilik:</b> ${wd.account_name || '-'}
<b>No. Rekening/HP:</b> <code>${wd.account_number || '-'}</code>

<b>Status:</b> <b>DISETUJUI (APPROVED)</b>
<b>Waktu ACC:</b> ${dateStr} WIB
━━━━━━━━━━━━━━━━━━━━━━`;

      await editAdminMessage({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: updatedText
      });
      return;
    }

    if (data.startsWith('rej_wd_') || data.startsWith('reject_wd_')) {
      let wdId = 0;
      let note = 'Ditolak via Bot Telegram Admin';

      if (data.startsWith('rej_wd_')) {
        const parts = data.replace('rej_wd_', '').split('_');
        wdId = Number(parts[0]);
        const reasonKey = parts[1] || '';

        if (reasonKey === 'rek') {
          note = 'Nomor Rekening / E-Wallet Salah atau Tidak Aktif';
        } else if (reasonKey === 'nama') {
          note = 'Nama Pemilik Rekening Tidak Sesuai Data';
        } else if (reasonKey === 'saldo') {
          note = 'Saldo Siap Tarik Tidak Mencukupi';
        } else {
          note = 'Pengajuan Penarikan Ditolak oleh Admin';
        }
      } else {
        wdId = Number(data.replace('reject_wd_', ''));
      }

      const wd = await getWithdrawalById(wdId);
      if (!wd) {
        await answerCallbackQuery(cb.id, 'WD tidak ditemukan.', true);
        return;
      }

      if (wd.status !== 'PENDING') {
        await answerCallbackQuery(cb.id, `Status WD #${wdId} sudah ${wd.status}.`, true);
        return;
      }

      await updateWithdrawalStatus(wdId, 'REJECTED', note);
      await answerCallbackQuery(cb.id, `❌ WD Rp ${(wd.amount || 0).toLocaleString('id-ID')} (#${wdId}) DITOLAK & REFUND!`, false);

      const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
      const updatedText = `<b>[PENARIKAN SALDO - DITOLAK ❌]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>ID WD:</b> <code>#${wd.id}</code>
<b>Merchant ID:</b> #${wd.user_id}
<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}

<b>Catatan Admin:</b> ${note}
<b>Status:</b> <b>DITOLAK (REJECTED & SALDO REFUND)</b>
<b>Waktu Tolak:</b> ${dateStr} WIB
━━━━━━━━━━━━━━━━━━━━━━`;

      await editAdminMessage({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: updatedText
      });
      return;
    }
  }

  if (update.message && update.message.text) {
    const msg = update.message;
    const fromId = String(msg.from?.id || msg.chat?.id || '');
    const text = (msg.text || '').trim();

    if (adminChatId && fromId !== adminChatId) {

      return;
    }

    if (text.startsWith('/start') || text.startsWith('/help')) {
      const welcomeText = `<b>[ADMIN TELEGRAM BOT]</b> 🤖
━━━━━━━━━━━━━━━━━━━━━━
Selamat datang di Bot Admin WARUNGERIKPAY!

<b>Cara ACC / Tolak Penarikan (WD):</b>

1. <b>Klik Tombol Instan:</b>
   Klik [ ✅ ACC ] atau [ ❌ Tolak ] langsung pada pesan notifikasi WD.

2. **Balas Pesan Notifikasi (Reply Message):**
   Balas (Reply) pesan notifikasi WD dengan ketik:
   • <code>acc Ref BCA 893471</code> (Disetujui + Catatan)
   • <code>tolak Nomor rekening tidak aktif</code> (Ditolak + Catatan)

3. <b>Perintah (Command) Custom Catatan:</b>
   • <code>/acc [id] [catatan]</code> (Contoh: <code>/acc 15 Ref BCA 9847</code>)
   • <code>/reject [id] [catatan]</code> (Contoh: <code>/reject 15 Nama pemilik salah</code>)

<b>Perintah Lainnya:</b>
• <code>/wd</code> atau <code>/pending</code> : Lihat daftar penarikan pending.
• <code>/stats</code> : Lihat statistik transaksi & omset.
━━━━━━━━━━━━━━━━━━━━━━`;
      await sendAdminMessage({ chat_id: msg.chat.id, text: welcomeText });
      return;
    }

    if (text.startsWith('/acc ')) {
      const parts = text.split(' ');
      const wdId = Number(parts[1]);
      const note = parts.slice(2).join(' ').trim() || 'Withdraw disetujui';

      if (!wdId || isNaN(wdId)) {
        await sendAdminMessage({ chat_id: msg.chat.id, text: 'Format salah. Gunakan: <code>/acc [ID_WD] [catatan]</code> (Contoh: <code>/acc 15 Ref BCA 1234</code>)' });
        return;
      }

      const wd = await getWithdrawalById(wdId);
      if (!wd) {
        await sendAdminMessage({ chat_id: msg.chat.id, text: `WD #${wdId} tidak ditemukan.` });
        return;
      }

      if (wd.status !== 'PENDING') {
        await sendAdminMessage({ chat_id: msg.chat.id, text: `Status WD #${wdId} sudah ${wd.status}.` });
        return;
      }

      await updateWithdrawalStatus(wdId, 'APPROVED', note);
      await sendAdminMessage({
        chat_id: msg.chat.id,
        text: `<b>[PENARIKAN SALDO - DISETUJUI ✅]</b>\n━━━━━━━━━━━━━━━━━━━━━━\n<b>ID WD:</b> <code>#${wd.id}</code>\n<b>Merchant ID:</b> #${wd.user_id}\n<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}\n<b>Net Ditransfer:</b> <b>Rp ${(wd.net_amount || 0).toLocaleString('id-ID')}</b>\n<b>Catatan Admin:</b> ${note}\n<b>Status:</b> <b>DISETUJUI (APPROVED)</b>\n━━━━━━━━━━━━━━━━━━━━━━`
      });
      return;
    }

    if (text.startsWith('/reject ')) {
      const parts = text.split(' ');
      const wdId = Number(parts[1]);
      const note = parts.slice(2).join(' ').trim() || 'Ditolak via Bot Telegram Admin';

      if (!wdId || isNaN(wdId)) {
        await sendAdminMessage({ chat_id: msg.chat.id, text: 'Format salah. Gunakan: <code>/reject [ID_WD] [alasan]</code> (Contoh: <code>/reject 15 Rekening salah</code>)' });
        return;
      }

      const wd = await getWithdrawalById(wdId);
      if (!wd) {
        await sendAdminMessage({ chat_id: msg.chat.id, text: `WD #${wdId} tidak ditemukan.` });
        return;
      }

      if (wd.status !== 'PENDING') {
        await sendAdminMessage({ chat_id: msg.chat.id, text: `Status WD #${wdId} sudah ${wd.status}.` });
        return;
      }

      await updateWithdrawalStatus(wdId, 'REJECTED', note);
      await sendAdminMessage({
        chat_id: msg.chat.id,
        text: `<b>[PENARIKAN SALDO - DITOLAK ❌]</b>\n━━━━━━━━━━━━━━━━━━━━━━\n<b>ID WD:</b> <code>#${wd.id}</code>\n<b>Merchant ID:</b> #${wd.user_id}\n<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}\n<b>Catatan Admin:</b> ${note}\n<b>Status:</b> <b>DITOLAK (REJECTED & SALDO REFUND)</b>\n━━━━━━━━━━━━━━━━━━━━━━`
      });
      return;
    }

    if (msg.reply_to_message && msg.reply_to_message.text) {
      const replyText = msg.reply_to_message.text;
      const match = replyText.match(/(?:ID WD:\s*#?|#)(\d+)/) || replyText.match(/\(#(\d+)\)/);

      if (match && match[1]) {
        const wdId = Number(match[1]);
        const wd = await getWithdrawalById(wdId);

        if (wd && wd.status === 'PENDING') {
          const lowerText = text.toLowerCase();
          let isAcc = lowerText.startsWith('acc') || lowerText.startsWith('setuju') || lowerText.startsWith('ok');
          let isReject = lowerText.startsWith('reject') || lowerText.startsWith('tolak') || lowerText.startsWith('batal');

          if (isAcc) {
            const note = text.replace(/^(acc|setuju|ok)\s*/i, '').trim() || 'Withdraw disetujui';
            await updateWithdrawalStatus(wdId, 'APPROVED', note);

            const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            const updatedText = `<b>[PENARIKAN SALDO - DISETUJUI ✅]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>ID WD:</b> <code>#${wd.id}</code>
<b>Merchant ID:</b> #${wd.user_id}
<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}
<b>Net Ditransfer:</b> <b>Rp ${(wd.net_amount || 0).toLocaleString('id-ID')}</b>

<b>Tipe Rekening:</b> ${wd.account_type || 'BANK'}
<b>Provider:</b> ${wd.account_provider || '-'}
<b>Nama Pemilik:</b> ${wd.account_name || '-'}
<b>No. Rekening/HP:</b> <code>${wd.account_number || '-'}</code>
<b>Catatan Admin:</b> ${note}

<b>Status:</b> <b>DISETUJUI (APPROVED)</b>
<b>Disetujui Pada:</b> ${dateStr} WIB
━━━━━━━━━━━━━━━━━━━━━━`;

            await sendAdminMessage({ chat_id: msg.chat.id, text: updatedText });
            return;
          }

          if (isReject) {
            const note = text.replace(/^(reject|tolak|batal)\s*/i, '').trim() || 'Ditolak via Bot Telegram Admin';
            await updateWithdrawalStatus(wdId, 'REJECTED', note);

            const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            const updatedText = `<b>[PENARIKAN SALDO - DITOLAK ❌]</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>ID WD:</b> <code>#${wd.id}</code>
<b>Merchant ID:</b> #${wd.user_id}
<b>Nominal WD:</b> Rp ${(wd.amount || 0).toLocaleString('id-ID')}

<b>Catatan Admin:</b> ${note}
<b>Status:</b> <b>DITOLAK (REJECTED & SALDO REFUND)</b>
<b>Ditolak Pada:</b> ${dateStr} WIB
━━━━━━━━━━━━━━━━━━━━━━`;

            await sendAdminMessage({ chat_id: msg.chat.id, text: updatedText });
            return;
          }
        }
      }
    }

    if (text.startsWith('/wd') || text.startsWith('/pending')) {
      const allWds = await getAllWithdrawals();
      const pendingWds = (allWds || []).filter(w => w.status === 'PENDING');

      if (pendingWds.length === 0) {
        await sendAdminMessage({
          chat_id: msg.chat.id,
          text: `<b>[DAFTAR PENARIKAN PENDING]</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n<b>Tidak ada pengajuan WD yang pending saat ini. 🎉</b>\nSeluruh penarikan telah diproses!`
        });
        return;
      }

      await sendAdminMessage({
        chat_id: msg.chat.id,
        text: `<b>[DAFTAR PENARIKAN PENDING]</b>\n━━━━━━━━━━━━━━━━━━━━━━\nDitemukan <b>${pendingWds.length}</b> penarikan saldo pending:`
      });

      for (const w of pendingWds) {
        const dateStr = w.created_at
          ? new Date(w.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
          : '-';

        const itemText = `<b>WD #${w.id} - ${w.user_name || `Merchant #${w.user_id}`}</b>
━━━━━━━━━━━━━━━━━━━━━━
<b>Nominal WD:</b> Rp ${(w.amount || 0).toLocaleString('id-ID')}
<b>Net Ditransfer:</b> <b>Rp ${(w.net_amount || 0).toLocaleString('id-ID')}</b>

<b>Tipe Rekening:</b> ${w.account_type || 'BANK'} (${w.account_provider || '-'})
<b>Nama Pemilik:</b> ${w.account_name || '-'}
<b>No. Rekening/HP:</b> <code>${w.account_number || '-'}</code>
<b>Waktu:</b> ${dateStr} WIB
━━━━━━━━━━━━━━━━━━━━━━`;

        await sendAdminMessage({
          chat_id: msg.chat.id,
          text: itemText,
          reply_markup: buildWdInlineKeyboard(w.id)
        });
      }
      return;
    }

    if (text.startsWith('/stats')) {
      const stats = await getStats();
      const statsText = `<b>[STATISTIK PLATFORM]</b> 📊
━━━━━━━━━━━━━━━━━━━━━━
<b>Total Transaksi Lunas:</b> ${stats.totalPaidCount || 0} Transaksi
<b>Total Omset Lunas:</b> <b>Rp ${(stats.totalPaidVolume || 0).toLocaleString('id-ID')}</b>
━━━━━━━━━━━━━━━━━━━━━━`;
      await sendAdminMessage({ chat_id: msg.chat.id, text: statsText });
      return;
    }
  }
}
