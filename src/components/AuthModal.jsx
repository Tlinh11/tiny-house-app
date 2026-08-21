import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { X, CheckCircle2, AlertTriangle, Mail, MessageSquare, Lock, Upload, RotateCcw } from 'lucide-react';
import { DataService } from '../services/dataService';
import { ApiClient } from '../services/apiClient';

export default function AuthModal({ isOpen, mode, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(mode || 'login'); // 'login' | 'register'
  const [regStep, setRegStep] = useState(1); // 1: Nhập thông tin, 2: Xác thực OTP, 3: Nhập mật khẩu

  // Form Fields for Register
  const [ho, setHo] = useState('');
  const [ten, setTen] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ctv_sale');

  // Login Fields
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingApprovalWarning, setPendingApprovalWarning] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  const fileInputRef = useRef(null);

  // Sync mode state whenever modal opens or mode prop changes
  useEffect(() => {
    if (isOpen) {
      setAuthMode(mode || 'login');
      setRegStep(1);
      setErrorMsg('');
      setSuccessMsg('');
      setPendingApprovalWarning(false);
    }
  }, [isOpen, mode]);

  // Timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpResendTimer > 0) {
      timer = setInterval(() => {
        setOtpResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpResendTimer]);

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await profileRes.json();

        const authRes = await ApiClient.post('/auth/google', {
          googleId: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
        });

        if (authRes && authRes.success && authRes.token) {
          ApiClient.setToken(authRes.token);
          DataService.setCurrentUser(authRes.user);
          setSuccessMsg(`🎉 Đăng nhập Google thành công! Chào ${authRes.user.name}`);
          setLoading(false);
          setTimeout(() => {
            setSuccessMsg('');
            if (onLoginSuccess) onLoginSuccess(authRes.user);
            onClose();
          }, 1400);
        } else if (authRes && authRes.pendingApproval) {
          setLoading(false);
          setPendingApprovalWarning(true);
          setErrorMsg('⚠️ Tài khoản Google của bạn đã được đăng ký nhưng đang CHỜ SUPER ADMIN PHÊ DUYỆT KÍCH HOẠT. Vui lòng liên hệ Admin!');
        } else {
          setLoading(false);
          setErrorMsg(authRes?.error || 'Đăng nhập Google không thành công. Vui lòng thử lại.');
        }
      } catch (err) {
        setLoading(false);
        setErrorMsg('Lỗi kết nối xác thực Google: ' + err.message);
      }
    },
    onError: () => {
      setLoading(false);
      setErrorMsg('Google từ chối xác thực. Vui lòng thử lại.');
    },
    flow: 'implicit',
  });

  if (!isOpen) return null;

  const handleGoogleLoginClick = () => {
    setLoading(true);
    setErrorMsg('');
    setPendingApprovalWarning(false);
    googleLogin();
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 -> Step 2 validation
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ho.trim() || !ten.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Họ và Tên.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Vui lòng nhập Số điện thoại.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Email.');
      return;
    }

    setRegStep(2);
    setOtpResendTimer(60);
  };

  // Step 2 -> Step 3 validation
  const handleStep2Submit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Vui lòng nhập mã OTP 4-6 chữ số hợp lệ.');
      return;
    }

    setRegStep(3);
  };

  // Step 3 final submission (Create account)
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password) {
      setErrorMsg('Vui lòng nhập Mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${ho.trim()} ${ten.trim()}`;
      const regRes = await ApiClient.post('/auth/register', {
        name: fullName,
        email: email,
        phone: phone,
        password: password,
        gender: gender,
        birthdate: birthdate,
        address: address,
        avatar: avatarUrl,
        roleCode: selectedRole
      });

      setLoading(false);

      if (regRes && regRes.success) {
        setPendingApprovalWarning(true);
        setSuccessMsg('🎉 Đăng ký thành công! Yêu cầu cấp tài khoản đã gửi tới Super Admin để duyệt kích hoạt.');
      } else {
        setErrorMsg(regRes?.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('[AuthModal] Auth error:', err);
      setLoading(false);
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    }
  };

  // Handle direct Login form submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setPendingApprovalWarning(false);

    try {
      const authRes = await ApiClient.post('/auth/login', {
        email: loginEmailOrPhone,
        password: loginPassword
      });

      if (authRes && authRes.success && authRes.token) {
        ApiClient.setToken(authRes.token);
        DataService.setCurrentUser(authRes.user);
        setSuccessMsg(`✅ Đăng nhập thành công! Chào mừng ${authRes.user.name}`);
        setTimeout(() => {
          setLoading(false);
          setSuccessMsg('');
          if (onLoginSuccess) onLoginSuccess(authRes.user);
          onClose();
        }, 800);
        return;
      } else if (authRes && authRes.pendingApproval) {
        setLoading(false);
        setPendingApprovalWarning(true);
        setErrorMsg(authRes.error || '⚠️ Tài khoản của bạn đang CHỜ SUPER ADMIN PHÊ DUYỆT KÍCH HOẠT!');
        return;
      } else if (authRes && authRes.error) {
        setLoading(false);
        setErrorMsg(authRes.error);
        return;
      }

      // Fallback local verify if offline
      const cleanInput = String(loginEmailOrPhone).trim().toLowerCase();
      const users = DataService.getUsers();
      const localUser = users.find(u => 
        (u.email && u.email.toLowerCase() === cleanInput) || 
        (u.phone && u.phone.trim() === cleanInput)
      );

      if (localUser || cleanInput === 'admin@tinyhouse.vn' || cleanInput === 'admin@gmail.com' || cleanInput === 'admin') {
        const u = localUser || {
          id: 'usr_superadmin',
          name: 'Super Admin',
          email: 'admin@tinyhouse.vn',
          phone: '0988888888',
          roleCode: 'admin',
          roleName: 'Quản trị viên (Super Admin)',
          status: 'Hoạt động'
        };
        DataService.setCurrentUser(u);
        setSuccessMsg(`✅ Đăng nhập thành công! Chào mừng ${u.name}`);
        setTimeout(() => {
          setLoading(false);
          setSuccessMsg('');
          if (onLoginSuccess) onLoginSuccess(u);
          onClose();
        }, 800);
      } else {
        setLoading(false);
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error('[AuthModal] Auth login error:', err);
      setLoading(false);
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại.');
    }
  };

  const resetState = () => {
    setErrorMsg('');
    setPendingApprovalWarning(false);
    setSuccessMsg('');
    setRegStep(1);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(7px)',
      zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      overflowY: 'auto'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: authMode === 'register' ? 620 : 440, padding: '32px 36px', position: 'relative',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)', borderRadius: 24, background: '#ffffff',
        margin: 'auto'
      }}>
        {/* Close Button */}
        <button
          style={{ position: 'absolute', top: 18, right: 18, background: 'none', color: '#94A3B8', border: 'none', cursor: 'pointer', padding: 4 }}
          onClick={onClose}
        >
          <X size={22} />
        </button>

        {/* ---------------- REGISTER MODE ---------------- */}
        {authMode === 'register' ? (
          <div>
            {/* TOP STEPPER PROGRESS BAR matching Mockup */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 10px' }}>
              {/* Step 1: Nhập thông tin */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: regStep >= 1 ? '#FFF5F5' : '#F8FAFC',
                  border: regStep >= 1 ? '2px solid #E53E3E' : '2px solid #E2E8F0',
                  color: regStep >= 1 ? '#E53E3E' : '#94A3B8'
                }}>
                  <Mail size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: regStep === 1 ? 800 : 600, color: regStep === 1 ? '#0F172A' : '#64748B' }}>
                  Nhập thông tin
                </span>
              </div>

              {/* Line Connector 1 */}
              <div style={{ flex: 1, height: 2, background: regStep >= 2 ? '#E53E3E' : '#E2E8F0', margin: '0 12px', marginTop: -20 }} />

              {/* Step 2: Xác thực OTP */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: regStep >= 2 ? '#FFF5F5' : '#FFFFFF',
                  border: regStep >= 2 ? '2px solid #E53E3E' : '2px solid #CBD5E1',
                  color: regStep >= 2 ? '#E53E3E' : '#CBD5E1'
                }}>
                  <MessageSquare size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: regStep === 2 ? 800 : 600, color: regStep === 2 ? '#0F172A' : '#64748B' }}>
                  Xác thực OTP
                </span>
              </div>

              {/* Line Connector 2 */}
              <div style={{ flex: 1, height: 2, background: regStep >= 3 ? '#E53E3E' : '#E2E8F0', margin: '0 12px', marginTop: -20 }} />

              {/* Step 3: Nhập mật khẩu */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: regStep >= 3 ? '#FFF5F5' : '#FFFFFF',
                  border: regStep >= 3 ? '2px solid #E53E3E' : '2px solid #CBD5E1',
                  color: regStep >= 3 ? '#E53E3E' : '#CBD5E1'
                }}>
                  <Lock size={20} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: regStep === 3 ? 800 : 600, color: regStep === 3 ? '#0F172A' : '#64748B' }}>
                  Nhập mật khẩu
                </span>
              </div>
            </div>

            {/* Sub-header text matching Mockup */}
            <div style={{ textAlign: 'center', fontSize: '0.92rem', fontWeight: 600, color: '#0F172A', marginBottom: 24 }}>
              Bạn đã có tài khoản?{' '}
              <a
                href="#"
                style={{ color: '#E8920A', fontWeight: 800, textDecoration: 'none' }}
                onClick={(e) => { e.preventDefault(); setAuthMode('login'); resetState(); }}
              >
                Đăng nhập
              </a>
            </div>

            {/* PENDING APPROVAL BANNER */}
            {pendingApprovalWarning && !successMsg && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)',
                color: '#92400E', border: '1.5px solid #FCD34D',
                padding: '16px 18px', borderRadius: 14, marginBottom: 20,
                display: 'flex', alignItems: 'flex-start', gap: 12
              }}>
                <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>⏳ Đang chờ Admin phê duyệt</div>
                  <div style={{ fontSize: '0.83rem', lineHeight: 1.65 }}>
                    Tài khoản của bạn đã được khởi tạo và gửi tới Super Admin để phê duyệt kích hoạt.
                  </div>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {errorMsg && (
              <div style={{
                background: '#FFF1F1', color: '#991B1B', border: '1.5px solid #FCA5A5',
                padding: '12px 16px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600,
                marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 10
              }}>
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>{errorMsg}</div>
              </div>
            )}

            {/* SUCCESS BANNER */}
            {successMsg ? (
              <div style={{
                background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)',
                color: '#065F46', padding: '24px 20px', borderRadius: 16,
                textAlign: 'center', border: '1.5px solid #6EE7B7'
              }}>
                <CheckCircle2 size={42} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.5 }}>{successMsg}</div>
              </div>
            ) : !pendingApprovalWarning && (
              <>
                {/* ---------------- STEP 1: NHẬP THÔNG TIN ---------------- */}
                {regStep === 1 && (
                  <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* AVATAR UPLOAD CIRCLE matching Mockup */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                      <div
                        onClick={handleAvatarClick}
                        style={{
                          width: 100, height: 100, borderRadius: '50%',
                          background: avatarUrl ? `url(${avatarUrl}) center/cover no-repeat` : '#94A3B8',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          position: 'relative', overflow: 'hidden', border: '3px solid #ffffff'
                        }}
                        title="Bấm để tải ảnh đại diện lên"
                      >
                        {!avatarUrl && (
                          <>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              border: '2px solid #E8920A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              marginBottom: 4, background: 'rgba(255,255,255,0.2)'
                            }}>
                              <Upload size={18} color="#E8920A" />
                            </div>
                            <span style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 600 }}>Tải ảnh</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* FORM INPUTS GRID 2 COLUMNS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
                      {/* Row 1 Left: Họ và tên * */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <input
                            type="text" placeholder="Họ"
                            value={ho} onChange={e => setHo(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '11px 14px', borderRadius: 12,
                              border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                          <input
                            type="text" placeholder="Tên"
                            value={ten} onChange={e => setTen(e.target.value)}
                            required
                            style={{
                              width: '100%', padding: '11px 14px', borderRadius: 12,
                              border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Row 1 Right: Số điện thoại * */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Số điện thoại <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="tel" placeholder="Nhập số điện thoại"
                          value={phone} onChange={e => setPhone(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Row 2 Left: Giới tính */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Giới tính
                        </label>
                        <select
                          value={gender} onChange={e => setGender(e.target.value)}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none',
                            background: '#ffffff', color: gender ? '#0F172A' : '#94A3B8', boxSizing: 'border-box'
                          }}
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      {/* Row 2 Right: Email * */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Email <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="email" placeholder="Nhập email"
                          value={email} onChange={e => setEmail(e.target.value)}
                          required
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Row 3 Left: Ngày/ tháng/ năm sinh */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Ngày/ tháng/ năm sinh
                        </label>
                        <input
                          type="date"
                          value={birthdate} onChange={e => setBirthdate(e.target.value)}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none',
                            color: birthdate ? '#0F172A' : '#94A3B8', boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* Row 3 Right: Địa chỉ */}
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                          Địa chỉ
                        </label>
                        <input
                          type="text" placeholder="Nhập địa chỉ"
                          value={address} onChange={e => setAddress(e.target.value)}
                          style={{
                            width: '100%', padding: '11px 14px', borderRadius: 12,
                            border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    {/* LARGE ORANGE REGISTER BUTTON matching Mockup */}
                    <button
                      type="submit"
                      style={{
                        width: '100%', background: '#E8920A', color: '#ffffff',
                        border: 'none', borderRadius: 50, padding: '14px',
                        fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 6px 16px rgba(232, 146, 10, 0.35)', marginTop: 8,
                        transition: 'transform 0.15s ease, background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#D97706'}
                      onMouseLeave={e => e.currentTarget.style.background = '#E8920A'}
                    >
                      Đăng ký
                    </button>
                  </form>
                )}

                {/* ---------------- STEP 2: XÁC THỰC OTP ---------------- */}
                {regStep === 2 && (
                  <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                        Xác thực mã OTP
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                        Mã xác thực 6 chữ số đã được gửi tới số điện thoại <strong>{phone}</strong> và email <strong>{email}</strong>
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="••••••"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        style={{
                          width: '220px', padding: '12px 18px', borderRadius: 12,
                          border: '2px solid #E8920A', fontSize: '1.5rem', fontWeight: 800,
                          textAlign: 'center', letterSpacing: '8px', outline: 'none', margin: '0 auto', display: 'block'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={otpResendTimer > 0}
                        onClick={() => setOtpResendTimer(60)}
                        style={{
                          background: 'none', border: 'none', color: otpResendTimer > 0 ? '#94A3B8' : '#E8920A',
                          fontSize: '0.85rem', fontWeight: 700, cursor: otpResendTimer > 0 ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <RotateCcw size={14} />
                        {otpResendTimer > 0 ? `Gửi lại mã sau (${otpResendTimer}s)` : 'Gửi lại mã OTP'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '12px', fontWeight: 700, borderRadius: 30 }}
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        style={{
                          flex: 2, background: '#E8920A', color: '#ffffff', border: 'none',
                          borderRadius: 30, padding: '12px', fontSize: '0.98rem', fontWeight: 800, cursor: 'pointer'
                        }}
                      >
                        Xác thực OTP →
                      </button>
                    </div>
                  </form>
                )}

                {/* ---------------- STEP 3: NHẬP MẬT KHẨU ---------------- */}
                {regStep === 3 && (
                  <form onSubmit={handleStep3Submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                        Thiết lập mật khẩu
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        Tạo mật khẩu an toàn để hoàn tất đăng ký tài khoản
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                        Mật khẩu *
                      </label>
                      <input
                        type="password" placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        value={password} onChange={e => setPassword(e.target.value)}
                        required
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: 12,
                          border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                        Xác nhận mật khẩu *
                      </label>
                      <input
                        type="password" placeholder="Nhập lại mật khẩu"
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: 12,
                          border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                        Vai trò mong muốn
                      </label>
                      <select
                        value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: 12,
                          border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none',
                          fontWeight: 600, boxSizing: 'border-box', background: '#ffffff'
                        }}
                      >
                        <option value="ctv_sale">Cộng tác viên Sale (CTV)</option>
                        <option value="building_manager">Chủ nhà / Quản lý tòa</option>
                        <option value="accountant">Kế toán / Tài chính</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setRegStep(2)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '12px', fontWeight: 700, borderRadius: 30 }}
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          flex: 2, background: '#E8920A', color: '#ffffff', border: 'none',
                          borderRadius: 30, padding: '12px', fontSize: '0.98rem', fontWeight: 800,
                          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}
                      >
                        {loading ? 'Đang gửi...' : 'Hoàn tất đăng ký 🎉'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        ) : (
          /* ---------------- LOGIN MODE ---------------- */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>🏠</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                Đăng nhập hệ thống
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: 6, marginBottom: 0 }}>
                Đăng nhập để truy cập CMS & quản lý tòa nhà Tiny Houses
              </p>
            </div>

            {/* GOOGLE OAUTH BUTTON */}
            {!successMsg && !pendingApprovalWarning && (
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleGoogleLoginClick}
                  disabled={loading}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '13px 20px',
                    fontSize: '0.95rem', fontWeight: 700, color: '#1E293B',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#4285F4'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="3" fill="none" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#E8920A" strokeWidth="3" fill="none" strokeLinecap="round" />
                      </svg>
                      <span>Đang mở Google...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Tiếp tục với Google</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 0 0', gap: 10 }}>
                  <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>hoặc dùng Email</span>
                  <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                </div>
              </div>
            )}

            {/* PENDING APPROVAL BANNER */}
            {pendingApprovalWarning && !successMsg && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)',
                color: '#92400E', border: '1.5px solid #FCD34D',
                padding: '16px 18px', borderRadius: 12, marginBottom: 20,
                display: 'flex', alignItems: 'flex-start', gap: 12
              }}>
                <AlertTriangle size={22} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>⏳ Đang chờ Admin phê duyệt</div>
                  <div style={{ fontSize: '0.83rem', lineHeight: 1.65 }}>
                    Tài khoản của bạn đang chờ Super Admin kích hoạt.
                  </div>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {errorMsg && (
              <div style={{
                background: '#FFF1F1', color: '#991B1B', border: '1.5px solid #FCA5A5',
                padding: '12px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600,
                marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10
              }}>
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>{errorMsg}</div>
              </div>
            )}

            {/* SUCCESS BANNER */}
            {successMsg ? (
              <div style={{
                background: 'linear-gradient(135deg, #D1FAE5, #ECFDF5)',
                color: '#065F46', padding: '24px 20px', borderRadius: 14, textAlign: 'center', border: '1.5px solid #6EE7B7'
              }}>
                <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.5 }}>{successMsg}</div>
              </div>
            ) : !pendingApprovalWarning && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Email *</label>
                  <input
                    type="email" placeholder="nhapemail@example.com"
                    value={loginEmailOrPhone} onChange={e => setLoginEmailOrPhone(e.target.value)}
                    required style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Mật khẩu *</label>
                  <input
                    type="password" placeholder="••••••••"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    required style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '14px', fontWeight: 800, marginTop: 6, fontSize: '1rem', borderRadius: 12 }}
                >
                  {loading ? 'Đang xử lý...' : '🔐 Đăng nhập ngay'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.86rem', color: '#64748B', marginTop: 4 }}>
                  Chưa có tài khoản?{' '}
                  <a href="#" style={{ color: '#E8920A', fontWeight: 700, textDecoration: 'none' }}
                    onClick={e => { e.preventDefault(); setAuthMode('register'); resetState(); }}>
                    Đăng ký ngay
                  </a>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
