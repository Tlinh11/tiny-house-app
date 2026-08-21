import { supabase } from '../config/supabaseClient.js';

export const UserModel = {
  async findAll() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      return [
        { id: "usr_superadmin", name: "Super Admin", email: "admin@tinyhouse.vn", phone: "0988888888", roleCode: "admin", roleName: "Quản trị viên (Super Admin)", status: "Hoạt động", password: "admin" }
      ];
    }
    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      roleCode: u.role_code || u.roleCode || 'staff',
      roleName: u.role_name || u.roleName || 'Nhân viên',
      status: u.status || 'Hoạt động',
      password: u.password
    }));
  },

  async findByEmail(email) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error) return null;
    return data;
  },

  async upsert(user) {
    const payload = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role_code: user.roleCode || user.role_code || 'staff',
      role_name: user.roleName || user.role_name || 'Nhân viên',
      status: user.status || 'Hoạt động',
      password: user.password
    };
    const { data, error } = await supabase.from('users').upsert(payload).select();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id) {
    if (id === 'usr_admin' || id === 'usr_superadmin') {
      throw new Error('Không thể xóa tài khoản Quản trị viên tối cao (Super Admin).');
    }
    const { data, error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return data;
  }
};
