import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { dbEngine as dataEngine } from './dbEngine.js';
import { isSupabaseConfigured, SupabaseDb } from './supabaseEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tinyhouse_secret_jwt_key_2026';

// ---- EMAIL TRANSPORT (nodemailer + Gmail SMTP) ----
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SMTP_USER || '',
    pass: process.env.EMAIL_SMTP_PASS || ''
  },
  tls: { rejectUnauthorized: false }
});

const sendApprovalEmail = async ({ toEmail, toName, action, roleName }) => {
  if (!process.env.EMAIL_SMTP_USER || process.env.EMAIL_SMTP_PASS === 'your_gmail_app_password_here') {
    console.log(`[Email] (SMTP chưa cấu hình) Would send ${action} email to: ${toEmail}`);
    return { skipped: true };
  }
  const isApproved = action === 'approve';
  const subject = isApproved
    ? '✅ Tài khoản Tiny Houses của bạn đã được kích hoạt!'
    : '❌ Yêu cầu đăng ký tài khoản Tiny Houses bị từ chối';

  const html = isApproved ? `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #E8920A, #d97706); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 1.6rem;">🏠 Tiny Houses</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Đơn vị vận hành căn hộ hàng đầu Hà Nội</p>
      </div>
      <div style="padding: 32px; background: #fff;">
        <h2 style="color: #0F172A; margin-top: 0;">Chào mừng ${toName}! 🎉</h2>
        <p style="color: #374151; line-height: 1.7;">Tài khoản của bạn với vai trò <strong style="color: #E8920A;">${roleName}</strong> đã được <strong>Super Admin phê duyệt và kích hoạt thành công!</strong></p>
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #065F46; font-weight: bold;">✅ Bạn có thể đăng nhập ngay tại:</p>
          <a href="http://localhost:5175" style="color: #E8920A; font-weight: bold;">http://localhost:5175</a>
        </div>
        <p style="color: #64748B; font-size: 0.9rem;">Email đăng nhập của bạn: <strong>${toEmail}</strong></p>
        <p style="color: #64748B; font-size: 0.85rem; margin-top: 24px;">Nếu có thắc mắc, liên hệ: <a href="mailto:admin@tinyhouse.vn">admin@tinyhouse.vn</a></p>
      </div>
      <div style="background: #F8FAFC; padding: 16px; text-align: center; color: #94A3B8; font-size: 0.8rem;">
        © 2026 Tiny Houses — Hà Nội
      </div>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <div style="background: #374151; padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 1.6rem;">🏠 Tiny Houses</h1>
      </div>
      <div style="padding: 32px; background: #fff;">
        <h2 style="color: #0F172A;">Xin chào ${toName},</h2>
        <p style="color: #374151; line-height: 1.7;">Rất tiếc, yêu cầu đăng ký tài khoản của bạn chưa được phê duyệt vào lúc này.</p>
        <p style="color: #64748B; line-height: 1.7;">Nếu bạn cho rằng đây là nhầm lẫn hoặc muốn biết thêm chi tiết, vui lòng liên hệ trực tiếp với chúng tôi qua email: <a href="mailto:admin@tinyhouse.vn" style="color: #E8920A;">admin@tinyhouse.vn</a></p>
      </div>
      <div style="background: #F8FAFC; padding: 16px; text-align: center; color: #94A3B8; font-size: 0.8rem;">
        © 2026 Tiny Houses — Hà Nội
      </div>
    </div>
  `;

  await emailTransporter.sendMail({
    from: `"Tiny Houses Admin" <${process.env.EMAIL_SMTP_USER}>`,
    to: toEmail,
    subject,
    html
  });
  return { sent: true };
};

const sendBookingNotificationEmail = async (booking) => {
  const targetEmail = process.env.NOTIFICATION_EMAIL || 'mkt.tinyhouses@gmail.com';

  if (!process.env.EMAIL_SMTP_USER || process.env.EMAIL_SMTP_PASS === 'your_gmail_app_password_here') {
    console.log(`[Email Notification] (SMTP chưa cấu hình) Would send booking notification email for ${booking.customerName || booking.customer_name || 'Khách xem phòng'} to: ${targetEmail}`);
    return { skipped: true };
  }

  const customerName = booking.customerName || booking.customer_name || booking.name || 'Khách hàng';
  const phone = booking.phone || 'Chưa cung cấp';
  const email = booking.email || 'Chưa cung cấp';
  const buildingCode = booking.buildingCode || booking.building_code || 'N/A';
  const roomNumber = booking.roomNumber || booking.room_number || 'N/A';
  const appointmentDate = booking.appointmentDate || booking.appointment_date || 'N/A';
  const appointmentTime = booking.appointmentTime || booking.appointment_time || '';
  const bookingId = booking.id || `BK-${Date.now()}`;

  const subject = `📅 [Tiny Houses] Lịch xem phòng mới: ${buildingCode} - Phòng ${roomNumber} (${customerName})`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #E8920A, #d97706); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 1.5rem;">🏠 Tiny Houses</h1>
        <p style="color: rgba(255,255,255,0.95); margin: 6px 0 0 0; font-size: 1rem; font-weight: 500;">Thông báo: Có lịch xem phòng mới!</p>
      </div>
      <div style="padding: 28px; background: #ffffff;">
        <h2 style="color: #0F172A; margin-top: 0; font-size: 1.2rem; border-bottom: 2px solid #E8920A; padding-bottom: 8px;">📋 Chi tiết người đặt lịch xem phòng</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600; width: 140px;">Mã lịch hẹn:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: bold;">${bookingId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Họ và tên:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: bold; font-size: 1.05rem;">${customerName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Số điện thoại:</td>
            <td style="padding: 10px 0; color: #E8920A; font-weight: bold; font-size: 1.1rem;"><a href="tel:${phone}" style="color: #E8920A; text-decoration: none;">${phone}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Email khách:</td>
            <td style="padding: 10px 0; color: #0F172A;">${email !== 'Chưa cung cấp' ? `<a href="mailto:${email}" style="color: #2563eb;">${email}</a>` : email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Tòa nhà / Căn hộ:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: bold;">${buildingCode}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Số phòng xem:</td>
            <td style="padding: 10px 0; color: #0F172A; font-weight: bold;">Phòng ${roomNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Thời gian hẹn:</td>
            <td style="padding: 10px 0; color: #16a34a; font-weight: bold;">${appointmentTime ? appointmentTime + ' — ' : ''}Ngày ${appointmentDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #64748B; font-weight: 600;">Trạng thái:</td>
            <td style="padding: 10px 0;"><span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;">Chờ xác nhận</span></td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; font-size: 0.88rem; color: #92400E;">
          💡 <strong>Nhắc nhở MKT / CSKH:</strong> Vui lòng gọi điện hoặc liên hệ qua Zalo/Email cho khách hàng để xác nhận thời gian xem phòng.
        </div>
      </div>
      <div style="background: #F1F5F9; padding: 14px; text-align: center; color: #94A3B8; font-size: 0.8rem;">
        © 2026 Tiny Houses — Hệ thống gửi email tự động
      </div>
    </div>
  `;

  await emailTransporter.sendMail({
    from: `"Tiny Houses System" <${process.env.EMAIL_SMTP_USER || 'no-reply@tinyhouse.vn'}>`,
    to: targetEmail,
    subject,
    html
  });
  return { sent: true };
};


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Helper: Verify JWT Token Middleware
const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (_err) {
    req.user = null;
  }
  next();
};

app.use(verifyTokenMiddleware);

// Helper: Require Authentication Middleware
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: '⛔ Yêu cầu đăng nhập để thực hiện thao tác này (Missing Token).' });
  }
  next();
};

// Helper: Require Role-Based Authorization Middleware
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (req.user) {
      const userRole = req.user.roleCode || 'ctv_sale';
      if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
        return res.status(403).json({ 
          error: `⛔ Quyền truy cập bị từ chối. Vai trò '${req.user.roleName || userRole}' không được phép thực hiện thao tác này.` 
        });
      }
    }
    next();
  };
};

// --- API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), server: 'Tiny Houses Express API' });
});

// AUTH: Register New Account
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, roleCode, password } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.' });
    }

    const users = isSupabaseConfigured() ? (await SupabaseDb.getUsers() || []) : dataEngine.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản trong hệ thống.' });
    }

    const roles = isSupabaseConfigured() ? (await SupabaseDb.getRoles() || []) : dataEngine.getRoles();
    const roleObj = roles.find(r => r.code === roleCode) || roles.find(r => r.code === 'ctv_sale') || roles[0];

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      phone,
      password: password || '123456',
      roleCode: roleObj ? roleObj.code : 'ctv_sale',
      roleName: roleObj ? roleObj.name : 'Cộng tác viên Sale (CTV)',
      status: 'Chờ duyệt',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      authProvider: 'local'
    };

    if (isSupabaseConfigured()) {
      await SupabaseDb.saveUser(newUser);
    } else {
      dataEngine.saveUser(newUser);
    }

    res.json({
      success: true,
      pendingApproval: true,
      user: newUser,
      message: 'Đăng ký tài khoản thành công! Yêu cầu của bạn đã được gửi tới Super Admin để duyệt kích hoạt.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTH: Google OAuth 2.0 & JWT Token Generation
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email Google không hợp lệ' });
    }

    const users = isSupabaseConfigured() ? (await SupabaseDb.getUsers() || []) : dataEngine.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const roles = isSupabaseConfigured() ? (await SupabaseDb.getRoles() || []) : dataEngine.getRoles();
      const defaultRole = roles.find(r => r.code === 'ctv_sale') || roles[0];
      
      user = {
        id: `usr_g_${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
        roleCode: defaultRole.code,
        roleName: defaultRole.name,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        authProvider: 'google',
        status: 'Chờ duyệt',
        createdAt: new Date().toISOString()
      };
      if (isSupabaseConfigured()) {
        await SupabaseDb.saveUser(user);
      } else {
        dataEngine.saveUser(user);
      }
    }

    // Check account status
    if (user.status === 'Chờ duyệt') {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        user,
        error: '⚠️ Tài khoản Google của bạn đang chờ Super Admin phê duyệt kích hoạt. Vui lòng liên hệ Admin!'
      });
    }

    if (user.status === 'Từ chối') {
      return res.status(403).json({
        success: false,
        error: '⛔ Tài khoản này đã bị Admin từ chối kích hoạt.'
      });
    }

    // Sign JWT Bearer Token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        roleCode: user.roleCode, 
        roleName: user.roleName,
        authProvider: 'google'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user,
      expiresIn: '7 days',
      authMethod: 'Google OAuth 2.0'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTH: Real Login checking Password & Account Status
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng nhập Email để đăng nhập.' });
    }

    const users = isSupabaseConfigured() ? (await SupabaseDb.getUsers() || []) : dataEngine.getUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() || (u.phone && u.phone === email)
    );

    if (!user) {
      return res.status(400).json({ error: 'Tài khoản Email không tồn tại trong hệ thống.' });
    }

    // Kiểm tra mật khẩu (nếu user có password thì phải khớp)
    if (user.password && password && user.password !== password) {
      return res.status(400).json({ error: 'Mật khẩu không chính xác. Vui lòng thử lại.' });
    }

    // Kiểm tra trạng s thái tài khoản
    if (user.status === 'Chờ duyệt') {
      return res.status(403).json({
        success: false,
        pendingApproval: true,
        user,
        error: '⚠️ Tài khoản của bạn đang chờ Super Admin phê duyệt kích hoạt. Vui lòng liên hệ Admin!'
      });
    }

    if (user.status === 'Từ chối') {
      return res.status(403).json({
        success: false,
        error: '⛔ Tài khoản này đã bị Admin từ chối kích hoạt.'
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        roleCode: user.roleCode, 
        roleName: user.roleName 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// AUTH: Verify Active JWT Session (/api/auth/me)
app.get('/api/auth/me', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, error: 'Mã Token JWT không hợp lệ hoặc đã hết hạn' });
  }
  const users = isSupabaseConfigured() ? (await SupabaseDb.getUsers() || []) : dataEngine.getUsers();
  const activeUser = users.find(u => u.id === req.user.id || (u.email && req.user.email && u.email.toLowerCase() === req.user.email.toLowerCase())) || req.user;

  if (activeUser.status === 'Chờ duyệt') {
    return res.status(403).json({ authenticated: false, error: 'Tài khoản đang chờ duyệt' });
  }

  res.json({
    authenticated: true,
    user: activeUser,
    jwtDecoded: req.user
  });
});

// ADMIN API: Approve or Reject User Account + Send Email Notification
app.post('/api/users/approve', requireRole(['admin']), async (req, res) => {
  try {
    const { userId, action } = req.body; // action: 'approve' | 'reject'
    const users = dataEngine.getUsers();
    const targetUser = users.find(u => u.id === userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    targetUser.status = action === 'approve' ? 'Hoạt động' : 'Từ chối';
    dataEngine.saveUser(targetUser);

    // Gửi email thông báo cho user
    let emailResult = { skipped: true };
    try {
      emailResult = await sendApprovalEmail({
        toEmail: targetUser.email,
        toName: targetUser.name,
        action,
        roleName: targetUser.roleName || targetUser.roleCode
      });
      console.log(`[Email] ${action} email sent to ${targetUser.email}:`, emailResult);
    } catch (emailErr) {
      console.warn(`[Email] Failed to send email to ${targetUser.email}:`, emailErr.message);
    }

    res.json({
      success: true,
      emailSent: emailResult.sent || false,
      emailSkipped: emailResult.skipped || false,
      message: action === 'approve'
        ? `✅ Đã phê duyệt kích hoạt tài khoản ${targetUser.name}! ${emailResult.sent ? 'Email thông báo đã được gửi.' : '(Email chưa cấu hình SMTP)'}`
        : `❌ Đã từ chối tài khoản ${targetUser.name}.`,
      users: dataEngine.getUsers()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUILDINGS API
app.get('/api/buildings', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbData = await SupabaseDb.getBuildings();
      if (sbData) return res.json(sbData);
    }
    const buildings = dataEngine.getBuildings();
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buildings', requireRole(['admin', 'building_manager']), async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbRes = await SupabaseDb.saveBuilding(req.body);
      if (sbRes) return res.json(sbRes);
    }
    const updated = dataEngine.saveBuilding(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROOMS API
app.get('/api/rooms', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbData = await SupabaseDb.getRooms();
      if (sbData) return res.json(sbData);
    }
    const rooms = dataEngine.getRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', requireRole(['admin', 'building_manager']), async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbRes = await SupabaseDb.saveRoom(req.body);
      if (sbRes) return res.json(sbRes);
    }
    const updated = dataEngine.saveRoom(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOKINGS API
app.get('/api/bookings', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbData = await SupabaseDb.getBookings();
      if (sbData) return res.json(sbData);
    }
    const bookings = dataEngine.getBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    let newBooking;
    if (isSupabaseConfigured()) {
      newBooking = await SupabaseDb.createBooking(req.body);
    }
    if (!newBooking) {
      newBooking = dataEngine.createBooking(req.body);
    }

    const bookingData = newBooking || req.body;

    // Gửi email thông báo đặt lịch tới mkt.tinyhouses@gmail.com
    let emailResult = { skipped: true };
    try {
      emailResult = await sendBookingNotificationEmail(bookingData);
      console.log(`[Email] Đã gửi thông báo lịch xem phòng tới MKT:`, emailResult);
    } catch (emailErr) {
      console.warn(`[Email] Lỗi gửi email thông báo đặt lịch xem phòng:`, emailErr.message);
    }

    res.json({
      ...bookingData,
      emailNotified: emailResult.sent || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbRes = await SupabaseDb.updateBookingStatus(req.params.id, req.body.status);
      if (sbRes) return res.json(sbRes);
    }
    const updated = dataEngine.updateBookingStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROLES & USERS API
app.get('/api/roles', async (req, res) => {
  if (isSupabaseConfigured()) {
    const sbRoles = await SupabaseDb.getRoles();
    if (sbRoles) return res.json(sbRoles);
  }
  res.json(dataEngine.getRoles());
});

app.post('/api/roles', (req, res) => {
  try {
    const updated = dataEngine.saveRole(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/roles/:id', (req, res) => {
  try {
    const updated = dataEngine.deleteRole(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  if (isSupabaseConfigured()) {
    const sbUsers = await SupabaseDb.getUsers();
    if (sbUsers) return res.json(sbUsers);
  }
  res.json(dataEngine.getUsers());
});

app.post('/api/users', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const sbRes = await SupabaseDb.saveUser(req.body);
      if (sbRes) return res.json(sbRes);
    }
    const updated = dataEngine.saveUser(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMAGE UPLOAD API (Uploads directly to new Supabase Storage bucket room-images)
app.post('/api/upload', async (req, res) => {
  try {
    const { image, fileName: origFileName } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu hình ảnh' });
    }

    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      ext = matches[1].split('/')[1] || 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const uniqueFileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

    // 1. Try uploading to new Supabase Storage bucket 'room-images'
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error: uploadErr } = await supabase.storage
          .from('room-images')
          .upload(uniqueFileName, buffer, {
            contentType: `image/${ext}`,
            upsert: true
          });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage.from('room-images').getPublicUrl(uniqueFileName);
          if (publicUrlData && publicUrlData.publicUrl) {
            console.log(`[Supabase Storage] ✅ Uploaded image: ${publicUrlData.publicUrl}`);
            return res.json({
              success: true,
              url: publicUrlData.publicUrl,
              fileName: uniqueFileName,
              storage: 'supabase'
            });
          }
        } else {
          console.warn('[Supabase Storage] Upload warning:', uploadErr.message);
        }
      } catch (sbErr) {
        console.warn('[Supabase Storage] Upload error:', sbErr.message);
      }
    }

    // 2. Fallback to local uploads directory
    const filePath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `http://localhost:${PORT}/uploads/${uniqueFileName}`;

    res.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      storage: 'local'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BACKUP API
app.get('/api/backup', requireRole(['admin']), (req, res) => {
  res.json(dataEngine.exportBackup());
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Tiny Houses Backend API Server running on http://localhost:${PORT}`);
    console.log(`🔒 Real Auth & Admin Approval Workflow Active`);
  });
}

export default app;
