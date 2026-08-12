// Data Service for local state & Backend API Server Realtime integration
import { INITIAL_BUILDINGS, INITIAL_ROOMS, INITIAL_BOOKINGS, INITIAL_CTVS, INITIAL_BLOGS } from '../data/mockData';
import { ApiClient } from './apiClient';

const STORAGE_KEYS = {
  BUILDINGS: 'tinyhouse_buildings_v4',
  ROOMS: 'tinyhouse_rooms_v4',
  BOOKINGS: 'tinyhouse_bookings_v4',
  CTVS: 'tinyhouse_ctvs_v4',
  BLOGS: 'tinyhouse_blogs_v4',
  ROLES: 'tinyhouse_roles_v4',
  USERS: 'tinyhouse_users_v4',
  CURRENT_USER: 'tinyhouse_current_user_v4',
};

// Initial Roles Definition
export const INITIAL_ROLES = [
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

// Initial Users Definition
export const INITIAL_USERS = [
  {
    id: "usr_tailinh_admin",
    name: "Tài Linh Lê Phạm",
    email: "tailinh@tinyhouse.vn",
    phone: "0988123456",
    roleCode: "admin",
    roleName: "Quản trị viên (Super Admin)",
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
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
  },
  {
    id: "usr_manager",
    name: "Trần Anh Quân",
    email: "quan.ta@tinyhouse.vn",
    phone: "0987654321",
    roleCode: "building_manager",
    roleName: "Quản lý Tòa nhà",
    status: "Hoạt động",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
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
        
        // Sync active user's role from live users array
        const activeUser = getStoredItem(STORAGE_KEYS.CURRENT_USER, null);
        if (activeUser) {
          const matchedUser = users.find(u => 
            (u.email && activeUser.email && u.email.toLowerCase() === activeUser.email.toLowerCase()) ||
            u.id === activeUser.id
          );
          if (matchedUser) {
            setStoredItem(STORAGE_KEYS.CURRENT_USER, matchedUser);
          }
        }
      }
    } catch (err) {
      console.warn('[DataService] fetchAllAsync failed, using cached storage:', err);
    }
  },

  // Buildings (Sorted default: highest vacant rooms first)
  getBuildings: () => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    return [...list].sort((a, b) => (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0));
  },
  
  getBuildingById: (id) => {
    const list = getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    if (!id) return list[0];
    return list.find(b => b.id === id || b.code === id || (b.code && b.code.toLowerCase() === String(id).toLowerCase())) || list[0];
  },

  saveBuilding: async (buildingData) => {
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
    
    // API POST to backend Express server
    const apiRes = await ApiClient.post('/buildings', buildingData);
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.BUILDINGS, apiRes);
    }
    return updated;
  },

  // Rooms
  getRooms: () => {
    return getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  },

  getRoomsByBuilding: (buildingId) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    return rooms.filter(r => r.buildingId === buildingId || r.buildingCode === buildingId);
  },

  getRoomById: (roomId) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    if (!roomId) return rooms[0];
    return rooms.find(r => r.id === roomId || r.id.includes(roomId)) || rooms[0];
  },

  saveRoom: async (roomData) => {
    const rooms = getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const index = rooms.findIndex(r => r.id === roomData.id);
    let updated;
    if (index >= 0) {
      updated = [...rooms];
      updated[index] = { ...updated[index], ...roomData };
    } else {
      updated = [...rooms, { ...roomData, id: roomData.id || `RM-${Date.now()}` }];
    }
    setStoredItem(STORAGE_KEYS.ROOMS, updated);

    // API POST to backend
    const apiRes = await ApiClient.post('/rooms', roomData);
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.ROOMS, apiRes);
    }
    return updated;
  },

  // Bookings (Viewing Appointments)
  getBookings: () => {
    return getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  createBooking: async (booking) => {
    const bookings = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const newBooking = {
      ...booking,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Chờ xác nhận',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newBooking, ...bookings];
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);

    // API POST to backend Express server
    const apiRes = await ApiClient.post('/bookings', booking);
    if (apiRes) {
      // Re-fetch fresh bookings from backend
      const freshBookings = await ApiClient.get('/bookings');
      if (freshBookings && Array.isArray(freshBookings)) {
        setStoredItem(STORAGE_KEYS.BOOKINGS, freshBookings);
      }
    }
    return newBooking;
  },

  updateBookingStatus: async (id, newStatus) => {
    const bookings = getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setStoredItem(STORAGE_KEYS.BOOKINGS, updated);

    // API PUT to backend Express server
    const apiRes = await ApiClient.put(`/bookings/${id}/status`, { status: newStatus });
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.BOOKINGS, apiRes);
    }
    return updated;
  },

  // CTVs
  getCTVs: () => getStoredItem(STORAGE_KEYS.CTVS, INITIAL_CTVS),

  // Blogs
  getBlogs: () => getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS),
  getBlogById: (id) => {
    const blogs = getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
    return blogs.find(b => b.id === id);
  },

  // Roles & Permissions Management
  getRoles: () => {
    return getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
  },
  
  saveRole: async (roleData) => {
    const roles = getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    const index = roles.findIndex(r => r.id === roleData.id || r.code === roleData.code);
    let updated;
    if (index >= 0) {
      updated = [...roles];
      updated[index] = { ...updated[index], ...roleData };
    } else {
      const newRole = {
        ...roleData,
        id: roleData.id || `role_${Date.now()}`,
        code: roleData.code || `role_${Date.now()}`,
      };
      updated = [...roles, newRole];
    }
    setStoredItem(STORAGE_KEYS.ROLES, updated);

    const apiRes = await ApiClient.post('/roles', roleData);
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.ROLES, apiRes);
    }
    return updated;
  },

  deleteRole: async (roleId) => {
    const roles = getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    const updated = roles.filter(r => r.id !== roleId && r.code !== roleId);
    setStoredItem(STORAGE_KEYS.ROLES, updated);

    const apiRes = await ApiClient.delete(`/roles/${roleId}`);
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.ROLES, apiRes);
    }
    return updated;
  },

  // Users Management
  getUsers: () => {
    return getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  saveUser: async (userData) => {
    const users = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === userData.id || u.email === userData.email);
    let updated;
    if (index >= 0) {
      updated = [...users];
      updated[index] = { ...updated[index], ...userData };
    } else {
      const newUser = {
        ...userData,
        id: userData.id || `usr_${Date.now()}`,
        status: userData.status || 'Hoạt động',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      };
      updated = [...users, newUser];
    }
    setStoredItem(STORAGE_KEYS.USERS, updated);

    const apiRes = await ApiClient.post('/users', userData);
    if (apiRes && Array.isArray(apiRes)) {
      setStoredItem(STORAGE_KEYS.USERS, apiRes);
    }
    return updated;
  },

  approveUserAccount: async (userId, action) => {
    const apiRes = await ApiClient.post('/users/approve', { userId, action });
    if (apiRes && apiRes.users) {
      setStoredItem(STORAGE_KEYS.USERS, apiRes.users);
      return apiRes;
    }
    const users = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = users.map(u => u.id === userId ? { ...u, status: action === 'approve' ? 'Hoạt động' : 'Từ chối' } : u);
    setStoredItem(STORAGE_KEYS.USERS, updated);
    return { success: true, users: updated };
  },

  // Authentication & Current User State
  getCurrentUser: () => getStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]),

  setCurrentUser: (user) => {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  logoutUser: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('tinyhouse_jwt');
    notifyListeners();
    return null;
  },

  // Backup & Restore
  exportFullBackup: () => {
    const backupData = {
      version: "3.0",
      timestamp: new Date().toISOString(),
      databaseProvider: "Tiny Houses Express & Supabase Cloud API Engine",
      tables: {
        buildings: getStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS),
        rooms: getStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS),
        bookings: getStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS),
        ctvs: getStoredItem(STORAGE_KEYS.CTVS, INITIAL_CTVS),
        blogs: getStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS),
        roles: getStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES),
        users: getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS),
      }
    };
    return backupData;
  },

  importBackupData: async (backupJson) => {
    try {
      if (backupJson && backupJson.tables) {
        if (backupJson.tables.buildings) setStoredItem(STORAGE_KEYS.BUILDINGS, backupJson.tables.buildings);
        if (backupJson.tables.rooms) setStoredItem(STORAGE_KEYS.ROOMS, backupJson.tables.rooms);
        if (backupJson.tables.bookings) setStoredItem(STORAGE_KEYS.BOOKINGS, backupJson.tables.bookings);
        if (backupJson.tables.ctvs) setStoredItem(STORAGE_KEYS.CTVS, backupJson.tables.ctvs);
        if (backupJson.tables.blogs) setStoredItem(STORAGE_KEYS.BLOGS, backupJson.tables.blogs);
        if (backupJson.tables.roles) setStoredItem(STORAGE_KEYS.ROLES, backupJson.tables.roles);
        if (backupJson.tables.users) setStoredItem(STORAGE_KEYS.USERS, backupJson.tables.users);
        await ApiClient.post('/restore', backupJson);
        return { success: true, message: "Phục hồi cơ sở dữ liệu Backend thành công!" };
      } else {
        return { success: false, message: "Định dạng tập tin sao lưu không hợp lệ." };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  resetToDefault: () => {
    setStoredItem(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    setStoredItem(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    setStoredItem(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setStoredItem(STORAGE_KEYS.CTVS, INITIAL_CTVS);
    setStoredItem(STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
    setStoredItem(STORAGE_KEYS.ROLES, INITIAL_ROLES);
    setStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
};
