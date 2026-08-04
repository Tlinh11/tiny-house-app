import React from 'react';

export default function LogoIcon({ size = 38, className = "" }) {
  return (
    <img 
      src="/logo.png" 
      alt="Tiny Houses Logo" 
      width={size} 
      height={size} 
      className={className}
      style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  );
}
