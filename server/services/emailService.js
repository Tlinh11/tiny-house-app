import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if available
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const ADMIN_EMAIL = 'mkt.tinyhouses@gmail.com';
const SMTP_USER = process.env.EMAIL_SMTP_USER || process.env.EMAIL_FROM || 'lptlinh2003@gmail.com';
const SMTP_PASS = process.env.EMAIL_SMTP_PASS || process.env.EMAIL_PASS || '';

// Create Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const emailService = {
  /**
   * Send notification to mkt.tinyhouses@gmail.com when a new room appointment is booked
   * Formatted exactly matching the reference card style
   */
  async sendBookingNotificationToAdmin({ booking, building }) {
    try {
      const buildingCode = booking.buildingCode || (building ? building.code : 'DT0015');
      const roomName = booking.roomNumber ? (String(booking.roomNumber).startsWith('Phòng') || String(booking.roomNumber).startsWith('Studio') || String(booking.roomNumber).startsWith('Căn') ? booking.roomNumber : `Phòng ${booking.roomNumber}`) : 'Phòng Studio';
      const customerName = booking.customerName || 'Khách hàng';
      const formattedDate = booking.appointmentDate || new Date().toISOString().split('T')[0];
      const formattedTime = booking.appointmentTime || '10:00';
      const cleanPhone = String(booking.phone || '').trim();

      const subject = `📅 [Tiny Houses] Lịch xem phòng mới: ${buildingCode} - ${roomName} (${customerName})`;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F1F5F9; margin: 0; padding: 24px; color: #1E293B; }
    .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
    .header-banner { background: #D97706; padding: 28px 20px; text-align: center; color: #ffffff; }
    .header-title { font-size: 24px; font-weight: 700; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; color: #ffffff; }
    .header-subtitle { font-size: 14px; margin: 8px 0 0 0; color: #ffffff; opacity: 0.95; font-weight: 500; }
    .content-body { padding: 28px 24px; background: #ffffff; }
    .section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; padding-bottom: 10px; border-bottom: 2px solid #E8920A; display: flex; align-items: center; gap: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table tr { border-bottom: 1px solid #F1F5F9; }
    .info-table tr:last-child { border-bottom: none; }
    .info-label { width: 35%; padding: 12px 6px 12px 0; font-size: 13.5px; color: #64748B; font-weight: 600; vertical-align: middle; }
    .info-value { width: 65%; padding: 12px 0; font-size: 14px; color: #0F172A; vertical-align: middle; font-weight: 600; }
    .value-highlight { color: #D97706; font-weight: 800; font-size: 15px; }
    .value-date { color: #059669; font-weight: 700; }
    .badge-status { display: inline-block; background: #FEF3C7; color: #92400E; padding: 3px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; }
    .alert-box { background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #92400E; line-height: 1.5; margin-top: 10px; }
    .footer { text-align: center; padding: 16px; font-size: 12px; color: #64748B; background: #F8FAFC; border-top: 1px solid #F1F5F9; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header-banner">
      <h1 class="header-title">🏠 Tiny Houses</h1>
      <p class="header-subtitle">Thông báo: Có lịch xem phòng mới!</p>
    </div>

    <!-- Body -->
    <div class="content-body">
      <div class="section-title">
        📋 Chi tiết người đặt lịch xem phòng
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Mã lịch hẹn:</td>
          <td class="info-value">${booking.id}</td>
        </tr>
        <tr>
          <td class="info-label">Họ và tên:</td>
          <td class="info-value" style="font-weight: 700; color: #0F172A;">${customerName}</td>
        </tr>
        <tr>
          <td class="info-label">Số điện thoại:</td>
          <td class="info-value value-highlight">
            <a href="tel:${cleanPhone.replace(/\D/g, '')}" style="color: #D97706; text-decoration: none;">${cleanPhone}</a>
          </td>
        </tr>
        <tr>
          <td class="info-label">Email khách:</td>
          <td class="info-value">
            ${booking.email && booking.email !== 'Chưa cung cấp' ? `<a href="mailto:${booking.email}" style="color: #2563EB; text-decoration: underline;">${booking.email}</a>` : 'Chưa cung cấp'}
          </td>
        </tr>
        <tr>
          <td class="info-label">Tòa nhà / Căn hộ:</td>
          <td class="info-value" style="font-weight: 700;">${buildingCode}</td>
        </tr>
        <tr>
          <td class="info-label">Số phòng xem:</td>
          <td class="info-value" style="font-weight: 700;">${roomName}</td>
        </tr>
        <tr>
          <td class="info-label">Thời gian hẹn:</td>
          <td class="info-value value-date">${formattedTime} — Ngày ${formattedDate}</td>
        </tr>
        <tr>
          <td class="info-label">Trạng thái:</td>
          <td class="info-value">
            <span class="badge-status">Chờ xác nhận</span>
          </td>
        </tr>
      </table>

      <!-- Nhắc nhở MKT/CSKH -->
      <div class="alert-box">
        💡 <strong>Nhắc nhở MKT / CSKH:</strong> Vui lòng gọi điện hoặc liên hệ qua Zalo/Email cho khách hàng để xác nhận thời gian xem phòng.
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      © 2026 Tiny Houses — Hệ thống gửi email tự động
    </div>
  </div>
</body>
</html>
      `;

      if (SMTP_PASS) {
        const mailOptions = {
          from: `"Tiny Houses System" <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject: subject,
          html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[emailService] ✅ Email sent to ${ADMIN_EMAIL}:`, info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        console.log(`[emailService] ℹ️ SMTP_PASS not set, logged email notification for ${ADMIN_EMAIL}`);
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.warn(`[emailService] ⚠️ Error sending booking email:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send notification when a new user registers or requests approval
   */
  async sendNewUserRegistrationNotification({ user }) {
    try {
      const subject = `👤 [Tiny Houses] Yêu cầu duyệt tài khoản mới: ${user.name}`;

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F1F5F9; margin: 0; padding: 24px; color: #1E293B; }
    .email-container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
    .header-banner { background: #0F172A; padding: 24px 20px; text-align: center; color: #ffffff; border-bottom: 3px solid #D97706; }
    .content-body { padding: 24px; background: #ffffff; }
    .section-title { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; padding-bottom: 10px; border-bottom: 2px solid #D97706; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table tr { border-bottom: 1px solid #F1F5F9; }
    .info-label { width: 35%; padding: 10px 0; font-size: 13.5px; color: #64748B; font-weight: 600; }
    .info-value { width: 65%; padding: 10px 0; font-size: 14px; color: #0F172A; font-weight: 700; }
    .footer { text-align: center; padding: 14px; font-size: 12px; color: #64748B; background: #F8FAFC; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header-banner">
      <h2 style="margin: 0; color: #ffffff;">🏠 Tiny Houses — Tài Khoản Mới</h2>
    </div>
    <div class="content-body">
      <div class="section-title">👤 Chi tiết người dùng đăng ký</div>
      <table class="info-table">
        <tr><td class="info-label">Họ và tên:</td><td class="info-value">${user.name}</td></tr>
        <tr><td class="info-label">Email:</td><td class="info-value">${user.email || 'Chưa cung cấp'}</td></tr>
        <tr><td class="info-label">Số điện thoại:</td><td class="info-value" style="color: #D97706;">${user.phone || 'Chưa cung cấp'}</td></tr>
        <tr><td class="info-label">Vai trò yêu cầu:</td><td class="info-value">${user.roleName || user.roleCode}</td></tr>
        <tr><td class="info-label">Trạng thái:</td><td class="info-value"><span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 8px; font-size: 12px;">Chờ duyệt</span></td></tr>
      </table>
    </div>
    <div class="footer">© 2026 Tiny Houses — Hệ thống gửi email tự động</div>
  </div>
</body>
</html>
      `;

      if (SMTP_PASS) {
        await transporter.sendMail({
          from: `"Tiny Houses System" <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject: subject,
          html: htmlContent
        });
      }
      return { success: true };
    } catch (error) {
      console.warn(`[emailService] ⚠️ User registration email warning:`, error.message);
      return { success: false, error: error.message };
    }
  }
};
