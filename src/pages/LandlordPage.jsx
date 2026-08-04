import React, { useState } from 'react';
import { Building2, ShieldCheck, TrendingUp, HelpCircle, CheckCircle2, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function LandlordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* HERO SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 24,
          padding: '60px 40px',
          color: '#ffffff',
          marginBottom: 60,
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 40,
          alignItems: 'center'
        }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: 12 }}>◆ Giải Pháp Quản Lý Vận Hành Tòa Nhà ◆</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: 16 }}>
              BẠN CÓ TÒA NHÀ <br />
              <span style={{ color: '#E8920A' }}>MUỐN CHO THUÊ?</span>
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Giải pháp quản lý vận hành toàn diện giúp tối đa hóa tỷ lệ lấp đầy, minh bạch tài chính và nâng cao giá trị tài sản bền vững cho chủ đầu tư.
            </p>
          </div>

          <div className="card" style={{ padding: 24, background: '#ffffff', color: '#0F172A' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>Đăng ký tư vấn miễn phí</h3>
            {submitted ? (
              <div style={{ background: '#D1FAE5', color: '#065F46', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <CheckCircle2 size={30} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 800 }}>Đã nhận thông tin đăng ký!</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Chuyên viên Tiny Houses sẽ liên hệ trong 24h.</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="text" placeholder="Họ và tên chủ nhà *" required />
                <input type="tel" placeholder="Số điện thoại *" required />
                <input type="text" placeholder="Địa chỉ tòa nhà / số phòng" required />
                <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 800 }}>
                  Gửi thông tin hợp tác →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* BẢNG SO SÁNH HIỆU QUẢ DÒNG TIỀN matching PDF */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Mô hình hợp tác & So sánh dòng tiền</h2>
            <p style={{ color: '#64748B' }}>Tiny Houses đồng hành cùng chủ nhà để giảm thiểu rủi ro vận hành</p>
          </div>

          <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: 14 }}>Tiêu chí so sánh</th>
                  <th style={{ padding: 14, color: '#EF4444' }}>Tự vận hành / Cho thuê lẻ</th>
                  <th style={{ padding: 14, color: '#E8920A', fontWeight: 800 }}>Đồng hành cùng Tiny Houses</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 14, fontWeight: 700 }}>Tỷ lệ trống phòng</td>
                  <td style={{ padding: 14, color: '#64748B' }}>Không ổn định (trống 15 - 30%)</td>
                  <td style={{ padding: 14, color: '#10B981', fontWeight: 700 }}>Lấp đầy nhanh &gt; 95% nhờ kênh Sale mạnh</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 14, fontWeight: 700 }}>Quản lý cư dân & Bảo trì</td>
                  <td style={{ padding: 14, color: '#64748B' }}>Tự xử lý sự cố 24/7 mệt mỏi</td>
                  <td style={{ padding: 14, color: '#10B981', fontWeight: 700 }}>Đội ngũ kỹ thuật Tiny trực 2h xử lý tận nơi</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 14, fontWeight: 700 }}>Tiêu chuẩn PCCC & Pháp lý</td>
                  <td style={{ padding: 14, color: '#64748B' }}>Tự tìm hiểu, dễ vi phạm</td>
                  <td style={{ padding: 14, color: '#10B981', fontWeight: 700 }}>100% Tòa nhà được chuẩn hóa PCCC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
