import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Coordinate map for Hanoi districts if lat/lng is missing
const DISTRICT_COORDS = {
  'Nam Từ Liêm': { lat: 21.0135, lng: 105.7645 },
  'Bắc Từ Liêm': { lat: 21.0635, lng: 105.7645 },
  'Hà Đông': { lat: 20.9715, lng: 105.7780 },
  'Cầu Giấy': { lat: 21.0362, lng: 105.7906 },
  'Thanh Xuân': { lat: 20.9936, lng: 105.8080 },
  'Đống Đa': { lat: 21.0180, lng: 105.8290 },
  'Hoàng Mai': { lat: 20.9720, lng: 105.8450 },
  'Tây Hồ': { lat: 21.0600, lng: 105.8200 },
  'Ba Đình': { lat: 21.0330, lng: 105.8250 },
  'Hai Bà Trưng': { lat: 21.0100, lng: 105.8500 },
  'Long Biên': { lat: 21.0450, lng: 105.8850 },
  'Thanh Trì': { lat: 20.9500, lng: 105.8300 },
  'Đông Anh': { lat: 21.1350, lng: 105.8400 }
};

function parseJsonFile(filename) {
  const filePath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

async function runImport() {
  console.log('🚀 Reading new data files...');

  const rawExport = parseJsonFile('export_all_data.json');
  const rawCopy = parseJsonFile('buildings_and_rooms copy.json');

  // Fetch existing buildings from Supabase Cloud to map existing IDs
  const existingCodeToId = new Map();
  if (SUPABASE_URL && SUPABASE_KEY) {
    const { data: existingBldgs } = await supabase.from('buildings').select('id, code');
    if (existingBldgs && Array.isArray(existingBldgs)) {
      existingBldgs.forEach(b => {
        if (b.code) existingCodeToId.set(b.code, b.id);
      });
      console.log(`ℹ️ Found ${existingCodeToId.size} existing building codes on Supabase.`);
    }
  }

  let rawBuildings = [];
  if (rawCopy && Array.isArray(rawCopy)) {
    rawBuildings.push(...rawCopy);
  }
  if (rawExport) {
    if (Array.isArray(rawExport)) {
      rawBuildings.push(...rawExport);
    } else if (rawExport.buildings && Array.isArray(rawExport.buildings)) {
      rawBuildings.push(...rawExport.buildings);
    }
  }

  console.log(`📊 Found total ${rawBuildings.length} raw building entries.`);

  // Deduplicate buildings by ID / Code
  const buildingMap = new Map();
  const roomsList = [];

  for (const b of rawBuildings) {
    const code = b.name || b.code || (b.id ? `BLD_${b.id}` : null);
    if (!code) continue;

    let buildingId = existingCodeToId.get(code) || b.id || `BLD_${code}`;
    if (buildingMap.has(code)) {
      buildingId = buildingMap.get(code).id;
    }
    const district = b.district || 'Nam Từ Liêm';
    const coords = DISTRICT_COORDS[district] || { lat: 21.0135, lng: 105.7645 };

    // Process room types
    const roomTypes = b.room_types || b.rooms || [];
    let vacantCount = 0;
    let minPrice = Infinity;
    let maxPrice = 0;
    const allImages = [];

    for (let i = 0; i < roomTypes.length; i++) {
      const rt = roomTypes[i];
      const rtPrice = Number(rt.price || rt.min_price || 3000000);
      const avail = Number(rt.available_rooms || rt.vacant_rooms || 1);
      vacantCount += avail;
      if (rtPrice < minPrice) minPrice = rtPrice;
      if (rtPrice > maxPrice) maxPrice = rtPrice;

      const rtImages = rt.images || [];
      allImages.push(...rtImages);

      // Create room record
      const roomId = rt.id || `RM_${code}_${i + 1}`;
      const roomNum = rt.name || `Phòng ${101 + i}`;
      roomsList.push({
        id: roomId,
        buildingId: buildingId,
        buildingCode: code,
        roomNumber: roomNum,
        type: rt.name || 'Studio khép kín',
        price: rtPrice,
        area: Number(rt.area || 25),
        maxOccupants: Number(rt.max_occupants || 2),
        availableFrom: 'Ở ngay',
        status: avail > 0 ? 'Có sẵn' : 'Đã thuê',
        coverImage: rtImages[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        images: rtImages.length > 0 ? rtImages : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        amenitiesFurniture: rt.amenities || ['Điều hòa', 'Nóng lạnh', 'Giường', 'Tủ quần áo', 'Tủ bếp'],
        amenitiesPrivate: ['Wifi từng phòng', 'Khóa vân tay'],
        description: rt.description || ''
      });
    }

    if (minPrice === Infinity) minPrice = 3500000;
    if (maxPrice === 0) maxPrice = minPrice;

    const buildingObj = {
      id: buildingId,
      code: code,
      name: `Tòa nhà ${code} – ${b.address || district}`,
      address: [b.address, b.ward, b.district, b.province || 'Hà Nội'].filter(Boolean).join(', '),
      district: district,
      city: b.province || 'Hà Nội',
      latitude: Number(b.latitude) || (coords.lat + (Math.random() - 0.5) * 0.01),
      longitude: Number(b.longitude) || (coords.lng + (Math.random() - 0.5) * 0.01),
      minPrice: minPrice,
      maxPrice: maxPrice,
      isTiny: b.owner_type === 'tiny' || b.ownerType === 'tiny' || code.startsWith('TN'),
      ownerType: b.owner_type || (code.startsWith('TN') ? 'tiny' : 'partner'),
      vacantRoomsCount: vacantCount,
      coverImage: allImages[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80']
    };

    buildingMap.set(code, buildingObj);
  }

  const finalBuildings = Array.from(buildingMap.values());
  console.log(`✅ Deduplicated to ${finalBuildings.length} unique Buildings and ${roomsList.length} Rooms.`);

  // Update local server/dataStore.json
  const dataStorePath = path.join(__dirname, 'dataStore.json');
  let currentStore = {};
  if (fs.existsSync(dataStorePath)) {
    try {
      currentStore = JSON.parse(fs.readFileSync(dataStorePath, 'utf-8'));
    } catch (_e) {}
  }

  currentStore.buildings = finalBuildings;
  currentStore.rooms = roomsList;

  fs.writeFileSync(dataStorePath, JSON.stringify(currentStore, null, 2));
  console.log(`💾 Saved ${finalBuildings.length} buildings & ${roomsList.length} rooms to local dataStore.json!`);

  // Migrate directly to Supabase Cloud PostgreSQL
  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log('☁️ Uploading to Supabase Cloud PostgreSQL Database...');

    // Format buildings payload for SQL
    const dbBuildings = finalBuildings.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      address: b.address,
      district: b.district,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      min_price: b.minPrice,
      max_price: b.maxPrice,
      is_tiny: b.isTiny,
      owner_type: b.ownerType,
      vacant_rooms_count: b.vacantRoomsCount,
      cover_image: b.coverImage,
      images: b.images
    }));

    const { error: bErr } = await supabase.from('buildings').upsert(dbBuildings);
    if (bErr) {
      console.error('❌ Supabase buildings error:', bErr.message);
    } else {
      console.log(`✅ Successfully uploaded ${dbBuildings.length} buildings to Supabase Cloud!`);
    }

    // Format & deduplicate rooms payload for SQL
    const roomMap = new Map();
    roomsList.forEach(r => {
      roomMap.set(r.id, {
        id: r.id,
        building_id: r.buildingId,
        building_code: r.buildingCode,
        room_number: r.roomNumber,
        type: r.type,
        price: r.price,
        area: r.area,
        max_occupants: r.maxOccupants,
        status: r.status,
        images: r.images
      });
    });
    const dbRooms = Array.from(roomMap.values());

    const { error: rErr } = await supabase.from('rooms').upsert(dbRooms);
    if (rErr) {
      console.error('❌ Supabase rooms error:', rErr.message);
    } else {
      console.log(`✅ Successfully uploaded ${dbRooms.length} rooms to Supabase Cloud!`);
    }
  }

  console.log('🎉 Data Import & Synchronization Complete!');
}

runImport();
