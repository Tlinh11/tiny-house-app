import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read server .env
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
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in server/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Read export_all_data copy.json
const rawJsonPath = path.join(__dirname, '..', 'export_all_data copy.json');
const rawContent = fs.readFileSync(rawJsonPath, 'utf-8');
const exportData = JSON.parse(rawContent);
const rawBuildings = Array.isArray(exportData) ? exportData : (exportData.buildings || []);

console.log(`📦 Loaded ${rawBuildings.length} buildings from export_all_data copy.json`);

async function syncToSupabase() {
  console.log(`🚀 Starting Full Data Backup to Supabase (${SUPABASE_URL})...\n`);

  // Fetch existing buildings to avoid unique code violations
  const { data: existingBldgs } = await supabase.from('buildings').select('id, code');
  const codeToIdMap = new Map();
  if (existingBldgs) {
    existingBldgs.forEach(eb => codeToIdMap.set(eb.code, eb.id));
  }

  let syncedBuildings = 0;
  let syncedRooms = 0;

  for (const b of rawBuildings) {
    const code = b.name || `BLD-${b.id.slice(0, 6)}`;
    const targetBuildingId = codeToIdMap.get(code) || b.id;
    const isTiny = b.owner_type === 'tiny';
    const district = b.district || 'Bắc Từ Liêm';
    
    let minPrice = Infinity;
    let maxPrice = 0;
    let vacantRoomsCount = 0;
    let allImages = [];
    let roomNumbersList = [];

    (b.room_types || []).forEach(rt => {
      if (rt.price && rt.price < minPrice) minPrice = rt.price;
      if (rt.price && rt.price > maxPrice) maxPrice = rt.price;
      const count = rt.available_rooms || (rt.room_numbers ? rt.room_numbers.length : 1);
      vacantRoomsCount += count;
      if (rt.images && Array.isArray(rt.images)) allImages.push(...rt.images);
      if (rt.room_numbers && Array.isArray(rt.room_numbers)) roomNumbersList.push(...rt.room_numbers);
    });

    if (minPrice === Infinity) minPrice = 3500000;
    if (maxPrice === 0) maxPrice = minPrice + 1500000;

    const coverImage = allImages[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';

    // 1. Upsert Building
    const buildingPayload = {
      id: targetBuildingId,
      code: code,
      name: `Tòa nhà ${code} - ${b.address}`,
      is_tiny: isTiny,
      owner_type: b.owner_type || 'partner',
      rating: 5.0,
      address: `${b.address}${b.ward ? ', ' + b.ward : ''}`,
      district: district,
      city: b.province || 'Hà Nội',
      latitude: b.latitude || (21.0000 + Math.random() * 0.05),
      longitude: b.longitude || (105.8000 + Math.random() * 0.05),
      vacant_rooms_count: vacantRoomsCount,
      min_price: minPrice,
      max_price: maxPrice,
      cover_image: coverImage,
      images: allImages.slice(0, 10),
      rooms: Array.from(new Set(roomNumbersList))
    };

    const { error: bError } = await supabase.from('buildings').upsert(buildingPayload);
    if (bError) {
      console.error(`❌ Building ${code} Error:`, bError.message);
    } else {
      syncedBuildings++;
      codeToIdMap.set(code, targetBuildingId);
    }

    // 2. Upsert Room Types for this building
    for (const [rtIdx, rt] of (b.room_types || []).entries()) {
      const roomNumbers = (rt.room_numbers && rt.room_numbers.length > 0) ? rt.room_numbers : ['101', '102'];
      const roomPayload = {
        id: rt.id || `${targetBuildingId}-rt-${rtIdx}`,
        room_type_id: rt.id || `${targetBuildingId}-rt-${rtIdx}`,
        building_id: targetBuildingId,
        building_code: code,
        building_name: `Tòa nhà ${code}`,
        room_number: roomNumbers[0] || '101',
        status: (rt.available_rooms > 0 || roomNumbers.length > 0) ? 'Có sẵn' : 'Đã thuê',
        price: rt.price || 3500000,
        type: rt.name || 'Studio khép kín',
        area: rt.area || 25,
        max_occupants: rt.max_occupants || 2,
        images: rt.images || []
      };

      const { error: rError } = await supabase.from('rooms').upsert(roomPayload);
      if (rError) {
        console.error(`  ❌ Room Type ${rt.name} Error:`, rError.message);
      } else {
        syncedRooms++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 Backup to Supabase Completed!`);
  console.log(`✅ Synced Buildings: ${syncedBuildings}/${rawBuildings.length}`);
  console.log(`✅ Synced Room Types: ${syncedRooms}`);
  console.log(`========================================\n`);
}

syncToSupabase();
