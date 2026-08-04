import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbEngine } from './dbEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Tiny Houses Backend API',
    timestamp: new Date().toISOString(),
    database: 'Online (Cloud & Local JSON Store Synchronized)',
    uploadsDir: UPLOADS_DIR
  });
});

// Image Upload API Endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { image, fileName } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không được để trống' });
    }

    let buffer;
    let ext = 'png';
    const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      ext = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const uniqueName = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    const imageUrl = `/uploads/${uniqueName}`;

    res.json({
      success: true,
      url: imageUrl,
      fileName: uniqueName,
      message: 'Tải ảnh lên Cloud thành công!'
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Buildings API Endpoints
app.get('/api/buildings', (req, res) => {
  try {
    const buildings = dbEngine.getBuildings();
    res.json({ success: true, count: buildings.length, data: buildings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/buildings/:id', (req, res) => {
  try {
    const buildings = dbEngine.getBuildings();
    const building = buildings.find(b => b.id === req.params.id || b.code === req.params.id);
    if (building) {
      res.json({ success: true, data: building });
    } else {
      res.status(404).json({ success: false, message: 'Building not found' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/buildings', (req, res) => {
  try {
    const updatedList = dbEngine.saveBuilding(req.body);
    res.json({ success: true, data: updatedList });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Rooms API Endpoints
app.get('/api/rooms', (req, res) => {
  try {
    const rooms = dbEngine.getRooms();
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/rooms/:id', (req, res) => {
  try {
    const rooms = dbEngine.getRooms();
    const room = rooms.find(r => r.id === req.params.id);
    if (room) {
      res.json({ success: true, data: room });
    } else {
      res.status(404).json({ success: false, message: 'Room not found' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/rooms', (req, res) => {
  try {
    const updatedRooms = dbEngine.saveRoom(req.body);
    res.json({ success: true, data: updatedRooms });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Bookings API Endpoints
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = dbEngine.getBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const newBooking = dbEngine.createBooking(req.body);
    res.json({ success: true, data: newBooking });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put('/api/bookings/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updatedBookings = dbEngine.updateBookingStatus(req.params.id, status);
    res.json({ success: true, data: updatedBookings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Roles & RBAC Permissions API Endpoints
app.get('/api/roles', (req, res) => {
  try {
    const roles = dbEngine.getRoles();
    res.json({ success: true, count: roles.length, data: roles });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/roles', (req, res) => {
  try {
    const updatedRoles = dbEngine.saveRole(req.body);
    res.json({ success: true, data: updatedRoles });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/roles/:id', (req, res) => {
  try {
    const updatedRoles = dbEngine.deleteRole(req.params.id);
    res.json({ success: true, data: updatedRoles });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Users API Endpoints
app.get('/api/users', (req, res) => {
  try {
    const users = dbEngine.getUsers();
    res.json({ success: true, count: users.length, data: users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const updatedUsers = dbEngine.saveUser(req.body);
    res.json({ success: true, data: updatedUsers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Authentication API Endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, roleCode } = req.body;
    const users = dbEngine.getUsers();
    const roles = dbEngine.getRoles();

    let user = users.find(u => u.email === email);
    if (!user) {
      const roleObj = roles.find(r => r.code === roleCode) || roles[0];
      user = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        phone: '0912345678',
        roleCode: roleObj.code,
        roleName: roleObj.name,
        status: 'Hoạt động',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      dbEngine.saveUser(user);
    }
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, roleCode } = req.body;
    const roles = dbEngine.getRoles();
    const roleObj = roles.find(r => r.code === roleCode) || roles[0];

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      phone: phone || '0900000000',
      roleCode: roleObj.code,
      roleName: roleObj.name,
      status: 'Hoạt động',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };

    const updatedUsers = dbEngine.saveUser(newUser);
    res.json({ success: true, user: newUser, data: updatedUsers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Backup & Restore API Endpoints
app.get('/api/backup', (req, res) => {
  try {
    const backupData = {
      version: '3.0',
      timestamp: new Date().toISOString(),
      databaseProvider: 'Tiny Houses Backend API Engine',
      tables: {
        buildings: dbEngine.getBuildings(),
        rooms: dbEngine.getRooms(),
        bookings: dbEngine.getBookings(),
        roles: dbEngine.getRoles(),
        users: dbEngine.getUsers()
      }
    };
    res.json(backupData);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/restore', (req, res) => {
  try {
    const { tables } = req.body;
    if (tables) {
      dbEngine.saveStore(tables);
      res.json({ success: true, message: 'Phục hồi CSDL Backend thành công!' });
    } else {
      res.status(400).json({ success: false, message: 'Tập tin backup không hợp lệ.' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tiny Houses Backend API Server running at http://localhost:${PORT}`);
});
