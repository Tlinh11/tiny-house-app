import React, { useState } from 'react';
import { UploadCloud, X, CheckCircle2, Loader2, Plus, Star, Image as ImageIcon } from 'lucide-react';
import { ApiClient } from '../services/apiClient';

export default function MultiImageUploader({
  images = [],
  onChange = () => {},
  label = 'Bộ sưu tập hình ảnh'
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setErrorMsg('');
    setUploading(true);
    setUploadCount(files.length);

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const url = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Data = event.target.result;
            const res = await ApiClient.post('/upload', {
              image: base64Data,
              fileName: file.name
            });

            if (res && res.url) {
              resolve(res.url);
            } else {
              resolve(base64Data);
            }
          };
          reader.readAsDataURL(file);
        });

        if (url) uploadedUrls.push(url);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }

    setUploading(false);
    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetCoverImage = (indexToCover) => {
    if (indexToCover === 0 || indexToCover >= images.length) return;
    const target = images[indexToCover];
    const remaining = images.filter((_, idx) => idx !== indexToCover);
    onChange([target, ...remaining]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
            {label} ({images.length} ảnh)
          </label>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Giữ phím Ctrl/Shift để chọn nhiều ảnh cùng lúc
          </span>
        </div>
      )}

      {/* PHOTO GALLERY GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 12,
        background: '#F8FAFC',
        padding: 14,
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        minHeight: 140
      }}>
        {images.map((imgUrl, idx) => (
          <div 
            key={`${imgUrl}-${idx}`}
            style={{
              position: 'relative',
              height: 120,
              borderRadius: 10,
              overflow: 'hidden',
              border: idx === 0 ? '2px solid #E8920A' : '1px solid #CBD5E1',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
              background: '#ffffff'
            }}
          >
            <img 
              src={imgUrl} 
              alt={`Photo ${idx + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />

            {/* BADGE: COVER IMAGE */}
            {idx === 0 ? (
              <span style={{
                position: 'absolute',
                top: 6,
                left: 6,
                background: '#E8920A',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <Star size={10} fill="#fff" />
                <span>Ảnh bìa</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleSetCoverImage(idx)}
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
                title="Đặt làm ảnh bìa chính"
              >
                Đặt làm bìa
              </button>
            )}

            {/* DELETE BUTTON */}
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Xóa ảnh này"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* UPLOAD BOX BUTTON */}
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 120,
          borderRadius: 10,
          border: '2px dashed #CBD5E1',
          background: uploading ? '#FFF7ED' : '#ffffff',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          padding: 8,
          transition: 'all 0.2s ease'
        }}>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFilesChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#E8920A' }}>
              <Loader2 className="animate-spin" size={24} />
              <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Tải {uploadCount} ảnh...</span>
            </div>
          ) : (
            <>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#FFF7ED',
                color: '#E8920A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6
              }}>
                <UploadCloud size={20} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>
                + Chọn nhiều ảnh
              </span>
              <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                PNG, JPG, WEBP
              </span>
            </>
          )}
        </label>
      </div>

      {errorMsg && (
        <div style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}
