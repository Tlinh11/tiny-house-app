import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, Target, Award, Compass } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* HERO SECTION matching PDF Item #51-52 */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 24,
          padding: '60px 40px',
          color: '#ffffff',
          marginBottom: 60,
          textAlign: 'center'
        }}>
          <span className="badge badge-warning" style={{ marginBottom: 12 }}>◆ Về Chúng Tôi ◆</span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, marginBottom: 16 }}>
            TINY HOUSES — PHÒNG CHO THUÊ CHẤT LƯỢNG TOÀN HÀ NỘI
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: 800, margin: '0 auto', lineHeight: 1.6 }}>
            Tiny Houses được thành lập với sứ mệnh chuẩn hóa trải nghiệm thuê nhà tại Việt Nam — Minh bạch, Chất lượng và Tận tâm. Để mỗi người có thể an tâm tập trung vào cuộc sống của mình.
          </p>
        </div>

        {/* CÂU CHUYỆN THƯƠNG HIỆU matching PDF Item #53-54 */}
        <div className="card" style={{ padding: 40, marginBottom: 60 }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#E8920A', marginBottom: 16 }}>
            Câu chuyện thương hiệu
          </h2>
          <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.8, marginBottom: 16 }}>
            Thị trường cho thuê nhà tại Hà Nội từ lâu tồn tại nhiều bất cập; thiếu thông tin minh bạch, chất lượng không đồng nhất, dịch vụ hậu thuê thiếu chuyên nghiệp. Người thuê - đặc biệt là những người trẻ mới bắt đầu cuộc sống độc lập - phải đối mặt với nhiều rủi ro không đáng có trên hành trình tìm kiếm nơi ở phù hợp.
          </p>
          <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.8 }}>
            Tiny Houses ra đời vào năm 2024 với mục tiêu thay đổi điều đó. Thay vì chỉ kết nối người thuê với chủ nhà như các nền tảng truyền thống, chúng tôi trực tiếp vận hành toàn bộ hệ thống - từ tiêu chuẩn phòng, quy trình bàn giao, đến đội ngũ kỹ thuật 24/7 để đảm bảo mỗi cư dân nhận được đúng những gì đã cam kết.
          </p>
        </div>

        {/* TẦM NHÌN & SỨ MỆNH & GIÁ TRỊ CỐT LÕI matching PDF Item #55-58 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 60 }}>
          <div className="card" style={{ padding: 30 }}>
            <Compass size={36} color="#E8920A" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10 }}>Tầm nhìn 2029</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Trở thành hệ sinh thái cư dân hàng đầu Việt Nam với 15.000 phòng cho thuê tiêu chuẩn cùng dịch vụ khép kín phục vụ toàn diện đời sống cư dân.
            </p>
          </div>

          <div className="card" style={{ padding: 30 }}>
            <Target size={36} color="#E8920A" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10 }}>Sứ mệnh</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              Để mỗi người thuê phòng đều nhận được trải nghiệm tuyệt vời nhất, an tâm tập trung vào những điều quan trọng hơn trong cuộc sống.
            </p>
          </div>

          <div className="card" style={{ padding: 30 }}>
            <Award size={36} color="#E8920A" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10 }}>Giá trị cốt lõi</h3>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Minh bạch:</strong> Nhìn thấy là nhận được.</li>
              <li><strong>Chất lượng:</strong> Tiêu chuẩn PCCC & bảo trì.</li>
              <li><strong>Tận tâm:</strong> Hỗ trợ 24/7 có mặt 2h.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
