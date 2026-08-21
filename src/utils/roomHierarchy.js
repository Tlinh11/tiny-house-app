/**
 * Ultra-Clean Room Hierarchy Helpers (Tòa nhà -> Loại phòng -> Số phòng)
 * Single Source of Truth, no string-matching hacks, direct 1-to-1 data binding.
 */

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

export function getValidImageUrl(url, fallback = FALLBACK_IMAGE) {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))) {
    return url;
  }
  return fallback;
}

export function parseRoomNumbers(input, existingRooms = []) {
  if (!input || typeof input !== 'string') return existingRooms;
  const incoming = input
    .split(/[,;\s]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
  return Array.from(new Set([...existingRooms, ...incoming]));
}

export function getRoomTypeNumbers(roomType) {
  if (!roomType) return [];
  const raw = roomType.specificRooms || roomType.room_numbers || (roomType.roomNumber ? [roomType.roomNumber] : []);
  return Array.from(new Set(raw.map(r => String(r).trim()).filter(Boolean)));
}

export function getRoomTypeVacantCount(roomType) {
  if (!roomType) return 0;
  return getRoomTypeNumbers(roomType).length;
}

export function getBuildingVacantCount(building, allRooms = []) {
  if (!building) return 0;
  const bldRooms = allRooms.filter(r => 
    r.buildingId === building.id || 
    r.buildingCode === building.code ||
    r.buildingCode === building.name
  );
  return bldRooms.reduce((sum, r) => sum + getRoomTypeVacantCount(r), 0);
}

export function getBuildingPriceRange(building, allRooms = []) {
  const bldRooms = allRooms.filter(r => 
    r.buildingId === building.id || 
    r.buildingCode === building.code ||
    r.buildingCode === building.name
  );
  if (bldRooms.length === 0) {
    return { minPrice: building.minPrice || 3500000, maxPrice: building.maxPrice || 5500000 };
  }
  const prices = bldRooms.map(r => Number(r.price) || 0).filter(p => p > 0);
  if (prices.length === 0) return { minPrice: 3500000, maxPrice: 5000000 };
  return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
}
