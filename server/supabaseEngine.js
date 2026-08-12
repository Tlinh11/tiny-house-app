import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL &&
    SUPABASE_KEY &&
    !SUPABASE_URL.includes('your-project-id') &&
    !SUPABASE_KEY.includes('your_supabase')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

export const SupabaseDb = {
  // Buildings
  async getBuildings() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('buildings').select('*');
    if (error) {
      console.error('[SupabaseDb] getBuildings error:', error.message);
      return null;
    }
    return data.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      isTiny: b.is_tiny,
      ownerType: b.owner_type,
      rating: b.rating,
      address: b.address,
      district: b.district,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      vacantRoomsCount: b.vacant_rooms_count,
      minPrice: b.min_price,
      maxPrice: b.max_price,
      coverImage: b.cover_image,
      images: b.images || [],
      rooms: b.rooms || []
    })).sort((a, b) => (b.vacantRoomsCount || 0) - (a.vacantRoomsCount || 0));
  },

  async saveBuilding(buildingData) {
    if (!supabase) return null;
    const payload = {
      id: buildingData.id || `BLD-${Date.now()}`,
      code: buildingData.code,
      name: buildingData.name,
      is_tiny: buildingData.isTiny ?? true,
      owner_type: buildingData.ownerType || 'tiny',
      rating: buildingData.rating || 5.0,
      address: buildingData.address,
      district: buildingData.district,
      city: buildingData.city || 'Hà Nội',
      latitude: buildingData.latitude,
      longitude: buildingData.longitude,
      vacant_rooms_count: buildingData.vacantRoomsCount || 0,
      min_price: buildingData.minPrice || 0,
      max_price: buildingData.maxPrice || 0,
      cover_image: buildingData.coverImage,
      images: buildingData.images || [],
      rooms: buildingData.rooms || []
    };
    const { error } = await supabase.from('buildings').upsert(payload);
    if (error) {
      console.error('[SupabaseDb] saveBuilding error:', error.message);
      return null;
    }
    return await this.getBuildings();
  },

  // Rooms
  async getRooms() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) {
      console.error('[SupabaseDb] getRooms error:', error.message);
      return null;
    }
    return data.map(r => ({
      id: r.id,
      roomTypeId: r.room_type_id,
      buildingId: r.building_id,
      buildingCode: r.building_code,
      buildingName: r.building_name,
      roomNumber: r.room_number,
      status: r.status,
      price: r.price,
      type: r.type,
      area: r.area,
      maxOccupants: r.max_occupants,
      images: r.images || []
    }));
  },

  async saveRoom(roomData) {
    if (!supabase) return null;
    const payload = {
      id: roomData.id || `RM-${Date.now()}`,
      room_type_id: roomData.roomTypeId,
      building_id: roomData.buildingId,
      building_code: roomData.buildingCode,
      building_name: roomData.buildingName,
      room_number: roomData.roomNumber,
      status: roomData.status || 'Có sẵn',
      price: roomData.price || 0,
      type: roomData.type || 'Studio',
      area: roomData.area || 25,
      max_occupants: roomData.maxOccupants || 2,
      images: roomData.images || []
    };
    const { error } = await supabase.from('rooms').upsert(payload);
    if (error) {
      console.error('[SupabaseDb] saveRoom error:', error.message);
      return null;
    }
    return await this.getRooms();
  },

  // Bookings
  async getBookings() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[SupabaseDb] getBookings error:', error.message);
      return null;
    }
    return data.map(bk => ({
      id: bk.id,
      customerName: bk.customer_name,
      phone: bk.phone,
      email: bk.email,
      buildingId: bk.building_id,
      buildingCode: bk.building_code,
      roomNumber: bk.room_number,
      appointmentDate: bk.appointment_date,
      appointmentTime: bk.appointment_time,
      status: bk.status,
      notes: bk.notes
    }));
  },

  async createBooking(booking) {
    if (!supabase) return null;
    const payload = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: booking.customerName || booking.name || 'Khách xem phòng',
      phone: booking.phone,
      email: booking.email,
      building_id: booking.buildingId,
      building_code: booking.buildingCode,
      room_number: booking.roomNumber,
      appointment_date: booking.appointmentDate || new Date().toISOString().split('T')[0],
      appointment_time: booking.appointmentTime,
      status: 'Chờ xác nhận',
      notes: booking.notes
    };
    const { error } = await supabase.from('bookings').insert(payload);
    if (error) {
      console.error('[SupabaseDb] createBooking error:', error.message);
      return null;
    }
    return payload;
  },

  async updateBookingStatus(id, status) {
    if (!supabase) return null;
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (error) {
      console.error('[SupabaseDb] updateBookingStatus error:', error.message);
      return null;
    }
    return await this.getBookings();
  },

  // Roles
  async getRoles() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('roles').select('*');
    if (error) {
      console.error('[SupabaseDb] getRoles error:', error.message);
      return null;
    }
    return data.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      allowedScreens: r.allowed_screens || []
    }));
  },

  // Users
  async getUsers() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('[SupabaseDb] getUsers error:', error.message);
      return null;
    }
    return data.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      password: u.password,
      roleCode: u.role_code,
      roleName: u.role_name,
      status: u.status,
      avatar: u.avatar
    }));
  },

  async saveUser(user) {
    if (!supabase) return null;
    const payload = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
      role_code: user.roleCode,
      role_name: user.roleName,
      status: user.status || 'Hoạt động',
      avatar: user.avatar
    };
    const { error } = await supabase.from('users').upsert(payload);
    if (error) {
      console.error('[SupabaseDb] saveUser error:', error.message);
      return null;
    }
    return await this.getUsers();
  },

  // Commissions
  async getCommissions() {
    if (!supabase) return null;
    const { data, error } = await supabase.from('commissions').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('[SupabaseDb] getCommissions error:', error.message);
      return null;
    }
    return data.map(c => ({
      id: c.id,
      ctvId: c.ctv_id,
      ctvName: c.ctv_name,
      ctvPhone: c.ctv_phone,
      buildingCode: c.building_code,
      roomNumber: c.room_number,
      contractValue: c.contract_value,
      commissionRate: c.commission_rate,
      commissionAmount: c.commission_amount,
      status: c.status,
      notes: c.notes
    }));
  },

  async saveCommission(commission) {
    if (!supabase) return null;
    const payload = {
      id: commission.id || `CMS-${Date.now()}`,
      ctv_id: commission.ctvId,
      ctv_name: commission.ctvName,
      ctv_phone: commission.ctvPhone,
      building_code: commission.buildingCode,
      room_number: commission.roomNumber,
      contract_value: commission.contractValue || 0,
      commission_rate: commission.commissionRate || 0,
      commission_amount: commission.commissionAmount || 0,
      status: commission.status || 'Chờ duyệt',
      notes: commission.notes
    };
    const { error } = await supabase.from('commissions').upsert(payload);
    if (error) {
      console.error('[SupabaseDb] saveCommission error:', error.message);
      return null;
    }
    return await this.getCommissions();
  }
};
