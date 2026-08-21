// Clean Data Transformer: export_all_data copy.json -> REAL_BUILDINGS & REAL_ROOMS
import rawExportedJson from '../../export_all_data copy.json';

const rawList = Array.isArray(rawExportedJson) 
  ? rawExportedJson 
  : (rawExportedJson.buildings || []);

// 1. Deduplicate buildings by unique ID / code
const seenBuildingIds = new Set();
const uniqueBuildingsList = rawList.filter(b => {
  const key = b.id || b.name;
  if (!key || seenBuildingIds.has(key)) return false;
  seenBuildingIds.add(key);
  return true;
});

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
];

export const REAL_BUILDINGS = [];
export const REAL_ROOMS = [];
const seenRoomIds = new Set();

uniqueBuildingsList.forEach((b, idx) => {
  const code = b.name || `BUILDING-${idx + 1}`;
  const isTiny = b.owner_type === 'tiny';
  const district = b.district || 'Bắc Từ Liêm';
  const buildingId = b.id;

  let minPrice = Infinity;
  let maxPrice = 0;
  let vacantRoomsCount = 0;
  let allBuildingImages = [];
  let allBuildingRoomsList = [];

  const buildingRoomTypes = b.room_types || [];

  buildingRoomTypes.forEach((rt, rtIdx) => {
    const rtId = rt.id || `${buildingId}-rt-${rtIdx}`;
    if (seenRoomIds.has(rtId)) return;
    seenRoomIds.add(rtId);

    const roomNumbers = (rt.room_numbers && Array.isArray(rt.room_numbers) && rt.room_numbers.length > 0)
      ? rt.room_numbers.map(s => String(s).trim())
      : ['101', '102'];

    const price = Number(rt.price) || 3500000;
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;

    vacantRoomsCount += roomNumbers.length;
    allBuildingRoomsList.push(...roomNumbers);

    const roomImages = (rt.images && Array.isArray(rt.images) && rt.images.length > 0)
      ? rt.images
      : DEFAULT_IMAGES;

    allBuildingImages.push(...roomImages);

    // Push Clean Room Type
    REAL_ROOMS.push({
      id: rtId,
      roomTypeId: rtId,
      buildingId: buildingId,
      buildingCode: code,
      buildingName: `Tòa nhà ${code}`,
      name: rt.name || 'Studio',
      type: rt.name || 'Studio',
      price: price,
      area: Number(rt.area) || 25,
      maxOccupants: Number(rt.max_occupants) || 2,
      specificRooms: roomNumbers,
      room_numbers: roomNumbers,
      available_rooms: roomNumbers.length,
      vacantCount: roomNumbers.length,
      status: roomNumbers.length > 0 ? 'Có sẵn' : 'Hết phòng',
      roomNumber: roomNumbers[0] || '101',
      coverImage: roomImages[0] || DEFAULT_IMAGES[0],
      images: roomImages,
      description: rt.description || '',
      amenities: rt.amenities || [],
      contactName: rt.contact_name || 'Ms. Huyền',
      contactPhone: rt.contact_phone || '0386570401',
      contactEmail: rt.contact_email || 'tinyhouse.info@gmail.com',
      host: {
        name: rt.contact_name || 'Ms. Huyền',
        phone: rt.contact_phone || '0386570401',
        email: rt.contact_email || 'tinyhouse.info@gmail.com'
      }
    });
  });

  if (minPrice === Infinity) minPrice = 3500000;
  if (maxPrice === 0) maxPrice = minPrice + 1500000;

  const coverImage = allBuildingImages.length > 0 ? allBuildingImages[0] : DEFAULT_IMAGES[idx % DEFAULT_IMAGES.length];

  REAL_BUILDINGS.push({
    id: buildingId,
    code: code,
    name: `Tòa nhà ${code} - ${b.address}`,
    isTiny: isTiny,
    ownerType: b.owner_type || 'tiny',
    rating: 5.0,
    address: `${b.address}${b.ward ? ', ' + b.ward : ''}`,
    district: district,
    ward: b.ward || '',
    city: b.province || 'Hà Nội',
    latitude: b.latitude || (21.0000 + (idx * 0.005)),
    longitude: b.longitude || (105.8000 + (idx * 0.005)),
    vacantRoomsCount: vacantRoomsCount,
    minPrice: minPrice,
    maxPrice: maxPrice,
    coverImage: coverImage,
    images: allBuildingImages.length > 0 ? allBuildingImages : DEFAULT_IMAGES,
    rooms: Array.from(new Set(allBuildingRoomsList)),
    roomTypes: buildingRoomTypes,
    sortOrder: b.sort_order || 0
  });
});

// Sort default: highest vacant rooms first
REAL_BUILDINGS.sort((a, b) => b.vacantRoomsCount - a.vacantRoomsCount);
