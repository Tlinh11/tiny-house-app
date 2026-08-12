import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(__dirname, '..', 'buildings_and_rooms.json');
const STORE_FILE_PATH = path.join(__dirname, 'dataStore.json');

// Initial setup from buildings_and_rooms.json
function loadRawBuildings() {
  try {
    const rawText = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(rawText);
  } catch (err) {
    console.error("Error reading raw buildings_and_rooms.json:", err);
    return [];
  }
}

// Lat/lng & District defaults for Hanoi
const LAT_LNG = {
  'DT006': { latitude: 21.0655, longitude: 105.8078 },
  'DT007': { latitude: 20.9575, longitude: 105.7952 },
  'TN008': { latitude: 21.0885, longitude: 105.7865 },
  'TN0016': { latitude: 21.0580, longitude: 105.8360 },
  'DT008': { latitude: 20.9820, longitude: 105.8150 },
  'DT004': { latitude: 21.0285, longitude: 105.7725 },
  'DT002': { latitude: 21.0185, longitude: 105.8365 },
  'DT003': { latitude: 21.0060, longitude: 105.8080 },
  'DT010': { latitude: 20.9850, longitude: 105.7875 },
  'TN004': { latitude: 20.9715, longitude: 105.7680 },
  'TN003': { latitude: 21.0105, longitude: 105.8085 },
  'DT005': { latitude: 21.0520, longitude: 105.8170 },
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
];

function transformInitialData() {
  const raw = loadRawBuildings();
  
  const buildings = raw.map((b, idx) => {
    const code = b.name || `BUILDING-${idx + 1}`;
    let minPrice = Infinity;
    let maxPrice = 0;
    let vacantRoomsCount = 0;
    let images = [];
    let roomNumbers = [];

    (b.room_types || []).forEach(rt => {
      if (rt.price && rt.price < minPrice) minPrice = rt.price;
      if (rt.price && rt.price > maxPrice) maxPrice = rt.price;
      vacantRoomsCount += (rt.available_rooms || 0);
      if (rt.images && rt.images.length) images.push(...rt.images);
      if (rt.room_numbers && rt.room_numbers.length) roomNumbers.push(...rt.room_numbers);
    });

    if (minPrice === Infinity) minPrice = 3500000;
    if (maxPrice === 0) maxPrice = minPrice + 1500000;

    return {
      id: b.id,
      code: code,
      name: `Tòa nhà ${code} - ${b.address}`,
      isTiny: b.owner_type === 'tiny',
      ownerType: b.owner_type,
      rating: 5.0,
      address: `${b.address}${b.ward ? ', ' + b.ward : ''}`,
      district: b.district || 'Hà Đông',
      city: b.province || 'Hà Nội',
      latitude: b.latitude || LAT_LNG[code]?.latitude || (21.0000 + idx * 0.005),
      longitude: b.longitude || LAT_LNG[code]?.longitude || (105.8000 + idx * 0.005),
      vacantRoomsCount: vacantRoomsCount,
      minPrice: minPrice,
      maxPrice: maxPrice,
      coverImage: images[0] || DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length],
      images: images.length ? images : DEFAULT_IMAGES,
      rooms: roomNumbers.length ? roomNumbers : ['101', '102', '201']
    };
  });

  // Sort default: vacant rooms highest -> lowest
  buildings.sort((a, b) => b.vacantRoomsCount - a.vacantRoomsCount);

  const rooms = [];
  raw.forEach(b => {
    (b.room_types || []).forEach(rt => {
      const roomNums = (rt.room_numbers && rt.room_numbers.length) ? rt.room_numbers : ['Phòng tiêu chuẩn'];
      roomNums.forEach(rNum => {
        rooms.push({
          id: `${b.id}-${rt.id}-${rNum}`,
          roomTypeId: rt.id,
          buildingId: b.id,
          buildingCode: b.name,
          buildingName: `Tòa nhà ${b.name}`,
          roomNumber: rNum,
          status: rt.available_rooms > 0 ? "Có sẵn" : "Đã thuê",
          price: rt.price || 3500000,
          type: rt.name || "Studio khép kín",
          area: rt.area || 25,
          maxOccupants: rt.max_occupants || 2,
          images: rt.images && rt.images.length ? rt.images : DEFAULT_IMAGES
        });
      });
    });
  });

  rooms.sort((a, _b) => (a.status === 'Có sẵn' ? -1 : 1));

  const roles = [
    {
      id: "role_admin",
      name: "Quản trị viên (Super Admin)",
      code: "admin",
      description: "Toàn quyền quản trị hệ thống, danh mục tòa nhà, phòng, lịch hẹn, CTV và Phân quyền",
      allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings', 'ctv', 'permissions', 'database']
    },
    {
      id: "role_manager",
      name: "Quản lý Tòa nhà",
      code: "building_manager",
      description: "Quản lý tòa nhà, danh sách phòng, cập nhật trạng thái trống và lịch xem phòng",
      allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings']
    },
    {
      id: "role_ctv",
      name: "Cộng tác viên Sale (CTV)",
      code: "ctv_sale",
      description: "Xem danh sách phòng trống, xem lịch hẹn xem phòng của khách hàng và theo dõi hoa hồng",
      allowedScreens: ['dashboard', 'rooms', 'bookings', 'ctv']
    },
    {
      id: "role_accountant",
      name: "Kế toán & Thu chi",
      code: "accountant",
      description: "Xem tổng quan doanh thu, bảng kê hoa hồng CTV và xuất dữ liệu",
      allowedScreens: ['dashboard', 'ctv', 'database']
    }
  ];

  const users = [
    {
      id: "usr_admin",
      name: "Đỗ Thảo Nguyên",
      email: "admin@tinyhouse.vn",
      phone: "0167423824",
      roleCode: "admin",
      roleName: "Quản trị viên (Super Admin)",
      status: "Hoạt động",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr_ctv_1",
      name: "Nguyễn Hoàng Nam",
      email: "nam.nh@gmail.com",
      phone: "0901112233",
      roleCode: "ctv_sale",
      roleName: "Cộng tác viên Sale (CTV)",
      status: "Hoạt động",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    }
  ];

  const bookings = [
    {
      id: "BK-8821",
      customerName: "Nguyễn Văn Hùng",
      phone: "0981234567",
      email: "hung.nv@gmail.com",
      buildingId: "bldg-1",
      buildingCode: "TN008",
      roomNumber: "201",
      appointmentDate: "2026-08-05",
      appointmentTime: "14:30",
      status: "Chờ xác nhận",
      notes: "Cần phòng tầng 2 ban công rộng"
    }
  ];

  return { buildings, rooms, roles, users, bookings };
}

class DbEngine {
  constructor() {
    this.store = this.loadStore();
  }

  loadStore() {
    if (fs.existsSync(STORE_FILE_PATH)) {
      try {
        const text = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
        return JSON.parse(text);
      } catch (e) {
        console.error("Error reading dataStore.json, regenerating...", e);
      }
    }
    const initial = transformInitialData();
    this.saveStore(initial);
    return initial;
  }

  saveStore(data = this.store) {
    try {
      this.store = data;
      fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Error writing dataStore.json:", e);
    }
  }

  // API Methods
  getBuildings() {
    return [...this.store.buildings].sort((a, b) => (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0));
  }

  saveBuilding(buildingData) {
    const list = [...this.store.buildings];
    const idx = list.findIndex(b => b.id === buildingData.id || b.code === buildingData.code);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...buildingData };
    } else {
      list.push({ ...buildingData, id: buildingData.id || `BLD-${Date.now()}` });
    }
    this.store.buildings = list;
    this.saveStore();
    return this.getBuildings();
  }

  getRooms() {
    return [...this.store.rooms].sort((a, _b) => (a.status === 'Có sẵn' ? -1 : 1));
  }

  saveRoom(roomData) {
    const list = [...this.store.rooms];
    const idx = list.findIndex(r => r.id === roomData.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...roomData };
    } else {
      list.push({ ...roomData, id: roomData.id || `RM-${Date.now()}` });
    }
    this.store.rooms = list;
    this.saveStore();
    return this.getRooms();
  }

  getBookings() {
    return this.store.bookings || [];
  }

  createBooking(booking) {
    const newBooking = {
      ...booking,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Chờ xác nhận',
      createdAt: new Date().toISOString()
    };
    this.store.bookings = [newBooking, ...(this.store.bookings || [])];
    this.saveStore();
    return newBooking;
  }

  updateBookingStatus(id, status) {
    this.store.bookings = (this.store.bookings || []).map(b => b.id === id ? { ...b, status } : b);
    this.saveStore();
    return this.store.bookings;
  }

  getRoles() {
    return this.store.roles || [];
  }

  saveRole(roleData) {
    const list = [...(this.store.roles || [])];
    const idx = list.findIndex(r => r.id === roleData.id || r.code === roleData.code);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...roleData };
    } else {
      list.push({
        ...roleData,
        id: roleData.id || `role_${Date.now()}`,
        code: roleData.code || `role_${Date.now()}`
      });
    }
    this.store.roles = list;
    this.saveStore();
    return list;
  }

  deleteRole(roleId) {
    this.store.roles = (this.store.roles || []).filter(r => r.id !== roleId && r.code !== roleId);
    this.saveStore();
    return this.store.roles;
  }

  getUsers() {
    return this.store.users || [];
  }

  saveUser(userData) {
    const list = [...(this.store.users || [])];
    const idx = list.findIndex(u => u.id === userData.id || u.email === userData.email);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...userData };
    } else {
      list.push({
        ...userData,
        id: userData.id || `usr_${Date.now()}`,
        status: userData.status || 'Hoạt động',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
    }
    this.store.users = list;
    this.saveStore();
    return list;
  }
}

export const dbEngine = new DbEngine();
