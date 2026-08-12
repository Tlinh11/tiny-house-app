import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataService } from '../services/dataService';

export default function MyBookingsModal({ isOpen, onClose, currentUser }) {
  const [allBookings, setAllBookings] = useState(() => DataService.getBookings());

  useEffect(() => {
    const syncData = () => setAllBookings(DataService.getBookings());
    syncData();
    const unsubscribe = DataService.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;
  
  // Filter bookings for current logged in user (by email or phone)
  const userBookings = currentUser
    ? allBookings.filter(b => 
        (b.email && b.email.toLowerCase() === currentUser.email.toLowerCase()) || 
        (b.phone && b.phone === currentUser.phone)
      )
    : [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Đã duyệt':
      case 'Xác nhận':
        return <span className="badge badge-success">✅ Đã xác nhận</span>;
      case 'Hoàn thành':
        return <span className="badge badge-primary">🎉 Hoàn thành</span>;
      case 'Hủy':
        return <span className="badge badge-warning">❌ Đã hủy</span>;
      default:
        return <span className="badge badge-warning">⏳ Chờ xác nhận</span>;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: 680,
          background: '#ffffff',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={24} color="#E8920A" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
              Lịch hẹn xem phòng của tôi
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {userBookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {userBookings.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={18} color="#E8920A" />
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                        Tòa {item.buildingCode} — Phòng {item.roomNumber || 'Tự chọn'}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#E8920A" />
                      <span>Ngày xem: <strong>{item.appointmentDate || 'Trong ngày'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#E8920A" />
                      <span>Giờ: <strong>{item.appointmentTime || '09:00'}</strong></span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', background: '#ffffff', padding: '8px 12px', borderRadius: 8, border: '1px solid #F1F5F9' }}>
                    👤 Khách hàng: <strong>{item.customerName}</strong> ({item.phone})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <AlertCircle size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0F172A' }}>Chưa có lịch hẹn nào</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Bạn chưa đăng ký lịch hẹn xem phòng nào. Hãy chọn căn hộ ưng ý và đăng ký lịch xem ngay!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 16, marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
