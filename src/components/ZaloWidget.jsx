import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function ZaloWidget() {
  return (
    <div 
      className="floating-zalo"
      onClick={() => window.open('https://zalo.me', '_blank')}
      title="Chat qua Zalo OA với Tiny Houses"
    >
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#E8920A'
      }}>
        <MessageSquare size={16} fill="#E8920A" />
      </div>
      <span>Zalo OA Hỗ trợ 24/7</span>
    </div>
  );
}
