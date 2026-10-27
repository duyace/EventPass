import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Hash, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  User, 
  Compass,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send,
  Key,
  X
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound, playBlockSound } from '../utils/audio.js';
import { initAuth, googleSignIn, logoutGoogle } from '../services/googleAuth.js';
import { sendOtpEmailViaGmail } from '../services/gmailService.js';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthPageProps {
  onAuthSuccess: (redirectTo: string) => void;
  onExploreAsGuest?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  onExploreAsGuest
}) => {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useWallet();

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login Form State
  const [accountInput, setAccountInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Google Workspace / Gmail Integration state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showConfirmSendModal, setShowConfirmSendModal] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<{ email: string; name: string; otp: string; maskedEmail: string } | null>(null);
  const [isSendingRealEmail, setIsSendingRealEmail] = useState(false);
  const [realEmailSentNotice, setRealEmailSentNotice] = useState<string | null>(null);

  // Forgot Password / Recovery State
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Register Form State (for students)
  const [regName, setRegName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Handle Unified Login: Works for both Admin and Student accounts
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountInput.trim()) {
      setError('Vui lòng nhập Email, Mã sinh viên hoặc Tên tài khoản');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await login(accountInput.trim(), password);
      playSuccessSound();

      const userRole = res.user?.role;
      if (userRole === 'organizer') {
        setSuccessNotice('Đăng nhập thành công với tư cách Admin / Ban Tổ Chức! Đang chuyển hướng vào Bảng Quản Trị...');
        setTimeout(() => {
          onAuthSuccess('organizer-center');
        }, 600);
      } else {
        setSuccessNotice('Đăng nhập thành công với tư cách Sinh viên! Đang mở trang Sự kiện & Vé...');
        setTimeout(() => {
          onAuthSuccess('events');
        }, 600);
      }
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration for new Students
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setError('Vui lòng điền họ tên và email');
      return;
    }
    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        studentId: regStudentId.trim() || undefined,
        password: regPassword || '123456',
        role: 'student'
      });
      playSuccessSound();
      setSuccessNotice('Đăng ký tài khoản Sinh viên thành công! Đã cấp ví Web3 DID tự động.');
      setTimeout(() => {
        onAuthSuccess('events');
      }, 700);
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đăng ký tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Listen to Google Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setSuccessNotice(`Đã kết nối tài khoản Google: ${res.user.email}. Quyền gửi email Gmail đã sẵn sàng!`);
        playSuccessSound();
      }
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đăng nhập Google thất bại');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
  };

  // Handle Request OTP for Forgot Password
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setError('Vui lòng nhập Email hoặc Mã số sinh viên (MSSV) để khôi phục mật khẩu');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setRecoveryLoading(true);

    try {
      const res = await requestPasswordReset(recoveryIdentifier.trim());
      setMaskedEmail(res.maskedEmail);
      setSimulatedOtp(res.simulatedOtp || '123456');
      setRecoveryOtp(res.simulatedOtp || '');
      
      const recipientData = {
        email: res.userEmail,
        name: res.userName,
        otp: res.simulatedOtp || '123456',
        maskedEmail: res.maskedEmail
      };
      setPendingRecipient(recipientData);

      // If user has connected Google, open the explicit confirmation modal for sending real email!
      if (googleToken) {
        setShowConfirmSendModal(true);
      } else {
        // Proceed to reset step and offer one-click Google connect & real email dispatch
        setForgotStep('reset');
        setSuccessNotice(`Đã tìm thấy tài khoản! Mã xác thực OTP đã được tạo cho ${res.maskedEmail}.`);
        playSuccessSound();
      }
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Không tìm thấy tài khoản hoặc gửi mã thất bại');
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Send real email via Gmail API after explicit user confirmation
  const handleConfirmSendRealEmail = async () => {
    if (!pendingRecipient) return;
    setIsSendingRealEmail(true);
    setError(null);
    try {
      await sendOtpEmailViaGmail(
        pendingRecipient.email,
        pendingRecipient.name,
        pendingRecipient.otp,
        googleToken || undefined
      );
      playSuccessSound();
      setRealEmailSentNotice(`Đã gửi thành công email thật đến ${pendingRecipient.email} qua Gmail!`);
      setSuccessNotice(`Email thật đã được gửi thành công đến ${pendingRecipient.email}! Vui lòng mở hộp thư Gmail để lấy mã OTP.`);
      setShowConfirmSendModal(false);
      setForgotStep('reset');
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Gửi email qua Gmail thất bại');
    } finally {
      setIsSendingRealEmail(false);
    }
  };

  // Handle Confirm New Password with OTP
  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtp.trim()) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự để đảm bảo an toàn');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setRecoveryLoading(true);

    try {
      const res = await confirmPasswordReset(recoveryIdentifier.trim(), recoveryOtp.trim(), newPassword);
      playSuccessSound();
      setSuccessNotice('Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới này để đăng nhập ngay.');
      
      // Auto pre-fill account and password on login form
      if (res.accountEmail) {
        setAccountInput(res.accountEmail);
      } else if (recoveryIdentifier) {
        setAccountInput(recoveryIdentifier);
      }
      setPassword(newPassword);

      // Reset form states
      setRecoveryOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotStep('request');

      // Switch smoothly back to login
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 animate-fadeIn">
      
      {/* Container Card */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl p-6 sm:p-10 overflow-hidden">
        
        {/* Glow ambient background accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-800/80 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-0.5 shadow-xl shadow-cyan-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {mode === 'login' ? (
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              ) : mode === 'register' ? (
                <UserPlus className="w-7 h-7 text-fuchsia-400" />
              ) : (
                <KeyRound className="w-7 h-7 text-amber-400" />
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'login' 
              ? 'Đăng Nhập EventPass' 
              : mode === 'register'
              ? 'Đăng Ký Tài Khoản Sinh Viên'
              : 'Khôi Phục & Tìm Lại Mật Khẩu'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            {mode === 'login' ? (
              <>
                Hệ thống tự động nhận diện tài khoản: <span className="text-cyan-400 font-semibold">Tài khoản sinh viên</span> sẽ mở trang sinh viên, <span className="text-fuchsia-400 font-semibold">tài khoản admin</span> sẽ mở trang quản trị admin.
              </>
            ) : mode === 'register' ? (
              <>
                Tạo tài khoản sinh viên mới để đăng ký vé, nhận mã QR điểm danh và chứng chỉ Soulbound Token (SBT) vĩnh viễn trên blockchain.
              </>
            ) : (
              <>
                Lấy lại quyền truy cập tài khoản EventPass an toàn qua mã xác thực bảo mật OTP gửi về email đăng ký.
              </>
            )}
          </p>

          {/* Switcher Tab: 3 options */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md mx-auto mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Đăng ký
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setForgotStep('request');
                setError(null);
                setSuccessNotice(null);
                if (accountInput) setRecoveryIdentifier(accountInput);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'forgot'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Tìm mật khẩu
            </button>
          </div>
        </div>

        {/* Success or Error alert banner */}
        <div className="relative z-10 pt-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5 mb-4 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-start gap-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* ================= MODE 1: UNIFIED LOGIN ================= */}
        {mode === 'login' ? (
          <div className="space-y-6 relative z-10">
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tài khoản đăng nhập:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={accountInput}
                    onChange={e => setAccountInput(e.target.value)}
                    placeholder="Email (VD: admin@... hoặc sinh viên), hoặc MSSV"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nhập email hoặc tài khoản admin/sinh viên. Hệ thống tự nhận diện để mở trang tương ứng.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mật khẩu:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotStep('request');
                      setError(null);
                      setSuccessNotice(null);
                      if (accountInput) setRecoveryIdentifier(accountInput);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra tài khoản...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập vào hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick helper links below login */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-400">
              <div>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setSuccessNotice(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold underline"
                >
                  Đăng ký tài khoản sinh viên
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('request');
                    setError(null);
                    setSuccessNotice(null);
                    if (accountInput) setRecoveryIdentifier(accountInput);
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Tìm lại mật khẩu</span>
                </button>
              </div>
            </div>

          </div>
        ) : mode === 'forgot' ? (
          /* ================= MODE 3: FORGOT & RECOVER PASSWORD ================= */
          <div className="space-y-6 relative z-10 animate-fadeIn">
            {forgotStep === 'request' ? (
              /* Bước 1: Yêu cầu mã OTP */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                    <Key className="w-4 h-4" />
                    <span>Bước 1: Tìm tài khoản & Gửi mã OTP xác nhận</span>
                  </div>
                  Nhập Email hoặc Mã số sinh viên (MSSV) của bạn. Hệ thống sẽ xác thực và gửi mã OTP 6 chữ số để bạn đặt lại mật khẩu mới.
                </div>

                {/* Google Workspace Gmail Integration Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                        <Mail className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Gửi Email Thật qua Gmail</span>
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30">Google Workspace</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {googleUser ? `🟢 Đã kết nối: ${googleUser.email}` : 'Hỗ trợ gửi email thật 100% đến hộp thư người nhận'}
                        </p>
                      </div>
                    </div>
                    {googleUser && (
                      <button 
                        type="button" 
                        onClick={handleGoogleSignOut}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Đăng xuất
                      </button>
                    )}
                  </div>

                  {!googleUser && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleSigningIn}
                      className="gsi-material-button mt-1 cursor-pointer"
                    >
                      <div className="gsi-material-button-state"></div>
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isGoogleSigningIn ? 'Đang kết nối Google...' : 'Kết nối Google để gửi Email thật qua Gmail'}
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email hoặc Mã số sinh viên (MSSV): <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={recoveryIdentifier}
                      onChange={e => setRecoveryIdentifier(e.target.value)}
                      placeholder="VD: duyndtk8cpascal@gmail.com hoặc 24100484 hoặc admin"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Hỗ trợ tìm lại mật khẩu cho cả tài khoản Sinh viên và tài khoản Ban Tổ Chức / Admin.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {recoveryLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang kiểm tra tài khoản & tạo mã OTP...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{googleUser ? 'Gửi mã xác thực & Email thật qua Gmail' : 'Gửi mã xác thực tìm lại mật khẩu'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setSuccessNotice(null);
                    }}
                    className="text-slate-400 hover:text-white font-medium inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại trang Đăng nhập</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Bước 2: Nhập OTP & Đặt mật khẩu mới */
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200/90 leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bước 2: Nhập mã OTP & Tạo mật khẩu mới</span>
                  </div>
                  Mã xác thực đã được gửi tới email <span className="font-bold text-white">{maskedEmail}</span>.
                </div>

                {/* Real email status banner if sent via Gmail */}
                {realEmailSentNotice ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Đã gửi email thật qua Gmail thành công!</div>
                      <p className="text-[11px] text-emerald-300/90 mt-0.5">
                        {realEmailSentNotice} Hãy mở hộp thư đến (Inbox) hoặc Thư rác (Spam) để xem thư.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Option to trigger real email delivery now */
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Bạn muốn nhận email thật vào Gmail?</span>
                    {googleUser ? (
                      <button
                        type="button"
                        onClick={() => setShowConfirmSendModal(true)}
                        className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 px-2.5 py-1 rounded-lg border border-cyan-400/30 transition-all flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Gửi email thật qua Gmail</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all"
                      >
                        Kết nối Google để gửi thư thật
                      </button>
                    )}
                  </div>
                )}

                {/* Simulated OTP helper badge for instant testability */}
                {simulatedOtp && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Mã OTP dự phòng: <span className="font-mono font-bold text-amber-400 text-sm">{simulatedOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecoveryOtp(simulatedOtp)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30 transition-all"
                    >
                      Điền nhanh mã OTP
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mã xác thực OTP (6 chữ số): <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryOtp}
                      onChange={e => setRecoveryOtp(e.target.value)}
                      placeholder="VD: 682914"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 font-mono tracking-widest text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mật khẩu mới: <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Xác nhận mật khẩu mới: <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Mật khẩu mới phải có ít nhất 6 ký tự. Sau khi hoàn tất bạn có thể dùng ngay mật khẩu mới để đăng nhập.
                </p>

                <button
                  type="submit"
                  disabled={recoveryLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {recoveryLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang cập nhật mật khẩu mới...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận & Đổi mật khẩu mới</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setError(null);
                      setSuccessNotice(null);
                    }}
                    className="text-slate-400 hover:text-white inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Chọn tài khoản khác</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={recoveryLoading}
                    className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Gửi lại mã OTP</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ================= MODE 2: STUDENT REGISTRATION ================= */
          <div className="space-y-6 relative z-10">
            <form onSubmit={handleSubmitRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Họ và tên: <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mã số sinh viên (MSSV):
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={regStudentId}
                      onChange={e => setRegStudentId(e.target.value)}
                      placeholder="24100484"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email sinh viên: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="ten.sinhvien@student.edu.vn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mật khẩu:
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Xác nhận mật khẩu:
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-[11px] text-cyan-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Hệ thống sẽ tự động tạo ví Web3 DID trên Polygon Testnet để sinh viên lưu trữ chứng chỉ Soulbound Token (SBT) sau khi điểm danh.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tạo tài khoản & ví Web3...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Đăng ký & Vào trang sinh viên</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center pt-2 text-xs text-slate-400">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessNotice(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold underline"
              >
                Quay lại Đăng nhập ngay
              </button>
            </div>
          </div>
        )}

        {/* Footer Explorer Link */}
        {onExploreAsGuest && (
          <div className="mt-8 pt-4 border-t border-slate-800/80 text-center relative z-10">
            <button
              type="button"
              onClick={onExploreAsGuest}
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Khám phá danh sách sự kiện công khai trước khi đăng nhập</span>
            </button>
          </div>
        )}

      </div>

      {/* MANDATORY Confirmation Dialog before sending real email via Gmail API */}
      {showConfirmSendModal && pendingRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Xác nhận gửi email thật</h3>
                  <p className="text-xs text-slate-400">Dịch vụ Gmail API (Google Workspace)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSendModal(false);
                  setForgotStep('reset');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300 leading-relaxed">
              <div>
                Hệ thống sẽ gửi email thật chứa mã xác thực OTP khôi phục mật khẩu:
              </div>
              <div className="text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                <div>Người nhận: <strong className="text-white">{pendingRecipient.name}</strong></div>
                <div>Địa chỉ email: <strong className="text-cyan-400">{pendingRecipient.email}</strong></div>
                {googleUser && (
                  <div>Tài khoản gửi: <strong className="text-slate-400">{googleUser.email}</strong></div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Email này sẽ xuất hiện trực tiếp trong Hộp thư đến (Inbox) của người nhận.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSendModal(false);
                  setForgotStep('reset');
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Để sau / Dùng mã thử
              </button>
              <button
                type="button"
                disabled={isSendingRealEmail}
                onClick={handleConfirmSendRealEmail}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSendingRealEmail ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang gửi mail...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Xác nhận gửi email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
