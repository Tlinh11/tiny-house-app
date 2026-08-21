/**
 * Unified Room Hierarchy Helper Utilities (Tòa nhà -> Loại phòng -> Số phòng)
 * Ensures strict, single-source-of-truth consistency across Frontend, Detail views, and CMS.
 */

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

// 1. Safe Image URL resolver
export function getValidImageUrl(url, fallback = FALLBACK_ROOM_IMAGE) {
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))) {
    return url;
  }
  return fallback;
}

// 2. Canonical Room Type Key Normalizer (Merges "Studio ban công" and "Studio - Ban công")
export function normalizeRoomTypeKey(name = '') {
  return String(name || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics for key matching
    .replace(/[\s\-_–—]+/g, ' ')
    .trim();
}

// 3. Canonical Room Type Name Formatter
export function formatRoomTypeName(name = '') {
  const clean = String(name || '').trim();
  const key = normalizeRoomTypeKey(clean);
  if (key === 'studio ban cong') return 'Studio - Ban công';
  if (key === 'studio khep kin') return 'Studio khép kín';
  if (key === 'studio gac xep') return 'Studio gác xép';
  if (key === 'studio') return 'Studio';
  if (key === 'can 1n1k' || key === '1n1k' || key === '1pn ban cong') return 'Căn 1N1K';
  if (key === 'can 2n1k' || key === '2n1k') return 'Căn 2N1K';
  return clean || 'Studio khép kín';
}

// 4. Parse and deduplicate raw room number input string (e.g. "201, 202; 203 204")
export function parseRoomNumbers(input, existingRooms = []) {
  if (!input || typeof input !== 'string') return existingRooms;
  const incoming = input
    .split(/[,;\s]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
  
  return Array.from(new Set([...existingRooms, ...incoming]));
}

// 5. Get accurate list of specific room numbers for a Room Type
export function getRoomTypeNumbers(roomType) {
  if (!roomType) return [];
  let raw = [];
  if (Array.isArray(roomType.specificRooms) && roomType.specificRooms.length > 0) {
    raw = roomType.specificRooms;
  } else if (Array.isArray(roomType.room_numbers) && roomType.room_numbers.length > 0) {
    raw = roomType.room_numbers;
  } else if (roomType.roomNumber) {
    raw = [roomType.roomNumber];
  }
  return Array.from(new Set(raw.map(r => String(r).trim()).filter(Boolean)));
}

// 6. Get accurate vacant rooms count of a Room Type
export function getRoomTypeVacantCount(roomType) {
  if (!roomType) return 0;
  const numbers = getRoomTypeNumbers(roomType);
  if (numbers.length > 0) return numbers.length;
  if (typeof roomType.available_rooms === 'number') return roomType.available_rooms;
  return roomType.status === 'Có sẵn' ? 1 : 0;
}

// 7. Calculate total vacant rooms of a Building from its Room Types
export function getBuildingVacantCount(building, allRooms = []) {
  if (!building) return 0;
  const bldRooms = allRooms.filter(r => 
    r.buildingId === building.id || 
    r.buildingCode === building.code ||
    r.buildingCode === building.name
  );
  if (bldRooms.length === 0) {
    return building.vacantRoomsCount || 0;
  }
  const grouped = groupRoomsIntoTypes(bldRooms);
  return grouped.reduce((acc, r) => acc + getRoomTypeVacantCount(r), 0);
}

// 8. Calculate dynamic price range (minPrice, maxPrice) from its Room Types
export function getBuildingPriceRange(building, allRooms = []) {
  const bldRooms = allRooms.filter(r => 
    r.buildingId === building.id || 
    r.buildingCode === building.code ||
    r.buildingCode === building.name
  );
  if (bldRooms.length === 0) {
    return {
      minPrice: building.minPrice || 3500000,
      maxPrice: building.maxPrice || 5500000
    };
  }
  const prices = bldRooms.map(r => Number(r.price) || 0).filter(p => p > 0);
  if (prices.length === 0) {
    return { minPrice: 3500000, maxPrice: 5000000 };
  }
  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices)
  };
}

// 9. Group raw room list into clean, deduplicated, canonical Room Types (1 card per distinct type)
export function groupRoomsIntoTypes(rooms = []) {
  if (!Array.isArray(rooms) || rooms.length === 0) return [];
  const map = new Map();

  rooms.forEach(r => {
    const rawName = (r.type || r.name || 'Studio khép kín').trim();
    const canonKey = normalizeRoomTypeKey(rawName);
    const standardName = formatRoomTypeName(rawName);
    const roomsList = getRoomTypeNumbers(r);

    const validImages = Array.isArray(r.images) 
      ? r.images.map(img => getValidImageUrl(img)).filter(Boolean)
      : [getValidImageUrl(r.coverImage)];

    if (!map.has(canonKey)) {
      map.set(canonKey, {
        ...r,
        type: standardName,
        name: standardName,
        coverImage: validImages[0] || FALLBACK_ROOM_IMAGE,
        images: validImages.length > 0 ? validImages : [FALLBACK_ROOM_IMAGE],
        specificRooms: roomsList,
        room_numbers: roomsList,
        available_rooms: roomsList.length,
        vacantCount: roomsList.length,
        status: roomsList.length > 0 ? (r.status || 'Có sẵn') : 'Hết phòng'
      });
    } else {
      const existing = map.get(canonKey);
      const combinedRooms = Array.from(new Set([...existing.specificRooms, ...roomsList]));
      const combinedImages = Array.from(new Set([...existing.images, ...validImages])).filter(Boolean);

      map.set(canonKey, {
        ...existing,
        ...r,
        type: standardName,
        name: standardName,
        coverImage: existing.coverImage || validImages[0] || FALLBACK_ROOM_IMAGE,
        images: combinedImages.length > 0 ? combinedImages : [FALLBACK_ROOM_IMAGE],
        specificRooms: combinedRooms,
        room_numbers: combinedRooms,
        available_rooms: combinedRooms.length,
        vacantCount: combinedRooms.length,
        status: combinedRooms.length > 0 ? (existing.status || 'Có sẵn') : 'Hết phòng'
      });
    }
  });

  return Array.from(map.values());
}
