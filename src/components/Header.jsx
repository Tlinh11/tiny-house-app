import React, { useState } from 'react';
import { Home, Search, Users, PhoneCall, ShieldCheck, UserCheck, LayoutDashboard, Menu, X, Building2, LogOut, User as UserIcon } from 'lucide-react';
import { DataService } from '../services/dataService';
import Logo from './Logo';

export default function Header({ activeTab, setActiveTab, onOpenAuthModal, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'search', label: 'Tìm phòng', icon: Search },
    { id: 'about', label: 'Về chúng tôi', icon: ShieldCheck },
    { id: 'landlord', label: 'Cho thuê (Chủ nhà)', icon: Building2 },
    { id: 'partner', label: 'Hợp tác CTV', icon: Users },
    { id: 'blog', label: 'Tin tức', icon: UserCheck },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  // Check if current user has permission to enter CMS
  const hasCmsAccess = () => {
    if (!currentUser) return false;
    const roles = DataService.getRoles();
    const roleObj = roles.find(r => r.code === currentUser.roleCode || r.name === currentUser.roleName) || roles[0];
    return roleObj && roleObj.allowedScreens && roleObj.allowedScreens.length > 0;
  };

  return (
    <header className="main-header">
      <div className="container header-container">
        {/* Official Brand Logo Component */}
        <Logo size={40} onClick={() => handleNavClick('home')} />

        {/* Desktop Nav */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          <div className="nav-actions-desktop" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              className="btn btn-outline"
              style={{ 
                backgroundColor: '#FFF7ED', 
                color: '#E8920A', 
                borderColor: '#FED7AA',
                fontSize: '0.85rem',
                padding: '6px 12px'
              }}
              onClick={() => window.open('https://zalo.me', '_blank')}
            >
              <PhoneCall size={14} />
              <span>Liên hệ</span>
            </button>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', padding: '4px 8px 4px 12px', borderRadius: 30, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                  <UserIcon size={14} color="#E8920A" />
                  <span>{currentUser.name}</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                    {currentUser.roleName || currentUser.roleCode}
                  </span>
                </div>

                {hasCmsAccess() && (
                  <button
                    className="btn"
                    style={{ 
                      background: '#0F172A', 
                      color: '#ffffff', 
                      fontSize: '0.75rem', 
                      padding: '5px 12px',
                      borderRadius: '20px'
                    }}
                    onClick={() => handleNavClick('cms')}
                    title="Chuyển đến màn hình quản trị CMS Admin"
                  >
                    <LayoutDashboard size={13} />
                    <span>Vào CMS</span>
                  </button>
                )}

                <button 
                  onClick={onLogout} 
                  title="Đăng xuất"
                  style={{ background: 'none', color: '#EF4444', padding: 4, display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  onClick={() => onOpenAuthModal('login')}
                >
                  Đăng nhập
                </button>

                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  onClick={() => onOpenAuthModal('register')}
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            style={{ background: 'none', color: '#0F172A', padding: 4 }}
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 72,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#ffffff',
          zIndex: 9999,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: 14, fontSize: '1rem', fontWeight: 700 }}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}

          {currentUser && hasCmsAccess() && (
            <button
              className="btn"
              style={{ 
                justifyContent: 'flex-start', 
                padding: 14, 
                fontSize: '1rem', 
                fontWeight: 700, 
                background: '#0F172A', 
                color: '#ffffff' 
              }}
              onClick={() => handleNavClick('cms')}
            >
              <LayoutDashboard size={18} />
              <span>Vào màn hình CMS Admin</span>
            </button>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentUser ? (
              <button 
                className="btn btn-secondary" 
                style={{ padding: 14, fontWeight: 800, color: '#EF4444' }}
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
              >
                Đăng xuất ({currentUser.name})
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                style={{ padding: 14, fontWeight: 800 }}
                onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
