

export async function sendTelegramNotification(text, botToken, chatId) {
  const token = (botToken && String(botToken).trim() !== '') ? String(botToken).trim() : (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const targetChatId = (chatId && String(chatId).trim() !== '') ? String(chatId).trim() : (process.env.TELEGRAM_CHAT_ID || '').trim();

  if (!token || !targetChatId) {
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const data = await res.json();
    if (!data.ok) {
      console.warn('[Telegram Notif Failed]', data.description || 'Unknown error');
      return false;
    } else {
      console.log(`[Telegram Notif Sent] Sukses terkirim ke Telegram Chat: ${targetChatId}`);
      return true;
    }
  } catch (err) {
    console.warn('[Telegram Notif Error]', err.message);
    return false;
  }
}
