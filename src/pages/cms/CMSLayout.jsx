import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Home, Calendar, Users, FileText, Settings, Download, Upload, 
  RefreshCw, CheckCircle2, ShieldCheck, Plus, Edit, Trash2, ShieldAlert, LogOut, X, ArrowUpDown, Clock, Search, Menu, Sparkles
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import { ApiClient } from '../../services/apiClient';
import Pagination from '../../components/Pagination';
import Logo from '../../components/Logo';
import MultiImageUploader from '../../components/MultiImageUploader';
import BuildingLocationPicker from '../../components/BuildingLocationPicker';
import RoomDetailsForm from '../../components/RoomDetailsForm';
import SpecificRoomsSection from '../../components/SpecificRoomsSection';
import { getRoomTypeNumbers, getRoomTypeVacantCount, getBuildingVacantCount, getValidImageUrl } from '../../utils/roomHierarchy';

export default function CMSLayout({ setActiveTab, currentUser, setCurrentUser, onLogout, onOpenAuthModal }) {
  // If not logged in, show access restriction screen
  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: 40,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #F1F5F9'
        }}>
          <div style={{
            width: 72,
            height: 72,
            background: '#FFF7ED',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <ShieldAlert size={36} color="#E8920A" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>
            Yêu cầu Đăng nhập Quản trị
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
            Khu vực Quản trị CMS chỉ dành riêng cho Quản trị viên và Nhân viên có tài khoản được cấp quyền. Vui lòng đăng nhập để tiếp tục.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '10px 20px', fontWeight: 700 }} 
              onClick={() => setActiveTab('home')}
            >
              ← Về Trang chủ
            </button>
            <button 
              className="btn btn-primary" 
              style={{ padding: '10px 24px', fontWeight: 800 }} 
              onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
            >
              Đăng nhập tài khoản
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [activeCmsSection, setActiveCmsSection] = useState('dashboard');

  const [notification, setNotification] = useState('');
  const [permSubTab, setPermSubTab] = useState('pending'); // 'roles', 'users', 'pending'

  // Sorting State
  const [buildingSortBy, setBuildingSortBy] = useState('vacant-desc');
  const [roomSortBy, setRoomSortBy] = useState('status');

  // Pagination State
  const [buildingPage, setBuildingPage] = useState(1);
  const [buildingPerPage, setBuildingPerPage] = useState(10);

  const [roomPage, setRoomPage] = useState(1);
  const [roomPerPage, setRoomPerPage] = useState(10);

  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPerPage, setBookingPerPage] = useState(10);

  const [ctvPage, setCtvPage] = useState(1);
  const [ctvPerPage, setCtvPerPage] = useState(10);

  const [userPage, setUserPage] = useState(1);
  const [userPerPage, setUserPerPage] = useState(10);

  // Local Data State
  const [buildings, setBuildings] = useState(() => DataService.getBuildings());
  const [rooms, setRooms] = useState(() => DataService.getRooms());
  const [bookings, setBookings] = useState(() => DataService.getBookings());
  const [ctvs, setCtvs] = useState(() => DataService.getCTVs());
  const [roles, setRoles] = useState(() => DataService.getRoles());
  const [usersList, setUsersList] = useState(() => DataService.getUsers());

  // Subscribe to DataService live backend state updates
  useEffect(() => {
    const refreshAll = () => {
      setBuildings(DataService.getBuildings());
      setRooms(DataService.getRooms());
      setBookings(DataService.getBookings());
      setCtvs(DataService.getCTVs());
      setRoles(DataService.getRoles());
      setUsersList(DataService.getUsers());
    };
    refreshAll();
    const unsubscribe = DataService.subscribe(refreshAll);
    return () => unsubscribe();
  }, []);

  // Building Modal Tab & Form State
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [buildingTab, setBuildingTab] = useState('basic');
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    code: '',
    name: '',
    address: '',
    district: 'Hà Đông',
    latitude: 20.9715,
    longitude: 105.7780,
    minPrice: 3500000,
    maxPrice: 6500000,
    isTiny: true,
    ownerType: 'tiny',
    vacantRoomsCount: 5,
    coverImage: '',
    images: [],
    hostName: 'Đỗ Thảo Nguyên',
    hostPhone: '0167423824',
    hostEmail: 'minhxuyen88@gmail.com',
    amenitiesPccc: ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy'],
    amenitiesBuilding: ['Thang máy', 'Camera an ninh', 'Khóa vân tay', 'Máy giặt chung']
  });

  // Room Modal Tab & Form State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomTab, setRoomTab] = useState('basic');
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    buildingCode: 'TN008',
    roomNumber: '101',
    type: 'Studio khép kín',
    price: 3500000,
    area: 25,
    maxOccupants: 2,
    availableFrom: 'Ở ngay',
    status: 'Có sẵn',
    coverImage: '',
    images: [],
    amenitiesFurniture: ['Điều hòa', 'Nóng lạnh', 'Giường', 'Tủ quần áo', 'Tủ bếp trên', 'Tủ bếp dưới'],
    amenitiesPrivate: ['Wifi từng phòng', 'Khóa vân tay', 'Ban công']
  });

  // Role Form Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    code: '',
    description: '',
    allowedScreens: ['dashboard', 'rooms', 'bookings']
  });

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: '', // 'building' | 'room'
    id: '',
    name: '',
    subText: ''
  });

  // User Form Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleCode: 'ctv_sale'
  });

  // Reset / Change Password Modal State
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPassUser, setResetPassUser] = useState(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [showPassText, setShowPassText] = useState(true);

  // Responsive Drawer Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Building & Room Search States
  const [buildingSearchQuery, setBuildingSearchQuery] = useState('');
  const [selectedBuildingForRooms, setSelectedBuildingForRooms] = useState('');
  const [buildingSearchInRooms, setBuildingSearchInRooms] = useState('');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  const generateRandomPassword = (length = 8) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenAddUser = () => {
    setUserForm({
      name: '',
      email: '',
      phone: '',
      password: generateRandomPassword(8),
      roleCode: roles[0]?.code || 'ctv_sale'
    });
    setShowUserModal(true);
  };

  const handleOpenResetPassword = (user) => {
    setResetPassUser(user);
    setResetPasswordVal(generateRandomPassword(8));
    setShowPassText(true);
    setShowResetPasswordModal(true);
  };

  const handleCopyText = (text, msg) => {
    navigator.clipboard.writeText(text);
    showToast(msg || "📋 Đã sao chép mật khẩu vào bộ nhớ tạm!");
  };

  const availableCmsScreens = [
    { code: 'dashboard', label: '📊 Tổng quan hệ thống', desc: 'Thống kê tổng quan doanh thu & phòng' },
    { code: 'buildings', label: '🏢 Quản lý Tòa nhà', desc: 'Thêm/sửa danh mục 19+ tòa nhà Tiny & Đối tác' },
    { code: 'rooms', label: '🏠 Quản lý Phòng', desc: 'Cập nhật loại phòng, diện tích, giá và tiện nghi' },
    { code: 'bookings', label: '📅 Lịch xem phòng', desc: 'Tiếp nhận & xác nhận lịch hẹn của khách' },
    { code: 'ctv', label: '👥 Quản lý CTV & Hoa hồng', desc: 'Theo dõi hợp tác sale & tính hoa hồng' },
    { code: 'permissions', label: '🔐 Phân quyền & Role', desc: 'Tạo vai trò role & gán màn hình được xem' },
    { code: 'database', label: '💾 Backup & Database', desc: 'Xuất/Nhập dữ liệu sao lưu JSON' },
  ];

  const pcccOptions = ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy', 'Chuông báo cháy', 'Báo khói', 'Cửa chống cháy', 'Mặt nạ phòng độc'];
  const buildingAmenityOptions = ['Thang máy', 'Camera an ninh', 'Khóa vân tay', 'Máy giặt chung', 'Bãi xe điện', 'Sân phơi đồ', 'Thẻ từ thang máy'];
  const furnitureOptions = ['Điều hòa', 'Nóng lạnh', 'Giường nệm', 'Tủ quần áo', 'Tủ bếp trên', 'Tủ bếp dưới', 'Tủ lạnh', 'Sofa', 'Hút mùi'];

  // Active User Profile
  const allScreenCodes = availableCmsScreens.map(s => s.code);
  const activeUser = currentUser || usersList[0] || { name: 'Super Admin', roleCode: 'admin', roleName: 'Quản trị viên' };
  const userRoleObj = roles.find(r => r.code === activeUser?.roleCode || r.name === activeUser?.roleName) || roles[0];
  const allowedScreens = (userRoleObj && Array.isArray(userRoleObj.allowedScreens) && userRoleObj.allowedScreens.length > 0)
    ? userRoleObj.allowedScreens
    : (userRoleObj && Array.isArray(userRoleObj.allowed_screens) && userRoleObj.allowed_screens.length > 0)
      ? userRoleObj.allowed_screens
      : allScreenCodes;

  const pendingUsers = usersList.filter(u => u.status === 'Chờ duyệt');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Process sorted buildings with search filter
  const filteredCmsBuildings = buildings.filter(b => {
    if (!buildingSearchQuery) return true;
    const q = buildingSearchQuery.toLowerCase().trim();
    return (
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.address && b.address.toLowerCase().includes(q)) ||
      (b.district && b.district.toLowerCase().includes(q))
    );
  });

  const sortedBuildings = [...filteredCmsBuildings].sort((a, b) => {
    if (buildingSortBy === 'vacant-desc') return (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0);
    if (buildingSortBy === 'vacant-asc') return (a.vacantRoomsCount || 0) - (b.vacantRoomsCount || 0);
    if (buildingSortBy === 'price-asc') return (a.minPrice || 0) - (b.minPrice || 0);
    if (buildingSortBy === 'price-desc') return (b.minPrice || 0) - (a.minPrice || 0);
    if (buildingSortBy === 'code') return a.code.localeCompare(b.code);
    return 0;
  });

  const paginatedBuildings = sortedBuildings.slice((buildingPage - 1) * buildingPerPage, buildingPage * buildingPerPage);

  // Process sorted rooms
  const sortedRooms = [...rooms].sort((a, b) => {
    if (roomSortBy === 'status') return (a.status === 'Có sẵn' ? -1 : 1);
    if (roomSortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (roomSortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  const paginatedRooms = sortedRooms.slice((roomPage - 1) * roomPerPage, roomPage * roomPerPage);
  const paginatedBookings = bookings.slice((bookingPage - 1) * bookingPerPage, bookingPage * bookingPerPage);
  const paginatedCtvs = ctvs.slice((ctvPage - 1) * ctvPerPage, ctvPage * ctvPerPage);
  const paginatedUsers = usersList.slice((userPage - 1) * userPerPage, userPage * userPerPage);

  // Admin Account Approval Handler
  const handleApproveAccount = async (userId, userName, action) => {
    try {
      const res = await ApiClient.post('/users/approve', { userId, action });
      const updatedList = usersList.map(u => {
        if (u.id === userId) {
          return { ...u, status: action === 'approve' ? 'Hoạt động' : 'Từ chối' };
        }
        return u;
      });
      DataService.saveUser(updatedList.find(u => u.id === userId));
      setUsersList(updatedList);

      if (action === 'approve') {
        const emailNote = res?.emailSent ? ' ✉️ Email kích hoạt đã gửi!' : res?.emailSkipped ? ' (Email SMTP chưa cấu hình, nhớ báo CTV thủ công)' : '';
        showToast(`✅ Đã phê duyệt kích hoạt tài khoản ${userName}!${emailNote}`);
      } else {
        showToast(`❌ Đã từ chối tài khoản ${userName}.`);
      }
    } catch (err) {
      console.error("Approve user error:", err);
      showToast('⚠️ Lỗi khi xử lý yêu cầu. Vui lòng thử lại.');
    }
  };

  // Building Detailed Modal Handlers
  const handleOpenBuildingModal = (bldg = null) => {
    setBuildingTab('basic');
    if (bldg) {
      setEditingBuilding(bldg);
      setBuildingForm({
        code: bldg.code,
        name: bldg.name,
        address: bldg.address,
        city: bldg.city || 'Hà Nội',
        district: bldg.district || 'Hà Đông',
        ward: bldg.ward || '',
        latitude: bldg.latitude || 20.9715,
        longitude: bldg.longitude || 105.7780,
        minPrice: bldg.minPrice || 3500000,
        maxPrice: bldg.maxPrice || 6500000,
        isTiny: bldg.isTiny,
        ownerType: bldg.ownerType || (bldg.isTiny ? 'tiny' : 'partner'),
        vacantRoomsCount: bldg.vacantRoomsCount || 5,
        coverImage: bldg.coverImage || '',
        images: bldg.images && bldg.images.length ? bldg.images : (bldg.coverImage ? [bldg.coverImage] : []),
        hostName: bldg.host?.name || 'Đỗ Thảo Nguyên',
        hostPhone: bldg.host?.phone || '0167423824',
        hostEmail: bldg.host?.email || 'minhxuyen88@gmail.com',
        amenitiesPccc: bldg.amenitiesPccc || ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy'],
        amenitiesBuilding: bldg.amenitiesBuilding || ['Thang máy', 'Camera an ninh', 'Khóa vân tay']
      });
    } else {
      setEditingBuilding(null);
      setBuildingForm({
        code: `TN${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        address: '',
        city: 'Hà Nội',
        district: 'Nam Từ Liêm',
        ward: 'Phường Đại Mỗ',
        latitude: 21.0125,
        longitude: 105.7650,
        minPrice: 3500000,
        maxPrice: 6500000,
        isTiny: true,
        ownerType: 'partner',
        vacantRoomsCount: 5,
        coverImage: '',
        images: [],
        hostName: 'Đỗ Thảo Nguyên',
        hostPhone: '0167423824',
        hostEmail: 'minhxuyen88@gmail.com',
        amenitiesPccc: ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy'],
        amenitiesBuilding: ['Thang máy', 'Camera an ninh', 'Khóa vân tay']
      });
    }
    setShowBuildingModal(true);
  };

  const handleTogglePccc = (item) => {
    const list = buildingForm.amenitiesPccc || [];
    if (list.includes(item)) {
      setBuildingForm({ ...buildingForm, amenitiesPccc: list.filter(i => i !== item) });
    } else {
      setBuildingForm({ ...buildingForm, amenitiesPccc: [...list, item] });
    }
  };

  const handleToggleBuildingAmenity = (item) => {
    const list = buildingForm.amenitiesBuilding || [];
    if (list.includes(item)) {
      setBuildingForm({ ...buildingForm, amenitiesBuilding: list.filter(i => i !== item) });
    } else {
      setBuildingForm({ ...buildingForm, amenitiesBuilding: [...list, item] });
    }
  };

  const handleSaveBuildingSubmit = (e) => {
    e.preventDefault();
    const buildingImages = buildingForm.images && buildingForm.images.length ? buildingForm.images : (buildingForm.coverImage ? [buildingForm.coverImage] : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']);
    const cover = buildingImages[0];

    const updated = DataService.saveBuilding({
      id: editingBuilding ? editingBuilding.id : `bldg_${Date.now()}`,
      code: buildingForm.code,
      name: buildingForm.name || `Tòa nhà ${buildingForm.code} - ${buildingForm.address}`,
      address: buildingForm.address,
      city: buildingForm.city || 'Hà Nội',
      district: buildingForm.district,
      ward: buildingForm.ward || '',
      latitude: Number(buildingForm.latitude),
      longitude: Number(buildingForm.longitude),
      minPrice: Number(buildingForm.minPrice),
      maxPrice: Number(buildingForm.maxPrice),
      isTiny: buildingForm.ownerType === 'tiny',
      ownerType: buildingForm.ownerType,
      vacantRoomsCount: Number(buildingForm.vacantRoomsCount),
      coverImage: cover,
      images: buildingImages,
      host: {
        name: buildingForm.hostName,
        phone: buildingForm.hostPhone,
        email: buildingForm.hostEmail
      },
      amenitiesPccc: buildingForm.amenitiesPccc,
      amenitiesBuilding: buildingForm.amenitiesBuilding
    });

    setBuildings(updated);
    setShowBuildingModal(false);
    showToast(editingBuilding ? `Đã cập nhật Tòa nhà ${buildingForm.code}` : `Thêm Tòa nhà mới ${buildingForm.code} thành công!`);
  };

  // Quick Update Vacant Rooms Count & Quick Delete Handler
  const handleQuickUpdateRoomVacant = (room, delta) => {
    const currentVacant = room.vacantCount ?? (room.specificRooms && room.specificRooms.length ? room.specificRooms.length : (room.status === 'Có sẵn' ? 1 : 0));
    const newVacant = Math.max(0, currentVacant + delta);
    const newStatus = newVacant > 0 ? 'Có sẵn' : 'Đã thuê';

    let updatedSpecificRooms = room.specificRooms ? [...room.specificRooms] : [room.roomNumber];
    if (delta > 0) {
      const nextIndex = updatedSpecificRooms.length + 1;
      const baseCode = room.roomNumber || '101';
      const cleanCode = baseCode.replace(/[^0-9]/g, '') || '101';
      const nextCode = `P${parseInt(cleanCode) + nextIndex - 1}`;
      if (!updatedSpecificRooms.includes(nextCode)) {
        updatedSpecificRooms.push(nextCode);
      } else {
        updatedSpecificRooms.push(`P${parseInt(cleanCode) + Math.floor(Math.random() * 89 + 10)}`);
      }
    } else if (delta < 0 && updatedSpecificRooms.length > 0) {
      updatedSpecificRooms.pop();
    }

    const updatedRoom = {
      ...room,
      specificRooms: updatedSpecificRooms,
      vacantCount: updatedSpecificRooms.length,
      status: updatedSpecificRooms.length > 0 ? 'Có sẵn' : 'Đã thuê'
    };

    const freshRooms = DataService.saveRoom(updatedRoom);
    setRooms(freshRooms);

    // Also update Building vacantRoomsCount
    const targetBld = buildings.find(b => b.code === room.buildingCode || b.id === room.buildingId);
    if (targetBld) {
      const bldRooms = freshRooms.filter(r => r.buildingCode === targetBld.code || r.buildingId === targetBld.id);
      const totalVacantInBld = bldRooms.reduce((acc, r) => {
        const rVacant = r.specificRooms && r.specificRooms.length ? r.specificRooms.length : (r.status === 'Có sẵn' ? 1 : 0);
        return acc + rVacant;
      }, 0);

      const updatedBld = { ...targetBld, vacantRoomsCount: totalVacantInBld };
      const freshBuildings = DataService.saveBuilding(updatedBld);
      setBuildings(freshBuildings);
    }

    showToast(`✅ Đã cập nhật số lượng phòng trống Căn ${room.roomNumber}: ${updatedRoom.vacantCount} phòng (${updatedRoom.status})`);
  };

  const handleDeleteRoom = (roomId, roomNumber) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Căn ${roomNumber}?`)) {
      const updatedRooms = rooms.filter(r => r.id !== roomId);
      setRooms(updatedRooms);
      showToast(`❌ Đã xóa Căn ${roomNumber}.`);
    }
  };

  // Room Detailed Modal Handlers
  const handleOpenRoomModal = (rm = null) => {
    setRoomTab('basic');
    if (rm) {
      setEditingRoom(rm);
      const existingRooms = getRoomTypeNumbers(rm);

      setRoomForm({
        buildingCode: rm.buildingCode,
        roomNumber: existingRooms[0] || rm.roomNumber || '501',
        type: rm.type || 'Studio khép kín',
        price: rm.price || 3500000,
        area: rm.area || 25,
        maxOccupants: rm.maxOccupants || 2,
        availableFrom: rm.availableFrom || 'Ở ngay',
        status: rm.status || 'Có sẵn',
        coverImage: rm.images && rm.images.length ? rm.images[0] : '',
        images: rm.images && rm.images.length ? rm.images : [],
        specificRooms: existingRooms,
        hostName: rm.host?.name || 'Ms. Huyền',
        hostPhone: rm.host?.phone || '0386570401',
        hostEmail: rm.host?.email || 'tinyhouse.info@gmail.com',
        description: rm.description || '✨ Căn hộ cao cấp phong cách Hiện Đại – Đỉnh cao tinh tế & Tiện nghi đẳng cấp!',
        amenitiesNoiThat: rm.amenitiesNoiThat || ['Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Rèm cửa'],
        amenitiesRieng: rm.amenitiesRieng || ['Wifi từng phòng', 'App hệ sinh thái cư dân'],
        amenitiesChung: rm.amenitiesChung || ['Thang máy', 'Sân phơi'],
        amenitiesAnNinh: rm.amenitiesAnNinh || ['Khóa vân tay', 'Camera an ninh'],
        amenitiesPccc: rm.amenitiesPccc || ['Sprinkler', 'Báo cháy', 'Thang thoát hiểm', 'Bình cứu hỏa']
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        buildingCode: selectedBuildingForRooms || buildings[0]?.code || 'TN008',
        roomNumber: '501',
        type: 'Studio khép kín',
        price: 3500000,
        area: 25,
        maxOccupants: 2,
        availableFrom: 'Ở ngay',
        status: 'Có sẵn',
        coverImage: '',
        images: [],
        specificRooms: ['501', '502', '503', '504'],
        hostName: 'Ms. Huyền',
        hostPhone: '0386570401',
        hostEmail: 'tinyhouse.info@gmail.com',
        description: '✨ Căn hộ cao cấp phong cách Hiện Đại – Đỉnh cao tinh tế & Tiện nghi đẳng cấp!',
        amenitiesNoiThat: ['Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Rèm cửa'],
        amenitiesRieng: ['Wifi từng phòng', 'App hệ sinh thái cư dân'],
        amenitiesChung: ['Thang máy', 'Sân phơi'],
        amenitiesAnNinh: ['Khóa vân tay', 'Camera an ninh'],
        amenitiesPccc: ['Sprinkler', 'Báo cháy', 'Thang thoát hiểm', 'Bình cứu hỏa']
      });
    }
    setShowRoomModal(true);
  };

  const handleSaveRoomSubmit = (e) => {
    e.preventDefault();
    const roomImages = roomForm.images && roomForm.images.length ? roomForm.images : (roomForm.coverImage ? [roomForm.coverImage] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80']);

    const specificRooms = roomForm.specificRooms && roomForm.specificRooms.length > 0
      ? roomForm.specificRooms
      : [roomForm.roomNumber || '501'];

    const updated = DataService.saveRoom({
      id: editingRoom ? editingRoom.id : `rm_${Date.now()}`,
      buildingCode: roomForm.buildingCode,
      buildingName: `Tòa nhà ${roomForm.buildingCode}`,
      roomNumber: specificRooms[0] || '501',
      type: roomForm.type || 'Studio khép kín',
      price: Number(roomForm.price) || 3500000,
      area: Number(roomForm.area) || 25,
      maxOccupants: Number(roomForm.maxOccupants) || 2,
      availableFrom: roomForm.availableFrom || 'Ở ngay',
      status: specificRooms.length > 0 ? (roomForm.status || 'Có sẵn') : 'Hết phòng',
      images: roomImages,
      specificRooms: specificRooms,
      room_numbers: specificRooms,
      available_rooms: specificRooms.length,
      vacantCount: specificRooms.length,
      host: {
        name: roomForm.hostName,
        phone: roomForm.hostPhone,
        email: roomForm.hostEmail
      },
      description: roomForm.description,
      amenitiesNoiThat: roomForm.amenitiesNoiThat,
      amenitiesRieng: roomForm.amenitiesRieng,
      amenitiesChung: roomForm.amenitiesChung,
      amenitiesAnNinh: roomForm.amenitiesAnNinh,
      amenitiesPccc: roomForm.amenitiesPccc,
      amenities: {
        furniture: roomForm.amenitiesNoiThat || [],
        private: roomForm.amenitiesRieng || []
      }
    });

    setRooms(updated);
    setShowRoomModal(false);
    showToast(editingRoom ? `Đã cập nhật Loại phòng: ${roomForm.type}` : `Thêm Loại phòng: ${roomForm.type} mới thành công!`);
  };

  // Role Modal Handlers
  const handleOpenRoleModal = (roleToEdit = null) => {
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setRoleForm({
        name: roleToEdit.name,
        code: roleToEdit.code,
        description: roleToEdit.description || '',
        allowedScreens: roleToEdit.allowedScreens || ['dashboard']
      });
    } else {
      setEditingRole(null);
      setRoleForm({
        name: '',
        code: `role_${Date.now()}`,
        description: '',
        allowedScreens: ['dashboard', 'rooms']
      });
    }
    setShowRoleModal(true);
  };

  const handleToggleScreenPermission = (screenCode) => {
    if (roleForm.allowedScreens.includes(screenCode)) {
      setRoleForm({
        ...roleForm,
        allowedScreens: roleForm.allowedScreens.filter(s => s !== screenCode)
      });
    } else {
      setRoleForm({
        ...roleForm,
        allowedScreens: [...roleForm.allowedScreens, screenCode]
      });
    }
  };

  const handleSaveRoleSubmit = (e) => {
    e.preventDefault();
    if (!roleForm.name) {
      alert("Vui lòng nhập tên Vai trò (Role).");
      return;
    }

    const updatedRoles = DataService.saveRole({
      id: editingRole ? editingRole.id : `role_${Date.now()}`,
      name: roleForm.name,
      code: editingRole ? editingRole.code : (roleForm.code || `role_${Date.now()}`),
      description: roleForm.description,
      allowedScreens: roleForm.allowedScreens
    });

    setRoles(updatedRoles);
    setShowRoleModal(false);
    showToast(editingRole ? `Đã cập nhật quyền hạn màn hình cho Role "${roleForm.name}"` : `Tạo Role mới "${roleForm.name}" thành công!`);
  };

  const handleDeleteRole = (roleId, roleName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Vai trò "${roleName}"?`)) {
      const updated = DataService.deleteRole(roleId);
      setRoles(updated);
      showToast(`Đã xóa Vai trò "${roleName}".`);
    }
  };

  // Building & Room Delete Request Handlers (With Confirmation Modal)
  const handleRequestDeleteBuilding = (b) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'building',
      id: b.id,
      name: b.name || b.code,
      subText: `Toàn bộ các loại phòng và danh sách phòng thuộc ${b.name || b.code} cũng sẽ bị xóa khỏi hệ thống.`
    });
  };

  const handleRequestDeleteRoom = (r) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'room',
      id: r.id,
      name: r.type || r.name,
      subText: `Toàn bộ danh sách số phòng của loại phòng "${r.type || r.name}" sẽ bị xóa vĩnh viễn.`
    });
  };

  const handlePromptDeleteBooking = (b) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'booking',
      id: b.id,
      name: b.id,
      subText: `Lịch hẹn xem phòng của khách "${b.customerName}" (${b.phone}) tại ${b.buildingCode} - Căn ${b.roomNumber} sẽ bị xóa hoàn toàn khỏi hệ thống.`
    });
  };

  const handlePromptDeleteUser = (u) => {
    if (u.id === 'usr_admin' || u.id === 'usr_superadmin') {
      alert('Không thể xóa tài khoản Quản trị viên tối cao (Super Admin).');
      return;
    }
    setDeleteConfirm({
      isOpen: true,
      type: 'user',
      id: u.id,
      name: u.name,
      subText: `Tài khoản người dùng "${u.name}" (${u.email || u.phone}) sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu Supabase.`
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm.id) return;
    
    if (deleteConfirm.type === 'building') {
      const updatedBuildings = DataService.deleteBuilding(deleteConfirm.id);
      setBuildings(updatedBuildings);
      setRooms(DataService.getRooms());
      if (selectedBuildingForRooms === deleteConfirm.id || selectedBuildingForRooms === deleteConfirm.name) {
        setSelectedBuildingForRooms('');
      }
      showToast(`🗑️ Đã xóa thành công Tòa nhà "${deleteConfirm.name}"!`);
    } else if (deleteConfirm.type === 'room') {
      const updatedRooms = DataService.deleteRoom(deleteConfirm.id);
      setRooms(updatedRooms);
      setBuildings(DataService.getBuildings());
      showToast(`🗑️ Đã xóa thành công Loại phòng "${deleteConfirm.name}"!`);
    } else if (deleteConfirm.type === 'booking') {
      const updatedBookings = DataService.deleteBooking(deleteConfirm.id);
      setBookings(updatedBookings);
      showToast(`🗑️ Đã xóa lịch hẹn xem phòng #${deleteConfirm.name}!`);
    } else if (deleteConfirm.type === 'user') {
      const updatedUsers = DataService.deleteUser(deleteConfirm.id);
      setUsersList(updatedUsers);
      showToast(`🗑️ Đã xóa tài khoản người dùng "${deleteConfirm.name}"!`);
    }
    
    setDeleteConfirm({ isOpen: false, type: '', id: '', name: '', subText: '' });
  };

  // Booking Status Handler
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const updated = DataService.updateBookingStatus(bookingId, newStatus);
    setBookings(updated);
    showToast(`✅ Đã cập nhật trạng thái lịch hẹn #${bookingId} sang "${newStatus}"!`);
  };

  // User Handlers
  const handleChangeUserRole = (userId, newRoleCode) => {
    const roleObj = roles.find(r => r.code === newRoleCode);
    const updatedUsers = usersList.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          roleCode: newRoleCode,
          roleName: roleObj ? roleObj.name : newRoleCode
        };
      }
      return u;
    });
    DataService.saveUser(updatedUsers.find(u => u.id === userId));
    setUsersList(updatedUsers);
    showToast(`Đã đổi vai trò người dùng sang "${roleObj?.name}"`);
  };

  const handleSaveNewUser = (e) => {
    e.preventDefault();
    const roleObj = roles.find(r => r.code === userForm.roleCode) || roles[0];
    const userPass = userForm.password || generateRandomPassword(8);
    const updated = DataService.saveUser({
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone,
      password: userPass,
      roleCode: roleObj.code,
      roleName: roleObj.name,
      status: "Hoạt động"
    });
    setUsersList(updated);
    setShowUserModal(false);
    showToast(`🔑 Tạo người dùng "${userForm.name}" thành công! Mật khẩu: ${userPass}`);
  };

  const handleSaveResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPasswordVal || resetPasswordVal.length < 4) {
      alert("Mật khẩu mới phải từ 4 ký tự trở lên!");
      return;
    }
    const updatedUsers = usersList.map(u => {
      if (u.id === resetPassUser.id) {
        return { ...u, password: resetPasswordVal };
      }
      return u;
    });
    DataService.saveUser({
      ...resetPassUser,
      password: resetPasswordVal
    });
    setUsersList(updatedUsers);
    setShowResetPasswordModal(false);
    showToast(`🔑 Đã đổi mật khẩu thành công cho tài khoản ${resetPassUser.name}! Mật khẩu mới: ${resetPasswordVal}`);
  };

  // Backup & Restore
  const handleExportBackup = () => {
    const backupData = DataService.exportFullBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tinyhouse_db_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Tải bản sao lưu JSON Database thành công!");
  };

  const handleRestoreBackup = (event) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const res = DataService.importBackupData(parsed);
          if (res.success) {
            setBuildings(DataService.getBuildings());
            setRooms(DataService.getRooms());
            setBookings(DataService.getBookings());
            setCtvs(DataService.getCTVs());
            setRoles(DataService.getRoles());
            setUsersList(DataService.getUsers());
            showToast("Khôi phục cơ sở dữ liệu hệ thống thành công!");
          } else {
            alert(res.message);
          }
        } catch (err) {
          alert("Lỗi đọc file JSON backup: " + err.message);
        }
      };
    }
  };

  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const handleSyncSupabase = async () => {
    setIsSyncingSupabase(true);
    showToast('⏳ Đang đồng bộ dữ liệu từ Supabase Cloud...');
    const res = await DataService.syncFromSupabase();
    setIsSyncingSupabase(false);
    if (res.success) {
      setBuildings(DataService.getBuildings());
      setRooms(DataService.getRooms());
      showToast(`✅ Đã đồng bộ thành công ${res.count} loại phòng từ Supabase!`);
    } else {
      showToast(`⚠️ Đồng bộ cảnh báo: ${res.error}`);
    }
  };

  return (
    <div className="cms-layout-wrapper">
      {/* MOBILE / TABLET DRAWER BACKDROP */}
      <div 
        className={`cms-backdrop ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />

      {/* MOBILE & TABLET TOP HEADER BAR (HIỂN THỊ TRÊN MOBILE/TABLET NHƯ ẢNH MẪU) */}
      <header className="cms-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="cms-mobile-toggle-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Đóng / Mở Menu Quản trị"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0F172A' }}>
            {activeCmsSection === 'dashboard' && 'Tổng quan'}
            {activeCmsSection === 'buildings' && 'Quản lý Tòa nhà'}
            {activeCmsSection === 'rooms' && 'Quản lý Phòng'}
            {activeCmsSection === 'bookings' && 'Lịch xem phòng'}
            {activeCmsSection === 'ctv' && 'Quản lý CTV'}
            {activeCmsSection === 'permissions' && 'Phân quyền Role'}
            {activeCmsSection === 'database' && 'Backup Database'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '4px 8px', fontWeight: 800 }}>
            🔑 {activeUser.name}
          </span>
        </div>
      </header>

      {/* RESPONSIVE DRAWER SIDEBAR (ĐÓNG MỞ TRÊN MOBILE & TABLET, DẠNG NỔI HOẶC STICKY TRÊN DESKTOP) */}
      <aside className={`cms-sidebar-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <Logo dark={true} size={36} showSubtitle={false} onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }} />
          <button 
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
            onClick={() => setIsMobileMenuOpen(false)}
            title="Đóng Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Active User Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Tài khoản đang đăng nhập:</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', marginTop: 2 }}>{activeUser.name}</div>
          <div className="badge badge-warning" style={{ marginTop: 6, fontSize: '0.75rem', padding: '3px 8px' }}>
            🔑 {userRoleObj ? userRoleObj.name : activeUser.roleName}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 8px' }}>
          Màn hình được phép xem
        </div>

        {/* DYNAMIC PERMISSION FILTERED SIDEBAR BUTTONS */}
        {allowedScreens.includes('dashboard') && (
          <button 
            className={`btn ${activeCmsSection === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'dashboard' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('dashboard'); setIsMobileMenuOpen(false); }}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </button>
        )}

        {allowedScreens.includes('buildings') && (
          <button 
            className={`btn ${activeCmsSection === 'buildings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'buildings' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('buildings'); setIsMobileMenuOpen(false); }}
          >
            <Building2 size={18} />
            <span>Quản lý Tòa nhà ({buildings.length})</span>
          </button>
        )}

        {allowedScreens.includes('rooms') && (
          <button 
            className={`btn ${activeCmsSection === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'rooms' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('rooms'); setIsMobileMenuOpen(false); }}
          >
            <Home size={18} />
            <span>Quản lý Phòng ({rooms.length})</span>
          </button>
        )}

        {allowedScreens.includes('bookings') && (
          <button 
            className={`btn ${activeCmsSection === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'bookings' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('bookings'); setIsMobileMenuOpen(false); }}
          >
            <Calendar size={18} />
            <span>Lịch xem phòng ({bookings.length})</span>
          </button>
        )}

        {allowedScreens.includes('ctv') && (
          <button 
            className={`btn ${activeCmsSection === 'ctv' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'ctv' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('ctv'); setIsMobileMenuOpen(false); }}
          >
            <Users size={18} />
            <span>Quản lý CTV & Hoa hồng</span>
          </button>
        )}

        {allowedScreens.includes('permissions') && (
          <button 
            className={`btn ${activeCmsSection === 'permissions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'permissions' ? '#E8920A' : 'transparent', color: '#fff', position: 'relative' }}
            onClick={() => { setActiveCmsSection('permissions'); setIsMobileMenuOpen(false); }}
          >
            <ShieldCheck size={18} />
            <span style={{ flex: 1 }}>Phân quyền & Role</span>
            {pendingUsers.length > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#fff',
                borderRadius: '50%',
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 900,
                flexShrink: 0, animation: 'pulse 1.5s infinite'
              }}>
                {pendingUsers.length}
              </span>
            )}
          </button>
        )}

        {allowedScreens.includes('database') && (
          <button 
            className={`btn ${activeCmsSection === 'database' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'database' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => { setActiveCmsSection('database'); setIsMobileMenuOpen(false); }}
          >
            <Download size={18} />
            <span>Backup & Database</span>
          </button>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', color: '#94a3b8', borderColor: '#334155', fontSize: '0.85rem' }}
            onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
          >
            ← Về Website người dùng
          </button>

          {onLogout && (
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', color: '#EF4444', fontSize: '0.85rem', padding: '8px' }}
              onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            >
              <LogOut size={14} />
              <span>Đăng xuất tài khoản</span>
            </button>
          )}
        </div>
      </aside>

      {/* CMS MAIN CONTENT AREA */}
      <main className="cms-main-content" style={{ flex: 1, padding: 32, minWidth: 0 }}>
        {notification && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: 10, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#10B981" />
            <span>{notification}</span>
          </div>
        )}

        {/* SECTION: DASHBOARD */}
        {activeCmsSection === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 24 }}>Thống kê tổng quan hệ thống</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
              <div className="card" style={{ padding: 20 }}>
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Tổng doanh thu ước tính</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E8920A', marginTop: 4 }}>450M VND</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: 4 }}>↑ 12% so với tháng trước</div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Tổng số Tòa nhà</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{buildings.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>Phủ rộng 8+ quận Hà Nội</div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Tài khoản Chờ duyệt</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EF4444', marginTop: 4 }}>{pendingUsers.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>Cần Admin kích hoạt</div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Lịch xem phòng chờ duyệt</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#E8920A', marginTop: 4 }}>
                  {bookings.filter(b => b.status === 'Chờ xác nhận').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#E8920A', marginTop: 4 }}>Cần xử lý ngay</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: BUILDINGS */}
        {activeCmsSection === 'buildings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Danh sách Tòa nhà ({filteredCmsBuildings.length} / {buildings.length})</h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 2 }}>
                  Quản lý danh mục, địa chỉ, bản đồ định vị và số lượng phòng trống của từng tòa nhà
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* SORT CONTROL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
                  <ArrowUpDown size={16} color="#E8920A" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sắp xếp:</span>
                  <select 
                    value={buildingSortBy} 
                    onChange={(e) => {
                      setBuildingSortBy(e.target.value);
                      setBuildingPage(1);
                    }}
                    style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <option value="vacant-desc">Phòng trống: Nhiều nhất → Ít nhất (Mặc định)</option>
                    <option value="vacant-asc">Phòng trống: Ít nhất → Nhiều nhất</option>
                    <option value="price-asc">Giá thuê: Thấp → Cao</option>
                    <option value="price-desc">Giá thuê: Cao → Thấp</option>
                    <option value="code">Mã tòa A-Z</option>
                  </select>
                </div>

                <button className="btn btn-primary" onClick={() => handleOpenBuildingModal()}>
                  <Plus size={18} />
                  <span>Thêm Tòa nhà mới</span>
                </button>
              </div>
            </div>

            {/* THANH TÌM KIẾM TÒA NHÀ REALTIME */}
            <div className="card" style={{ padding: 16, marginBottom: 20, background: '#ffffff', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Search size={20} color="#E8920A" />
                <input 
                  type="text" 
                  placeholder="🔍 Tìm nhanh Tòa nhà theo Mã tòa (TN008, DT0047), Tên tòa, Địa chỉ, Quận..." 
                  value={buildingSearchQuery} 
                  onChange={(e) => {
                    setBuildingSearchQuery(e.target.value);
                    setBuildingPage(1);
                  }} 
                  style={{ flex: 1, border: 'none', background: 'none', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }} 
                />
                {buildingSearchQuery && (
                  <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} onClick={() => { setBuildingSearchQuery(''); setBuildingPage(1); }}>
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: 14 }}>Tòa nhà</th>
                    <th style={{ padding: 14 }}>Địa chỉ & Quận</th>
                    <th style={{ padding: 14 }}>Loại hình</th>
                    <th style={{ padding: 14 }}>Số phòng trống</th>
                    <th style={{ padding: 14 }}>Khoảng giá</th>
                    <th style={{ padding: 14, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBuildings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={b.coverImage} alt={b.code} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 800, color: '#E8920A' }}>{b.code}</span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.address}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Quận {b.district}</div>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span className={`badge ${b.isTiny ? 'badge-tiny' : 'badge-primary'}`}>
                          {b.isTiny ? 'Tòa Tiny' : 'Đối tác'}
                        </span>
                      </td>
                      <td style={{ padding: 14 }}>
                        <span className={`badge ${b.vacantRoomsCount > 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 800 }}>
                          {b.vacantRoomsCount} phòng trống
                        </span>
                      </td>
                      <td style={{ padding: 14, fontWeight: 800 }}>{(b.minPrice / 1000000).toFixed(1)} triệu đ</td>
                      <td style={{ padding: 14, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button style={{ background: 'none', border: 'none', color: '#0F172A', cursor: 'pointer' }} title="Sửa chi tiết tòa nhà" onClick={() => handleOpenBuildingModal(b)}>
                            <Edit size={16} />
                          </button>
                          <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Xóa tòa nhà này" onClick={() => handleRequestDeleteBuilding(b)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination 
                totalItems={sortedBuildings.length}
                itemsPerPage={buildingPerPage}
                currentPage={buildingPage}
                onPageChange={setBuildingPage}
                onItemsPerPageChange={setBuildingPerPage}
              />
            </div>
          </div>
        )}

        {/* SECTION: ROOMS (CHỌN TÒA NHÀ RỒI MỚI QUẢN LÝ PHÒNG) */}
        {activeCmsSection === 'rooms' && (
          <div>
            {/* HEADER BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Quản lý Căn hộ & Phòng trống</h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
                  {selectedBuildingForRooms 
                    ? `Đang xem danh sách phòng của Tòa nhà: ${selectedBuildingForRooms}` 
                    : `Chọn 1 trong ${buildings.length} Tòa nhà bên dưới để xem và quản lý phòng chi tiết`}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ background: '#0F172A', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, padding: '8px 16px', borderRadius: 10 }}
                  onClick={handleSyncSupabase}
                  disabled={isSyncingSupabase}
                  title="Kéo và làm mới dữ liệu chuẩn 100% từ Supabase Cloud"
                >
                  <RefreshCw size={16} className={isSyncingSupabase ? 'animate-spin' : ''} />
                  <span>{isSyncingSupabase ? 'Đang đồng bộ...' : '🔄 Đồng bộ Supabase'}</span>
                </button>
                {selectedBuildingForRooms && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontWeight: 800, padding: '8px 16px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => { setSelectedBuildingForRooms(''); setRoomSearchQuery(''); }}
                  >
                    ↩️ Chọn Tòa nhà khác
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => handleOpenRoomModal()}>
                  <Plus size={18} />
                  <span>Thêm Căn hộ mới</span>
                </button>
              </div>
            </div>

            {/* BƯỚC 1: BẢNG CHỌN TÒA NHÀ (KHI CHƯA CHỌN TÒA NÀO) */}
            {!selectedBuildingForRooms ? (
              <div>
                {/* THANH TÌM KIẾM TÒA NHÀ */}
                <div className="card" style={{ padding: 16, marginBottom: 20, background: '#ffffff', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={20} color="#E8920A" />
                    <input 
                      type="text" 
                      placeholder="🔍 Tìm nhanh Tòa nhà theo Mã tòa (TN008, DT0047), Địa chỉ, Quận..." 
                      value={buildingSearchInRooms} 
                      onChange={(e) => setBuildingSearchInRooms(e.target.value)} 
                      style={{ flex: 1, border: 'none', background: 'none', fontSize: '1rem', fontWeight: 700, outline: 'none' }} 
                    />
                    {buildingSearchInRooms && (
                      <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} onClick={() => setBuildingSearchInRooms('')}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* LƯỚI CARD TÒA NHÀ ĐỂ CHỌN (HIỂN THỊ ĐÚNG 4 TÒA / HÀNG & TĂNG SIZE CHỮ) */}
                <div className="building-grid-4col">
                  {buildings.filter(b => {
                    if (!buildingSearchInRooms) return true;
                    const q = buildingSearchInRooms.toLowerCase().trim();
                    return (
                      (b.code && b.code.toLowerCase().includes(q)) ||
                      (b.address && b.address.toLowerCase().includes(q)) ||
                      (b.district && b.district.toLowerCase().includes(q)) ||
                      (b.name && b.name.toLowerCase().includes(q))
                    );
                  }).map(b => {
                    const bRooms = rooms.filter(r => r.buildingCode === b.code || r.buildingId === b.id);
                    const totalVacantRooms = bRooms.reduce((acc, r) => {
                      return acc + (r.specificRooms && r.specificRooms.length ? r.specificRooms.length : (r.status === 'Có sẵn' ? 1 : 0));
                    }, 0);
                    const displayVacant = totalVacantRooms > 0 ? totalVacantRooms : (b.vacantRoomsCount || 0);
                    return (
                      <div 
                        key={b.id} 
                        className="card" 
                        style={{ 
                          padding: 20, 
                          cursor: 'pointer', 
                          transition: 'all 0.2s', 
                          border: '1.5px solid #E2E8F0',
                          borderRadius: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          gap: 16,
                          background: '#ffffff'
                        }}
                        onClick={() => { setSelectedBuildingForRooms(b.code); setRoomSearchQuery(''); }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span className="badge badge-warning" style={{ fontSize: '0.95rem', fontWeight: 900, background: '#FFF7ED', color: '#E8920A', border: '1px solid #FED7AA', padding: '4px 10px' }}>
                              🏢 {b.code}
                            </span>
                            <span className={`badge ${b.isTiny ? 'badge-tiny' : 'badge-primary'}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                              {b.isTiny ? 'Tòa Tiny' : 'Đối tác'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <img src={b.coverImage} alt={b.code} style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.35 }}>{b.name || b.address}</div>
                              <div style={{ fontSize: '0.88rem', color: '#64748B', marginTop: 4, fontWeight: 600 }}>📍 Quận {b.district}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Loại phòng: </span>
                            <strong style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 900 }}>{bRooms.length} loại</strong>
                            <div style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 800, marginTop: 2 }}>({displayVacant} phòng trống)</div>
                          </div>
                          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px', borderRadius: 10, fontWeight: 800 }}>
                            👉 Chọn Tòa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* BƯỚC 2: QUẢN LÝ PHÒNG TRONG TÒA NHÀ ĐÃ CHỌN */
              <div>
                {/* BANNER THÔNG TIN TÒA ĐÃ CHỌN */}
                {(() => {
                  const selBld = buildings.find(b => b.code === selectedBuildingForRooms || b.id === selectedBuildingForRooms);
                  const bldRooms = rooms.filter(r => r.buildingCode === selectedBuildingForRooms || r.buildingId === selectedBuildingForRooms);
                  const totalVacantCount = bldRooms.reduce((acc, r) => {
                    return acc + (r.specificRooms && r.specificRooms.length ? r.specificRooms.length : (r.status === 'Có sẵn' ? 1 : 0));
                  }, 0);
                  const displayVacantCount = totalVacantCount > 0 ? totalVacantCount : (selBld?.vacantRoomsCount || 0);

                  return (
                    <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#ffffff', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <img src={selBld?.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'} alt={selectedBuildingForRooms} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F59E0B' }}>🏢 Tòa nhà {selectedBuildingForRooms}</span>
                            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{displayVacantCount} phòng trống</span>
                            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>{bldRooms.length} loại phòng</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: 4 }}>📍 {selBld?.address}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ background: '#334155', color: '#ffffff', border: 'none', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}
                          onClick={() => setSelectedBuildingForRooms('')}
                        >
                          ↩️ Chọn Tòa khác
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 800 }}
                          onClick={() => handleOpenRoomModal(null)}
                        >
                          ➕ Thêm loại phòng vào {selectedBuildingForRooms}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* THANH TÌM KIẾM VÀ BỘ LỌC PHÒNG TRONG TÒA */}
                <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260, background: '#F8FAFC', padding: '8px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <Search size={18} color="#E8920A" />
                    <input 
                      type="text" 
                      placeholder={`🔍 Tìm nhanh phòng trong tòa ${selectedBuildingForRooms} (VD: 201, Studio, 3.5tr)...`}
                      value={roomSearchQuery}
                      onChange={(e) => setRoomSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'none', flex: 1, fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                    />
                    {roomSearchQuery && (
                      <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} onClick={() => setRoomSearchQuery('')}>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1', height: 42 }}>
                    <ArrowUpDown size={16} color="#E8920A" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sắp xếp:</span>
                    <select 
                      value={roomSortBy} 
                      onChange={(e) => {
                        setRoomSortBy(e.target.value);
                        setRoomPage(1);
                      }}
                      style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <option value="status">Phòng trống (Có sẵn) trước</option>
                      <option value="price-asc">Giá thuê: Thấp → Cao</option>
                      <option value="price-desc">Giá thuê: Cao → Thấp</option>
                    </select>
                  </div>
                </div>

                {/* BẢNG DANH SÁCH LOẠI PHÒNG & SỐ PHÒNG CỦA TÒA ĐÃ CHỌN */}
                <div className="card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: 14 }}>Tên Loại phòng</th>
                        <th style={{ padding: 14 }}>Danh sách số phòng (room_numbers)</th>
                        <th style={{ padding: 14 }}>Diện tích & Số người</th>
                        <th style={{ padding: 14 }}>Mức giá / tháng</th>
                        <th style={{ padding: 14 }}>Số phòng trống</th>
                        <th style={{ padding: 14, textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredRoomsInBld = rooms.filter(r => {
                          const isMatchBld = r.buildingCode === selectedBuildingForRooms || r.buildingId === selectedBuildingForRooms;
                          if (!isMatchBld) return false;
                          if (!roomSearchQuery) return true;
                          const q = roomSearchQuery.toLowerCase().trim();
                          return (
                            (r.roomNumber && String(r.roomNumber).toLowerCase().includes(q)) ||
                            (r.type && r.type.toLowerCase().includes(q)) ||
                            (r.price && String(r.price).includes(q)) ||
                            (r.status && r.status.toLowerCase().includes(q)) ||
                            (r.specificRooms && r.specificRooms.some(sr => String(sr).toLowerCase().includes(q)))
                          );
                        });

                        if (filteredRoomsInBld.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: 4 }}>Không tìm thấy loại phòng nào phù hợp!</div>
                                <div style={{ fontSize: '0.85rem' }}>Thử đổi từ khóa tìm kiếm hoặc bấm "Thêm loại phòng mới".</div>
                              </td>
                            </tr>
                          );
                        }

                        return filteredRoomsInBld.map((r) => {
                          const roomList = getRoomTypeNumbers(r);

                          return (
                            <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src={getValidImageUrl(r.images?.[0] || r.coverImage)} alt={r.type} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                                <div>
                                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{r.type}</span>
                                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Mã: {r.id?.slice(0, 10)}</div>
                                </div>
                              </td>
                              <td style={{ padding: 14 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 280 }}>
                                  {roomList.map(code => (
                                    <span 
                                      key={code} 
                                      style={{ 
                                        background: '#F1F5F9', 
                                        color: '#0F172A', 
                                        border: '1px solid #E2E8F0', 
                                        padding: '2px 8px', 
                                        borderRadius: 6, 
                                        fontSize: '0.78rem', 
                                        fontWeight: 800 
                                      }}
                                    >
                                      {code}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: 14 }}>
                                <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>📐 {r.area} m²</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>👥 Tối đa {r.maxOccupants} người</div>
                              </td>
                              <td style={{ padding: 14, fontWeight: 800, color: '#E8920A' }}>{(r.price).toLocaleString('vi-VN')} VND</td>
                              <td style={{ padding: 14 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F8FAFC', padding: '4px 10px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Trống:</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleQuickUpdateRoomVacant(r, -1)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6, border: '1px solid #CBD5E1',
                                      background: '#ffffff', color: '#0F172A', fontSize: '1rem', fontWeight: 800,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    title="Giảm số phòng trống"
                                  >
                                    -
                                  </button>
                                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', minWidth: 16, textAlign: 'center' }}>
                                    {roomList.length}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => handleQuickUpdateRoomVacant(r, 1)}
                                    style={{
                                      width: 28, height: 28, borderRadius: 6, border: '1px solid #CBD5E1',
                                      background: '#ffffff', color: '#0F172A', fontSize: '1rem', fontWeight: 800,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                    title="Tăng số phòng trống"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td style={{ padding: 14, textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                  <button style={{ background: 'none', border: 'none', color: '#0F172A', cursor: 'pointer' }} title="Sửa chi tiết loại phòng" onClick={() => handleOpenRoomModal(r)}>
                                    <Edit size={18} />
                                  </button>
                                  <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }} title="Xóa loại phòng này" onClick={() => handleRequestDeleteRoom(r)}>
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION: BOOKINGS */}
        {activeCmsSection === 'bookings' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 24 }}>Quản lý Lịch hẹn xem phòng ({bookings.length})</h1>
            
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: 14 }}>Mã Đặt</th>
                    <th style={{ padding: 14 }}>Khách hàng</th>
                    <th style={{ padding: 14 }}>Liên hệ</th>
                    <th style={{ padding: 14 }}>Phòng & Tòa</th>
                    <th style={{ padding: 14 }}>Ngày giờ xem</th>
                    <th style={{ padding: 14 }}>Trạng thái</th>
                    <th style={{ padding: 14, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 14, fontWeight: 800 }}>#{b.id}</td>
                      <td style={{ padding: 14, fontWeight: 700, color: '#0F172A' }}>{b.customerName}</td>
                      <td style={{ padding: 14, fontSize: '0.85rem' }}>
                        <div>📞 {b.phone}</div>
                        <div style={{ color: '#64748B' }}>{b.email}</div>
                      </td>
                      <td style={{ padding: 14, fontWeight: 700, color: '#E8920A' }}>
                        {b.buildingCode} - Căn {b.roomNumber}
                      </td>
                      <td style={{ padding: 14, fontWeight: 700 }}>
                        📅 {b.appointmentDate} lúc {b.appointmentTime}
                      </td>
                      <td style={{ padding: 14 }}>
                        <select
                          value={b.status || 'Chờ xác nhận'}
                          onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: 20,
                            border: '1px solid #CBD5E1',
                            background: b.status === 'Đã xác nhận' ? '#D1FAE5' : (b.status === 'Đã xem phòng' ? '#E0F2FE' : (b.status === 'Đã hủy' ? '#FEE2E2' : '#FEF3C7')),
                            color: b.status === 'Đã xác nhận' ? '#065F46' : (b.status === 'Đã xem phòng' ? '#0369A1' : (b.status === 'Đã hủy' ? '#991B1B' : '#92400E')),
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Chờ xác nhận">Chờ xác nhận</option>
                          <option value="Đã xác nhận">Đã xác nhận</option>
                          <option value="Đã xem phòng">Đã xem phòng</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>
                      <td style={{ padding: 14, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {b.status === 'Chờ xác nhận' && (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                              onClick={() => handleUpdateBookingStatus(b.id, 'Đã xác nhận')}
                              title="Xác nhận lịch hẹn với khách"
                            >
                              Xác nhận
                            </button>
                          )}
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '5px', borderColor: '#EF4444', color: '#EF4444' }}
                            onClick={() => handlePromptDeleteBooking(b)}
                            title="Xóa lịch hẹn"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination 
                totalItems={bookings.length}
                itemsPerPage={bookingPerPage}
                currentPage={bookingPage}
                onPageChange={setBookingPage}
                onItemsPerPageChange={setBookingPerPage}
              />
            </div>
          </div>
        )}

        {/* SECTION: CTV & COMMISSION */}
        {activeCmsSection === 'ctv' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 24 }}>Danh sách CTV & Hoa hồng Sale phòng</h1>
            
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: 14 }}>Họ và Tên CTV</th>
                    <th style={{ padding: 14 }}>Phân loại CTV</th>
                    <th style={{ padding: 14 }}>Số điện thoại / Email</th>
                    <th style={{ padding: 14 }}>Tỷ lệ hoa hồng</th>
                    <th style={{ padding: 14 }}>Số Deal chốt</th>
                    <th style={{ padding: 14 }}>Ví số dư tích lũy</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCtvs.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 14, fontWeight: 800, color: '#0F172A' }}>{c.name}</td>
                      <td style={{ padding: 14 }}>
                        <span className="badge badge-primary">{c.type}</span>
                      </td>
                      <td style={{ padding: 14, fontSize: '0.85rem' }}>
                        <div>📞 {c.phone}</div>
                        <div style={{ color: '#64748B' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: 14, fontWeight: 800, color: '#10B981' }}>{c.commissionRate}</td>
                      <td style={{ padding: 14, fontWeight: 700 }}>{c.totalDeals} căn</td>
                      <td style={{ padding: 14, fontWeight: 800, color: '#E8920A' }}>{c.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination 
                totalItems={ctvs.length}
                itemsPerPage={ctvPerPage}
                currentPage={ctvPage}
                onPageChange={setCtvPage}
                onItemsPerPageChange={setCtvPerPage}
              />
            </div>
          </div>
        )}

        {/* SECTION: PERMISSIONS & ROLES MANAGEMENT WITH ADMIN APPROVAL */}
        {activeCmsSection === 'permissions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Phân quyền Người dùng & Admin Phê duyệt Tài khoản</h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
                  Phê duyệt yêu cầu đăng ký mới, quản lý vai trò (Role) và gán quyền màn hình CMS.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {permSubTab === 'roles' ? (
                  <button className="btn btn-primary" onClick={() => handleOpenRoleModal()}>
                    <Plus size={18} />
                    <span>Tạo Role Mới</span>
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>
                    <Plus size={18} />
                    <span>Thêm Người Dùng Mới</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '2px solid #E2E8F0', paddingBottom: 8 }}>
              <button 
                className={`btn ${permSubTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 8, padding: '8px 18px', fontWeight: 800, position: 'relative' }}
                onClick={() => setPermSubTab('pending')}
              >
                ⏳ Yêu cầu Chờ duyệt ({pendingUsers.length})
              </button>
              <button 
                className={`btn ${permSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 8, padding: '8px 18px', fontWeight: 800 }}
                onClick={() => setPermSubTab('users')}
              >
                👤 Người dùng & Gán Role ({usersList.length})
              </button>
              <button 
                className={`btn ${permSubTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 8, padding: '8px 18px', fontWeight: 800 }}
                onClick={() => setPermSubTab('roles')}
              >
                🔐 Danh sách Vai trò (Roles & Perms)
              </button>
            </div>

            {/* SUB TAB 1: PENDING ACCOUNT APPROVALS */}
            {permSubTab === 'pending' && (
              <div className="card" style={{ overflowX: 'auto', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock color="#E8920A" size={20} />
                  <span>Danh sách Đăng ký chờ Super Admin Phê duyệt ({pendingUsers.length})</span>
                </h3>

                {pendingUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, background: '#F8FAFC', borderRadius: 12, color: '#64748B' }}>
                    <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 800, color: '#0F172A' }}>Hiện không có yêu cầu đăng ký nào chờ duyệt!</div>
                    <div style={{ fontSize: '0.85rem' }}>Mọi tài khoản đăng ký mới sẽ xuất hiện ở đây để Admin bấm Phê duyệt kích hoạt.</div>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: 14 }}>Người dùng đăng ký</th>
                        <th style={{ padding: 14 }}>Liên hệ (Email / SĐT)</th>
                        <th style={{ padding: 14 }}>Vai trò yêu cầu</th>
                        <th style={{ padding: 14 }}>Trạng thái</th>
                        <th style={{ padding: 14, textAlign: 'right' }}>Thao tác Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 800, color: '#0F172A' }}>{u.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {u.id}</div>
                            </div>
                          </td>
                          <td style={{ padding: 14 }}>
                            <div>📧 {u.email}</div>
                            <div style={{ color: '#64748B', fontSize: '0.8rem' }}>📞 {u.phone}</div>
                          </td>
                          <td style={{ padding: 14 }}>
                            <span className="badge badge-warning">
                              {roles.find(r => r.code === u.roleCode)?.name || u.roleName || u.roleCode}
                            </span>
                          </td>
                          <td style={{ padding: 14 }}>
                            <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#B45309' }}>
                              ⏳ Chờ Admin duyệt
                            </span>
                          </td>
                          <td style={{ padding: 14, textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#10B981', borderColor: '#059669' }}
                                onClick={() => handleApproveAccount(u.id, u.name, 'approve')}
                              >
                                ✅ Phê duyệt (Kích hoạt)
                              </button>
                              <button 
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444' }}
                                onClick={() => handleApproveAccount(u.id, u.name, 'reject')}
                              >
                                ❌ Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* SUB TAB 2: USER MANAGEMENT & ROLE ASSIGNMENT */}
            {permSubTab === 'users' && (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: 14 }}>Người dùng</th>
                      <th style={{ padding: 14 }}>Email & Số điện thoại</th>
                      <th style={{ padding: 14 }}>Vai trò hiện tại (Role)</th>
                      <th style={{ padding: 14 }}>Trạng thái</th>
                      <th style={{ padding: 14, textAlign: 'right' }}>Gán Vai trò mới</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img src={u.avatar} alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {u.id}</div>
                          </div>
                        </td>
                        <td style={{ padding: 14 }}>
                          <div>📧 {u.email}</div>
                          <div style={{ color: '#64748B', fontSize: '0.8rem' }}>📞 {u.phone}</div>
                        </td>
                        <td style={{ padding: 14 }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
                            {roles.find(r => r.code === u.roleCode)?.name || u.roleName || u.roleCode}
                          </span>
                        </td>
                        <td style={{ padding: 14 }}>
                          <span className={`badge ${u.status === 'Hoạt động' ? 'badge-success' : (u.status === 'Chờ duyệt' ? 'badge-warning' : 'badge-warning')}`}>
                            {u.status || 'Hoạt động'}
                          </span>
                        </td>
                        <td style={{ padding: 14, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <select 
                              value={u.roleCode}
                              onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                              style={{ fontWeight: 700, padding: '6px 12px', borderRadius: 8, borderColor: '#CBD5E1', fontSize: '0.85rem' }}
                            >
                              {roles.map(r => (
                                <option key={r.code} value={r.code}>{r.name}</option>
                              ))}
                            </select>
                            <button 
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', borderColor: '#FDE68A' }}
                              onClick={() => handleOpenResetPassword(u)}
                              title="Đổi mật khẩu người dùng"
                            >
                              🔑 Đổi MK
                            </button>
                            <button 
                              type="button"
                              className="btn btn-outline"
                              style={{ padding: '6px', color: '#EF4444', borderColor: '#FCA5A5' }}
                              onClick={() => handlePromptDeleteUser(u)}
                              title="Xóa người dùng"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination 
                  totalItems={usersList.length}
                  itemsPerPage={userPerPage}
                  currentPage={userPage}
                  onPageChange={setUserPage}
                  onItemsPerPageChange={setUserPerPage}
                />
              </div>
            )}

            {/* SUB TAB 3: ROLES LIST & SCREEN PERMISSIONS MATRIX */}
            {permSubTab === 'roles' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                {roles.map((r) => (
                  <div key={r.id} className="card" style={{ padding: 24, position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className="badge badge-warning" style={{ marginBottom: 6 }}>
                          Mã Role: {r.code}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>{r.name}</h3>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleOpenRoleModal(r)}
                        >
                          <Edit size={14} /> Sửa quyền
                        </button>
                        {r.code !== 'admin' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#EF4444' }}
                            onClick={() => handleDeleteRole(r.id, r.name)}
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>{r.description}</p>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: 8 }}>
                        Màn hình CMS được gán quyền ({r.allowedScreens ? r.allowedScreens.length : 0} màn hình):
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableCmsScreens.map(scr => {
                          const isAllowed = r.allowedScreens && r.allowedScreens.includes(scr.code);
                          return (
                            <span 
                              key={scr.code} 
                              style={{ 
                                fontSize: '0.75rem', 
                                padding: '3px 8px', 
                                borderRadius: 6, 
                                fontWeight: 700,
                                background: isAllowed ? '#D1FAE5' : '#F1F5F9',
                                color: isAllowed ? '#065F46' : '#94A3B8',
                                border: isAllowed ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                                opacity: isAllowed ? 1 : 0.6
                              }}
                            >
                              {isAllowed ? '✓' : '✗'} {scr.label.split(' ')[1]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION: BACKUP DATABASE */}
        {activeCmsSection === 'database' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A' }}>
                  Trung tâm Quản lý Cơ sở Dữ liệu & Sao lưu
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
                  Kết nối trực tiếp Supabase Cloud PostgreSQL — Đồng bộ 2 chiều, sao lưu JSON và quản lý cấu trúc bảng.
                </p>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', fontWeight: 800 }}
                onClick={handleSyncSupabase}
                disabled={isSyncingSupabase}
              >
                <RefreshCw size={16} className={isSyncingSupabase ? 'animate-spin' : ''} />
                <span>{isSyncingSupabase ? 'Đang đồng bộ...' : '🔄 Đồng bộ dữ liệu Supabase'}</span>
              </button>
            </div>

            {/* 1. SUPABASE CLOUD CONNECTION STATUS CARD */}
            <div className="card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#ffffff', border: 'none', boxShadow: '0 8px 24px rgba(15,23,42,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Supabase Cloud PostgreSQL Active
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px 0' }}>
                    https://dqwgponeoibhpcslqlgd.supabase.co
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                    Mô hình luồng: <strong style={{ color: '#E8920A' }}>Controller → Service → Model → Database</strong> (Không lưu trữ file cục bộ)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.85rem' }}
                    onClick={() => {
                      setBuildings(DataService.getBuildings());
                      setRooms(DataService.getRooms());
                      setBookings(DataService.getBookings());
                      showToast('⚡ Đã làm mới bộ nhớ hiển thị UI!');
                    }}
                  >
                    ⚡ Làm mới UI State
                  </button>
                </div>
              </div>
            </div>

            {/* 2. TABLE METRICS GRID */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                Bảng dữ liệu thực tế (Database Tables)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div className="card" style={{ padding: 18, borderLeft: '4px solid #E8920A' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>🏢 Bảng buildings</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>
                    {buildings.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Tòa nhà đang quản lý</div>
                </div>

                <div className="card" style={{ padding: 18, borderLeft: '4px solid #3B82F6' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>🛏️ Bảng rooms</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>
                    {rooms.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 700 }}>
                    {rooms.reduce((acc, r) => acc + (r.specificRooms?.length || 0), 0)} phòng cụ thể
                  </div>
                </div>

                <div className="card" style={{ padding: 18, borderLeft: '4px solid #10B981' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>📅 Bảng bookings</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>
                    {bookings.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Lịch hẹn xem phòng</div>
                </div>

                <div className="card" style={{ padding: 18, borderLeft: '4px solid #8B5CF6' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>👤 Bảng users & roles</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>
                    {usersList.length} / {roles.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 700 }}>Tài khoản & Vai trò</div>
                </div>
              </div>
            </div>

            {/* 3. EXPORT & RESTORE JSON BACKUP PANELS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* EXPORT PANEL */}
              <div className="card" style={{ padding: 24, borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Download size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Xuất bản Sao lưu JSON (Export Backup)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Phiên bản sao lưu v2.0.0 (Full Snapshot)</span>
                  </div>
                </div>

                <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
                  Tạo tệp tin sao lưu đầy đủ chứa toàn bộ 39 tòa nhà, 88 loại phòng, danh sách phòng cụ thể, lịch hẹn khách hàng và tài khoản phân quyền để lưu trữ an toàn.
                </p>

                <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Nội dung gói sao lưu:</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <div>✓ {buildings.length} Tòa nhà</div>
                    <div>✓ {rooms.length} Loại phòng</div>
                    <div>✓ {bookings.length} Lịch hẹn</div>
                    <div>✓ {usersList.length} Tài khoản</div>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '12px 20px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleExportBackup}
                >
                  <Download size={18} />
                  <span>Tải bản sao lưu JSON Database</span>
                </button>
              </div>

              {/* RESTORE PANEL */}
              <div className="card" style={{ padding: 24, borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Phục hồi Dữ liệu (Restore Backup)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Nạp lại dữ liệu từ tệp JSON sao lưu</span>
                  </div>
                </div>

                <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
                  Chọn tệp JSON sao lưu đã lưu trước đó để khôi phục toàn bộ hệ thống. Quá trình này sẽ cập nhật lại các bảng dữ liệu tương ứng.
                </p>

                <div style={{ border: '2px dashed #CBD5E1', padding: 20, borderRadius: 12, textAlign: 'center', background: '#F8FAFC', marginBottom: 20 }}>
                  <Upload size={28} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    Chọn tệp tin sao lưu (.json)
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleRestoreBackup}
                    style={{ fontSize: '0.85rem', maxWidth: 280, margin: '0 auto', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }}>
                  ⚠️ Khuyến nghị xuất một bản sao lưu trước khi tiến hành khôi phục.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL DETAILED BUILDING MODAL WITH MULTI IMAGE UPLOADER */}
      {showBuildingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 680, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowBuildingModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#0F172A' }}>
              {editingBuilding ? `Chỉnh sửa Tòa nhà ${editingBuilding.code}` : 'Thêm Tòa Nhà Mới'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Nhập thông tin địa lý, tọa độ Leaflet Map, người quản lý Host và tải nhiều ảnh cùng lúc.
            </p>

            {/* TAB SELECTOR */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E2E8F0', pb: 8 }}>
              <button 
                type="button"
                className={`btn ${buildingTab === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setBuildingTab('basic')}
              >
                📍 Địa chỉ & Tọa độ Map
              </button>
              <button 
                type="button"
                className={`btn ${buildingTab === 'manager' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setBuildingTab('manager')}
              >
                👤 Quản lý & Giá thuê
              </button>
              <button 
                type="button"
                className={`btn ${buildingTab === 'amenities' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setBuildingTab('amenities')}
              >
                🛡 PCCC & Tiện ích
              </button>
              <button 
                type="button"
                className={`btn ${buildingTab === 'images' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setBuildingTab('images')}
              >
                📸 Tải Nhiều Ảnh ({buildingForm.images?.length || 0})
              </button>
            </div>

            <form onSubmit={handleSaveBuildingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* TAB 1: BASIC & MAP */}
              {buildingTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mã Tòa nhà *</label>
                    <input type="text" placeholder="TN008" value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} required style={{ width: '100%' }} />
                  </div>

                  <BuildingLocationPicker
                    buildingForm={buildingForm}
                    setBuildingForm={setBuildingForm}
                    showToast={showToast}
                  />
                </div>
              )}

              {/* TAB 2: MANAGER & PRICING */}
              {buildingTab === 'manager' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Họ tên Người quản lý (Host) *</label>
                      <input type="text" value={buildingForm.hostName} onChange={(e) => setBuildingForm({ ...buildingForm, hostName: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số điện thoại Host *</label>
                      <input type="tel" value={buildingForm.hostPhone} onChange={(e) => setBuildingForm({ ...buildingForm, hostPhone: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Email liên hệ</label>
                    <input type="email" value={buildingForm.hostEmail} onChange={(e) => setBuildingForm({ ...buildingForm, hostEmail: e.target.value })} style={{ width: '100%' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Giá thuê thấp nhất (VND/tháng) *</label>
                      <input type="number" value={buildingForm.minPrice} onChange={(e) => setBuildingForm({ ...buildingForm, minPrice: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Giá thuê cao nhất (VND/tháng) *</label>
                      <input type="number" value={buildingForm.maxPrice} onChange={(e) => setBuildingForm({ ...buildingForm, maxPrice: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số phòng trống hiện tại *</label>
                    <input type="number" value={buildingForm.vacantRoomsCount} onChange={(e) => setBuildingForm({ ...buildingForm, vacantRoomsCount: e.target.value })} required style={{ width: '100%' }} />
                  </div>
                </div>
              )}

              {/* TAB 3: PCCC & AMENITIES */}
              {buildingTab === 'amenities' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <ShieldAlert size={16} />
                      <span>Trang thiết bị An toàn PCCC đạt chuẩn (Checklist PCCC):</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#FEF2F2', padding: 12, borderRadius: 10, border: '1px solid #FCA5A5' }}>
                      {pcccOptions.map(p => {
                        const checked = buildingForm.amenitiesPccc?.includes(p);
                        return (
                          <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: '#991B1B', fontWeight: 700 }}>
                            <input type="checkbox" checked={checked} onChange={() => handleTogglePccc(p)} style={{ accentColor: '#EF4444' }} />
                            <span>{p}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E8920A', display: 'block', marginBottom: 8 }}>
                      Tiện ích sử dụng chung Tòa nhà:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#FFF7ED', padding: 12, borderRadius: 10, border: '1px solid #FFEDD5' }}>
                      {buildingAmenityOptions.map(a => {
                        const checked = buildingForm.amenitiesBuilding?.includes(a);
                        return (
                          <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: '#9A3412', fontWeight: 700 }}>
                            <input type="checkbox" checked={checked} onChange={() => handleToggleBuildingAmenity(a)} style={{ accentColor: '#E8920A' }} />
                            <span>{a}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MULTI CLOUD IMAGES */}
              {buildingTab === 'images' && (
                <div>
                  <MultiImageUploader 
                    label="📸 Bộ sưu tập hình ảnh Tòa nhà (Tải nhiều ảnh cùng lúc)"
                    images={buildingForm.images}
                    onChange={(newImagesList) => setBuildingForm({ ...buildingForm, images: newImagesList, coverImage: newImagesList[0] || '' })}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBuildingModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Lưu Tòa Nhà</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL DETAILED ROOM MODAL WITH MULTI IMAGE UPLOADER */}
      {showRoomModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 680, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowRoomModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#0F172A' }}>
              {editingRoom ? `Chỉnh sửa Căn hộ ${editingRoom.roomNumber}` : 'Thêm Căn Hộ Mới'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Nhập chi tiết diện tích, mức giá thuê, trạng thái và tải nhiều ảnh phòng thực tế.
            </p>

            {/* TAB SELECTOR */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E2E8F0', pb: 8 }}>
              <button 
                type="button"
                className={`btn ${roomTab === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setRoomTab('basic')}
              >
                🏠 Thông tin Căn
              </button>
              <button 
                type="button"
                className={`btn ${roomTab === 'pricing' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setRoomTab('pricing')}
              >
                💰 Giá & Diện tích
              </button>
              <button 
                type="button"
                className={`btn ${roomTab === 'amenities' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setRoomTab('amenities')}
              >
                🛋 Nội thất phòng
              </button>
              <button 
                type="button"
                className={`btn ${roomTab === 'images' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                onClick={() => setRoomTab('images')}
              >
                📸 Tải Nhiều Ảnh ({roomForm.images?.length || 0})
              </button>
            </div>

            <form onSubmit={handleSaveRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* TAB 1: BASIC */}
              {roomTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Thuộc Tòa nhà *</label>
                      <select value={roomForm.buildingCode} onChange={(e) => setRoomForm({ ...roomForm, buildingCode: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                        {buildings.map(b => (
                          <option key={b.code} value={b.code}>{b.code} - {b.address}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tên Loại phòng *</label>
                      <input 
                        type="text" 
                        placeholder="VD: Studio - Ban công, Studio khép kín, Căn 1N1K..." 
                        value={roomForm.type} 
                        onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} 
                        required 
                        style={{ width: '100%', fontWeight: 700 }} 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Trạng thái giao dịch *</label>
                    <select value={roomForm.status} onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                      <option value="Có sẵn">Có sẵn (Còn trống)</option>
                      <option value="Đã thuê">Đã thuê (Đang có người ở)</option>
                      <option value="Đang bảo trì">Đang bảo trì / Sửa chữa</option>
                    </select>
                  </div>

                  {/* DANH SÁCH PHÒNG CỤ THỂ (NHẬP MÃ PHÒNG P501, P502...) */}
                  <SpecificRoomsSection 
                    roomForm={roomForm}
                    setRoomForm={setRoomForm}
                  />
                </div>
              )}

              {/* TAB 2: PRICING & AREA */}
              {roomTab === 'pricing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mức giá thuê (VND/tháng) *</label>
                      <input type="number" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Diện tích sử dụng (m²) *</label>
                      <input type="number" value={roomForm.area} onChange={(e) => setRoomForm({ ...roomForm, area: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số người ở tối đa *</label>
                      <input type="number" value={roomForm.maxOccupants} onChange={(e) => setRoomForm({ ...roomForm, maxOccupants: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Thời gian có thể chuyển vào *</label>
                      <input type="text" placeholder="Ở ngay hoặc DD/MM" value={roomForm.availableFrom} onChange={(e) => setRoomForm({ ...roomForm, availableFrom: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS & AMENITIES CHECKLIST */}
              {roomTab === 'amenities' && (
                <RoomDetailsForm 
                  roomForm={roomForm}
                  setRoomForm={setRoomForm}
                />
              )}

              {/* TAB 4: MULTI CLOUD IMAGES */}
              {roomTab === 'images' && (
                <div>
                  <MultiImageUploader 
                    label="📸 Bộ sưu tập ảnh phòng thực tế (Tải nhiều ảnh cùng lúc)"
                    images={roomForm.images}
                    onChange={(newImagesList) => setRoomForm({ ...roomForm, images: newImagesList, coverImage: newImagesList[0] || '' })}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoomModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Lưu Căn Hộ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 540, padding: 32, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowRoleModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 6, color: '#0F172A' }}>
              {editingRole ? `Chỉnh sửa Vai trò: ${editingRole.name}` : 'Tạo Vai Trò Mới (Role Access)'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 20 }}>
              Đánh dấu tích chọn các màn hình trong CMS được phép gán cho vai trò này.
            </p>

            <form onSubmit={handleSaveRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tên Vai trò (Role Name) *</label>
                <input type="text" placeholder="Ví dụ: Quản lý Kinh doanh, CTV Sale,..." value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mô tả vai trò</label>
                <input type="text" placeholder="Mô tả ngắn gọn chức năng của role này" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E8920A', display: 'block', marginBottom: 8 }}>
                  Gán quyền Màn hình CMS (Screen Permissions):
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  {availableCmsScreens.map(scr => {
                    const checked = roleForm.allowedScreens.includes(scr.code);
                    return (
                      <label key={scr.code} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: '#0F172A', padding: '4px 0' }}>
                        <input type="checkbox" checked={checked} onChange={() => handleToggleScreenPermission(scr.code)} style={{ marginTop: 3, accentColor: '#E8920A' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{scr.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{scr.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Lưu Vai trò & Phân quyền</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showUserModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowUserModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 16, color: '#0F172A' }}>Thêm Người dùng Hệ thống mới</h2>

            <form onSubmit={handleSaveNewUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                <input type="text" placeholder="Nhập họ tên" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Email *</label>
                <input type="email" placeholder="email@tinyhouse.vn" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số điện thoại *</label>
                <input type="tel" placeholder="0912345678" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} required style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mật khẩu khởi tạo *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type={showPassText ? "text" : "password"} 
                    placeholder="Bấm Tạo ngẫu nhiên" 
                    value={userForm.password} 
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} 
                    required 
                    style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.78rem', padding: '6px 10px', whiteSpace: 'nowrap' }} 
                    onClick={() => setUserForm({ ...userForm, password: generateRandomPassword(8) })}
                  >
                    🎲 Tạo MK ngẫu nhiên
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.78rem', padding: '6px 10px' }} 
                    onClick={() => handleCopyText(userForm.password, '📋 Đã sao chép mật khẩu khởi tạo!')}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Gán Vai trò (Role) *</label>
                <select value={userForm.roleCode} onChange={(e) => setUserForm({ ...userForm, roleCode: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                  {roles.map(r => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Thêm Người dùng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET / CHANGE PASSWORD MODAL */}
      {showResetPasswordModal && resetPassUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32, position: 'relative' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowResetPasswordModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#0F172A' }}>
              🔑 Đổi Mật Khẩu Người Dùng
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Đặt mật khẩu mới cho tài khoản <strong style={{ color: '#0F172A' }}>{resetPassUser.name}</strong> ({resetPassUser.email}).
            </p>

            <form onSubmit={handleSaveResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                  Mật khẩu mới *
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type={showPassText ? "text" : "password"} 
                    placeholder="Nhập mật khẩu mới..." 
                    value={resetPasswordVal} 
                    onChange={(e) => setResetPasswordVal(e.target.value)} 
                    required 
                    style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.78rem', padding: '6px 10px', whiteSpace: 'nowrap' }} 
                    onClick={() => setResetPasswordVal(generateRandomPassword(8))}
                  >
                    🎲 Tạo ngẫu nhiên
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.78rem', padding: '6px 10px' }} 
                    onClick={() => handleCopyText(resetPasswordVal, '📋 Đã sao chép mật khẩu mới!')}
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetPasswordModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>Lưu Mật Khẩu Mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {deleteConfirm.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{
            maxWidth: 440, width: '100%', padding: 28, borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', background: '#FFFFFF'
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#FEE2E2',
              color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <ShieldAlert size={28} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
              Xác nhận xóa {deleteConfirm.type === 'building' ? 'Tòa nhà' : 'Loại phòng'}?
            </h3>

            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EF4444', marginBottom: 6 }}>
              {deleteConfirm.name}
            </p>

            <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginBottom: 24 }}>
              {deleteConfirm.subText || 'Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ padding: '10px 20px', fontWeight: 700, flex: 1 }}
                onClick={() => setDeleteConfirm({ isOpen: false, type: '', id: '', name: '', subText: '' })}
              >
                Hủy bỏ
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ padding: '10px 20px', fontWeight: 800, background: '#EF4444', borderColor: '#EF4444', flex: 1 }}
                onClick={handleConfirmDelete}
              >
                Đồng ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
