/**
 * Unified Room Hierarchy Helper Utilities (Tòa nhà -> Loại phòng -> Số phòng)
 * Ensures consistent business rules across Frontend, CMS, and Services.
 */

// 1. Parse and deduplicate raw room number input string (e.g. "201, 202; 203 204")
export function parseRoomNumbers(input, existingRooms = []) {
  if (!input || typeof input !== 'string') return existingRooms;
  const incoming = input
    .split(/[,;\s]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
  
  return Array.from(new Set([...existingRooms, ...incoming]));
}

// 2. Get accurate vacant rooms count of a Room Type
export function getRoomTypeVacantCount(roomType) {
  if (!roomType) return 0;
  if (Array.isArray(roomType.specificRooms) && roomType.specificRooms.length > 0) {
    return roomType.specificRooms.length;
  }
  if (Array.isArray(roomType.room_numbers) && roomType.room_numbers.length > 0) {
    return roomType.room_numbers.length;
  }
  if (typeof roomType.available_rooms === 'number') {
    return roomType.available_rooms;
  }
  return roomType.status === 'Có sẵn' ? 1 : 0;
}

// 3. Get accurate list of specific room numbers for a Room Type
export function getRoomTypeNumbers(roomType) {
  if (!roomType) return [];
  const raw = roomType.specificRooms || roomType.room_numbers || (roomType.roomNumber ? [roomType.roomNumber] : []);
  return Array.from(new Set(raw.filter(Boolean)));
}

// 4. Calculate total vacant rooms of a Building from its Room Types
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
  return bldRooms.reduce((acc, r) => acc + getRoomTypeVacantCount(r), 0);
}

// 5. Calculate dynamic price range (minPrice, maxPrice) from its Room Types
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

// 6. Group raw room list into clean, deduplicated Room Types
export function groupRoomsIntoTypes(rooms = []) {
  const map = new Map();

  rooms.forEach(r => {
    const typeKey = (r.type || r.name || 'Studio khép kín').trim();
    const roomsList = getRoomTypeNumbers(r);

    if (!map.has(typeKey)) {
      map.set(typeKey, {
        ...r,
        type: typeKey,
        name: typeKey,
        specificRooms: roomsList,
        room_numbers: roomsList,
        available_rooms: roomsList.length,
        vacantCount: roomsList.length,
        status: roomsList.length > 0 ? (r.status || 'Có sẵn') : 'Hết phòng'
      });
    } else {
      const existing = map.get(typeKey);
      const combined = Array.from(new Set([...existing.specificRooms, ...roomsList]));
      map.set(typeKey, {
        ...existing,
        specificRooms: combined,
        room_numbers: combined,
        available_rooms: combined.length,
        vacantCount: combined.length,
        status: combined.length > 0 ? (existing.status || 'Có sẵn') : 'Hết phòng'
      });
    }
  });

  return Array.from(map.values());
}
