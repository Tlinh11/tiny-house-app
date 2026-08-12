import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Star, ChevronRight, Check, LayoutGrid, Map, Columns, ArrowUpDown } from 'lucide-react';
import { DataService } from '../services/dataService';
import MapView from '../components/MapView';
import Pagination from '../components/Pagination';
import RangeFilterDropdown from '../components/RangeFilterDropdown';
import DualRangeSlider from '../components/DualRangeSlider';

export default function SearchPage({ setActiveTab, setSelectedBuildingId, searchFilters }) {
  const [filterType, setFilterType] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState(searchFilters?.district || 'all');
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  
  const [minPrice, setMinPrice] = useState(searchFilters?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState(searchFilters?.maxPrice ?? 20000000);
  const [minArea, setMinArea] = useState(0);
  const [maxArea, setMaxArea] = useState(100);

  const [viewMode, setViewMode] = useState('split');
  const [sortBy, setSortBy] = useState('vacant-desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [buildings, setBuildings] = useState(() => DataService.getBuildings());
  const [allRooms, setAllRooms] = useState(() => DataService.getRooms());

  useEffect(() => {
    const syncData = () => {
      setBuildings(DataService.getBuildings());
      setAllRooms(DataService.getRooms());
    };
    syncData();
    const unsubscribe = DataService.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  const districtsList = [
    'Tất cả quận', 'Hà Đông', 'Thanh Xuân', 'Tây Hồ', 'Hoàng Mai', 'Cầu Giấy', 'Bắc Từ Liêm', 'Nam Từ Liêm', 'Đống Đa', 'Ba Đình'
  ];

  const roomTypeOptions = [
    'Căn 1N1K', 'Căn hộ 1N1K', 'Căn hộ 2N1K', 'Căn hộ nguyên tầng',
    'Phòng gác xép', 'Studio', 'Studio ban công', 'Studio Full đồ', 'Studio gác xép'
  ];

  const handleToggleRoomType = (type) => {
    if (selectedRoomTypes.includes(type)) {
      setSelectedRoomTypes(selectedRoomTypes.filter(t => t !== type));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, type]);
    }
  };

  const filteredBuildings = buildings.filter(b => {
    if (filterType === 'tiny' && !b.isTiny) return false;
    if (filterType === 'partner' && b.isTiny) return false;
    if (selectedDistrict !== 'all' && selectedDistrict !== 'Tất cả quận' && b.district !== selectedDistrict) return false;

    if (b.minPrice > maxPrice) return false;
    if (b.maxPrice && b.maxPrice < minPrice) return false;

    const bRooms = allRooms.filter(r => r.buildingId === b.id || r.buildingCode === b.code || r.buildingId === b.code);

    if (selectedRoomTypes.length > 0) {
      const hasMatchingType = bRooms.some(r => selectedRoomTypes.some(type => r.type?.toLowerCase().includes(type.toLowerCase())));
      if (!hasMatchingType) return false;
    }

    return true;
  });

  const sortedBuildings = [...filteredBuildings].sort((a, b) => {
    if (sortBy === 'vacant-desc') return (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0);
    if (sortBy === 'vacant-asc') return (a.vacantRoomsCount || 0) - (b.vacantRoomsCount || 0);
    if (sortBy === 'price-asc') return (a.minPrice || 0) - (b.minPrice || 0);
    if (sortBy === 'price-desc') return (b.minPrice || 0) - (a.minPrice || 0);
    return 0;
  });

  const paginatedBuildings = sortedBuildings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectBuilding = (id) => {
    setSelectedBuildingId(id);
    setActiveTab('building-detail');
  };

  return (
    <div style={{ padding: '30px 0' }}>
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#ffffff',
        padding: '30px 0 35px 0',
        marginBottom: 30
      }}>
        <div className="container">
          <span className="badge badge-warning" style={{ marginBottom: 10 }}>🏠 Tìm phòng thực tế</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 8, color: '#ffffff' }}>
            Danh sách {buildings.length} Tòa nhà Tiny Houses
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
            Phòng thật — Giá thật — 100% Ảnh & Video thực tế — Xem phòng 24/7 miễn phí
          </p>
        </div>
      </div>

      <div className="container">
        {/* TOP FILTER & VIEW TOGGLE BAR */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* HÀNG 1: TẤT CẢ BỘ LỌC NẰM TRÊN CÙNG 1 HÀNG DỰA TRÊN THIẾT KẾ ĐỒNG ĐỀU */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', whiteSpace: 'nowrap', marginRight: 4 }}>
              Hiển thị {sortedBuildings.length} / {buildings.length} tòa nhà
            </span>

            {/* Tiny vs Partner Tabs */}
            <div style={{ background: '#F1F5F9', padding: 3, borderRadius: 10, display: 'flex', gap: 3, height: 42, alignItems: 'center' }}>
              <button
                className={'btn ' + (filterType === 'all' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '0 12px', height: 36, fontWeight: 700 }}
                onClick={() => { setFilterType('all'); setCurrentPage(1); }}
              >
                Tất cả
              </button>
              <button
                className={'btn ' + (filterType === 'tiny' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '0 12px', height: 36, fontWeight: 700 }}
                onClick={() => { setFilterType('tiny'); setCurrentPage(1); }}
              >
                Tòa Tiny
              </button>
              <button
                className={'btn ' + (filterType === 'partner' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '0 12px', height: 36, fontWeight: 700 }}
                onClick={() => { setFilterType('partner'); setCurrentPage(1); }}
              >
                Tòa Đối tác
              </button>
            </div>

            {/* District Quick Selector */}
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
              style={{ fontWeight: 700, padding: '0 12px', borderRadius: 10, border: '1px solid #CBD5E1', height: 42, fontSize: '0.85rem', color: '#0F172A', background: '#ffffff', cursor: 'pointer' }}
            >
              {districtsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* DUAL RANGE PRICE FILTER DROPDOWN */}
            <RangeFilterDropdown
              title="Khoảng giá"
              popupTitle="Khoảng giá thuê / tháng"
              min={0}
              max={20000000}
              step={500000}
              minValue={minPrice}
              maxValue={maxPrice}
              onChange={({ min, max }) => {
                setMinPrice(min);
                setMaxPrice(max);
                setCurrentPage(1);
              }}
              unit="đ"
            />

            {/* SORT BY VACANT ROOMS / PRICE DROPDOWN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', padding: '0 12px', borderRadius: 10, border: '1px solid #CBD5E1', height: 42 }}>
              <ArrowUpDown size={15} color="#E8920A" />
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', cursor: 'pointer', outline: 'none' }}
              >
                <option value="vacant-desc">Sắp xếp: Còn trống nhiều nhất</option>
                <option value="price-asc">Giá thuê: Thấp → Cao</option>
                <option value="price-desc">Giá thuê: Cao → Thấp</option>
              </select>
            </div>
          </div>

          {/* HÀNG 2: CHẾ ĐỘ XEM (DANH SÁCH, CHIA ĐÔI, BẢN ĐỒ) NẰM HÀNG DƯỚI */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
            <div style={{ background: '#F1F5F9', padding: 4, borderRadius: 12, display: 'flex', gap: 4 }}>
              <button
                className={'btn ' + (viewMode === 'grid' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                onClick={() => setViewMode('grid')}
                title="Xem danh sách dạng ô"
              >
                <LayoutGrid size={16} />
                <span>Danh sách</span>
              </button>
              <button
                className={'btn ' + (viewMode === 'split' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                onClick={() => setViewMode('split')}
                title="Chia đôi màn hình Danh sách + Bản đồ"
              >
                <Columns size={16} />
                <span>Chia đôi (Map + List)</span>
              </button>
              <button
                className={'btn ' + (viewMode === 'map' ? 'btn-primary' : 'btn-secondary')}
                style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                onClick={() => setViewMode('map')}
                title="Xem toàn màn hình bản đồ"
              >
                <Map size={16} />
                <span>Bản đồ</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW CONTENT MODES */}

        {/* 1. MAP ONLY FULL VIEW */}
        {viewMode === 'map' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 20, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={18} color="#E8920A" />
                  <span>Bộ lọc bản đồ</span>
                </h3>
                <button
                  style={{ background: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setSelectedRoomTypes([]); setMinPrice(0); setMaxPrice(20000000); setSelectedDistrict('all'); setCurrentPage(1); }}
                >
                  ↻ Bỏ lọc
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>Khoảng giá thuê / tháng</h4>
                <DualRangeSlider
                  min={0}
                  max={20000000}
                  step={500000}
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onChange={({ min, max }) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                    setCurrentPage(1);
                  }}
                  unit="đ"
                />
              </div>
            </div>

            <div>
              <MapView
                buildings={sortedBuildings}
                onSelectBuilding={handleSelectBuilding}
                height="650px"
              />
            </div>
          </div>
        )}

        {/* 2. SPLIT VIEW (LIST + MAP SIDE BY SIDE) */}
        {viewMode === 'split' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 16 }}>
                  {paginatedBuildings.map((building) => (
                    <div
                      key={building.id}
                      className="card"
                      onClick={() => handleSelectBuilding(building.id)}
                      style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}
                    >
                      <div style={{ position: 'relative', height: 160 }}>
                        <img src={building.coverImage} alt={building.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span className="badge badge-tiny" style={{ position: 'absolute', top: 8, left: 8 }}>
                          {building.isTiny ? 'Tiny' : 'Đối tác'}
                        </span>
                        <span className="badge badge-success" style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.75rem' }}>
                          {building.vacantRoomsCount} phòng trống
                        </span>
                      </div>

                      <div style={{ padding: '14px 14px 14px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{building.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.85rem', fontWeight: 700 }}>
                              <Star size={14} fill="#F59E0B" color="#F59E0B" />
                              <span>5.0</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            <MapPin size={14} color="#E8920A" />
                            <span>{building.address}</span>
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                          <div>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#E8920A' }}>
                              {(building.minPrice).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}> /tháng</span>
                          </div>

                          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                            Chi tiết →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <Pagination
                    totalItems={sortedBuildings.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              </div>

              <div style={{ position: 'sticky', top: 90 }}>
                <MapView
                  buildings={sortedBuildings}
                  onSelectBuilding={handleSelectBuilding}
                  height="750px"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. GRID VIEW (DEFAULT CARDS GRID) */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
            <div className="card" style={{ padding: 20, height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={18} color="#E8920A" />
                  <span>Bộ lọc</span>
                </h3>
                <button
                  style={{ background: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => { setSelectedRoomTypes([]); setMinPrice(0); setMaxPrice(20000000); setSelectedDistrict('all'); setCurrentPage(1); }}
                >
                  ↻ Bỏ lọc
                </button>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>Loại phòng</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {roomTypeOptions.map((type) => {
                    const checked = selectedRoomTypes.includes(type);
                    return (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleRoomType(type)}
                          style={{ accentColor: '#E8920A' }}
                        />
                        <span>{type}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>Khoảng giá thuê / tháng</h4>
                <DualRangeSlider
                  min={0}
                  max={20000000}
                  step={500000}
                  minValue={minPrice}
                  maxValue={maxPrice}
                  onChange={({ min, max }) => {
                    setMinPrice(min);
                    setMaxPrice(max);
                    setCurrentPage(1);
                  }}
                  unit="đ"
                />
              </div>
            </div>

            <div>
              <div className="responsive-grid-2" style={{ marginBottom: 20 }}>
                {paginatedBuildings.map((building) => (
                  <div key={building.id} className="card" onClick={() => handleSelectBuilding(building.id)} style={{ cursor: 'pointer' }}>
                    <div style={{ position: 'relative', height: 190 }}>
                      <img src={building.coverImage} alt={building.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                      <span className="badge badge-success" style={{ position: 'absolute', top: 10, left: 10 }}>
                        {building.vacantRoomsCount} phòng trống
                      </span>

                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'rgba(255,255,255,0.9)',
                        padding: '3px 8px',
                        borderRadius: 20,
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Star size={14} fill="#F59E0B" color="#F59E0B" />
                        <span>{building.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div style={{ padding: 16 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>{building.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <MapPin size={14} color="#E8920A" />
                        <span>{building.address}</span>
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                        <div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#E8920A' }}>
                            {(building.minPrice).toLocaleString('vi-VN')} VND
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}> /tháng</span>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                          Xem chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <Pagination
                  totalItems={sortedBuildings.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
