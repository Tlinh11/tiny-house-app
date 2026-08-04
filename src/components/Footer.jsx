import React from 'react';
import { Home, Phone, Mail, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-top">
          {/* Column 1: Company Info & Legal */}
          <div className="footer-brand">
            <Logo dark={true} size={40} onClick={() => setActiveTab('home')} />
            <p className="footer-tagline">
              Đơn vị vận hành căn hộ cho thuê hàng đầu Hà Nội. Phòng thật - Giá thật - Dịch vụ tận tâm 24/7.
            </p>

            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} color="#E8920A" />
                <a href="tel:0865145348" style={{ color: '#cbd5e1' }}>0865 145 348</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} color="#E8920A" />
                <a href="mailto:Tinyhouses.info@gmail.com" style={{ color: '#cbd5e1' }}>Tinyhouses.info@gmail.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={16} color="#E8920A" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Số 151 phố Vương Thừa Vũ, Phường Khương Trung, Thành phố Hà Nội, Việt Nam</span>
              </div>
            </div>

            {/* Legal Block */}
            <div className="footer-legal-box">
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                Công ty Cổ phần Đầu tư Phát triển Tiny Houses
              </div>
              <div>Người đại diện: Lê Thuận Khánh</div>
              <div>Mã số thuế: 0110674192 | Ngày cấp: 04/04/2024</div>

              <div className="bct-badge">
                <ShieldCheck size={18} color="#10B981" />
                <span>Đã đăng ký Bộ Công Thương</span>
              </div>
            </div>
          </div>

          {/* Column 2: CHO THUÊ */}
          <div>
            <h4 className="footer-heading">CHO THUÊ</h4>
            <ul className="footer-links">
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Phòng trọ Thanh Xuân</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Phòng trọ Cầu Giấy</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Phòng trọ Hà Đông</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Phòng trọ Tây Hồ</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Phòng trọ Hoàng Mai</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Gần trường Đại học</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveTab('search'); }}>Tất cả phòng trống</a></li>
            </ul>
          </div>

          {/* Column 3: TINY HOUSES */}
          <div>
            <h4 className="footer-heading">TINY HOUSES</h4>
            <ul className="footer-links">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setActiveTab('about'); }}>Về chúng tôi</a></li>
              <li><a href="#landlord" onClick={(e) => { e.preventDefault(); setActiveTab('landlord'); }}>Chủ nhà hợp tác</a></li>
              <li><a href="#blog" onClick={(e) => { e.preventDefault(); setActiveTab('blog'); }}>Tin tức & Kinh nghiệm</a></li>
              <li><a href="#partner" onClick={(e) => { e.preventDefault(); setActiveTab('partner'); }}>Hợp tác CTV</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>Giới thiệu & Nhận thưởng</a></li>
            </ul>
          </div>

          {/* Column 4: QUY ĐỊNH */}
          <div>
            <h4 className="footer-heading">QUY ĐỊNH</h4>
            <ul className="footer-links">
              <li><a href="#">Điều khoản sử dụng</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Quy chế hoạt động TMĐT</a></li>
              <li><a href="#">Cơ chế giải quyết tranh chấp</a></li>
              <li><a href="#">Tiếp nhận phản ánh</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>© 2026 Tiny Houses. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="#" style={{ color: '#64748b' }}>Điều khoản</a>
            <a href="#" style={{ color: '#64748b' }}>Bảo mật</a>
            <a href="#" style={{ color: '#64748b' }}>Liên hệ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
