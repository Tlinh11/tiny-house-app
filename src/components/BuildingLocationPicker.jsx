import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hanoi district & ward suggestions mapping
const HANOI_DISTRICTS = [
  'Nam Từ Liêm', 'Hà Đông', 'Thanh Xuân', 'Tây Hồ', 'Hoàng Mai',
  'Cầu Giấy', 'Bắc Từ Liêm', 'Đống Đa', 'Ba Đình', 'Hai Bà Trưng', 'Hoàn Kiếm', 'Long Biên'
];

const WARDS_BY_DISTRICT = {
  'Nam Từ Liêm': ['Phường Đại Mỗ', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Mễ Trì', 'Phường Tây Mỗ', 'Phường Trung Văn', 'Phường Xuân Phương', 'Phường Cầu Diễn', 'Phường Phú Đô'],
  'Hà Đông': ['Phường Mộ Lao', 'Phường Văn Quán', 'Phường Hà Cầu', 'Phường La Khê', 'Phường Phú La', 'Phường Quang Trung', 'Phường Yên Nghĩa', 'Phường Dương Nội', 'Phường Kiến Hưng', 'Phường Vạn Phúc'],
  'Thanh Xuân': ['Phường Nhân Chính', 'Phường Thanh Xuân Trung', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Khương Trung', 'Phường Khương Mai', 'Phường Thượng Đình', 'Phường Phương Liệt'],
  'Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Quan Hoa', 'Phường Yên Hòa', 'Phường Trung Hòa', 'Phường Nghĩa Tân', 'Phường Nghĩa Đô', 'Phường Mai Dịch'],
  'Tây Hồ': ['Phường Xuân La', 'Phường Quảng An', 'Phường Phú Thượng', 'Phường Nhật Tân', 'Phường Thụy Khuê', 'Phường Yên Phụ', 'Phường Bưởi'],
  'Hoàng Mai': ['Phường Định Công', 'Phường Đại Kim', 'Phường Tân Mai', 'Phường Hoàng Văn Thụ', 'Phường Giáp Bát', 'Phường Mai Động', 'Phường Tương Mai'],
  'Bắc Từ Liêm': ['Phường Đông Ngạc', 'Phường Đức Thắng', 'Phường Xuân Đỉnh', 'Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Phú Diễn', 'Phường Minh Khai'],
  'Đống Đa': ['Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Khâm Thiên', 'Phường Văn Miếu', 'Phường Nam Đồng'],
  'Ba Đình': ['Phường Kim Mã', 'Phường Đội Cấn', 'Phường Ngọc Khánh', 'Phường Liễu Giai', 'Phường Cống Vị', 'Phường Giảng Võ']
};

// District default coordinates lookup fallback
const DISTRICT_COORDS = {
  'Nam Từ Liêm': [21.0125, 105.7650],
  'Hà Đông': [20.9715, 105.7780],
  'Thanh Xuân': [21.0010, 105.8080],
  'Cầu Giấy': [21.0300, 105.7920],
  'Tây Hồ': [21.0650, 105.8150],
  'Hoàng Mai': [20.9780, 105.8450],
  'Bắc Từ Liêm': [21.0700, 105.7650],
  'Đống Đa': [21.0180, 105.8250],
  'Ba Đình': [21.0350, 105.8200]
};

export default function BuildingLocationPicker({ buildingForm, setBuildingForm, showToast }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [geocoding, setGeocoding] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');

  const currentLat = Number(buildingForm.latitude) || 21.0100;
  const currentLng = Number(buildingForm.longitude) || 105.8100;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Custom Red Pin Icon
      const pinIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
          <div style="
            background: #EF4444;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // Marker drag event
      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setBuildingForm(prev => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6))
        }));
      });

      // Map click event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setBuildingForm(prev => ({
          ...prev,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6))
        }));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size after render
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      // Update marker position if coordinates change externally
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
        mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom());
      }
    }
  }, [currentLat, currentLng, setBuildingForm]);

  // Geocode address via OpenStreetMap Nominatim API with district fallback
  const handleAutoGeocode = async () => {
    const fullQuery = [
      buildingForm.address,
      buildingForm.ward,
      buildingForm.district,
      buildingForm.city || 'Hà Nội',
      'Việt Nam'
    ].filter(Boolean).join(', ');

    setGeocoding(true);
    setGeoStatus('Đang truy vấn tọa độ từ vị trí địa lý...');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'vi,en' } });
      const data = await res.json();

      if (data && data.length > 0) {
        const newLat = Number(parseFloat(data[0].lat).toFixed(6));
        const newLng = Number(parseFloat(data[0].lon).toFixed(6));

        setBuildingForm(prev => ({
          ...prev,
          latitude: newLat,
          longitude: newLng
        }));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLng], 16, { animate: true });
          markerRef.current.setLatLng([newLat, newLng]);
        }

        setGeoStatus(`✅ Đã định vị thành công! (${newLat}, ${newLng})`);
        if (showToast) showToast(`✅ Định vị bản đồ thành công: ${newLat}, ${newLng}`);
      } else {
        // Fallback to district default center
        const districtCenter = DISTRICT_COORDS[buildingForm.district] || [21.0100, 105.8100];
        const [defLat, defLng] = districtCenter;

        setBuildingForm(prev => ({
          ...prev,
          latitude: defLat,
          longitude: defLng
        }));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([defLat, defLng], 14, { animate: true });
          markerRef.current.setLatLng([defLat, defLng]);
        }

        setGeoStatus(`📍 Đã định vị theo trung tâm quận ${buildingForm.district} (${defLat}, ${defLng})`);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setGeoStatus('⚠️ Không thể kết nối bản đồ. Đã sử dụng tọa độ mặc định.');
    } finally {
      setGeocoding(false);
    }
  };

  const currentWards = WARDS_BY_DISTRICT[buildingForm.district] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 1. PHÂN LOẠI TÒA NHÀ */}
      <div>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
          Phân loại tòa nhà *
        </label>
        <select
          value={buildingForm.ownerType || 'partner'}
          onChange={(e) => setBuildingForm({
            ...buildingForm,
            ownerType: e.target.value,
            isTiny: e.target.value === 'tiny'
          })}
          style={{ width: '100%', fontWeight: 700, padding: '10px 14px', borderRadius: 10, borderColor: '#CBD5E1', background: '#fff' }}
        >
          <option value="partner">Tòa nhà đối tác</option>
          <option value="tiny">Tòa nhà Tiny Houses chính chủ</option>
        </select>
      </div>

      {/* 2. ĐỊA CHỈ */}
      <div>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
          Địa chỉ *
        </label>
        <input
          type="text"
          placeholder="Ví dụ: 12Louis7 Đại Mỗ, Ngõ 535 Kim Mã..."
          value={buildingForm.address || ''}
          onChange={(e) => setBuildingForm({ ...buildingForm, address: e.target.value })}
          required
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, borderColor: '#CBD5E1' }}
        />
      </div>

      {/* 3. TỈNH/TP - QUẬN/HUYỆN - PHƯỜNG/XÃ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {/* Tỉnh/TP */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
            Tỉnh/TP
          </label>
          <select
            value={buildingForm.city || 'Hà Nội'}
            onChange={(e) => setBuildingForm({ ...buildingForm, city: e.target.value })}
            style={{ width: '100%', fontWeight: 700, padding: '10px 10px', borderRadius: 10, borderColor: '#CBD5E1', background: '#fff' }}
          >
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Bình Dương">Bình Dương</option>
          </select>
        </div>

        {/* Quận/Huyện */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
            Quận/Huyện *
          </label>
          <select
            value={buildingForm.district || 'Nam Từ Liêm'}
            onChange={(e) => {
              const newDistrict = e.target.value;
              const defaultWard = WARDS_BY_DISTRICT[newDistrict]?.[0] || '';
              setBuildingForm({
                ...buildingForm,
                district: newDistrict,
                ward: defaultWard
              });
            }}
            style={{ width: '100%', fontWeight: 700, padding: '10px 10px', borderRadius: 10, borderColor: '#CBD5E1', background: '#fff' }}
          >
            {HANOI_DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Phường/Xã */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
            Phường/Xã
          </label>
          <select
            value={buildingForm.ward || ''}
            onChange={(e) => setBuildingForm({ ...buildingForm, ward: e.target.value })}
            style={{ width: '100%', fontWeight: 700, padding: '10px 10px', borderRadius: 10, borderColor: '#CBD5E1', background: '#fff' }}
          >
            {currentWards.length > 0 ? (
              currentWards.map(w => (
                <option key={w} value={w}>{w}</option>
              ))
            ) : (
              <option value={buildingForm.ward || 'Phường tiêu chuẩn'}>
                {buildingForm.ward || 'Phường tiêu chuẩn'}
              </option>
            )}
          </select>
        </div>
      </div>

      {/* 4. BUTTON TỰ ĐỘNG TÌM VỊ TRÍ TRÊN BẢN ĐỒ */}
      <div>
        <button
          type="button"
          onClick={handleAutoGeocode}
          disabled={geocoding}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: geocoding ? '#F1F5F9' : '#ffffff',
            color: geocoding ? '#94A3B8' : '#0F172A',
            border: '1.5px solid #CBD5E1',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: geocoding ? 'wait' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s'
          }}
        >
          {geocoding ? (
            <Loader2 className="animate-spin" size={16} color="#E8920A" />
          ) : (
            <Navigation size={16} color="#E8920A" />
          )}
          <span>{geocoding ? 'Đang tự động tìm vị trí...' : '📍 Tự động tìm vị trí trên bản đồ'}</span>
        </button>

        {geoStatus && (
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: geoStatus.includes('✅') ? '#16A34A' : '#64748B', marginTop: 6 }}>
            {geoStatus}
          </div>
        )}
      </div>

      {/* 5. TỌA ĐỘ BẢN ĐỒ (CLICK ĐỂ GHIM VỊ TRÍ) */}
      <div style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} color="#EF4444" />
            <span>Tọa độ bản đồ (click hoặc kéo pin để ghim vị trí)</span>
          </label>

          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>
            Lat: {currentLat.toFixed(6)} | Lng: {currentLng.toFixed(6)}
          </span>
        </div>

        {/* Leaflet Map Picker Container */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: 240,
            borderRadius: 14,
            overflow: 'hidden',
            border: '2px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'relative',
            zIndex: 1
          }}
        />

        {/* Manual Latitude & Longitude Inputs Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>Kinh độ (Longitude)</label>
            <input
              type="number"
              step="0.000001"
              value={buildingForm.longitude || ''}
              onChange={(e) => setBuildingForm({ ...buildingForm, longitude: parseFloat(e.target.value) || 0 })}
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '0.82rem', borderRadius: 8 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 2 }}>Vĩ độ (Latitude)</label>
            <input
              type="number"
              step="0.000001"
              value={buildingForm.latitude || ''}
              onChange={(e) => setBuildingForm({ ...buildingForm, latitude: parseFloat(e.target.value) || 0 })}
              required
              style={{ width: '100%', padding: '6px 10px', fontSize: '0.82rem', borderRadius: 8 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
