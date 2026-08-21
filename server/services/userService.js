import { UserModel } from '../models/UserModel.js';
import { RoleModel } from '../models/RoleModel.js';

export const userService = {
  async getAllUsers() {
    return await UserModel.findAll();
  },

  async saveUser(user) {
    return await UserModel.upsert(user);
  },

  async deleteUser(id) {
    return await UserModel.delete(id);
  },

  async getAllRoles() {
    return await RoleModel.findAll();
  },

  async saveRole(role) {
    return await RoleModel.upsert(role);
  },

  async deleteRole(id) {
    return await RoleModel.delete(id);
  },

  // Auth Operations
  async login(emailOrPhone, password) {
    if (!emailOrPhone) throw new Error('Vui lòng nhập Email hoặc Số điện thoại.');
    if (!password) throw new Error('Vui lòng nhập Mật khẩu.');

    const cleanInput = String(emailOrPhone).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const users = await UserModel.findAll();
    let user = users.find(u => 
      (u.email && u.email.toLowerCase() === cleanInput) || 
      (u.phone && u.phone.trim() === cleanInput)
    );

    // If admin default credentials used
    if (!user && (cleanInput === 'admin@tinyhouse.vn' || cleanInput === 'admin@gmail.com' || cleanInput === 'admin')) {
      user = {
        id: 'usr_superadmin',
        name: 'Super Admin',
        email: 'admin@tinyhouse.vn',
        phone: '0988888888',
        roleCode: 'admin',
        roleName: 'Quản trị viên (Super Admin)',
        status: 'Hoạt động',
        password: 'admin'
      };
      await UserModel.upsert(user).catch(() => {});
    }

    if (!user) {
      throw new Error('Tài khoản không tồn tại trên hệ thống.');
    }

    // Check password (allow '123456', 'admin', or actual saved password)
    const validPassword = 
      user.password === cleanPass || 
      cleanPass === '123456' || 
      cleanPass === 'admin' ||
      !user.password;

    if (!validPassword) {
      throw new Error('Mật khẩu không chính xác.');
    }

    if (user.status === 'Chờ duyệt' || user.status === 'pending_approval') {
      return {
        success: false,
        pendingApproval: true,
        error: '⚠️ Tài khoản của bạn đang CHỜ SUPER ADMIN PHÊ DUYỆT KÍCH HOẠT!'
      };
    }

    const token = `jwt_${user.id}_${Date.now()}`;

    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleCode: user.roleCode,
        roleName: user.roleName,
        status: user.status
      }
    };
  },

  async register(data) {
    if (!data.email && !data.phone) {
      throw new Error('Vui lòng nhập Email hoặc Số điện thoại.');
    }

    const fullName = data.name || `${data.ho || ''} ${data.ten || ''}`.trim() || 'Người dùng mới';
    const newUser = {
      id: `usr_${Date.now()}`,
      name: fullName,
      email: data.email || '',
      phone: data.phone || '',
      password: data.password || '123456',
      roleCode: data.roleCode || 'ctv_sale',
      roleName: data.roleCode === 'admin' ? 'Quản trị viên' : 'CTV Sale',
      status: 'pending_approval'
    };

    await UserModel.upsert(newUser);
    return {
      success: true,
      message: 'Đăng ký tài khoản thành công! Yêu cầu đang chờ duyệt.',
      user: newUser
    };
  },

  async googleAuth(data) {
    if (!data.email) throw new Error('Không nhận được email từ Google.');

    const users = await UserModel.findAll();
    let user = users.find(u => u.email && u.email.toLowerCase() === data.email.toLowerCase());

    if (!user) {
      user = {
        id: `usr_gg_${Date.now()}`,
        name: data.name || 'Người dùng Google',
        email: data.email,
        phone: '',
        roleCode: 'ctv_sale',
        roleName: 'CTV Sale',
        status: 'Hoạt động'
      };
      await UserModel.upsert(user);
    }

    const token = `jwt_google_${user.id}_${Date.now()}`;
    return {
      success: true,
      token,
      user
    };
  }
};
