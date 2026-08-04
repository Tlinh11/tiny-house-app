import React, { useState } from 'react';
import { MapPin, Share2, Heart, Calendar, Clock, User, Phone, Mail, ShieldCheck, CheckCircle2, Eye, Sparkles, Building2 } from 'lucide-react';
import { DataService } from '../services/dataService';
import MapView from '../components/MapView';

export default function RoomDetailPage({ roomId, setActiveTab }) {
  const room = DataService.getRoomById(roomId) || DataService.getRooms()[0];
  const building = DataService.getBuildingById(room.buildingId || room.buildingCode) || DataService.getBuildings()[0];
  const buildingRooms = DataService.getRoomsByBuilding(building.id);

  const [selectedRoomNumber, setSelectedRoomNumber] = useState(room.roomNumber || '101');
  const [view360, setView360] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');

  const currentRoom = buildingRooms.find(r => r.roomNumber === selectedRoomNumber) || room;

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    DataService.createBooking({
      customerName: fullName,
      phone: phone,
      email: email || "khachhang@gmail.com",
      buildingCode: building.code,
      roomNumber: selectedRoomNumber,
      appointmentDate: appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: appointmentTime
    });

    setBookingSubmitted(true);
  };

  return (
    <div style={{ padding: '30px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 12 }}>
          Trang chủ / Cho thuê / <span style={{ color: '#E8920A', fontWeight: 700 }}>Căn hộ {building.code}</span>
        </p>

        {/* Building Header Code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className={`badge ${building.isTiny ? 'badge-tiny' : 'badge-primary'}`}>
            {building.isTiny ? 'Tiny' : 'Đối tác'}
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A' }}>{building.code}</h1>
        </div>
        <p style={{ fontSize: '0.95rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <MapPin size={18} color="#E8920A" />
          <span>{building.address}</span>
        </p>

        {/* Room List Selector Pills */}
        <div className="card" style={{ padding: 20, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building2 size={20} color="#E8920A" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Danh sách phòng thuộc tòa {building.code}</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Chọn căn hộ bạn quan tâm để xem chi tiết.</span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(building.rooms || ['101', '102', '201', '301']).map((num) => {
              const isSelected = selectedRoomNumber === num;
              return (
                <button
                  key={num}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    minWidth: 54,
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                  onClick={() => setSelectedRoomNumber(num)}
                >
                  Phòng {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN LAYOUT: LEFT DETAILS & RIGHT BOOKING FORM */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Room Specs Header */}
            <div style={{ background: '#0F172A', color: '#fff', borderRadius: '16px 16px 0 0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>Phòng {selectedRoomNumber}</span>
                <span className="badge badge-success">{currentRoom.status || 'Có sẵn'}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button style={{ background: 'none', color: '#fff' }} title="Chia sẻ phòng"><Share2 size={18} /></button>
                <button 
                  style={{ background: 'none', color: isFavorite ? '#EF4444' : '#fff' }} 
                  onClick={() => setIsFavorite(!isFavorite)}
                  title="Thêm yêu thích"
                >
                  <Heart size={18} fill={isFavorite ? '#EF4444' : 'none'} />
                </button>
              </div>
            </div>

            {/* Room Specs Table */}
            <div className="card" style={{ borderRadius: '0 0 16px 16px', padding: 24, marginBottom: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 12 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Giá thuê phòng</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#E8920A' }}>
                    {(currentRoom.price || 3500000).toLocaleString('vi-VN')} VND <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 400 }}>/Tháng</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 12 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Loại phòng</span>
                  <span style={{ fontWeight: 800 }}>{currentRoom.type || 'Studio khép kín'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 12 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Diện tích</span>
                  <span style={{ fontWeight: 800 }}>{currentRoom.area || 25} m²</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 12 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Số người ở tối đa</span>
                  <span style={{ fontWeight: 800 }}>{currentRoom.maxOccupants || 2} người</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Thời gian trống</span>
                  <span style={{ fontWeight: 800, color: '#10B981' }}>{currentRoom.availableFrom || 'Ở ngay'}</span>
                </div>
              </div>
            </div>

            {/* REAL INTERACTIVE LEAFLET MAPVIEW */}
            <div className="card" style={{ padding: 20, marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={18} color="#E8920A" />
                <span>Bản đồ vị trí căn hộ {building.code}</span>
              </h3>
              
              <MapView 
                buildings={[building]}
                selectedBuildingId={building.id}
                height="280px"
                zoom={15}
              />
            </div>

            {/* AMENITIES SECTION */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#E8920A" />
                <span>Tiện nghi & Tiện ích trang bị</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Nội thất phòng */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#E8920A', marginBottom: 12 }}>◆ Nội thất phòng</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: '0.85rem', color: '#334155' }}>
                    {currentRoom.amenities?.furniture?.length > 0 ? (
                      currentRoom.amenities.furniture.map((item, idx) => <div key={idx}>✓ {item}</div>)
                    ) : (
                      <>
                        <div>❄ Điều hòa</div>
                        <div>♨ Nóng lạnh</div>
                        <div>🛏 Giường & Đệm</div>
                        <div>👔 Tủ quần áo</div>
                        <div>🧊 Tủ lạnh</div>
                        <div>🍳 Tủ bếp cao cấp</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Tiện ích riêng */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#E8920A', marginBottom: 12 }}>◆ Tiện ích riêng</h4>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    📶 Wifi tốc độ cao & Khóa vân tay từng phòng
                  </div>
                </div>

                {/* Phòng cháy chữa cháy */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#E8920A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={16} color="#10B981" />
                    <span>Phòng cháy chữa cháy (PCCC)</span>
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    🚨 Hệ thống Sprinkler tự động, Bình chữa cháy & Thang thoát hiểm an toàn 100%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: GALLERY & BOOKING FORM */}
          <div>
            {/* Top Photo Gallery Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ height: 220, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
                <img src={currentRoom.images?.[0] || building.coverImage} alt="Main Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  className="btn btn-secondary" 
                  style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '0.8rem', padding: '6px 12px' }}
                  onClick={() => setView360(!view360)}
                >
                  <Eye size={14} />
                  <span>{view360 ? "Xem ảnh thường" : "Xem ảnh 360°"}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {(currentRoom.images?.slice(0, 4) || building.images.slice(0, 4)).map((img, i) => (
                  <img key={i} src={img} alt="Thumbnail" style={{ width: '100%', height: 70, borderRadius: 8, objectFit: 'cover' }} />
                ))}
              </div>
            </div>

            {/* Host Card */}
            <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <img 
                src={building.host?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                alt={building.host?.name || "Tiny Houses"} 
                style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{building.host?.name || "Đỗ Thảo Nguyên"}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} color="#E8920A" />
                  <span>{building.host?.phone || "0167423824"}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{building.host?.email || "tinyhouse.info@gmail.com"}</div>
              </div>
            </div>

            {/* BOOKING CALENDAR FORM */}
            <div className="card" style={{ padding: 24, borderTop: '4px solid #E8920A' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="#E8920A" />
                <span>Đặt lịch xem phòng {selectedRoomNumber}</span>
              </h3>

              {bookingSubmitted ? (
                <div style={{ background: '#D1FAE5', color: '#065F46', padding: 16, borderRadius: 12, fontSize: '0.9rem', textAlign: 'center' }}>
                  <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: 800 }}>Đặt lịch xem phòng thành công!</div>
                  <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Đội ngũ Tiny Houses sẽ liên hệ với bạn trong 15 phút.</div>
                  <button 
                    className="btn btn-primary" 
                    style={{ marginTop: 12, width: '100%', fontSize: '0.85rem' }}
                    onClick={() => setBookingSubmitted(false)}
                  >
                    Đặt lịch khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                    <input 
                      type="text" 
                      placeholder="Nhập họ tên" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Số điện thoại *</label>
                    <input 
                      type="tel" 
                      placeholder="Nhập số điện thoại" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Email liên hệ</label>
                    <input 
                      type="email" 
                      placeholder="Nhập địa chỉ email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Ngày giờ xem phòng</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <input 
                        type="date" 
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        style={{ width: '100%' }}
                      />
                      <input 
                        type="time" 
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '14px', marginTop: 10, fontSize: '1rem', fontWeight: 800 }}
                  >
                    Đặt lịch xem phòng
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
