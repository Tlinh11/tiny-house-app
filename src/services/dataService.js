// Data Service for local state & Backend API Server Realtime integration
import { INITIAL_BUILDINGS, INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_CTVS, INITIAL_BLOGS } from '../data/mockData';
import { ApiClient } from './apiClient';
import { getValidImageUrl, getRoomTypeNumbers } from '../utils/roomHierarchy';

const STORAGE_KEYS = {
  BUILDINGS: 'tinyhouse_db_buildings_v1',
  ROOMS: 'tinyhouse_db_rooms_v1',
  BOOKINGS: 'tinyhouse_db_bookings_v1',
  CTVS: 'tinyhouse_db_ctvs_v1',
  BLOGS: 'tinyhouse_db_blogs_v1',
  ROLES: 'tinyhouse_db_roles_v1',
  USERS: 'tinyhouse_db_users_v1',
  CURRENT_USER: 'tinyhouse_db_current_user_v1',
};

// Initial Roles Definition
export const INITIAL_ROLES = [
  {
    id: "role_admin",
    name: "Quản trị viên (Super Admin)",
    code: "admin",
    description: "Toàn quyền quản trị hệ thống, danh mục tòa nhà, phòng, lịch hẹn, CTV và Phân quyền",
    allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings', 'ctvs', 'permissions', 'database']
  },
  {
    id: "role_manager",
    name: "Quản lý Vận hành (Manager)",
    code: "manager",
    description: "Quản lý tòa nhà, phòng, lịch hẹn xem phòng của khách hàng và danh sách CTV",
    allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings', 'ctvs']
  },
  {
    id: "role_staff",
    name: "Nhân viên Vận hành / Lễ tân (Staff)",
    code: "staff",
    description: "Xem danh sách phòng trống, xem lịch hẹn xem phòng của khách hàng và theo dõi hoa hồng",
    allowedScreens: ['dashboard', 'rooms', 'bookings']
  },
  {
    id: "role_ctv",
    name: "Cộng tác viên (CTV Sale)",
    code: "ctv",
    description: "Màn hình riêng cho CTV: Đặt lịch xem phòng cho khách, xem hoa hồng và phòng trống khả dụng",
    allowedScreens: ['dashboard', 'rooms', 'bookings']
  }
];

// Initial Users
export const INITIAL_USERS = [
  {
    id: "usr_superadmin",
    name: "Super Admin",
    email: "admin@tinyhouse.vn",
    phone: "0988888888",
    roleCode: "admin",
    roleName: "Quản trị viên (Super Admin)",
    status: "Hoạt động",
    password: "admin"
  },
  {
    id: "usr_thuy_manager",
    name: "Thu Thủy - Quản lý",
    email: "thuthuy@tinyhouse.vn",
    phone: "0977112233",
    roleCode: "manager",
    roleName: "Quản lý Vận hành (Manager)",
    status: "Hoạt động",
    password: "123"
  },
  {
    id: "usr_huyen_host",
    name: "Ms. Huyền (Host TH0008)",
    email: "huyen.th0008@tinyhouse.vn",
    phone: "0386570401",
    roleCode: "staff",
    roleName: "Nhân viên Vận hành / Lễ tân (Staff)",
    status: "Hoạt động",
    password: "123"
  }
];

const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error('DataService listener error:', e); }
  });
};

const getStoredItem = (key, initialValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return initialValue;
  }
};

const setStoredItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

export const DataService = {
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Fetch all backend endpoints in parallel
  fetchAllAsync: async () => {
    try {
      const [buildings, rooms, bookings, roles, users] = await Promise.all([
        ApiClient.get('/buildings'),
        ApiClient.get('/rooms'),
        ApiClient.get('/bookings'),
        ApiClient.get('/roles'),
        ApiClient.get('/users')
      ]);

      if (buildings && Array.isArray(buildings) && buildings.length > 0) {
        setStoredItem(STORAGE_KEYS.BUILDINGS, buildings);
      }
      if (rooms && Array.isArray(rooms) && rooms.length > 0) {
        setStoredItem(STORAGE_KEYS.ROOMS, rooms);
      }
      if (bookings && Array.isArray(bookings)) {
        setStoredItem(STORAGE_KEYS.BOOKINGS, bookings);
      }
      if (roles && Array.isArray(roles) && roles.length > 0) {
        setStoredItem(STORAGE_KEYS.ROLES, roles);
      }
      if (users && Array.isArray(users) && users.length > 0) {
        setStoredItem(STORAGE_KEYS.USERS, users);
      }
    } catch (err) {
      console.warn('[DataService] fetchAllAsync warning:', err);
    }
  },

  // Force Sync directly from Supabase Backend
  syncFromSupabase: async () => {
    try {
      const [buildings, rooms] = await Promise.all([
        ApiClient.get('/buildings'),
        ApiClient.get('/rooms')
      ]);
      if (buildings && Array.isArray(buildings) && buildings.length > 0) {
        setStoredItem(STORAGE_KEYS.BUILDINGS, buildings);
      }
      if (rooms && Array.isArray(rooms) && rooms.length > 0) {
        setStoredItem(STORAGE_KEYS.ROOMS, rooms);
      }
      return { success: true, count: rooms?.length || 0 };
    } catch (e) {
      console.error('syncFromSupabase error:', e);
      return { success: false, error: e.message };
    }
  },

  // Buildings
  getBuildings: () => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    return [...list].sort((a, b) => (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0));
  },

  getBuildingById: (id) => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    if (!id) return list[0];
    return list.find(b => b.id === id || b.code === id || (b.code && b.code.toLowerCase() === String(id).toLowerCase())) || list[0];
  },

  saveBuilding: (buildingData) => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    const existingIndex = list.findIndex(b => b.id === buildingData.id || b.code === buildingData.code);
    let updated;
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...buildingData };
    } else {
      updated = [...list, { ...buildingData, id: buildingData.id || `BLD-${Date.now()}` }];
    }
    setStoredItem(STORAGE_KEYS.BUILDINGS, updated);
    
    // API POST to backend in background
    ApiClient.post('/buildings', buildingData).catch(err => console.warn('saveBuilding API:', err.message));
    return updated;
  },

  deleteBuilding: (buildingId) => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    const updated = list.filter(b => b.id !== buildingId && b.code !== buildingId);
    setStoredItem(STORAGE_KEYS.BUILDINGS, updated);
    ApiClient.delete(`/buildings/${buildingId}`).catch(err => console.warn('deleteBuilding API:', err.message));
    return updated;
  },

  // Rooms
  getRooms: () => {
    return getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  },

  getRoomsByBuilding: (buildingIdOrCode) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    if (!buildingIdOrCode) return rooms;
    const bId = typeof buildingIdOrCode === 'object' ? (buildingIdOrCode.id || buildingIdOrCode.code) : buildingIdOrCode;
    return rooms.filter(r => 
      r.buildingId === bId || 
      r.buildingCode === bId ||
      r.buildingName?.includes(bId)
    );
  },

  getRoomById: (roomId) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    if (!roomId) return rooms[0];
    return rooms.find(r => r.id === roomId || r.id.includes(roomId)) || rooms[0];
  },

  saveRoom: (roomData) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const specificRooms = getRoomTypeNumbers(roomData);

    const roomPayload = {
      ...roomData,
      id: roomData.id || `RM-${Date.now()}`,
      specificRooms: specificRooms,
      room_numbers: specificRooms,
      available_rooms: specificRooms.length,
      vacantCount: specificRooms.length,
      status: specificRooms.length > 0 ? (roomData.status || 'Có sẵn') : 'Hết phòng',
      roomNumber: specificRooms[0] || roomData.roomNumber || '101'
    };

    const index = rooms.findIndex(r => r.id === roomPayload.id);
    let updatedRooms;
    if (index >= 0) {
      updatedRooms = [...rooms];
      updatedRooms[index] = { ...updatedRooms[index], ...roomPayload };
    } else {
      updatedRooms = [...rooms, roomPayload];
    }
    setStoredItem(STORAGE_KEYS.ROOMS, updatedRooms);

    // Recalculate parent building's vacantRoomsCount
    const targetBuildingCode = roomPayload.buildingCode;
    if (targetBuildingCode) {
      const buildings = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
      const bIndex = buildings.findIndex(b => b.code === targetBuildingCode || b.id === targetBuildingCode);
      if (bIndex >= 0) {
        const bldRooms = updatedRooms.filter(r => r.buildingCode === targetBuildingCode || r.buildingId === targetBuildingCode);
        const totalVacantInBld = bldRooms.reduce((acc, r) => acc + (r.specificRooms?.length || 0), 0);
        buildings[bIndex] = { ...buildings[bIndex], vacantRoomsCount: totalVacantInBld };
        setStoredItem(STORAGE_KEYS.BUILDINGS, buildings);
      }
    }

    ApiClient.post('/rooms', roomPayload).catch(err => console.warn('saveRoom API:', err.message));
    return updatedRooms;
  },

  deleteRoom: (roomId) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const updated = rooms.filter(r => r.id !== roomId);
    setStoredItem(STORAGE_KEYS.ROOMS, updated);
    ApiClient.delete(`/rooms/${roomId}`).catch(err => console.warn('deleteRoom API:', err.message));
    return updated;
  },

  // Bookings
  getBookings: () => getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS),
  createBooking: (bookingData) => {
    const list = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const newBooking = {
      ...bookingData,
      id: `BK-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Chờ xác nhận'
    };
    const updated = [newBooking, ...list];
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    ApiClient.post('/bookings', newBooking).catch(err => console.warn('createBooking API:', err.message));
    return updated;
  },
  updateBookingStatus: (id, status) => {
    const list = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = list.map(b => b.id === id ? { ...b, status } : b);
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    return updated;
  },

  // Roles & Users
  getRoles: () => getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES),
  saveRole: (roleData) => {
    const list = getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    const index = list.findIndex(r => r.id === roleData.id || r.code === roleData.code);
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...roleData };
    } else {
      updated = [...list, { ...roleData, id: roleData.id || `role_${Date.now()}` }];
    }
    setStoredItem(STORAGE_KEYS.ROLES, updated);
    return updated;
  },
  deleteRole: (roleId) => {
    const list = getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    const updated = list.filter(r => r.id !== roleId && r.code !== roleId);
    setStoredItem(STORAGE_KEYS.ROLES, updated);
    return updated;
  },
  getUsers: () => getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUser: (userData) => {
    const list = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = list.findIndex(u => u.id === userData.id || (u.email && u.email === userData.email));
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...userData };
    } else {
      updated = [...list, { ...userData, id: userData.id || `usr_${Date.now()}` }];
    }
    setStoredItem(STORAGE_KEYS.USERS, updated);
    return updated;
  },
  deleteUser: (userId) => {
    const list = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = list.filter(u => u.id !== userId);
    setStoredItem(STORAGE_KEYS.USERS, updated);
    return updated;
  },
  getCurrentUser: () => getStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),
  setCurrentUser: (user) => setStoredItem(STORAGE_KEYS.CURRENT_USER, user),

  // CTVs
  getCTVs: () => getStoredItem(STORAGE_KEYS.CTVS, INITIAL_CTVS),

  // Blogs
  getBlogs: () => getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS)
};
