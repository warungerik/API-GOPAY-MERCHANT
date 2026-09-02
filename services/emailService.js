import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export async function sendOtpEmail(toEmail, otpCode, name = 'Merchant') {
  const smtpUser = process.env.SMTP_USER || process.env.GOPAY_EMAIL || 'noreply@example.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  if (!smtpPass) {
    console.warn(`[Email Service Notice] GMAIL_APP_PASSWORD / SMTP_PASS belum diisi di .env. Kode OTP untuk ${toEmail}: ${otpCode}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: `"WARUNGERIKPAY Security" <${smtpUser}>`,
    to: toEmail,
    replyTo: smtpUser,
    subject: `Kode OTP Verifikasi Akun WARUNGERIKPAY: ${otpCode}`,
    text: `Halo ${name},\n\nTerima kasih telah mendaftar di WARUNGERIKPAY. Berikut adalah Kode OTP untuk memverifikasi alamat email Anda:\n\nKODE OTP: ${otpCode}\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.\n\nSalam,\nTim WARUNGERIKPAY`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #1e293b;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #00aed6; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">WARUNGERIKPAY</h1>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Payment Gateway QRIS Auto Settlement</p>
          </div>

          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">Halo, ${name}!</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            Terima kasih telah mendaftar di <strong>WARUNGERIKPAY</strong>. Berikut adalah Kode OTP untuk memverifikasi alamat email akun Anda:
          </p>

          <div style="text-align: center; background: #f0f9ff; border: 2px dashed #00aed6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">KODE OTP VERIFIKASI</div>
            <div style="font-family: 'JetBrains Mono', monospace, monospace; font-size: 36px; font-weight: 800; color: #00aed6; letter-spacing: 8px;">${otpCode}</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun!</div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini secara aman.
          </p>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0 16px;" />

          <div style="text-align: center; font-size: 11px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} WARUNGERIKPAY. All rights reserved.<br />
            Powered by WARUNGERIK
          </div>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] OTP ${otpCode} terkirim ke ${toEmail} | Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`[Email Service Error] Gagal mengirim OTP ke ${toEmail}:`, err.message);
    return false;
  }
}
