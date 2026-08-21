import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import DualRangeSlider from './DualRangeSlider';

export default function RangeFilterDropdown({
  title = 'Khoảng giá thuê',
  popupTitle = 'Khoảng giá thuê / tháng',
  min = 0,
  max = 20000000,
  step = 500000,
  minValue = 0,
  maxValue = 20000000,
  onChange,
  unit = 'đ',
  formatLabel
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDefault = minValue === min && maxValue === max;

  const handleReset = (e) => {
    e.stopPropagation();
    if (onChange) onChange({ min, max });
  };

  // Summary Text formatting for trigger pill
  const getSummaryText = () => {
    if (isDefault) return 'Tất cả mức giá';
    if (unit === 'm²') return `${minValue}m² - ${maxValue}m²`;
    const formatShort = (v) => (v / 1000000).toFixed(1) + 'tr';
    return `${formatShort(minValue)} - ${formatShort(maxValue)} đ`;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', zIndex: isOpen ? 100 : 1 }}>
      {/* Trigger Button Matching Search Header Style */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          height: 42,
          padding: '0 14px',
          background: isOpen ? '#FFF7ED' : '#ffffff',
          border: isOpen ? '1.5px solid #E8920A' : '1px solid #CBD5E1',
          borderRadius: 10,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
          <span style={{ color: '#64748B', fontWeight: 600 }}>{title}:</span>
          <span style={{ fontWeight: 800, color: '#0F172A' }}>{getSummaryText()}</span>
        </div>
        <ChevronDown size={16} color="#64748B" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Popup Dropdown Card Matching Image 100% */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 1000,
            width: 320,
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.05)',
            border: '1px solid #F1F5F9',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Popup Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              {popupTitle}
            </h4>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#E8920A',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Đặt lại về mặc định"
            >
              <RotateCcw size={13} />
              <span>Xóa bộ lọc</span>
            </button>
          </div>

          {/* Dual Range Slider Body */}
          <DualRangeSlider
            min={min}
            max={max}
            step={step}
            minValue={minValue}
            maxValue={maxValue}
            onChange={onChange}
            unit={unit}
            formatLabel={formatLabel}
          />
        </div>
      )}
    </div>
  );
}
