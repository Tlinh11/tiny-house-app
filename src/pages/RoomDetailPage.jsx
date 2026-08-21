import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, ArrowLeft, Phone, ShieldCheck, CheckCircle2, Eye, Sparkles, X, PlayCircle,
  Wind, Droplets, WashingMachine, Refrigerator, BedDouble, Shirt, Blinds, ChefHat, 
  Armchair, Wifi, Smartphone, PawPrint, Camera, Fingerprint, Bell, BellRing, 
  ShowerHead, ArrowUpDown, ShieldAlert, Flame, DoorClosed, Sun, Bike
} from 'lucide-react';
import { DataService } from '../services/dataService';
import ImageLightboxModal from '../components/ImageLightboxModal';
import { getRoomTypeNumbers, getValidImageUrl } from '../utils/roomHierarchy';

const ALL_TIME_SLOTS = [
  { value: '07:00 AM', label: '07:00 AM' },
  { value: '07:30 AM', label: '07:30 AM' },
  { value: '08:00 AM', label: '08:00 AM' },
  { value: '08:30 AM', label: '08:30 AM' },
  { value: '09:00 AM', label: '09:00 AM' },
  { value: '09:30 AM', label: '09:30 AM' },
  { value: '10:00 AM', label: '10:00 AM' },
  { value: '10:30 AM', label: '10:30 AM' },
  { value: '11:00 AM', label: '11:00 AM' },
  { value: '11:30 AM', label: '11:30 AM' },
  { value: '12:00 PM', label: '12:00 PM' },
  { value: '12:30 PM', label: '12:30 PM' },
  { value: '01:00 PM', label: '01:00 PM' },
  { value: '01:30 PM', label: '01:30 PM' },
  { value: '02:00 PM', label: '02:00 PM' },
  { value: '02:30 PM', label: '02:30 PM' },
  { value: '03:00 PM', label: '03:00 PM' },
  { value: '03:30 PM', label: '03:30 PM' },
  { value: '04:00 PM', label: '04:00 PM' },
  { value: '04:30 PM', label: '04:30 PM' },
  { value: '05:00 PM', label: '05:00 PM' },
  { value: '05:30 PM', label: '05:30 PM' },
  { value: '06:00 PM', label: '06:00 PM' },
  { value: '06:30 PM', label: '06:30 PM' },
  { value: '07:00 PM', label: '07:00 PM' },
  { value: '07:30 PM', label: '07:30 PM' },
  { value: '08:00 PM', label: '08:00 PM' },
  { value: '08:30 PM', label: '08:30 PM' },
  { value: '09:00 PM', label: '09:00 PM' },
  { value: '09:30 PM', label: '09:30 PM' },
  { value: '10:00 PM', label: '10:00 PM' }
];

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const isPM = timeStr.toUpperCase().includes('PM');
  const isAM = timeStr.toUpperCase().includes('AM');
  const clean = timeStr.replace(/AM|PM/gi, '').trim();
  let [h, m] = clean.split(':').map(Number);
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + (m || 0);
};

// Custom Amenity Item with rounded bordered box matching user screenshot
function AmenityItem({ name }) {
  const getIcon = (label) => {
    const n = (label || '').toLowerCase().trim();
    if (n.includes('điều hòa')) return <Wind size={16} color="#64748B" />;
    if (n.includes('nóng lạnh') || n.includes('bình nóng lạnh')) return <Droplets size={16} color="#64748B" />;
    if (n.includes('máy giặt') || n.includes('máy sấy')) return <WashingMachine size={16} color="#64748B" />;
    if (n.includes('tủ lạnh')) return <Refrigerator size={16} color="#64748B" />;
    if (n.includes('giường') || n.includes('đệm')) return <BedDouble size={16} color="#64748B" />;
    if (n.includes('tủ quần áo') || n.includes('tủ áo')) return <Shirt size={16} color="#64748B" />;
    if (n.includes('rèm') || n.includes('rèm cửa')) return <Blinds size={16} color="#64748B" />;
    if (n.includes('bếp') || n.includes('tủ bếp')) return <ChefHat size={16} color="#64748B" />;
    if (n.includes('sofa') || n.includes('bàn')) return <Armchair size={16} color="#64748B" />;
    if (n.includes('wifi')) return <Wifi size={16} color="#64748B" />;
    if (n.includes('app') || n.includes('hệ sinh thái') || n.includes('cư dân')) return <Smartphone size={16} color="#64748B" />;
    if (n.includes('pet') || n.includes('thú cưng')) return <PawPrint size={16} color="#64748B" />;
    if (n.includes('camera')) return <Camera size={16} color="#64748B" />;
    if (n.includes('vân tay') || n.includes('khóa')) return <Fingerprint size={16} color="#64748B" />;
    if (n.includes('chuông')) return <BellRing size={16} color="#64748B" />;
    if (n.includes('báo cháy') || n.includes('báo khói') || n.includes('báo')) return <Bell size={16} color="#64748B" />;
    if (n.includes('sprinkler') || n.includes('chữa cháy')) return <ShowerHead size={16} color="#64748B" />;
    if (n.includes('thang máy')) return <ArrowUpDown size={16} color="#64748B" />;
    if (n.includes('thang thoát hiểm') || n.includes('thang')) return <ShieldAlert size={16} color="#64748B" />;
    if (n.includes('bình cứu hỏa') || n.includes('cứu hỏa')) return <Flame size={16} color="#64748B" />;
    if (n.includes('cửa chống cháy') || n.includes('chống cháy')) return <DoorClosed size={16} color="#64748B" />;
    if (n.includes('ban công') || n.includes('sân phơi')) return <Sun size={16} color="#64748B" />;
    if (n.includes('xe điện') || n.includes('chỗ để xe')) return <Bike size={16} color="#64748B" />;
    return <CheckCircle2 size={16} color="#64748B" />;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32,
        height: 32,
        minWidth: 32,
        borderRadius: 8,
        border: '1px solid #E2E8F0',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        {getIcon(name)}
      </div>
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
        {name}
      </span>
    </div>
  );
}

export default function RoomDetailPage({ roomId, setActiveTab }) {
  const [room, setRoom] = useState(() => DataService.getRoomById(roomId) || DataService.getRooms()[0]);
  const [building, setBuilding] = useState(() => DataService.getBuildingById(room?.buildingId || room?.buildingCode) || DataService.getBuildings()[0]);
  const [buildingRooms, setBuildingRooms] = useState(() => DataService.getRoomsByBuilding(building?.id));

  useEffect(() => {
    const syncData = () => {
      const r = DataService.getRoomById(roomId) || DataService.getRooms()[0];
      const b = DataService.getBuildingById(r?.buildingId || r?.buildingCode) || DataService.getBuildings()[0];
      setRoom(r);
      setBuilding(b);
      const bRooms = DataService.getRoomsByBuilding(b?.id);
      setBuildingRooms(bRooms && bRooms.length > 0 ? bRooms : [r]);
    };
    syncData();
    const unsubscribe = DataService.subscribe(syncData);
    return () => unsubscribe();
  }, [roomId]);

  // Direct list of room types in building
  const availableRoomTypes = buildingRooms && buildingRooms.length > 0 ? buildingRooms : [room];
  
  // Active Room Type ID
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(room.id || availableRoomTypes[0]?.id);

  // Fallback to active room type object
  const activeRoomType = availableRoomTypes.find(r => r.id === selectedRoomTypeId) || availableRoomTypes[0] || room;

  // Specific room numbers for active room type
  const specificRoomsList = getRoomTypeNumbers(activeRoomType);

  // Selected specific room number
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(specificRoomsList[0] || '501');

  // Handle switching room types
  const handleSelectRoomType = (rt) => {
    setSelectedRoomTypeId(rt.id);
    const cleanList = getRoomTypeNumbers(rt);
    setSelectedRoomNumber(cleanList[0] || '501');
  };

  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Lightbox & Tour Modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const todayDateStr = getTodayDateString();

  const [appointmentDate, setAppointmentDate] = useState(() => {
    const now = new Date();
    // If it's already late in the evening after 21:30, default to tomorrow
    if ((now.getHours() === 21 && now.getMinutes() > 30) || now.getHours() >= 22) {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const y = tomorrow.getFullYear();
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const d = String(tomorrow.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return todayDateStr;
  });

  const availableTimeSlots = useMemo(() => {
    if (!appointmentDate || appointmentDate > todayDateStr) {
      return ALL_TIME_SLOTS;
    }
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const filtered = ALL_TIME_SLOTS.filter(slot => {
      const slotMinutes = parseTimeToMinutes(slot.value);
      // Give at least current time or next slot
      return slotMinutes >= currentMinutes;
    });

    return filtered.length > 0 ? filtered : [{ value: '09:00 AM', label: 'Hết giờ hôm nay (Vui lòng chọn ngày mai)' }];
  }, [appointmentDate, todayDateStr]);

  const [appointmentTime, setAppointmentTime] = useState(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextSlot = ALL_TIME_SLOTS.find(slot => {
      const slotMinutes = parseTimeToMinutes(slot.value);
      return slotMinutes >= currentMinutes + 15;
    });
    return nextSlot ? nextSlot.value : '09:00 AM';
  });

  // Sync appointment time if currently selected time is no longer in available list
  useEffect(() => {
    if (availableTimeSlots.length > 0) {
      const isValid = availableTimeSlots.some(s => s.value === appointmentTime);
      if (!isValid && availableTimeSlots[0].value) {
        setAppointmentTime(availableTimeSlots[0].value);
      }
    }
  }, [availableTimeSlots, appointmentTime]);

  // Images Gallery (Left 1 big + Right 4 small)
  const rawGallery = [
    ...(activeRoomType.images || []),
    activeRoomType.coverImage,
    ...(building.images || []),
    building.coverImage,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
  ];
  const galleryImages = Array.from(new Set(rawGallery.map(img => getValidImageUrl(img)).filter(Boolean)));

  // Host Info (Room or Building)
  const hostName = activeRoomType.host?.name || building.host?.name || 'Ms. Huyền';
  const hostPhone = activeRoomType.host?.phone || building.host?.phone || '0386570401';
  const hostEmail = activeRoomType.host?.email || building.host?.email || 'email@example.com';

  // Dynamic Synchronized Amenities (Room + Building Shared + PCCC & Security)
  const roomFurniture = activeRoomType.amenitiesNoiThat && activeRoomType.amenitiesNoiThat.length > 0 
    ? activeRoomType.amenitiesNoiThat 
    : (activeRoomType.amenities?.furniture && activeRoomType.amenities.furniture.length > 0
        ? activeRoomType.amenities.furniture 
        : ['Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Rèm cửa']);

  const roomPrivate = activeRoomType.amenitiesRieng && activeRoomType.amenitiesRieng.length > 0 
    ? activeRoomType.amenitiesRieng 
    : (activeRoomType.amenities?.private && activeRoomType.amenities.private.length > 0
        ? activeRoomType.amenities.private
        : ['Wifi từng phòng', 'App hệ sinh thái cư dân']);

  const securityAmenities = activeRoomType.amenitiesAnNinh && activeRoomType.amenitiesAnNinh.length > 0
    ? activeRoomType.amenitiesAnNinh
    : ['Camera an ninh'];

  const pcccAmenities = Array.from(new Set([
    ...(activeRoomType.amenitiesPccc || []),
    ...(building.amenitiesPccc || ['Báo cháy', 'Chuông báo cháy'])
  ]));

  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    if (!appointmentDate) {
      alert("Vui lòng chọn ngày hẹn xem phòng.");
      return;
    }

    if (appointmentDate < todayDateStr) {
      alert("Thời gian hẹn không hợp lệ. Vui lòng chọn ngày từ hôm nay trở đi (không đặt lịch trong quá khứ).");
      return;
    }

    if (appointmentDate === todayDateStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const selectedMinutes = parseTimeToMinutes(appointmentTime);
      if (selectedMinutes < currentMinutes) {
        alert("Khung giờ hẹn đã qua. Vui lòng chọn khung giờ trong tương lai hoặc đặt lịch cho ngày mai.");
        return;
      }
    }

    setIsBookingLoading(true);
    try {
      await DataService.createBooking({
        customerName: fullName,
        phone: phone,
        email: email || "Chưa cung cấp",
        buildingCode: building.code,
        roomNumber: selectedRoomNumber,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime
      });
      setBookingSubmitted(true);
    } catch (err) {
      console.error('Booking error:', err);
      alert('Không thể gửi lịch hẹn. Vui lòng thử lại.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px 0 60px 0', background: '#FAFAFA', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 1160 }}>
        {/* 1. BACK BUTTON */}
        <div style={{ marginBottom: 14 }}>
          <button 
            type="button"
            onClick={() => setActiveTab ? setActiveTab('building-detail') : window.history.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        </div>

        {/* 2. BUILDING TITLE & ADDRESS */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
            {building.code}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <MapPin size={16} color="#64748B" />
            <span>{building.address}</span>
          </p>
        </div>

        {/* 3. BENTO PHOTO GALLERY (1 Big Left + 4 Small Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 12,
          height: 380,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          {/* Big Image (Left) */}
          <div 
            style={{ height: '100%', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
            onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
          >
            <img 
              src={galleryImages[0]} 
              alt="Main Room" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* 4 Small Images (Right 2x2 Grid) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, height: '100%' }}>
            {galleryImages.slice(1, 5).map((img, idx) => (
              <div 
                key={idx}
                style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                onClick={() => { setLightboxIndex(idx + 1); setLightboxOpen(true); }}
              >
                <img 
                  src={img} 
                  alt={`Preview ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                {idx === 3 && (
                  <button 
                    type="button"
                    style={{
                      position: 'absolute', bottom: 10, right: 10, fontSize: '0.75rem',
                      padding: '5px 12px', background: 'rgba(15,23,42,0.85)', color: '#fff',
                      border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(0);
                      setLightboxOpen(true);
                    }}
                  >
                    <Eye size={12} color="#E8920A" />
                    <span>Xem tất cả ảnh</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. SECTION: DANH SÁCH PHÒNG */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={18} color="#E8920A" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Danh sách phòng
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Chọn loại phòng và căn hộ phù hợp với bạn.
          </p>
        </div>

        {/* 5. LOẠI PHÒNG SELECTOR PILLS */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {availableRoomTypes.map((rt) => {
            const isSelected = rt.id === selectedRoomTypeId;
            return (
              <button
                key={rt.id}
                type="button"
                style={{
                  padding: '8px 18px',
                  borderRadius: 24,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? '#E6F7F0' : '#ffffff',
                  color: isSelected ? '#0D9488' : '#64748B',
                  border: isSelected ? '1.5px solid #0D9488' : '1px solid #E2E8F0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => handleSelectRoomType(rt)}
              >
                {rt.maxOccupants || 2} khách • {rt.type || 'Studio'}
              </button>
            );
          })}
        </div>

        {/* 6. SPECIFIC ROOM NUMBERS PILLS */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {specificRoomsList.map((num) => {
            const isSelected = selectedRoomNumber === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedRoomNumber(num)}
                style={{
                  minWidth: 46,
                  height: 34,
                  padding: '0 12px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: isSelected ? '#0D9488' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#0D9488',
                  border: isSelected ? '1.5px solid #0D9488' : '1.5px solid #CCFBF1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected ? '0 4px 10px rgba(13, 148, 136, 0.25)' : 'none'
                }}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* 7. QUICK BADGES */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28 }}>
          <span style={{ background: '#CCFBF1', color: '#0F766E', padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 700 }}>
            {activeRoomType.area || 30}m²
          </span>
          <span style={{ background: '#CCFBF1', color: '#0F766E', padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 700 }}>
            {activeRoomType.maxOccupants || 2} người
          </span>
          <span style={{ background: '#0D9488', color: '#ffffff', padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 800 }}>
            {specificRoomsList.length} phòng trống
          </span>
        </div>

        {/* 8. TWO-COLUMN MAIN BODY: LEFT DETAILS & RIGHT HOST/BOOKING */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* LEFT COLUMN */}
          <div>
            {/* ROOM SPECS TABLE BOX */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 28, background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ background: '#0F172A', color: '#ffffff', padding: '10px 18px', fontWeight: 800, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedRoomNumber}</span>
                <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>{activeRoomType.status || 'Có sẵn'}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 18px', color: '#64748B', fontWeight: 600 }}>Giá thuê phòng</td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 900, fontSize: '1.05rem', color: '#DC2626' }}>
                      {(activeRoomType.price || 5000000).toLocaleString('vi-VN')}đ <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>/tháng</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 18px', color: '#64748B', fontWeight: 600 }}>Loại phòng</td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {activeRoomType.type || 'Studio - Ban công'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 18px', color: '#64748B', fontWeight: 600 }}>Diện tích</td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {activeRoomType.area || 30}m²
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 18px', color: '#64748B', fontWeight: 600 }}>Số người ở tối đa</td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {activeRoomType.maxOccupants || 2} người
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 18px', color: '#64748B', fontWeight: 600 }}>Số phòng trống</td>
                    <td style={{ padding: '10px 18px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                      {specificRoomsList.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AMENITIES SECTION (TIỆN NGHI & TIỆN ÍCH - EXACT ICONS MATCHING SCREENSHOT) */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 20, color: '#0F172A' }}>
                Tiện nghi & Tiện ích
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* 1. NỘI THẤT PHÒNG */}
                {roomFurniture.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0D9488', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.1rem' }}>✳</span> Nội thất phòng
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {roomFurniture.map((item, idx) => (
                        <AmenityItem key={idx} name={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. TIỆN ÍCH RIÊNG */}
                {roomPrivate.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0D9488', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.1rem' }}>✳</span> Tiện ích riêng
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {roomPrivate.map((item, idx) => (
                        <AmenityItem key={idx} name={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AN NINH - AN TOÀN */}
                {securityAmenities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0D9488', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.1rem' }}>✳</span> An ninh - An toàn
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {securityAmenities.map((item, idx) => (
                        <AmenityItem key={idx} name={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. PHÒNG CHÁY CHỮA CHÁY */}
                {pcccAmenities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0D9488', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.1rem' }}>✳</span> Phòng cháy chữa cháy
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {pcccAmenities.map((item, idx) => (
                        <AmenityItem key={idx} name={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MÔ TẢ CHI TIẾT (RICH DESCRIPTION MATCHING SCREENSHOT) */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', marginBottom: 14 }}>
                Mô tả chi tiết
              </h3>
              
              <div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#334155', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontWeight: 800, color: '#D97706', fontSize: '0.92rem' }}>
                  📍 CHO THUÊ {activeRoomType.type ? activeRoomType.type.toUpperCase() : 'STUDIO KHÉP KÍN CÓ BAN CÔNG'} - GIÁ ƯU ĐÃI - NỘI THẤT MỚI CƠ BẢN!
                </div>

                <div>
                  {activeRoomType.description || (
                    <>
                      <p style={{ margin: '0 0 10px 0' }}>
                        Bạn đang tìm kiếm một không gian sống gọn gàng, thoải mái và riêng tư? Căn hộ Studio khép kín với thiết kế hiện đại này chính là sự lựa chọn hoàn hảo, bạn chỉ cần dọn vào ở ngay!
                      </p>

                      <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>✨</span> Thiết kế & Nội thất tiện nghi:
                      </div>
                      <ul style={{ margin: '4px 0 10px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li><strong>Không gian Studio:</strong> Được trang bị nội thất cơ bản mới, bao gồm giường ngủ và tủ quần áo bằng gỗ thiết kế hiện đại, đi kèm điều hòa mát lạnh.</li>
                        <li><strong>Ban công siêu thoáng:</strong> Căn hộ sở hữu ban công đón nắng gió tự nhiên, đặc biệt được bố trí sẵn máy giặt riêng cực kỳ tiện lợi cho việc giặt giũ hàng ngày.</li>
                        <li><strong>Vệ sinh khép kín:</strong> Nhà vệ sinh riêng biệt trong phòng đảm bảo sự riêng tư. Không gian ốp gạch sạch sẽ, trang bị đầy đủ thiết bị vệ sinh cao cấp như vòi sen cây, bồn cầu và lavabo.</li>
                      </ul>

                      <div style={{ fontWeight: 800, color: '#0F172A', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>💖</span> Tiện ích & An ninh tòa nhà:
                      </div>
                      <ul style={{ margin: '4px 0 10px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <li><strong>Tầng thượng cực rộng:</strong> Sở hữu khu vực sân thượng lợp mái che vô cùng rộng rãi, lát gạch sạch sẽ, là không gian lý tưởng để cư dân thư giãn, hóng gió.</li>
                        <li><strong>An ninh 24/7:</strong> Hệ thống ra vào kiểm soát bằng khóa vân tay và camera an ninh giám sát liên tục.</li>
                        <li><strong>PCCC đạt chuẩn an toàn:</strong> Tòa nhà trang bị hệ thống phòng cháy chữa cháy cực kỳ bài bản bao gồm: Sprinkler, báo cháy, báo khói, chuông báo cháy, thang thoát hiểm, cửa chống cháy và bình cứu hỏa.</li>
                      </ul>

                      <p style={{ margin: '10px 0 0 0', fontWeight: 700, color: '#0F766E' }}>
                        Căn hộ đang có mức giá siêu ưu đãi dành cho khách chốt sớm! Nhanh tay "Đặt Lịch" để hẹn xem phòng sớm nhất nhaaaa!
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: BOOKING FORM */}
          <div style={{ position: 'sticky', top: 90 }}>
            {/* BOOKING CALENDAR FORM */}
            <div className="card" style={{ padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                Đặt lịch xem phòng
              </div>

              {bookingSubmitted ? (
                <div style={{ background: '#D1FAE5', color: '#065F46', padding: 16, borderRadius: 12, fontSize: '0.85rem', textAlign: 'center', border: '1px solid #A7F3D0' }}>
                  <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>Đặt lịch xem phòng thành công!</div>
                  <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#047857', lineHeight: 1.5 }}>
                    Yêu cầu đã được ghi nhận và gửi thông báo tới Ban Quản Lý (mkt.tinyhouses@gmail.com). Nhân viên Tiny Houses sẽ liên hệ với bạn trong ít phút!
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: 12, width: '100%', fontSize: '0.82rem', padding: '8px' }}
                    onClick={() => setBookingSubmitted(false)}
                  >
                    Đặt thêm lịch hẹn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tên</label>
                    <input 
                      type="text" 
                      placeholder="Họ và tên" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="0912 345 678" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Email</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Thời gian hẹn</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 6 }}>
                      <input 
                        type="date" 
                        value={appointmentDate}
                        min={todayDateStr}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        required
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
                      />
                      <select 
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.78rem', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff' }}
                      >
                        {availableTimeSlots.map(slot => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isBookingLoading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: 4,
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #F59E0B 0%, #E8920A 100%)',
                      border: 'none',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(232, 146, 10, 0.25)',
                      opacity: isBookingLoading ? 0.7 : 1,
                      cursor: isBookingLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isBookingLoading ? '⏳ Đang gửi yêu cầu...' : 'Đặt lịch'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        currentIndex={lightboxIndex}
        onIndexChange={setLightboxIndex}
        title={`Ảnh căn hộ ${selectedRoomNumber} - Tòa ${building.code}`}
      />
    </div>
  );
}
