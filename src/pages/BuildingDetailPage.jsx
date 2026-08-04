import React from 'react';
import { MapPin, Star, ChevronRight, CheckCircle2, Building2, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';
import { DataService } from '../services/dataService';
import MapView from '../components/MapView';

export default function BuildingDetailPage({ buildingId, setActiveTab, setSelectedRoomId }) {
  const building = DataService.getBuildingById(buildingId || "TN007") || DataService.getBuildings()[0];
  const allBuildings = DataService.getBuildings().filter(b => b.id !== building.id);
  const rooms = DataService.getRoomsByBuilding(building.id);

  const handleSelectRoom = (roomId) => {
    if (setSelectedRoomId) setSelectedRoomId(roomId);
    setActiveTab('room-detail');
  };

  const handleSelectOtherBuilding = (id) => {
    if (buildingId !== id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveTab('building-detail');
    }
  };

  return (
    <div style={{ padding: '30px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>
          Trang chủ / Cho thuê / <span style={{ color: '#E8920A', fontWeight: 700 }}>Tòa nhà {building.code}</span>
        </p>

        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className={`badge ${building.isTiny ? 'badge-tiny' : 'badge-primary'}`}>
            {building.isTiny ? 'Tòa Tiny' : 'Tòa Đối tác'}
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0F172A' }}>{building.name}</h1>
        </div>

        <p style={{ fontSize: '0.95rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <MapPin size={18} color="#E8920A" />
          <span>{building.address}</span>
        </p>

        {/* 5-Photo Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 40, borderRadius: 20, overflow: 'hidden' }}>
          {/* Main Large Photo */}
          <div style={{ height: 380 }}>
            <img 
              src={building.images[0] || building.coverImage} 
              alt={building.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Right 4 Small Photos Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: 380 }}>
            {(building.images.slice(1, 5).concat([building.coverImage, building.coverImage])).slice(0, 4).map((img, idx) => (
              <div key={idx} style={{ height: 182, overflow: 'hidden' }}>
                <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* CÁC LOẠI PHÒNG + BẢN ĐỒ SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, marginBottom: 60 }}>
          {/* LEFT: ROOM TYPES LIST */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Building2 size={24} color="#E8920A" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Các loại phòng khả dụng ({rooms.length} phòng)</h2>
            </div>

            {/* Room List in Building */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.id} className="card" style={{ padding: 20, display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 20, alignItems: 'center' }}>
                    <img 
                      src={room.images[0] || building.coverImage} 
                      alt={room.type} 
                      style={{ width: '100%', height: 120, borderRadius: 12, objectFit: 'cover' }} 
                    />
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span className="badge badge-success">{room.status}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Căn: {room.roomNumber}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{room.type}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 4 }}>
                        📐 {room.area} m² · 👥 Tối đa {room.maxOccupants} người · 📶 Free Wifi · 🍳 Bếp khép kín
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E8920A', marginTop: 8 }}>
                        {(room.price).toLocaleString('vi-VN')} VND <span style={{ fontSize: '0.8rem', color: '#64748B' }}>/tháng</span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.85rem' }}
                      onClick={() => handleSelectRoom(room.id)}
                    >
                      Xem phòng →
                    </button>
                  </div>
                ))
              ) : (
                <div className="card" style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>
                  Đang cập nhật danh sách phòng chi tiết cho tòa nhà này. Vui lòng liên hệ hotline để được hỗ trợ.
                </div>
              )}
            </div>

            {/* Building Info & Amenities */}
            <div className="card" style={{ padding: 24, marginTop: 32 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#E8920A" />
                <span>Tiện ích & Tiêu chuẩn PCCC tòa nhà</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.9rem', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck color="#10B981" size={18} />
                  <span>100% Đạt chứng nhận tiêu chuẩn PCCC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <span>Khóa vân tay & Camera an ninh 24/7</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <span>Máy giặt & Sân phơi quần áo diện tích lớn</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 color="#10B981" size={18} />
                  <span>Dịch vụ bảo trì sự cố kỹ thuật 24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REAL INTERACTIVE MAPVIEW */}
          <div>
            <div className="card" style={{ padding: 20, position: 'sticky', top: 90 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={18} color="#E8920A" />
                <span>Vị trí bản đồ thực tế</span>
              </h3>
              
              <MapView 
                buildings={[building, ...allBuildings.slice(0, 4)]}
                selectedBuildingId={building.id}
                onSelectBuilding={handleSelectOtherBuilding}
                height="380px"
                zoom={15}
              />

              <div style={{ marginTop: 16, padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>📍 Địa chỉ chi tiết</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>{building.address}</div>
                <div style={{ fontSize: '0.75rem', color: '#E8920A', fontWeight: 700, marginTop: 6 }}>
                  Tọa độ: {building.latitude.toFixed(5)}, {building.longitude.toFixed(5)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOÀ NHÀ KHÁC RECOMMENDATION GRID */}
        <div style={{ marginTop: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Các toà nhà nổi bật khác</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {allBuildings.slice(0, 6).map((item) => (
              <div key={item.id} className="card" onClick={() => handleSelectOtherBuilding(item.id)} style={{ cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: 180 }}>
                  <img src={item.coverImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span className="badge badge-tiny" style={{ position: 'absolute', top: 12, left: 12 }}>
                    {item.isTiny ? 'Tiny' : 'Đối tác'}
                  </span>
                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    background: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <span>5.0</span>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{item.code}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 10px 0' }}>{item.address}</p>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E8920A' }}>
                    {(item.minPrice).toLocaleString('vi-VN')} VND /Tháng
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
