import { supabase } from '../config/supabaseClient.js';

export const RoomModel = {
  async findAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(`RoomModel.findAll error: ${error.message}`);

    return (data || []).map(r => {
      let roomNums = [];
      if (r.room_number) {
        try {
          if (r.room_number.startsWith('[')) {
            roomNums = JSON.parse(r.room_number);
          } else if (r.room_number.includes(',')) {
            roomNums = r.room_number.split(',').map(s => s.trim());
          } else {
            roomNums = [r.room_number];
          }
        } catch {
          roomNums = [r.room_number];
        }
      }
      if (roomNums.length === 0) roomNums = ['101', '102'];

      return {
        id: r.id,
        roomTypeId: r.room_type_id || r.id,
        buildingId: r.building_id,
        buildingCode: r.building_code,
        buildingName: r.building_name,
        name: r.type || 'Studio',
        type: r.type || 'Studio',
        roomNumber: roomNums[0] || '101',
        specificRooms: roomNums,
        room_numbers: roomNums,
        available_rooms: roomNums.length,
        vacantCount: roomNums.length,
        status: roomNums.length > 0 ? (r.status || 'Có sẵn') : 'Hết phòng',
        price: Number(r.price) || 3500000,
        area: Number(r.area) || 25,
        maxOccupants: Number(r.max_occupants) || 2,
        images: Array.isArray(r.images) && r.images.length > 0 ? r.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        coverImage: Array.isArray(r.images) && r.images.length > 0 ? r.images[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        description: r.description || '',
        amenities: r.amenities || []
      };
    });
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`RoomModel.findById error: ${error.message}`);
    return data;
  },

  async upsert(room) {
    const specificRooms = Array.isArray(room.specificRooms) && room.specificRooms.length > 0
      ? room.specificRooms.map(s => String(s).trim())
      : (room.roomNumber ? [String(room.roomNumber).trim()] : ['101']);

    const payload = {
      id: room.id || `RM-${Date.now()}`,
      room_type_id: room.roomTypeId || room.id || `RM-${Date.now()}`,
      building_id: room.buildingId,
      building_code: room.buildingCode,
      building_name: room.buildingName,
      room_number: JSON.stringify(specificRooms),
      status: specificRooms.length > 0 ? (room.status || 'Có sẵn') : 'Hết phòng',
      price: Number(room.price) || 3500000,
      type: room.type || room.name || 'Studio',
      area: Number(room.area) || 25,
      max_occupants: Number(room.maxOccupants) || 2,
      images: Array.isArray(room.images) ? room.images : []
    };

    const { data, error } = await supabase
      .from('rooms')
      .upsert(payload)
      .select();

    if (error) throw new Error(`RoomModel.upsert error: ${error.message}`);
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('rooms')
      .delete()
      .or(`id.eq.${id},room_type_id.eq.${id}`);

    if (error) throw new Error(`RoomModel.delete error: ${error.message}`);
    return data;
  }
};
