import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SpecificRoomsSection({ roomForm, setRoomForm }) {
  const [newRoomInput, setNewRoomInput] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const specificRooms = roomForm.specificRooms || [];
  const availableRooms = specificRooms.length;

  const handleAddSpecificRoom = (e) => {
    if (e) e.preventDefault();
    if (!newRoomInput.trim()) return;

    // Split input by comma, semicolon or whitespace
    const incomingCodes = newRoomInput
      .split(/[,;\s]+/)
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const duplicates = incomingCodes.filter(code => specificRooms.includes(code));
    const newUniqueCodes = incomingCodes.filter(code => !specificRooms.includes(code));

    if (newUniqueCodes.length === 0 && duplicates.length > 0) {
      setInputMessage(`⚠️ Mã phòng [${duplicates.join(', ')}] đã tồn tại trong danh sách!`);
      return;
    }

    const updatedRooms = [...specificRooms, ...newUniqueCodes];
    const newStatus = updatedRooms.length > 0 ? 'Có sẵn' : 'Hết phòng';

    setRoomForm({
      ...roomForm,
      specificRooms: updatedRooms,
      room_numbers: updatedRooms,
      available_rooms: updatedRooms.length,
      vacantCount: updatedRooms.length,
      roomNumber: updatedRooms[0] || '501',
      status: newStatus
    });

    if (duplicates.length > 0) {
      setInputMessage(`✅ Đã thêm ${newUniqueCodes.length} phòng mới (Đã bỏ qua trùng: ${duplicates.join(', ')})`);
    } else {
      setInputMessage(`✅ Đã thêm ${newUniqueCodes.length} phòng thành công!`);
    }
    
    setNewRoomInput('');
    setTimeout(() => setInputMessage(''), 4000);
  };

  const handleRemoveSpecificRoom = (roomCode) => {
    const updatedRooms = specificRooms.filter(r => r !== roomCode);
    const newStatus = updatedRooms.length > 0 ? 'Có sẵn' : 'Hết phòng';

    setRoomForm({
      ...roomForm,
      specificRooms: updatedRooms,
      room_numbers: updatedRooms,
      available_rooms: updatedRooms.length,
      vacantCount: updatedRooms.length,
      roomNumber: updatedRooms[0] || '',
      status: newStatus
    });
  };

  return (
    <div style={{ background: '#FFFFFF', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginTop: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
          Danh sách phòng cụ thể ({availableRooms} phòng)
        </div>
        {availableRooms > 0 ? (
          <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: 20, border: '1px solid #86EFAC' }}>
            ● {availableRooms} phòng trống (Có sẵn)
          </span>
        ) : (
          <span style={{ fontSize: '0.78rem', fontWeight: 800, background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 20, border: '1px solid #FCA5A5' }}>
            ● 0 phòng (Hết phòng)
          </span>
        )}
      </div>

      <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: 12 }}>
        Nhập mã phòng (VD: 203, 204, 501...) rồi nhấn Thêm. Số phòng trống = số mã phòng trong danh sách.
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="VD: 203, 204, 501..."
          value={newRoomInput}
          onChange={(e) => setNewRoomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSpecificRoom();
            }
          }}
          style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem', borderRadius: 10, border: '1px solid #CBD5E1', background: '#fff' }}
        />
        <button
          type="button"
          onClick={handleAddSpecificRoom}
          style={{
            padding: '10px 22px',
            background: '#F1F5F9',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: 10,
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          + Thêm
        </button>
      </div>

      {inputMessage && (
        <div style={{ fontSize: '0.8rem', color: inputMessage.startsWith('⚠️') ? '#D97706' : '#16A34A', fontWeight: 700, marginBottom: 10 }}>
          {inputMessage}
        </div>
      )}

      {/* ROOM NUMBER PILLS */}
      {specificRooms.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {specificRooms.map(code => (
            <span
              key={code}
              style={{
                background: '#F1F5F9',
                color: '#1E293B',
                border: '1px solid #E2E8F0',
                padding: '6px 14px',
                borderRadius: 10,
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {code}
              <button
                type="button"
                onClick={() => handleRemoveSpecificRoom(code)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  fontSize: '0.85rem',
                  fontWeight: 900
                }}
                title={`Xóa phòng ${code}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.82rem', textAlign: 'center', marginTop: 8 }}>
          Chưa có mã phòng nào. Hãy nhập số phòng ở trên và nhấn "+ Thêm" (khi danh sách rỗng, trạng thái sẽ là "Hết phòng").
        </div>
      )}
    </div>
  );
}
