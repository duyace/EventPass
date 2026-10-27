import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Hash, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound, playBlockSound } from '../utils/audio.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (redirectTo: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useWallet();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [accountInput, setAccountInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessNotice(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Unified Login
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountInput.trim()) {
      setError('Vui lòng nhập Email, Mã sinh viên hoặc Tên tài khoản');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await login(accountInput.trim(), password);
      playSuccessSound();
      onClose();
      onAuthSuccess(res.redirectTo);
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleFormRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accountInput.trim()) {
      setError('Vui lòng điền họ tên và email');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: accountInput.trim(),
        studentId: studentId.trim() || undefined,
        password: password || '123456',
        role: 'student'
      });
      playSuccessSound();
      onClose();
      onAuthSuccess(res.redirectTo);
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handlers
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setError('Vui lòng nhập Email hoặc Mã số sinh viên để khôi phục');
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
      setForgotStep('reset');
      setSuccessNotice(`Đã tìm thấy tài khoản! Mã xác thực đã gửi tới ${res.maskedEmail}`);
      playSuccessSound();
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Không tìm thấy tài khoản');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryOtp.trim()) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setRecoveryLoading(true);

    try {
      const res = await confirmPasswordReset(recoveryIdentifier.trim(), recoveryOtp.trim(), newPassword);
      playSuccessSound();
      setSuccessNotice('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
      setAccountInput(res.accountEmail || recoveryIdentifier);
      setPassword(newPassword);
      setRecoveryOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotStep('request');
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } catch (err: unknown) {
      playBlockSound();
      setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white my-8">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-cyan-500/15" />

        {/* Modal Header */}
        <div className="relative p-6 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {mode === 'login' ? (
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                ) : mode === 'register' ? (
                  <UserPlus className="w-5 h-5 text-fuchsia-400" />
                ) : (
                  <KeyRound className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {mode === 'login' 
                  ? 'Đăng Nhập EventPass' 
                  : mode === 'register' 
                  ? 'Đăng Ký Tài Khoản Sinh Viên' 
                  : 'Khôi Phục & Tìm Mật Khẩu'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' 
                  ? 'Hệ thống tự nhận diện Admin/BTC hoặc Sinh viên' 
                  : mode === 'register'
                  ? 'Tạo tài khoản để đăng ký vé & nhận chứng chỉ SBT'
                  : 'Nhận mã OTP qua email để thiết lập mật khẩu mới'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs: 3 tabs */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng nhập
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessNotice(null);
              }}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Đăng ký
            </button>
            <button
              onClick={() => {
                setMode('forgot');
                setForgotStep('request');
                setError(null);
                setSuccessNotice(null);
                if (accountInput) setRecoveryIdentifier(accountInput);
              }}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                mode === 'forgot'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Tìm lại
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleFormLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email / Tên tài khoản / MSSV:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={accountInput}
                    onChange={e => setAccountInput(e.target.value)}
                    placeholder="admin@eventpass.edu.vn hoặc sinh viên"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
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
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
              </button>
            </form>
          ) : mode === 'forgot' ? (
            /* Forgot / Reset Password Form in Modal */
            <div className="space-y-4">
              {forgotStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nhập Email hoặc Mã sinh viên để nhận mã xác thực OTP khôi phục mật khẩu:
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email hoặc MSSV:
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={e => setRecoveryIdentifier(e.target.value)}
                        placeholder="VD: duyndtk8cpascal@gmail.com hoặc 24100484"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Đang gửi...' : 'Gửi mã xác thực tìm lại mật khẩu'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmReset} className="space-y-3">
                  {simulatedOtp && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">OTP mẫu: <strong className="text-amber-400 font-mono">{simulatedOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setRecoveryOtp(simulatedOtp)}
                        className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30"
                      >
                        Điền nhanh OTP
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mã OTP (6 chữ số):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={recoveryOtp}
                      onChange={e => setRecoveryOtp(e.target.value)}
                      placeholder="VD: 682914"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 font-mono tracking-widest text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mật khẩu mới:
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Xác nhận:
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu mới'}
                  </button>

                  <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="hover:text-white"
                    >
                      ← Nhập email khác
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      Gửi lại OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleFormRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã số sinh viên (MSSV):
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="24100484"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email sinh viên: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={accountInput}
                    onChange={e => setAccountInput(e.target.value)}
                    placeholder="sinhvien@student.edu.vn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mật khẩu:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Xác nhận:
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký & Vào trang sinh viên'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
