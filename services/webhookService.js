import crypto from 'crypto';
import { getMerchantSettings, saveWebhookLog } from '../db.js';

export function generateWebhookSignature(payloadString, secret) {
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
}

export async function dispatchWebhookNotification(order) {
  if (!order || !order.userId) return;

  try {
    const settings = await getMerchantSettings(order.userId);
    if (!settings || !settings.webhookUrl || !settings.webhookUrl.trim()) {
      return;
    }

    const targetUrl = settings.webhookUrl.trim();
    const payload = {
      event: 'payment.success',
      orderId: order.orderId,
      baseAmount: order.baseAmount,
      uniqueCode: order.uniqueCode,
      totalAmount: order.totalAmount,
      customerName: order.customerName || 'Customer',
      note: order.note || '',
      status: order.status,
      txId: order.txId || null,
      paidAt: order.paidAt || new Date().toISOString(),
      createdAt: order.createdAt
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, settings.webhookSecret);

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'WARUNGERIKPAY-Webhook/1.0',
      'X-WarungErikPay-Event': 'payment.success'
    };

    if (signature) {
      headers['X-WarungErikPay-Signature'] = signature;
    }

    console.log(`[Webhook Dispatcher] Sending callback for Order ${order.orderId} -> ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000)
    });

    const responseText = await res.text();

    await saveWebhookLog({
      userId: order.userId,
      orderId: order.orderId,
      url: targetUrl,
      payload,
      responseStatus: res.status,
      responseBody: responseText.substring(0, 1000)
    });

    console.log(`[Webhook Response] Status: ${res.status} | Order: ${order.orderId}`);
  } catch (err) {
    console.error(`[Webhook Error] Failed to dispatch callback for Order ${order.orderId}:`, err.message);

    try {
      const settings = await getMerchantSettings(order.userId);
      await saveWebhookLog({
        userId: order.userId,
        orderId: order.orderId,
        url: settings?.webhookUrl || 'UNKNOWN',
        payload: { orderId: order.orderId, error: err.message },
        responseStatus: 500,
        responseBody: `Error: ${err.message}`
      });
    } catch (e) {}
  }
}
