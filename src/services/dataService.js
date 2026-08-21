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

const _memoryStore = {
  [STORAGE_KEYS.BUILDINGS]: INITIAL_BUILDINGS,
  [STORAGE_KEYS.ROOMS]: INITIAL_ROOMS,
  [STORAGE_KEYS.BOOKINGS]: INITIAL_BOOKINGS,
  [STORAGE_KEYS.ROLES]: INITIAL_ROLES,
  [STORAGE_KEYS.USERS]: INITIAL_USERS,
  [STORAGE_KEYS.CURRENT_USER]: null,
  [STORAGE_KEYS.CTVS]: INITIAL_CTVS,
  [STORAGE_KEYS.BLOGS]: INITIAL_BLOGS
};

// Initialize memory store from localStorage once on boot if valid
Object.keys(_memoryStore).forEach(key => {
  try {
    const raw = localStorage.getItem(key);
    if (raw && raw !== 'null' && raw !== 'undefined') {
      const parsed = JSON.parse(raw);
      if (parsed) _memoryStore[key] = parsed;
    }
  } catch {
    // Keep in-memory default
  }
});

const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error('DataService listener error:', e); }
  });
};

const getStoredItem = (key, initialValue) => {
  if (_memoryStore[key] !== undefined && _memoryStore[key] !== null) {
    return _memoryStore[key];
  }
  return initialValue;
};

const setStoredItem = (key, value) => {
  _memoryStore[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gracefully handle LocalStorage QuotaExceededError - _memoryStore is 100% active and accurate
  }
  notifyListeners();
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
    const buildings = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    const targetBld = buildings.find(b => b.id === buildingId || b.code === buildingId);
    const updatedBuildings = buildings.filter(b => b.id !== buildingId && b.code !== buildingId);
    setStoredItem(STORAGE_KEYS.BUILDINGS, updatedBuildings);

    // Also remove child rooms belonging to this building
    const bCode = targetBld ? (targetBld.code || targetBld.id) : buildingId;
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const updatedRooms = rooms.filter(r => r.buildingCode !== bCode && r.buildingId !== bCode && r.buildingId !== buildingId && r.buildingCode !== buildingId);
    setStoredItem(STORAGE_KEYS.ROOMS, updatedRooms);

    ApiClient.delete(`/buildings/${buildingId}`).catch(err => console.warn('deleteBuilding API:', err.message));
    return updatedBuildings;
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
    const targetRoom = rooms.find(r => r.id === roomId || r.roomTypeId === roomId);
    const updatedRooms = rooms.filter(r => r.id !== roomId && r.roomTypeId !== roomId);
    setStoredItem(STORAGE_KEYS.ROOMS, updatedRooms);

    // Recalculate parent building vacant count
    if (targetRoom && (targetRoom.buildingCode || targetRoom.buildingId)) {
      const bCode = targetRoom.buildingCode || targetRoom.buildingId;
      const buildings = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
      const bIndex = buildings.findIndex(b => b.code === bCode || b.id === bCode);
      if (bIndex >= 0) {
        const bldRooms = updatedRooms.filter(r => r.buildingCode === bCode || r.buildingId === bCode);
        const totalVacantInBld = bldRooms.reduce((acc, r) => acc + (r.specificRooms?.length || 0), 0);
        buildings[bIndex] = { ...buildings[bIndex], vacantRoomsCount: totalVacantInBld };
        setStoredItem(STORAGE_KEYS.BUILDINGS, buildings);
      }
    }

    ApiClient.delete(`/rooms/${roomId}`).catch(err => console.warn('deleteRoom API:', err.message));
    return updatedRooms;
  },

  // Bookings
  getBookings: () => getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS),
  createBooking: async (bookingData) => {
    const list = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const newBooking = {
      ...bookingData,
      id: `BK-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Chờ xác nhận'
    };
    const updated = [newBooking, ...list];
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    try {
      const res = await ApiClient.post('/bookings', newBooking);
      if (res && res.id) {
        newBooking.id = res.id;
      }
    } catch (err) {
      console.warn('createBooking API:', err.message);
    }
    return { success: true, booking: newBooking, list: updated };
  },
  updateBookingStatus: (id, status) => {
    const list = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = list.map(b => b.id === id ? { ...b, status } : b);
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    ApiClient.patch(`/bookings/${id}/status`, { status }).catch(err => console.warn('updateBookingStatus API:', err.message));
    return updated;
  },
  deleteBooking: (bookingId) => {
    const list = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = list.filter(b => b.id !== bookingId);
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);
    ApiClient.delete(`/bookings/${bookingId}`).catch(err => console.warn('deleteBooking API:', err.message));
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
    ApiClient.post('/roles', roleData).catch(err => console.warn('saveRole API:', err.message));
    return updated;
  },
  deleteRole: (roleId) => {
    const list = getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    const updated = list.filter(r => r.id !== roleId && r.code !== roleId);
    setStoredItem(STORAGE_KEYS.ROLES, updated);
    ApiClient.delete(`/roles/${roleId}`).catch(err => console.warn('deleteRole API:', err.message));
    return updated;
  },
  getUsers: () => getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUser: (userData) => {
    const list = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const userToSave = {
      ...userData,
      id: userData.id || `usr_${Date.now()}`
    };
    const index = list.findIndex(u => u.id === userToSave.id || (u.email && u.email === userToSave.email));
    let updated;
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...updated[index], ...userToSave };
    } else {
      updated = [...list, userToSave];
    }
    setStoredItem(STORAGE_KEYS.USERS, updated);
    ApiClient.post('/users', userToSave).catch(err => console.warn('saveUser API:', err.message));
    return updated;
  },
  deleteUser: (userId) => {
    const list = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = list.filter(u => u.id !== userId);
    setStoredItem(STORAGE_KEYS.USERS, updated);
    ApiClient.delete(`/users/${userId}`).catch(err => console.warn('deleteUser API:', err.message));
    return updated;
  },
  getCurrentUser: () => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!item || item === 'null' || item === 'undefined') return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  },
  setCurrentUser: (user) => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      ApiClient.removeToken();
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    notifyListeners();
  },
  logoutUser: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    ApiClient.removeToken();
    notifyListeners();
  },

  // CTVs
  getCTVs: () => getStoredItem(STORAGE_KEYS.CTVS, INITIAL_CTVS),

  // Blogs
  getBlogs: () => getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS),

  // Full System Backup Export (JSON with metadata)
  exportFullBackup: () => {
    const buildings = DataService.getBuildings();
    const rooms = DataService.getRooms();
    const bookings = DataService.getBookings();
    const ctvs = DataService.getCTVs();
    const roles = DataService.getRoles();
    const users = DataService.getUsers();

    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      databaseEngine: 'Supabase PostgreSQL Cloud',
      metadata: {
        totalBuildings: buildings.length,
        totalRoomTypes: rooms.length,
        totalBookings: bookings.length,
        totalUsers: users.length,
        totalRoles: roles.length
      },
      data: {
        buildings,
        rooms,
        bookings,
        ctvs,
        roles,
        users
      }
    };
  },

  // Full System Restore from JSON Backup
  importBackupData: (backupPayload) => {
    try {
      if (!backupPayload || typeof backupPayload !== 'object') {
        return { success: false, message: 'Tệp sao lưu không hợp lệ.' };
      }

      const data = backupPayload.data || backupPayload;

      if (data.buildings && Array.isArray(data.buildings)) {
        setStoredItem(STORAGE_KEYS.BUILDINGS, data.buildings);
      }
      if (data.rooms && Array.isArray(data.rooms)) {
        setStoredItem(STORAGE_KEYS.ROOMS, data.rooms);
      }
      if (data.bookings && Array.isArray(data.bookings)) {
        setStoredItem(STORAGE_KEYS.BOOKINGS, data.bookings);
      }
      if (data.roles && Array.isArray(data.roles)) {
        setStoredItem(STORAGE_KEYS.ROLES, data.roles);
      }
      if (data.users && Array.isArray(data.users)) {
        setStoredItem(STORAGE_KEYS.USERS, data.users);
      }

      return {
        success: true,
        message: 'Khôi phục toàn bộ cơ sở dữ liệu thành công!',
        counts: {
          buildings: data.buildings?.length || 0,
          rooms: data.rooms?.length || 0,
          bookings: data.bookings?.length || 0
        }
      };
    } catch (e) {
      return { success: false, message: `Lỗi khôi phục: ${e.message}` };
    }
  },

  // Database Connection Metrics & Statistics
  getDatabaseStats: () => {
    const buildings = DataService.getBuildings();
    const rooms = DataService.getRooms();
    const bookings = DataService.getBookings();
    const users = DataService.getUsers();
    const roles = DataService.getRoles();

    return {
      connected: true,
      provider: 'Supabase Cloud (PostgreSQL)',
      endpoint: 'https://dqwgponeoibhpcslqlgd.supabase.co',
      tables: [
        { name: 'buildings', label: 'Tòa nhà (Buildings)', count: buildings.length, icon: '🏢' },
        { name: 'rooms', label: 'Loại phòng & Mã phòng (Rooms)', count: rooms.length, icon: '🛏️' },
        { name: 'bookings', label: 'Lịch hẹn xem phòng (Bookings)', count: bookings.length, icon: '📅' },
        { name: 'users', label: 'Tài khoản người dùng (Users)', count: users.length, icon: '👤' },
        { name: 'roles', label: 'Phân quyền vai trò (Roles)', count: roles.length, icon: '🔑' }
      ]
    };
  }
};
