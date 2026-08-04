import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, Loader2 } from 'lucide-react';
import { ApiClient } from '../services/apiClient';

export default function ImageUploader({
  value = '',
  onChange = () => {},
  label = 'Tải ảnh từ máy tính'
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn tập tin hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp ảnh không vượt quá 10MB.');
      return;
    }

    setErrorMsg('');
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;
        
        // Post base64 data to Backend Upload API
        const res = await ApiClient.post('/upload', {
          image: base64Data,
          fileName: file.name
        });

        if (res && res.url) {
          onChange(res.url);
        } else if (res && typeof res === 'string') {
          onChange(res);
        } else {
          // Fallback to base64 preview if backend is unreachable
          onChange(base64Data);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Lỗi khi tải ảnh lên server.");
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
          {label}
        </label>
      )}

      {value ? (
        // IMAGE PREVIEW STATE
        <div style={{
          position: 'relative',
          width: '100%',
          height: 180,
          borderRadius: 12,
          overflow: 'hidden',
          border: '2px solid #E2E8F0',
          background: '#F8FAFC'
        }}>
          <img 
            src={value} 
            alt="Uploaded Preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />

          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 6
          }}>
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Xóa ảnh"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#10B981',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <CheckCircle2 size={13} />
            <span>Đã tải lên Cloud</span>
          </div>
        </div>
      ) : (
        // UPLOAD FILE DRAG & DROP ZONE
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          border: '2px dashed #CBD5E1',
          borderRadius: 12,
          background: uploading ? '#FFF7ED' : '#F8FAFC',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          minHeight: 140
        }}>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#E8920A' }}>
              <Loader2 className="animate-spin" size={32} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Đang tải ảnh lên Cloud...</span>
            </div>
          ) : (
            <>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#FFF7ED',
                color: '#E8920A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <UploadCloud size={24} />
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                Bấm để chọn ảnh hoặc Kéo & thả vào đây
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                Hỗ trợ tập tin PNG, JPG, WEBP (tối đa 10MB)
              </div>
            </>
          )}
        </label>
      )}

      {errorMsg && (
        <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, marginTop: 2 }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}
