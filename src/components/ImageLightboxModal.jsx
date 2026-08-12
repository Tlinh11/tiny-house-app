import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ImageLightboxModal({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0, 
  onIndexChange,
  title = '' 
}) {
  const handlePrev = useCallback(() => {
    const nextIdx = (currentIndex - 1 + images.length) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % images.length;
    if (onIndexChange) onIndexChange(nextIdx);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImgSrc = typeof images[currentIndex] === 'string' 
    ? images[currentIndex] 
    : images[currentIndex]?.url || images[currentIndex]?.src;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      {/* Header Bar */}
      <div 
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ImageIcon size={20} color="#E8920A" />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {title || 'Bộ sưu tập hình ảnh'}
          </span>
          <span style={{ 
            background: 'rgba(255, 255, 255, 0.15)', 
            padding: '4px 12px', 
            borderRadius: 20, 
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: '#fff',
            width: 40,
            height: 40,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          title="Đóng (ESC)"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Display Area */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          height: 'calc(100vh - 160px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: 10,
              zIndex: 10001,
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: 50,
              height: 50,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8920A';
              e.currentTarget.style.borderColor = '#E8920A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            title="Ảnh trước (Mũi tên trái)"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Image Content */}
        <img 
          src={currentImgSrc} 
          alt={`Thumbnail ${currentIndex + 1}`} 
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            userSelect: 'none'
          }}
        />

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: 10,
              zIndex: 10001,
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              width: 50,
              height: 50,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8920A';
              e.currentTarget.style.borderColor = '#E8920A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            title="Ảnh kế tiếp (Mũi tên phải)"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Thumbnails Footer Strip */}
      {images.length > 1 && (
        <div 
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            maxWidth: '900px',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const src = typeof img === 'string' ? img : img?.url || img?.src;
            const isSelected = idx === currentIndex;
            return (
              <img
                key={idx}
                src={src}
                alt={`Thumb ${idx}`}
                onClick={() => onIndexChange && onIndexChange(idx)}
                style={{
                  width: 54,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: 6,
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.4,
                  border: isSelected ? '2px solid #E8920A' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
