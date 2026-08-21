import { supabase } from '../config/supabaseClient.js';

export const BuildingModel = {
  async findAll() {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('vacant_rooms_count', { ascending: false });

    if (error) throw new Error(`BuildingModel.findAll error: ${error.message}`);
    
    return (data || []).map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      isTiny: b.is_tiny,
      ownerType: b.owner_type,
      rating: b.rating || 5.0,
      address: b.address,
      district: b.district,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      vacantRoomsCount: b.vacant_rooms_count || 0,
      minPrice: b.min_price || 0,
      maxPrice: b.max_price || 0,
      coverImage: b.cover_image,
      images: b.images || [],
      rooms: b.rooms || [],
      host: {
        name: b.host_name || 'Ms. Huyền',
        phone: b.host_phone || '0386570401',
        email: b.host_email || 'tinyhouse.info@gmail.com'
      }
    }));
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`BuildingModel.findById error: ${error.message}`);
    return data;
  },

  async upsert(building) {
    const payload = {
      id: building.id || `BLD-${Date.now()}`,
      code: building.code,
      name: building.name,
      is_tiny: building.isTiny ?? true,
      owner_type: building.ownerType || 'tiny',
      rating: building.rating || 5.0,
      address: building.address,
      district: building.district,
      city: building.city || 'Hà Nội',
      latitude: building.latitude,
      longitude: building.longitude,
      vacant_rooms_count: building.vacantRoomsCount || 0,
      min_price: building.minPrice || 0,
      max_price: building.maxPrice || 0,
      cover_image: building.coverImage,
      images: building.images || [],
      rooms: building.rooms || []
    };

    const { data, error } = await supabase
      .from('buildings')
      .upsert(payload)
      .select();

    if (error) throw new Error(`BuildingModel.upsert error: ${error.message}`);
    return data;
  },

  async delete(id) {
    // 1. Delete all child rooms belonging to this building
    try {
      await supabase
        .from('rooms')
        .delete()
        .or(`building_id.eq.${id},building_code.eq.${id}`);
    } catch (err) {
      console.warn('[BuildingModel.delete] Cascade delete rooms warning:', err.message);
    }

    // 2. Delete the building record
    const { data, error } = await supabase
      .from('buildings')
      .delete()
      .or(`id.eq.${id},code.eq.${id}`);

    if (error) throw new Error(`BuildingModel.delete error: ${error.message}`);
    return data;
  }
};
