import React, { useState } from 'react';
import { 
  LayoutDashboard, Building2, Home, Calendar, Users, FileText, Settings, Download, Upload, 
  RefreshCw, CheckCircle2, ShieldCheck, DollarSign, Plus, Edit, Trash2, Key, Lock, UserCheck, Check, ShieldAlert, LogOut, X, ArrowUpDown, MapPin, User, Shield 
} from 'lucide-react';
import { DataService } from '../../services/dataService';
import Pagination from '../../components/Pagination';
import Logo from '../../components/Logo';
import ImageUploader from '../../components/ImageUploader';

export default function CMSLayout({ setActiveTab, currentUser, setCurrentUser, onOpenAuthModal, onLogout }) {
  const [activeCmsSection, setActiveCmsSection] = useState('dashboard');
  const [notification, setNotification] = useState('');
  const [permSubTab, setPermSubTab] = useState('roles'); // 'roles', 'users'

  // Sorting State
  const [buildingSortBy, setBuildingSortBy] = useState('vacant-desc'); // 'vacant-desc', 'price-asc', 'price-desc', 'code'
  const [roomSortBy, setRoomSortBy] = useState('status'); // 'status', 'price-asc', 'price-desc'

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

  // Building Modal Tab & Form State
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [buildingTab, setBuildingTab] = useState('basic'); // 'basic', 'manager', 'amenities', 'images'
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
    hostName: 'Đỗ Thảo Nguyên',
    hostPhone: '0167423824',
    hostEmail: 'minhxuyen88@gmail.com',
    amenitiesPccc: ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy'],
    amenitiesBuilding: ['Thang máy', 'Camera an ninh', 'Khóa vân tay', 'Máy giặt chung']
  });

  // Room Modal Tab & Form State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomTab, setRoomTab] = useState('basic'); // 'basic', 'pricing', 'amenities', 'images'
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

  // User Form Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleCode: 'ctv_sale'
  });

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

  // Get active role object for current user
  const activeUser = currentUser || usersList[0];
  const userRoleObj = roles.find(r => r.code === activeUser.roleCode || r.name === activeUser.roleName) || roles[0];
  const allowedScreens = userRoleObj ? userRoleObj.allowedScreens : availableCmsScreens.map(s => s.code);

  // Show Toast Message
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Process sorted buildings
  const sortedBuildings = [...buildings].sort((a, b) => {
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

  // Process paginated bookings
  const paginatedBookings = bookings.slice((bookingPage - 1) * bookingPerPage, bookingPage * bookingPerPage);

  // Process paginated CTVs
  const paginatedCtvs = ctvs.slice((ctvPage - 1) * ctvPerPage, ctvPage * ctvPerPage);

  // Process paginated Users
  const paginatedUsers = usersList.slice((userPage - 1) * userPerPage, userPage * userPerPage);

  // Quick switch role for testing
  const handleQuickSwitchUserRole = (roleCode) => {
    const targetUser = usersList.find(u => u.roleCode === roleCode) || {
      id: `usr_temp`,
      name: `Test ${roleCode}`,
      email: `${roleCode}@tinyhouse.vn`,
      roleCode: roleCode,
      roleName: roles.find(r => r.code === roleCode)?.name || roleCode,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    };
    DataService.setCurrentUser(targetUser);
    setCurrentUser(targetUser);
    
    const targetRole = roles.find(r => r.code === roleCode) || roles[0];
    if (targetRole && targetRole.allowedScreens && !targetRole.allowedScreens.includes(activeCmsSection)) {
      setActiveCmsSection(targetRole.allowedScreens[0] || 'dashboard');
    }
    showToast(`Đã chuyển sang góc nhìn của vai trò: ${targetRole.name}`);
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
        district: bldg.district || 'Hà Đông',
        latitude: bldg.latitude || 20.9715,
        longitude: bldg.longitude || 105.7780,
        minPrice: bldg.minPrice || 3500000,
        maxPrice: bldg.maxPrice || 6500000,
        isTiny: bldg.isTiny,
        ownerType: bldg.ownerType || (bldg.isTiny ? 'tiny' : 'partner'),
        vacantRoomsCount: bldg.vacantRoomsCount || 5,
        coverImage: bldg.coverImage || '',
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
        district: 'Hà Đông',
        latitude: 20.9715,
        longitude: 105.7780,
        minPrice: 3500000,
        maxPrice: 6500000,
        isTiny: true,
        ownerType: 'tiny',
        vacantRoomsCount: 5,
        coverImage: '',
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
    const updated = DataService.saveBuilding({
      id: editingBuilding ? editingBuilding.id : `bldg_${Date.now()}`,
      code: buildingForm.code,
      name: buildingForm.name || `Tòa nhà ${buildingForm.code} - ${buildingForm.address}`,
      address: buildingForm.address,
      district: buildingForm.district,
      latitude: Number(buildingForm.latitude),
      longitude: Number(buildingForm.longitude),
      minPrice: Number(buildingForm.minPrice),
      maxPrice: Number(buildingForm.maxPrice),
      isTiny: buildingForm.ownerType === 'tiny',
      ownerType: buildingForm.ownerType,
      vacantRoomsCount: Number(buildingForm.vacantRoomsCount),
      coverImage: buildingForm.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
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

  // Room Detailed Modal Handlers
  const handleOpenRoomModal = (rm = null) => {
    setRoomTab('basic');
    if (rm) {
      setEditingRoom(rm);
      setRoomForm({
        buildingCode: rm.buildingCode,
        roomNumber: rm.roomNumber,
        type: rm.type,
        price: rm.price,
        area: rm.area || 25,
        maxOccupants: rm.maxOccupants || 2,
        availableFrom: rm.availableFrom || 'Ở ngay',
        status: rm.status,
        coverImage: rm.images && rm.images.length ? rm.images[0] : '',
        amenitiesFurniture: rm.amenities?.furniture || ['Điều hòa', 'Nóng lạnh', 'Giường', 'Tủ quần áo'],
        amenitiesPrivate: rm.amenities?.private || ['Wifi từng phòng', 'Khóa vân tay', 'Ban công']
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        buildingCode: buildings[0]?.code || 'TN008',
        roomNumber: `${Math.floor(100 + Math.random() * 800)}`,
        type: 'Studio khép kín',
        price: 3500000,
        area: 25,
        maxOccupants: 2,
        availableFrom: 'Ở ngay',
        status: 'Có sẵn',
        coverImage: '',
        amenitiesFurniture: ['Điều hòa', 'Nóng lạnh', 'Giường nệm', 'Tủ quần áo'],
        amenitiesPrivate: ['Wifi từng phòng', 'Khóa vân tay', 'Ban công']
      });
    }
    setShowRoomModal(true);
  };

  const handleToggleFurniture = (item) => {
    const list = roomForm.amenitiesFurniture || [];
    if (list.includes(item)) {
      setRoomForm({ ...roomForm, amenitiesFurniture: list.filter(i => i !== item) });
    } else {
      setRoomForm({ ...roomForm, amenitiesFurniture: [...list, item] });
    }
  };

  const handleSaveRoomSubmit = (e) => {
    e.preventDefault();
    const updated = DataService.saveRoom({
      id: editingRoom ? editingRoom.id : `rm_${Date.now()}`,
      buildingCode: roomForm.buildingCode,
      buildingName: `Tòa nhà ${roomForm.buildingCode}`,
      roomNumber: roomForm.roomNumber,
      type: roomForm.type,
      price: Number(roomForm.price),
      area: Number(roomForm.area),
      maxOccupants: Number(roomForm.maxOccupants),
      availableFrom: roomForm.availableFrom,
      status: roomForm.status,
      images: roomForm.coverImage ? [roomForm.coverImage] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
      amenities: {
        furniture: roomForm.amenitiesFurniture,
        private: roomForm.amenitiesPrivate
      }
    });

    setRooms(updated);
    setShowRoomModal(false);
    showToast(editingRoom ? `Đã cập nhật Căn ${roomForm.roomNumber}` : `Thêm Căn hộ ${roomForm.roomNumber} mới thành công!`);
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
    const updated = DataService.saveUser({
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone,
      roleCode: roleObj.code,
      roleName: roleObj.name,
      status: "Hoạt động"
    });
    setUsersList(updated);
    setShowUserModal(false);
    showToast(`Thêm người dùng mới "${userForm.name}" thành công!`);
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

  const handleConfirmBooking = (id) => {
    const updated = DataService.updateBookingStatus(id, 'Đã xác nhận');
    setBookings(updated);
    showToast(`Đã xác nhận lịch xem phòng #${id}`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1F5F9' }}>
      {/* FIXED STICKY CMS SIDEBAR */}
      <aside style={{ 
        width: 270, 
        background: '#0F172A', 
        color: '#94A3B8', 
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        alignSelf: 'flex-start'
      }}>
        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <Logo dark={true} size={36} showSubtitle={false} onClick={() => setActiveTab('home')} />
        </div>

        {/* Current Active User Profile Card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Tài khoản đang đăng nhập:</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', marginTop: 2 }}>{activeUser.name}</div>
          <div className="badge badge-warning" style={{ marginTop: 6, fontSize: '0.7rem', padding: '2px 8px' }}>
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
            onClick={() => setActiveCmsSection('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </button>
        )}

        {allowedScreens.includes('buildings') && (
          <button 
            className={`btn ${activeCmsSection === 'buildings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'buildings' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('buildings')}
          >
            <Building2 size={18} />
            <span>Quản lý Tòa nhà ({buildings.length})</span>
          </button>
        )}

        {allowedScreens.includes('rooms') && (
          <button 
            className={`btn ${activeCmsSection === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'rooms' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('rooms')}
          >
            <Home size={18} />
            <span>Quản lý Phòng ({rooms.length})</span>
          </button>
        )}

        {allowedScreens.includes('bookings') && (
          <button 
            className={`btn ${activeCmsSection === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'bookings' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('bookings')}
          >
            <Calendar size={18} />
            <span>Lịch xem phòng ({bookings.length})</span>
          </button>
        )}

        {allowedScreens.includes('ctv') && (
          <button 
            className={`btn ${activeCmsSection === 'ctv' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'ctv' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('ctv')}
          >
            <Users size={18} />
            <span>Quản lý CTV & Hoa hồng</span>
          </button>
        )}

        {allowedScreens.includes('permissions') && (
          <button 
            className={`btn ${activeCmsSection === 'permissions' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'permissions' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('permissions')}
          >
            <ShieldCheck size={18} />
            <span>Phân quyền & Role ({roles.length})</span>
          </button>
        )}

        {allowedScreens.includes('database') && (
          <button 
            className={`btn ${activeCmsSection === 'database' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', background: activeCmsSection === 'database' ? '#E8920A' : 'transparent', color: '#fff' }}
            onClick={() => setActiveCmsSection('database')}
          >
            <Download size={18} />
            <span>Backup & Database</span>
          </button>
        )}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', color: '#94a3b8', borderColor: '#334155', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('home')}
          >
            ← Về Website người dùng
          </button>

          {onLogout && (
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', color: '#EF4444', fontSize: '0.85rem', padding: '8px' }}
              onClick={onLogout}
            >
              <LogOut size={14} />
              <span>Đăng xuất tài khoản</span>
            </button>
          )}
        </div>
      </aside>

      {/* CMS MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: 32, minWidth: 0 }}>
        {/* TOP BAR WITH DEMO ROLE SWITCHER */}
        <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck color="#E8920A" size={20} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
              Kiểm tra phân quyền hiển thị theo Vai trò (Test View Mode):
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeUser.roleCode === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => handleQuickSwitchUserRole('admin')}
            >
              👑 Super Admin
            </button>
            <button 
              className={`btn ${activeUser.roleCode === 'ctv_sale' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => handleQuickSwitchUserRole('ctv_sale')}
            >
              🤝 CTV Sale
            </button>
            <button 
              className={`btn ${activeUser.roleCode === 'building_manager' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => handleQuickSwitchUserRole('building_manager')}
            >
              🏢 Quản lý Tòa
            </button>
            <button 
              className={`btn ${activeUser.roleCode === 'accountant' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => handleQuickSwitchUserRole('accountant')}
            >
              💼 Kế toán
            </button>
          </div>
        </div>

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
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Tổng số Phòng</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{rooms.length}</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: 4 }}>80 Căn sẵn sàng giao dịch</div>
              </div>

              <div className="card" style={{ padding: 20 }}>
                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Lịch xem phòng chờ duyệt</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EF4444', marginTop: 4 }}>
                  {bookings.filter(b => b.status === 'Chờ xác nhận').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>Cần xử lý ngay</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: BUILDINGS */}
        {activeCmsSection === 'buildings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Danh sách Tòa nhà ({buildings.length})</h1>

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
                        <button style={{ background: 'none', color: '#64748B', marginRight: 10 }} title="Sửa chi tiết" onClick={() => handleOpenBuildingModal(b)}>
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
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

        {/* SECTION: ROOMS */}
        {activeCmsSection === 'rooms' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Danh sách Phòng ({rooms.length})</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* SORT CONTROL */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
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
                    <option value="status">Phòng trống (Có sẵn) trước (Mặc định)</option>
                    <option value="price-asc">Giá thuê: Thấp → Cao</option>
                    <option value="price-desc">Giá thuê: Cao → Thấp</option>
                  </select>
                </div>

                <button className="btn btn-primary" onClick={() => handleOpenRoomModal()}>
                  <Plus size={18} />
                  <span>Thêm Căn hộ mới</span>
                </button>
              </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: 14 }}>Phòng</th>
                    <th style={{ padding: 14 }}>Thuộc Tòa</th>
                    <th style={{ padding: 14 }}>Loại phòng & Diện tích</th>
                    <th style={{ padding: 14 }}>Mức giá / tháng</th>
                    <th style={{ padding: 14 }}>Trạng thái</th>
                    <th style={{ padding: 14, textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRooms.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={r.images && r.images.length ? r.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'} alt={r.roomNumber} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontWeight: 800 }}>Căn {r.roomNumber}</span>
                      </td>
                      <td style={{ padding: 14, fontWeight: 700, color: '#E8920A' }}>{r.buildingCode}</td>
                      <td style={{ padding: 14 }}>
                        <div style={{ fontWeight: 700 }}>{r.type}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>📐 {r.area} m² · 👥 Tối đa {r.maxOccupants} người</div>
                      </td>
                      <td style={{ padding: 14, fontWeight: 800, color: '#E8920A' }}>{(r.price).toLocaleString('vi-VN')} VND</td>
                      <td style={{ padding: 14 }}>
                        <span className={`badge ${r.status === 'Có sẵn' ? 'badge-success' : 'badge-warning'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: 14, textAlign: 'right' }}>
                        <button style={{ background: 'none', color: '#64748B', marginRight: 10 }} title="Sửa chi tiết" onClick={() => handleOpenRoomModal(r)}>
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINATION */}
              <Pagination 
                totalItems={sortedRooms.length}
                itemsPerPage={roomPerPage}
                currentPage={roomPage}
                onPageChange={setRoomPage}
                onItemsPerPageChange={setRoomPerPage}
              />
            </div>
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
                        <span className={`badge ${b.status === 'Đã xác nhận' ? 'badge-success' : 'badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: 14, textAlign: 'right' }}>
                        {b.status === 'Chờ xác nhận' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleConfirmBooking(b.id)}
                          >
                            Xác nhận lịch
                          </button>
                        )}
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

        {/* SECTION: PERMISSIONS & ROLES MANAGEMENT */}
        {activeCmsSection === 'permissions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Phân quyền Người dùng & Vai trò (Role Access)</h1>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
                  Tạo các Vai trò (Role) tùy chỉnh và gán danh sách màn hình trong CMS được phép truy cập cho từng Role
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
                className={`btn ${permSubTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 8, padding: '8px 18px', fontWeight: 800 }}
                onClick={() => setPermSubTab('roles')}
              >
                🔐 Danh sách Vai trò (Roles & Perms)
              </button>
              <button 
                className={`btn ${permSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 8, padding: '8px 18px', fontWeight: 800 }}
                onClick={() => setPermSubTab('users')}
              >
                👤 Người dùng & Gán Role ({usersList.length})
              </button>
            </div>

            {/* SUB TAB 1: ROLES LIST & SCREEN PERMISSIONS MATRIX */}
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
                          <Edit size={14} />
                          <span>Sửa quyền</span>
                        </button>
                        {r.code !== 'admin' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', color: '#EF4444' }}
                            onClick={() => handleDeleteRole(r.id, r.name)}
                            title="Xóa role"
                          >
                            <Trash2 size={14} />
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
                          <span className="badge badge-success">{u.status || 'Hoạt động'}</span>
                        </td>
                        <td style={{ padding: 14, textAlign: 'right' }}>
                          <select 
                            value={u.roleCode}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            style={{ fontWeight: 700, padding: '6px 12px', borderRadius: 8, borderColor: '#CBD5E1', fontSize: '0.85rem' }}
                          >
                            {roles.map(r => (
                              <option key={r.code} value={r.code}>{r.name}</option>
                            ))}
                          </select>
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
          </div>
        )}

        {/* SECTION: BACKUP DATABASE */}
        {activeCmsSection === 'database' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 24 }}>Quản lý Dữ liệu & Backup JSON Database</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Download color="#E8920A" size={20} />
                  <span>Xuất bản Sao lưu (Export JSON)</span>
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
                  Tải toàn bộ cơ sở dữ liệu thực tế gồm 19 tòa nhà, phòng trọ, phân quyền Roles & Người dùng về máy tính bên ngoài.
                </p>
                <button className="btn btn-primary" onClick={handleExportBackup}>
                  <Download size={18} />
                  <span>Tải bản sao lưu JSON Database</span>
                </button>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Upload color="#10B981" size={20} />
                  <span>Phục hồi Dữ liệu (Restore Backup)</span>
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
                  Chọn tập tin sao lưu JSON để khôi phục toàn bộ trạng thái dữ liệu hệ thống.
                </p>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleRestoreBackup}
                  style={{ display: 'block', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL DETAILED BUILDING MODAL (TABBED FORM) */}
      {showBuildingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowBuildingModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#0F172A' }}>
              {editingBuilding ? `Chỉnh sửa Tòa nhà ${editingBuilding.code}` : 'Thêm Tòa Nhà Mới'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Nhập thông tin địa lý, tọa độ Leaflet Map, người quản lý Host và an toàn PCCC.
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
                📸 Ảnh Cloud
              </button>
            </div>

            <form onSubmit={handleSaveBuildingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* TAB 1: BASIC & MAP */}
              {buildingTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mã Tòa nhà *</label>
                      <input type="text" placeholder="TN008" value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Quận / Huyện *</label>
                      <select value={buildingForm.district} onChange={(e) => setBuildingForm({ ...buildingForm, district: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                        <option value="Hà Đông">Hà Đông</option>
                        <option value="Thanh Xuân">Thanh Xuân</option>
                        <option value="Tây Hồ">Tây Hồ</option>
                        <option value="Hoàng Mai">Hoàng Mai</option>
                        <option value="Cầu Giấy">Cầu Giấy</option>
                        <option value="Bắc Từ Liêm">Bắc Từ Liêm</option>
                        <option value="Nam Từ Liêm">Nam Từ Liêm</option>
                        <option value="Đống Đa">Đống Đa</option>
                        <option value="Ba Đình">Ba Đình</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Địa chỉ đầy đủ *</label>
                    <input type="text" placeholder="35 Đông Ngạc, Phường Đông Ngạc,..." value={buildingForm.address} onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })} required style={{ width: '100%' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Kinh độ (Longitude) *</label>
                      <input type="number" step="0.0001" value={buildingForm.longitude} onChange={(e) => setBuildingForm({ ...buildingForm, longitude: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Vĩ độ (Latitude) *</label>
                      <input type="number" step="0.0001" value={buildingForm.latitude} onChange={(e) => setBuildingForm({ ...buildingForm, latitude: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Loại hình sở hữu *</label>
                    <select value={buildingForm.ownerType} onChange={(e) => setBuildingForm({ ...buildingForm, ownerType: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                      <option value="tiny">Tòa nhà Tiny Houses chính chủ</option>
                      <option value="partner">Tòa nhà Đối tác hợp tác</option>
                    </select>
                  </div>
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

              {/* TAB 4: CLOUD IMAGES */}
              {buildingTab === 'images' && (
                <div>
                  <ImageUploader 
                    label="📸 Tải ảnh bìa Tòa nhà từ máy tính"
                    value={buildingForm.coverImage}
                    onChange={(newUrl) => setBuildingForm({ ...buildingForm, coverImage: newUrl })}
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

      {/* FULL DETAILED ROOM MODAL (TABBED FORM) */}
      {showRoomModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }} onClick={() => setShowRoomModal(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4, color: '#0F172A' }}>
              {editingRoom ? `Chỉnh sửa Căn hộ ${editingRoom.roomNumber}` : 'Thêm Căn Hộ Mới'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
              Nhập chi tiết diện tích, mức giá thuê, trạng thái và checklist trang thiết bị nội thất.
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
                📸 Ảnh phòng Cloud
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
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số phòng / Tên căn *</label>
                      <input type="text" placeholder="Phòng 201" value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} required style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Loại hình căn hộ *</label>
                    <select value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                      <option value="Studio khép kín">Studio khép kín</option>
                      <option value="Căn 1N1K">Căn 1N1K (1 Phòng ngủ 1 Khách)</option>
                      <option value="Căn 2N1K">Căn 2N1K (2 Phòng ngủ 1 Khách)</option>
                      <option value="Studio gác xép">Studio gác xép</option>
                      <option value="Studio ban công">Studio ban công</option>
                      <option value="Căn hộ nguyên tầng">Căn hộ nguyên tầng</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Trạng thái giao dịch *</label>
                    <select value={roomForm.status} onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })} style={{ width: '100%', fontWeight: 700 }}>
                      <option value="Có sẵn">Có sẵn (Còn trống)</option>
                      <option value="Đã thuê">Đã thuê (Đang có người ở)</option>
                      <option value="Đang bảo trì">Đang bảo trì / Sửa chữa</option>
                    </select>
                  </div>
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

              {/* TAB 3: FURNITURE CHECKLIST */}
              {roomTab === 'amenities' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E8920A', display: 'block', marginBottom: 8 }}>
                    Trang thiết bị Nội thất trong phòng (Furniture Checklist):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {furnitureOptions.map(f => {
                      const checked = roomForm.amenitiesFurniture?.includes(f);
                      return (
                        <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: '#0F172A', fontWeight: 700 }}>
                          <input type="checkbox" checked={checked} onChange={() => handleToggleFurniture(f)} style={{ accentColor: '#E8920A' }} />
                          <span>{f}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: CLOUD IMAGES */}
              {roomTab === 'images' && (
                <div>
                  <ImageUploader 
                    label="📸 Tải ảnh phòng thực tế từ máy tính"
                    value={roomForm.coverImage}
                    onChange={(newUrl) => setRoomForm({ ...roomForm, coverImage: newUrl })}
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
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 32, position: 'relative' }}>
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
    </div>
  );
}
