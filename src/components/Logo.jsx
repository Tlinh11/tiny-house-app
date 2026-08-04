import React from 'react';
import LogoIcon from './LogoIcon';

export default function Logo({ size = 38, showSubtitle = true, onClick = null, dark = false }) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        cursor: onClick ? 'pointer' : 'default', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      <LogoIcon size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
          <span style={{ color: '#E8920A' }}>Tiny</span>
          <span style={{ color: dark ? '#FFFFFF' : '#0F172A', marginLeft: 4 }}>Houses</span>
        </div>
        {showSubtitle && (
          <div style={{ fontSize: '0.65rem', color: dark ? '#CBD5E1' : '#64748B', fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap' }}>
            Phòng thật - Giá thật
          </div>
        )}
      </div>
    </div>
  );
}
