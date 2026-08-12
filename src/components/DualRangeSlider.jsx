import React, { useRef, useState, useCallback, useEffect } from 'react';

export default function DualRangeSlider({
  min = 0,
  max = 20000000,
  step = 500000,
  minValue = 0,
  maxValue = 20000000,
  onChange,
  unit = 'đ',
  formatLabel
}) {
  const trackRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null); // 'min' | 'max' | null

  const getPercent = useCallback(
    (value) => Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)),
    [min, max]
  );

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);

  const getValueFromPosition = useCallback(
    (clientX) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const rawPercent = (clientX - rect.left) / rect.width;
      const clampedPercent = Math.min(1, Math.max(0, rawPercent));
      const rawValue = min + clampedPercent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.min(max, Math.max(min, steppedValue));
    },
    [min, max, step]
  );

  const handlePointerDown = (e) => {
    const clickVal = getValueFromPosition(e.clientX);
    const distMin = Math.abs(clickVal - minValue);
    const distMax = Math.abs(clickVal - maxValue);

    let chosen = 'min';
    if (distMax < distMin) {
      chosen = 'max';
    } else if (distMin === distMax) {
      chosen = clickVal > (min + max) / 2 ? 'max' : 'min';
    }

    setActiveThumb(chosen);

    if (chosen === 'min') {
      const newMin = Math.min(clickVal, maxValue - step);
      if (onChange) onChange({ min: newMin, max: maxValue });
    } else {
      const newMax = Math.max(clickVal, minValue + step);
      if (onChange) onChange({ min: minValue, max: newMax });
    }

    if (e.target && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_err) {
        // Fallback for non-pointercapture elements
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!activeThumb) return;
    const moveVal = getValueFromPosition(e.clientX);

    if (activeThumb === 'min') {
      const newMin = Math.min(moveVal, maxValue - step);
      if (onChange) onChange({ min: newMin, max: maxValue });
    } else if (activeThumb === 'max') {
      const newMax = Math.max(moveVal, minValue + step);
      if (onChange) onChange({ min: minValue, max: newMax });
    }
  };

  const handlePointerUp = () => {
    setActiveThumb(null);
  };

  useEffect(() => {
    const onGlobalUp = () => setActiveThumb(null);
    window.addEventListener('pointerup', onGlobalUp);
    return () => window.removeEventListener('pointerup', onGlobalUp);
  }, []);

  const defaultFormat = (val) => {
    if (unit === 'm²') return `${val}m²`;
    if (val === 0) return `0${unit}`;
    return `${val.toLocaleString('vi-VN')}${unit}`;
  };

  const formatter = formatLabel || defaultFormat;

  return (
    <div style={{ width: '100%', padding: '10px 0 14px 0', userSelect: 'none' }}>
      {/* Radix UI HTML Structure Exact Match */}
      <span
        dir="ltr"
        data-orientation="horizontal"
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          touchAction: 'none',
          userSelect: 'none',
          alignItems: 'center',
          paddingTop: '8px',
          paddingBottom: '8px',
          cursor: 'pointer'
        }}
      >
        {/* Track Bar (bg-gray-200) */}
        <span
          data-orientation="horizontal"
          style={{
            position: 'relative',
            height: '8px',
            width: '100%',
            flexGrow: 1,
            overflow: 'hidden',
            borderRadius: '9999px',
            backgroundColor: '#E5E7EB'
          }}
        >
          {/* Active Highlighted Range (bg-brand-orange #E8920A) */}
          <span
            data-orientation="horizontal"
            style={{
              position: 'absolute',
              height: '100%',
              backgroundColor: '#E8920A',
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`
            }}
          />
        </span>

        {/* Minimum Thumb */}
        <span
          style={{
            position: 'absolute',
            left: `${minPercent}%`,
            transform: 'translateX(-50%)',
            zIndex: activeThumb === 'min' ? 10 : 5
          }}
        >
          <span
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={minValue}
            aria-label="Minimum"
            tabIndex={0}
            style={{
              display: 'block',
              height: '20px',
              width: '20px',
              borderRadius: '9999px',
              border: '2px solid #E8920A',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              transform: activeThumb === 'min' ? 'scale(1.25)' : 'scale(1)'
            }}
          />
        </span>

        {/* Maximum Thumb */}
        <span
          style={{
            position: 'absolute',
            left: `${maxPercent}%`,
            transform: 'translateX(-50%)',
            zIndex: activeThumb === 'max' ? 10 : 5
          }}
        >
          <span
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={maxValue}
            aria-label="Maximum"
            tabIndex={0}
            style={{
              display: 'block',
              height: '20px',
              width: '20px',
              borderRadius: '9999px',
              border: '2px solid #E8920A',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              cursor: 'pointer',
              transition: 'transform 0.1s ease',
              transform: activeThumb === 'max' ? 'scale(1.25)' : 'scale(1)'
            }}
          />
        </span>
      </span>

      {/* Dynamic Range Values Below Slider */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
        <span>{formatter(minValue)}</span>
        <span>{formatter(maxValue)}</span>
      </div>
    </div>
  );
}
