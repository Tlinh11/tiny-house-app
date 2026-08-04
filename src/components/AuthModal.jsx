import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { DataService } from '../services/dataService';

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(mode || 'login'); // login, register
  const [selectedRole, setSelectedRole] = useState('ctv_sale');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const users = DataService.getUsers();

  const handleQuickLogin = (roleCode) => {
    const foundUser = users.find(u => u.roleCode === roleCode) || users[0];
    DataService.setCurrentUser(foundUser);
    setSuccessMsg(`Đăng nhập thành công với vai trò: ${foundUser.roleName}!`);
    setTimeout(() => {
      setSuccessMsg('');
      if (onLoginSuccess) onLoginSuccess(foundUser);
      onClose();
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let loggedUser = null;

    if (authMode === 'login') {
      // Find matching user or fallback to admin/first user
      loggedUser = users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone) || {
        id: `usr_${Date.now()}`,
        name: emailOrPhone.split('@')[0] || "Người dùng",
        email: emailOrPhone,
        roleCode: "admin",
        roleName: "Quản trị viên (Super Admin)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
      };
    } else {
      // Register
      const roles = DataService.getRoles();
      const roleObj = roles.find(r => r.code === selectedRole) || roles[0];
      loggedUser = DataService.saveUser({
        name: fullName || "Thành viên mới",
        email: emailOrPhone,
        phone: emailOrPhone,
        roleCode: roleObj.code,
        roleName: roleObj.name,
        status: "Hoạt động"
      });
    }

    DataService.setCurrentUser(loggedUser);
    setSuccessMsg(authMode === 'login' ? `Đăng nhập thành công!` : `Đăng ký tài khoản thành công!`);

    setTimeout(() => {
      setSuccessMsg('');
      if (onLoginSuccess) onLoginSuccess(loggedUser);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(6px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: 32, position: 'relative' }}>
        <button 
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: '#64748B' }}
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span className="badge badge-warning" style={{ marginBottom: 8 }}>
            ★ Cổng xác thực Admin & CTV ★
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
            {authMode === 'login' ? 'Đăng nhập CMS & Hệ thống' : 'Đăng ký tài khoản mới'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 4 }}>
            Vui lòng đăng nhập tài khoản có phân quyền để truy cập CMS Admin
          </p>
        </div>

        {/* Quick Demo Login Presets */}
        {authMode === 'login' && !successMsg && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={14} color="#E8920A" />
              <span>Đăng nhập nhanh theo Vai trò (Demo):</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}
                onClick={() => handleQuickLogin('admin')}
              >
                👑 Super Admin
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' }}
                onClick={() => handleQuickLogin('ctv_sale')}
              >
                🤝 CTV Sale
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 4px', background: '#E0E7FF', color: '#3730A3', border: '1px solid #A5B4FC' }}
                onClick={() => handleQuickLogin('building_manager')}
              >
                🏢 Quản lý Tòa
              </button>
            </div>
          </div>
        )}

        {successMsg ? (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: 20, borderRadius: 12, textAlign: 'center' }}>
            <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{successMsg}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {authMode === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                  <input 
                    type="text" 
                    placeholder="Nhập họ và tên đầy đủ" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                    style={{ width: '100%' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Đăng ký với Vai trò *</label>
                  <select 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{ width: '100%', fontWeight: 700 }}
                  >
                    <option value="ctv_sale">Cộng tác viên Sale (CTV)</option>
                    <option value="building_manager">Chủ nhà / Quản lý tòa</option>
                    <option value="accountant">Kế toán / Tài chính</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Email hoặc Số điện thoại *</label>
              <input 
                type="text" 
                placeholder="Ví dụ: admin@tinyhouse.vn" 
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required 
                style={{ width: '100%' }} 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Mật khẩu *</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ width: '100%' }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: 800, marginTop: 8, fontSize: '1rem' }}>
              {authMode === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748B', marginTop: 12 }}>
              {authMode === 'login' ? (
                <span>Chưa có tài khoản? <a href="#" style={{ color: '#E8920A', fontWeight: 700 }} onClick={() => setAuthMode('register')}>Đăng ký ngay</a></span>
              ) : (
                <span>Đã có tài khoản? <a href="#" style={{ color: '#E8920A', fontWeight: 700 }} onClick={() => setAuthMode('login')}>Đăng nhập</a></span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
