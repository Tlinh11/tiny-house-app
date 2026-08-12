import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY trong file server/.env');
  console.log('Vui lòng thêm SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY vào server/.env và thử lại!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const STORE_PATH = path.join(__dirname, 'dataStore.json');

async function runMigration() {
  console.log('🚀 Bắt đầu chuyển đổi dữ liệu từ dataStore.json sang Supabase PostgreSQL...');

  if (!fs.existsSync(STORE_PATH)) {
    console.error('❌ Không tìm thấy tệp dataStore.json');
    process.exit(1);
  }

  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  const data = JSON.parse(raw);

  // 1. Migrate Roles
  if (data.roles && data.roles.length) {
    console.log(`📦 Đang lưu ${data.roles.length} Roles...`);
    const rolesPayload = data.roles.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      allowed_screens: r.allowedScreens || []
    }));
    const { error } = await supabase.from('roles').upsert(rolesPayload);
    if (error) console.error('  ⚠️ Lỗi khi lưu Roles:', error.message);
    else console.log('  ✅ Đã lưu Roles thành công!');
  }

  // 2. Migrate Users
  if (data.users && data.users.length) {
    console.log(`👤 Đang lưu ${data.users.length} Users...`);
    const usersPayload = data.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: u.password,
      role_code: u.roleCode,
      role_name: u.roleName,
      status: u.status || 'Hoạt động',
      avatar: u.avatar
    }));
    const { error } = await supabase.from('users').upsert(usersPayload);
    if (error) console.error('  ⚠️ Lỗi khi lưu Users:', error.message);
    else console.log('  ✅ Đã lưu Users thành công!');
  }

  // 3. Migrate Buildings
  if (data.buildings && data.buildings.length) {
    console.log(`🏢 Đang lưu ${data.buildings.length} Tòa nhà...`);
    const buildingsPayload = data.buildings.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      is_tiny: b.isTiny ?? true,
      owner_type: b.ownerType || 'tiny',
      rating: b.rating || 5.0,
      address: b.address,
      district: b.district,
      city: b.city || 'Hà Nội',
      latitude: b.latitude,
      longitude: b.longitude,
      vacant_rooms_count: b.vacantRoomsCount || 0,
      min_price: b.minPrice || 0,
      max_price: b.maxPrice || 0,
      cover_image: b.coverImage,
      images: b.images || [],
      rooms: b.rooms || []
    }));
    const { error } = await supabase.from('buildings').upsert(buildingsPayload);
    if (error) console.error('  ⚠️ Lỗi khi lưu Buildings:', error.message);
    else console.log('  ✅ Đã lưu Buildings thành công!');
  }

  // 4. Migrate Rooms
  if (data.rooms && data.rooms.length) {
    console.log(`🚪 Đang lưu ${data.rooms.length} Phòng...`);
    const roomsPayload = data.rooms.map(r => ({
      id: r.id,
      room_type_id: r.roomTypeId,
      building_id: r.buildingId,
      building_code: r.buildingCode,
      building_name: r.buildingName,
      room_number: r.roomNumber,
      status: r.status || 'Có sẵn',
      price: r.price || 0,
      type: r.type || 'Studio',
      area: r.area || 25,
      max_occupants: r.maxOccupants || 2,
      images: r.images || []
    }));
    const { error } = await supabase.from('rooms').upsert(roomsPayload);
    if (error) console.error('  ⚠️ Lỗi khi lưu Rooms:', error.message);
    else console.log('  ✅ Đã lưu Rooms thành công!');
  }

  // 5. Migrate Bookings
  if (data.bookings && data.bookings.length) {
    console.log(`📅 Đang lưu ${data.bookings.length} Lịch hẹn xem phòng...`);
    const bookingsPayload = data.bookings.map(bk => ({
      id: bk.id,
      customer_name: bk.customerName || bk.name || 'Khách xem phòng',
      phone: bk.phone,
      email: bk.email,
      building_id: bk.buildingId,
      building_code: bk.buildingCode,
      room_number: bk.roomNumber,
      appointment_date: bk.appointmentDate,
      appointment_time: bk.appointmentTime,
      status: bk.status || 'Chờ xác nhận',
      notes: bk.notes
    }));
    const { error } = await supabase.from('bookings').upsert(bookingsPayload);
    if (error) console.error('  ⚠️ Lỗi khi lưu Bookings:', error.message);
    else console.log('  ✅ Đã lưu Bookings thành công!');
  }

  console.log('🎉 HOÀN TẤT CHUYỂN ĐỔI DỮ LIỆU SANG SUPABASE POSTGRESQL!');
}

runMigration();
