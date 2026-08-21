import React, { useState } from 'react';
import { Plus, X, Check, ShieldCheck, Flame, Home, Wifi, Lock } from 'lucide-react';

export const AMENITIES_NOI_THAT = [
  'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Máy sấy', 'Tủ lạnh', 'Giường',
  'Sofa', 'Tủ quần áo', 'Đệm', 'Rèm cửa', 'Tủ bếp trên', 'Tủ bếp dưới',
  'Bếp từ', 'Ga bọc đệm', 'Chăn, gối'
];

export const AMENITIES_RIENG = [
  'Wifi từng phòng', 'Nuôi pet', 'Khóa vân tay (phòng)',
  'App hệ sinh thái cư dân', 'Mặt nạ phòng độc', 'Bình cứu hỏa (phòng)'
];

export const AMENITIES_CHUNG = [
  'Wifi chung', 'Xe điện', 'Máy sấy chung', 'Máy giặt chung', 'Thang máy', 'Sân phơi'
];

export const AMENITIES_AN_NINH = [
  'Khóa vân tay', 'Camera an ninh'
];

export const AMENITIES_PCCC = [
  'Sprinkler', 'Báo cháy', 'Báo khói', 'Thang thoát hiểm', 'Chuông báo cháy', 'Cửa chống cháy', 'Bình cứu hỏa'
];

export default function RoomDetailsForm({ roomForm, setRoomForm }) {
  const handleToggleAmenity = (categoryKey, item) => {
    const currentList = roomForm[categoryKey] || [];
    if (currentList.includes(item)) {
      setRoomForm({
        ...roomForm,
        [categoryKey]: currentList.filter(i => i !== item)
      });
    } else {
      setRoomForm({
        ...roomForm,
        [categoryKey]: [...currentList, item]
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. THÔNG TIN LIÊN HỆ CHỦ NHÀ */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #E2E8F0' }}>
        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', marginBottom: 10 }}>
          Thông tin liên hệ chủ nhà
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Tên chủ nhà</label>
            <input
              type="text"
              placeholder="Ms Huyền..."
              value={roomForm.hostName || ''}
              onChange={(e) => setRoomForm({ ...roomForm, hostName: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>SĐT chủ nhà</label>
            <input
              type="text"
              placeholder="0386570401..."
              value={roomForm.hostPhone || ''}
              onChange={(e) => setRoomForm({ ...roomForm, hostPhone: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Email chủ nhà</label>
            <input
              type="email"
              placeholder="email@..."
              value={roomForm.hostEmail || ''}
              onChange={(e) => setRoomForm({ ...roomForm, hostEmail: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 8, border: '1px solid #CBD5E1' }}
            />
          </div>
        </div>
      </div>

      {/* 3. TIỆN ÍCH (CHECKBOX 5 NHÓM) */}
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', marginBottom: 8 }}>
          Tiện ích & Trang thiết bị
        </div>

        {/* NHÓM 1: NỘI THẤT */}
        <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginBottom: 8 }}>Nội thất</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {AMENITIES_NOI_THAT.map(item => {
              const checked = (roomForm.amenitiesNoiThat || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleAmenity('amenitiesNoiThat', item)}
                    style={{ accentColor: '#E8920A' }}
                  />
                  <span style={{ color: checked ? '#0F172A' : '#64748B', fontWeight: checked ? 700 : 500 }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* NHÓM 2: TIỆN ÍCH RIÊNG */}
        <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginBottom: 8 }}>Tiện ích riêng</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {AMENITIES_RIENG.map(item => {
              const checked = (roomForm.amenitiesRieng || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleAmenity('amenitiesRieng', item)}
                    style={{ accentColor: '#E8920A' }}
                  />
                  <span style={{ color: checked ? '#0F172A' : '#64748B', fontWeight: checked ? 700 : 500 }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* NHÓM 3: TIỆN ÍCH CHUNG */}
        <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginBottom: 8 }}>Tiện ích chung</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {AMENITIES_CHUNG.map(item => {
              const checked = (roomForm.amenitiesChung || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleAmenity('amenitiesChung', item)}
                    style={{ accentColor: '#E8920A' }}
                  />
                  <span style={{ color: checked ? '#0F172A' : '#64748B', fontWeight: checked ? 700 : 500 }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* NHÓM 4: AN NINH - AN TOÀN */}
        <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginBottom: 8 }}>An ninh - An toàn</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {AMENITIES_AN_NINH.map(item => {
              const checked = (roomForm.amenitiesAnNinh || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleAmenity('amenitiesAnNinh', item)}
                    style={{ accentColor: '#E8920A' }}
                  />
                  <span style={{ color: checked ? '#0F172A' : '#64748B', fontWeight: checked ? 700 : 500 }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* NHÓM 5: PHÒNG CHÁY CHỮA CHÁY */}
        <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 10 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#D97706', marginBottom: 8 }}>Phòng cháy chữa cháy</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {AMENITIES_PCCC.map(item => {
              const checked = (roomForm.amenitiesPccc || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleAmenity('amenitiesPccc', item)}
                    style={{ accentColor: '#E8920A' }}
                  />
                  <span style={{ color: checked ? '#0F172A' : '#64748B', fontWeight: checked ? 700 : 500 }}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MÔ TẢ CHI TIẾT */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
          Mô tả chi tiết
        </label>
        <textarea
          rows={3}
          placeholder="✨ Căn hộ cao cấp phong cách Hiện Đại tại Kim Mã, Ba Đình – Đỉnh cao tinh tế & Tiện nghi đẳng cấp!"
          value={roomForm.description || ''}
          onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', fontSize: '0.88rem', borderRadius: 10, border: '1px solid #CBD5E1', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );
}
