import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Eye, MapPin, ChevronRight, Star, Map } from 'lucide-react';
import { DataService } from '../services/dataService';
import MapView from '../components/MapView';
import RangeFilterDropdown from '../components/RangeFilterDropdown';
import { getValidImageUrl } from '../utils/roomHierarchy';

export default function HomePage({ setActiveTab, setSelectedBuildingId, onSearch }) {
  const [searchDistrict, setSearchDistrict] = useState('Hà Đông');
  const [searchMinPrice, setSearchMinPrice] = useState(0);
  const [searchMaxPrice, setSearchMaxPrice] = useState(35000000);
  const [mapDistrict, setMapDistrict] = useState('all');

  const [buildings, setBuildings] = useState(() => DataService.getBuildings());

  useEffect(() => {
    const syncData = () => setBuildings(DataService.getBuildings());
    syncData();
    const unsubscribe = DataService.subscribe(syncData);
    return () => unsubscribe();
  }, []);
  const tinyBuildings = buildings.filter(b => b.isTiny);

  const mapFilteredBuildings = buildings.filter(b => {
    if (mapDistrict !== 'all' && b.district !== mapDistrict) return false;
    return true;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        district: searchDistrict,
        minPrice: searchMinPrice,
        maxPrice: searchMaxPrice
      });
    }
    setActiveTab('search');
  };

  const handleSelectBuilding = (id) => {
    setSelectedBuildingId(id);
    setActiveTab('building-detail');
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 100%), url("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        padding: '60px 0 90px 0',
        borderRadius: '0 0 32px 32px'
      }}>
        <div className="container">
          <div className="responsive-grid-hero">
            {/* Left Headline */}
            <div>
              <div className="badge badge-warning" style={{ marginBottom: 16 }}>
                ★ Đơn Vị Vận Hành Căn Hộ Hàng Đầu Hà Nội
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: 20 }}>
                ĐƠN VỊ VẬN HÀNH<br />
                <span style={{ color: '#E8920A' }}>CĂN HỘ CHO THUÊ</span>
              </h1>
              <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: 24, fontWeight: 500 }}>
                Phòng thật — Giá thật — Dịch vụ tận tâm 24/7
              </p>
              
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#f8fafc' }}>
                  <ShieldCheck color="#10B981" size={18} />
                  <span>100% Đạt tiêu chuẩn PCCC</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#f8fafc' }}>
                  <Eye color="#E8920A" size={18} />
                  <span>Ảnh & Video thực tế 100%</span>
                </div>
              </div>
            </div>

            {/* Right Action Choice Buttons */}
            <div className="glass-panel" style={{ padding: 24, background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.15)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: '#fff', textAlign: 'center' }}>
                Bạn cần giải pháp nào hôm nay?
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  className="btn"
                  style={{
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    color: '#0F172A',
                    padding: '14px 20px',
                    borderRadius: 12,
                    fontWeight: 700
                  }}
                  onClick={() => setActiveTab('search')}
                >
                  <span>Bạn đang tìm phòng?</span>
                  <ChevronRight size={18} color="#E8920A" />
                </button>

                <button
                  className="btn"
                  style={{
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    fontWeight: 600
                  }}
                  onClick={() => setActiveTab('landlord')}
                >
                  <span>Chủ nhà có phòng cho thuê?</span>
                  <ChevronRight size={18} color="#ffffff" />
                </button>

                <button
                  className="btn"
                  style={{
                    justifyContent: 'space-between',
                    background: 'rgba(232, 146, 10, 0.15)',
                    color: '#FFEDD5',
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: '1px solid rgba(232, 146, 10, 0.4)',
                    fontWeight: 600
                  }}
                  onClick={() => setActiveTab('partner')}
                >
                  <span>CTV sale phòng & nhận hoa hồng</span>
                  <ChevronRight size={18} color="#E8920A" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search Floating Bar */}
          <div 
            className="glass-panel" 
            style={{ 
              marginTop: 40, 
              padding: 20, 
              background: '#ffffff', 
              color: '#0F172A'
            }}
          >
            <form onSubmit={handleSearchSubmit} className="quick-search-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                  TỈNH / THÀNH PHỐ
                </label>
                <select 
                  value={searchDistrict} 
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Hà Đông">Hà Nội — Hà Đông</option>
                  <option value="Thanh Xuân">Hà Nội — Thanh Xuân</option>
                  <option value="Tây Hồ">Hà Nội — Tây Hồ</option>
                  <option value="Hoàng Mai">Hà Nội — Hoàng Mai</option>
                  <option value="Cầu Giấy">Hà Nội — Cầu Giấy</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                  GẦN TRƯỜNG ĐẠI HỌC
                </label>
                <select style={{ width: '100%' }}>
                  <option>Tất cả trường ĐH</option>
                  <option>Học viện Bưu chính Viễn thông</option>
                  <option>ĐH Kiến Trúc Hà Nội</option>
                  <option>ĐH Bách Khoa Hà Nội</option>
                  <option>ĐH Quốc Gia Hà Nội</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                  KHOẢNG GIÁ THUÊ
                </label>
                <RangeFilterDropdown
                  title="Khoảng giá"
                  popupTitle="Khoảng giá thuê / tháng"
                  min={0}
                  max={35000000}
                  step={500000}
                  minValue={searchMinPrice}
                  maxValue={searchMaxPrice}
                  onChange={({ min, max }) => {
                    setSearchMinPrice(min);
                    setSearchMaxPrice(max);
                  }}
                  unit="đ"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px', alignSelf: 'flex-end', height: 42 }}>
                <Search size={18} />
                <span>Tìm kiếm</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION: BẢN ĐỒ INTERACTIVE TOÀN HỆ THỐNG */}
      <section className="container" style={{ marginTop: 60 }}>
        <div className="card" style={{ padding: 24, borderTop: '4px solid #E8920A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 6 }}>◆ Bản đồ thực tế Vị trí ◆</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Map color="#E8920A" size={24} />
                <span>Bản đồ {buildings.length} tòa nhà Tiny Houses tại Hà Nội</span>
              </h2>
            </div>

            {/* Map District Selector Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['all', 'Hà Đông', 'Thanh Xuân', 'Tây Hồ', 'Hoàng Mai', 'Cầu Giấy'].map(d => (
                <button
                  key={d}
                  className={`btn ${mapDistrict === d ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                  onClick={() => setMapDistrict(d)}
                >
                  {d === 'all' ? 'Tất cả quận' : d}
                </button>
              ))}
            </div>
          </div>

          <MapView 
            buildings={mapFilteredBuildings}
            onSelectBuilding={handleSelectBuilding}
            height="460px"
          />
        </div>
      </section>

      {/* SECTION: HỆ THỐNG TÒA NHÀ CỦA TINY */}
      <section className="container" style={{ marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span className="badge badge-warning" style={{ marginBottom: 8 }}>◆ Khai thác & Vận hành trực tiếp ◆</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Hệ thống {tinyBuildings.length} tòa nhà trực tiếp Tiny</h2>
        </div>

        <div className="responsive-grid-3">
          {tinyBuildings.map((building) => (
            <div key={building.id} className="card" onClick={() => handleSelectBuilding(building.id)} style={{ cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 200 }}>
                <img src={getValidImageUrl(building.coverImage)} alt={building.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="badge badge-primary" style={{ position: 'absolute', top: 12, left: 12 }}>
                  Tòa nhà Tiny
                </span>
                <span className="badge badge-success" style={{ position: 'absolute', bottom: 12, left: 12 }}>
                  {building.vacantRoomsCount} phòng trống
                </span>
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: 'rgba(255,255,255,0.9)',
                  padding: '4px 8px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>{building.rating.toFixed(1)}</span>
                </div>
              </div>

              <div style={{ padding: 18 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>{building.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <MapPin size={14} color="#E8920A" />
                  <span>{building.address}</span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Giá từ</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E8920A' }}>
                      {(building.minPrice / 1000000).toFixed(1)} triệu <span style={{ fontSize: '0.8rem', color: '#64748B' }}>/tháng</span>
                    </span>
                  </div>
                  <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION: CON SỐ THỰC TẾ (Metrics) */}
      <section style={{ background: '#FFF7ED', padding: '50px 0', marginTop: 60 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="badge badge-warning">◆ Số liệu thực tế ◆</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 8 }}>Con số thực tế</h2>
          </div>

          <div className="responsive-grid-3" style={{ textAlign: 'center' }}>
            <div className="card" style={{ padding: 30, background: '#fff' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#E8920A' }}>{buildings.length}+</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginTop: 4 }}>Tòa nhà vận hành</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6 }}>Phủ khắp các quận trung tâm Hà Nội</p>
            </div>

            <div className="card" style={{ padding: 30, background: '#fff' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#E8920A' }}>200+</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginTop: 4 }}>Phòng trọ cho thuê</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6 }}>Đa dạng phân khúc từ Studio đến 2N1K</p>
            </div>

            <div className="card" style={{ padding: 30, background: '#fff' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#E8920A' }}>24/7</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginTop: 4 }}>Hỗ trợ kịp thời</div>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6 }}>Kỹ thuật viên xử lý sự cố trong 2h</p>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER CTA CHO CHỦ NHÀ */}
      <section className="container" style={{ marginTop: 60 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: 24,
          padding: '40px 30px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap'
        }}>
          <div>
            <span className="badge badge-warning" style={{ marginBottom: 12 }}>◆ Hợp tác bền vững ◆</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
              Bạn có tòa nhà muốn cho thuê?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 600 }}>
              Giải pháp quản lý tòa nhà toàn diện giúp tối đa hóa tỷ lệ lấp đầy và minh bạch tài chính.
            </p>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ padding: '14px 28px', fontSize: '0.95rem' }}
            onClick={() => setActiveTab('landlord')}
          >
            <span>Tìm hiểu thêm →</span>
          </button>
        </div>
      </section>
    </div>
  );
}
