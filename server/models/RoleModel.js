import { supabase } from '../config/supabaseClient.js';

export const RoleModel = {
  async findAll() {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) {
      // Return standard default roles if roles table not present
      return [
        { id: "role_admin", name: "Quản trị viên (Super Admin)", code: "admin", allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings', 'ctvs', 'permissions', 'database'] },
        { id: "role_manager", name: "Quản lý Vận hành (Manager)", code: "manager", allowedScreens: ['dashboard', 'buildings', 'rooms', 'bookings', 'ctvs'] },
        { id: "role_staff", name: "Nhân viên Vận hành / Lễ tân (Staff)", code: "staff", allowedScreens: ['dashboard', 'rooms', 'bookings'] },
        { id: "role_ctv", name: "Cộng tác viên (CTV Sale)", code: "ctv", allowedScreens: ['dashboard', 'rooms', 'bookings'] }
      ];
    }
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description || '',
      allowedScreens: Array.isArray(r.allowed_screens) 
        ? r.allowed_screens 
        : (Array.isArray(r.allowedScreens) ? r.allowedScreens : ['dashboard', 'buildings', 'rooms', 'bookings', 'ctv', 'permissions', 'database'])
    }));
  },

  async upsert(role) {
    const { data, error } = await supabase.from('roles').upsert(role).select();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  }
};
