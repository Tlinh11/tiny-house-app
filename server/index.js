import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { dataEngine } from './dbEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tinyhouse_secret_jwt_key_2026';

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
  } catch (err) {
    req.user = null;
  }
  next();
};

app.use(verifyTokenMiddleware);

// --- API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), server: 'Tiny Houses Express API' });
});

// AUTH: Google OAuth 2.0 & JWT Token Generation
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email Google không hợp lệ' });
    }

    const users = dataEngine.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Create new user for Google Account
      const roles = dataEngine.getRoles();
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
        status: 'Hoạt động'
      };
      users.push(user);
      dataEngine.saveUser(user);
    } else if (avatar && (!user.avatar || user.avatar.includes('unsplash'))) {
      user.avatar = avatar;
      dataEngine.saveUser(user);
    }

    // Sign JWT Bearer Token (Expires in 7 days)
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

// AUTH: Standard Login returning JWT Token
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, roleCode } = req.body;
    const users = dataEngine.getUsers();
    let user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() || u.roleCode === roleCode);

    if (!user) {
      user = users[0];
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
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, error: 'Mã Token JWT không hợp lệ hoặc đã hết hạn' });
  }
  const users = dataEngine.getUsers();
  const activeUser = users.find(u => u.id === req.user.id || u.email === req.user.email) || req.user;

  res.json({
    authenticated: true,
    user: activeUser,
    jwtDecoded: req.user
  });
});

// BUILDINGS API
app.get('/api/buildings', (req, res) => {
  try {
    const buildings = dataEngine.getBuildings();
    res.json(buildings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/buildings', (req, res) => {
  try {
    const updated = dataEngine.saveBuilding(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROOMS API
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = dataEngine.getRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', (req, res) => {
  try {
    const updated = dataEngine.saveRoom(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOKINGS API
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = dataEngine.getBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const updated = dataEngine.saveBooking(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROLES & USERS API
app.get('/api/roles', (req, res) => {
  res.json(dataEngine.getRoles());
});

app.get('/api/users', (req, res) => {
  res.json(dataEngine.getUsers());
});

// IMAGE UPLOAD API
app.post('/api/upload', (req, res) => {
  try {
    const { image, fileName } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu hình ảnh' });
    }

    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      ext = matches[1].split('/')[1] || 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const uniqueFileName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `http://localhost:${PORT}/uploads/${uniqueFileName}`;
    res.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BACKUP API
app.get('/api/backup', (req, res) => {
  res.json(dataEngine.exportBackup());
});

app.listen(PORT, () => {
  console.log(`🚀 Tiny Houses Backend API Server running on http://localhost:${PORT}`);
  console.log(`🔒 JWT Authentication Secret Active`);
});
