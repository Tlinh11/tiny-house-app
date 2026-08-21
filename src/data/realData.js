// Real Data Transformer from export_all_data copy.json / buildings_and_rooms copy.json
import rawExportedJson from '../../export_all_data copy.json';

const rawData = Array.isArray(rawExportedJson) 
  ? rawExportedJson 
  : (rawExportedJson.buildings || []);

// Coordinates mapping for buildings missing explicit lat/lng in raw JSON
const LAT_LNG_COORDINATES = {
  'DT006': { latitude: 21.0655, longitude: 105.8078 }, // ngõ 1 Võ Chí Công, Tây Hồ
  'DT007': { latitude: 20.9575, longitude: 105.7952 }, // ngõ 75 Mậu Lương, Kiến Hưng, Hà Đông
  'TN008': { latitude: 21.0885, longitude: 105.7865 }, // 35 Đông Ngạc, Bắc Từ Liêm
  'TN0016': { latitude: 21.0580, longitude: 105.8360 }, // ngõ 84 Tứ Liên, Tây Hồ
  'DT008': { latitude: 20.9820, longitude: 105.8150 }, // ngõ 619 Vũ Tông Phan, Thanh Xuân
  'DT004': { latitude: 21.0285, longitude: 105.7725 }, // 57 Phú Mỹ, Nam Từ Liêm
  'DT002': { latitude: 21.0185, longitude: 105.8365 }, // 51 Hòa Bình, Khâm Thiên, Đống Đa
  'DT003': { latitude: 21.0060, longitude: 105.8080 }, // ngõ 21 Lê Văn Lương, Thanh Xuân
  'DT010': { latitude: 20.9850, longitude: 105.7875 }, // ngõ 46 An Hòa, Hà Đông
  'TN004': { latitude: 20.9715, longitude: 105.7680 }, // ngõ 12 Quang Trung, Hà Đông
  'TN003': { latitude: 21.0105, longitude: 105.8085 }, // 189 Nguyễn Ngọc Vũ, Cầu Giấy
  'DT005': { latitude: 21.0520, longitude: 105.8170 }, // 48 Võng Thị, Tây Hồ
  'TH0008': { latitude: 21.0885, longitude: 105.7865 }, // 35 Đông Ngạc
};

const DISTRICT_CENTERS = {
  'Hà Đông': { latitude: 20.9715, longitude: 105.7780 },
  'Thanh Xuân': { latitude: 20.9930, longitude: 105.8120 },
  'Tây Hồ': { latitude: 21.0600, longitude: 105.8200 },
  'Hoàng Mai': { latitude: 20.9780, longitude: 105.8520 },
  'Cầu Giấy': { latitude: 21.0300, longitude: 105.7900 },
  'Bắc Từ Liêm': { latitude: 21.0750, longitude: 105.7700 },
  'Nam Từ Liêm': { latitude: 21.0200, longitude: 105.7650 },
  'Đống Đa': { latitude: 21.0150, longitude: 105.8250 },
  'Ba Đình': { latitude: 21.0350, longitude: 105.8200 }
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
];

// Transform raw buildings JSON into system building objects
export const REAL_BUILDINGS = rawData.map((b, idx) => {
  const code = b.name || `BUILDING-${idx + 1}`;
  const isTiny = b.owner_type === 'tiny';
  const district = b.district || 'Bắc Từ Liêm';

  const lat = b.latitude || LAT_LNG_COORDINATES[code]?.latitude || DISTRICT_CENTERS[district]?.latitude || (21.0000 + (idx * 0.005));
  const lng = b.longitude || LAT_LNG_COORDINATES[code]?.longitude || DISTRICT_CENTERS[district]?.longitude || (105.8000 + (idx * 0.005));

  let minPrice = Infinity;
  let maxPrice = 0;
  let vacantRoomsCount = 0;
  let allImages = [];
  let roomNumbersList = [];
  let hostInfo = {
    name: "Ms. Huyền",
    phone: "0386570401",
    email: "tinyhouse.info@gmail.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  };

  (b.room_types || []).forEach(rt => {
    if (rt.price && rt.price < minPrice) minPrice = rt.price;
    if (rt.price && rt.price > maxPrice) maxPrice = rt.price;
    
    const count = rt.available_rooms || (rt.room_numbers ? rt.room_numbers.length : 1);
    vacantRoomsCount += count;
    
    if (rt.images && Array.isArray(rt.images) && rt.images.length) {
      allImages.push(...rt.images);
    }
    
    if (rt.room_numbers && Array.isArray(rt.room_numbers)) {
      roomNumbersList.push(...rt.room_numbers);
    }

    if (rt.contact_name && rt.contact_phone) {
      hostInfo = {
        name: rt.contact_name,
        phone: rt.contact_phone,
        email: rt.contact_email || "tinyhouse.info@gmail.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
      };
    }
  });

  if (minPrice === Infinity) minPrice = 3500000;
  if (maxPrice === 0) maxPrice = minPrice + 1500000;
  if (roomNumbersList.length === 0) roomNumbersList = ['101', '102', '201', '301'];

  const coverImage = allImages.length > 0 ? allImages[0] : DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length];
  const galleryImages = allImages.length > 0 ? allImages : DEFAULT_IMAGES;

  return {
    id: b.id,
    code: code,
    name: `Tòa nhà ${code} - ${b.address}`,
    isTiny: isTiny,
    ownerType: b.owner_type,
    rating: 5.0,
    address: `${b.address}${b.ward ? ', ' + b.ward : ''}`,
    district: district,
    ward: b.ward || '',
    city: b.province || 'Hà Nội',
    latitude: lat,
    longitude: lng,
    vacantRoomsCount: vacantRoomsCount,
    minPrice: minPrice,
    maxPrice: maxPrice,
    coverImage: coverImage,
    images: galleryImages,
    host: hostInfo,
    rooms: Array.from(new Set(roomNumbersList)),
    roomTypes: b.room_types || [],
    sortOrder: b.sort_order || 0
  };
});

// DEFAULT SORT: Sort buildings by highest number of vacant rooms first!
REAL_BUILDINGS.sort((a, b) => b.vacantRoomsCount - a.vacantRoomsCount);

// Transform raw room_types JSON into unique Room Type items (Loại phòng)
export const REAL_ROOMS = [];

rawData.forEach(b => {
  const buildingCode = b.name;
  (b.room_types || []).forEach((rt, rtIdx) => {
    const roomNumbers = (rt.room_numbers && rt.room_numbers.length > 0) ? rt.room_numbers : ['101', '102', '201', '202'];
    
    // Extract unique room type (1 entry per room_type)
    REAL_ROOMS.push({
      id: rt.id || `${b.id}-rt-${rtIdx}`,
      roomTypeId: rt.id || `${b.id}-rt-${rtIdx}`,
      buildingId: b.id,
      buildingCode: buildingCode,
      buildingName: `Tòa nhà ${buildingCode}`,
      type: rt.name || "Studio khép kín",
      roomNumber: roomNumbers[0] || '101',
      specificRooms: roomNumbers,
      vacantCount: rt.available_rooms || roomNumbers.length,
      status: (rt.available_rooms > 0 || roomNumbers.length > 0) ? "Có sẵn" : "Đã thuê",
      price: rt.price || 3500000,
      area: rt.area || 25,
      maxOccupants: rt.max_occupants || 2,
      availableFrom: "Ở ngay",
      wifiFree: true,
      kitchenClosed: true,
      description: rt.description || "",
      images: rt.images && rt.images.length ? rt.images : DEFAULT_IMAGES,
      contactName: rt.contact_name || "Ms. Huyền",
      contactPhone: rt.contact_phone || "0386570401",
      contactEmail: rt.contact_email || "",
      host: {
        name: rt.contact_name || "Ms. Huyền",
        phone: rt.contact_phone || "0386570401",
        email: rt.contact_email || "tinyhouse.info@gmail.com"
      },
      amenitiesNoiThat: rt.amenities ? rt.amenities.filter(a => ['Điều hòa', 'Nóng lạnh', 'Giường', 'Tủ quần áo', 'Tủ bếp trên', 'Tủ bếp dưới', 'Tủ lạnh', 'Sofa', 'Máy giặt', 'Rèm cửa'].includes(a)) : ["Điều hòa", "Nóng lạnh", "Giường", "Tủ quần áo", "Tủ lạnh"],
      amenitiesRieng: rt.amenities ? rt.amenities.filter(a => ['Wifi từng phòng', 'Khóa vân tay', 'Ban công', 'App hệ sinh thái cư dân', 'Nuôi pet'].includes(a)) : ["Wifi từng phòng", "App hệ sinh thái cư dân"],
      amenitiesChung: rt.amenities ? rt.amenities.filter(a => ['Máy giặt chung', 'Máy sấy chung', 'Xe điện', 'Thang máy', 'Camera an ninh', 'Wifi chung'].includes(a)) : ["Thang máy", "Máy giặt chung"],
      amenitiesAnNinh: rt.amenities ? rt.amenities.filter(a => ['Khóa vân tay', 'Camera an ninh'].includes(a)) : ["Camera an ninh", "Khóa vân tay"],
      amenitiesPccc: rt.amenities ? rt.amenities.filter(a => ['Sprinkler', 'Bình cứu hỏa', 'Thang thoát hiểm', 'Báo cháy', 'Chuông báo cháy', 'Báo khói', 'Cửa chống cháy', 'Mặt nạ phòng độc'].includes(a)) : ["Sprinkler", "Bình cứu hỏa", "Thang thoát hiểm", "Báo cháy"]
    });
  });
});

// DEFAULT SORT: Available rooms first
REAL_ROOMS.sort((a, _b) => (a.status === 'Có sẵn' ? -1 : 1));
