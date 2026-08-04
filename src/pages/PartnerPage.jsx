import React, { useState } from 'react';
import { Users, DollarSign, Award, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function PartnerPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* HERO SECTION */}
        <div style={{
          background: 'linear-gradient(135deg, #E8920A 0%, #EA580C 100%)',
          borderRadius: 24,
          padding: '60px 40px',
          color: '#ffffff',
          marginBottom: 50,
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 40,
          alignItems: 'center'
        }}>
          <div>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: 12 }}>
              ★ Chương Trình Đối Tác Bán Phòng ★
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: 16 }}>
              GIA TĂNG THU NHẬP CÙNG <br />TINY HOUSES
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, lineHeight: 1.6 }}>
              Tham gia mạng lưới Cộng tác viên chốt hợp đồng thuê phòng với hoa hồng cạnh tranh từ 10% đến 30%.
            </p>
          </div>

          {/* CTV Signup Form */}
          <div className="card" style={{ padding: 24, background: '#ffffff', color: '#0F172A' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 14 }}>Đăng ký làm CTV Sale</h3>
            {submitted ? (
              <div style={{ background: '#D1FAE5', color: '#065F46', padding: 16, borderRadius: 10, textAlign: 'center' }}>
                <CheckCircle2 size={30} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 800 }}>Đã gửi đăng ký thành công!</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Bộ phận HR Tiny Houses sẽ gửi thông tin kích hoạt tài khoản.</div>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="text" placeholder="Họ và tên *" required />
                <input type="tel" placeholder="Số điện thoại *" required />
                <input type="email" placeholder="Email liên hệ *" required />
                <select required>
                  <option value="">Chọn loại hình CTV *</option>
                  <option value="resident">Dân cư của Tiny House</option>
                  <option value="outsource">Sale out source</option>
                  <option value="internal">Sale nội bộ</option>
                  <option value="individual">CTV đơn lẻ</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 800 }}>
                  Đăng ký ngay →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 LOẠI CTV & CHÍNH SÁCH HOA HỒNG matching PDF Item #21 (Cấu hình hoa hồng) */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>4 Nhóm Cộng Tác Viên & Hoa Hồng</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <span className="badge badge-warning" style={{ marginBottom: 8 }}>Nhóm 1</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Dân cư Tiny House</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E8920A', margin: '8px 0' }}>15%</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Dành cho cư dân đang sinh sống tại các tòa nhà Tiny giới thiệu bạn bè.</p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <span className="badge badge-warning" style={{ marginBottom: 8 }}>Nhóm 2</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Sale out source</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E8920A', margin: '8px 0' }}>25%</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Dành cho các mô hình agency và môi giới tự do bên ngoài.</p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <span className="badge badge-primary" style={{ marginBottom: 8 }}>Nhóm 3</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Sale nội bộ</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E8920A', margin: '8px 0' }}>30%</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Đội ngũ kinh doanh chính thức của Tiny Houses.</p>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <span className="badge badge-secondary" style={{ marginBottom: 8 }}>Nhóm 4</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>CTV đơn lẻ</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#E8920A', margin: '8px 0' }}>10%</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Cá nhân muốn kiếm thêm thu nhập phụ thời gian rảnh.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
