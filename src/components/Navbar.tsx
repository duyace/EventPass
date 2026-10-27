import React from 'react';
import { 
  ShieldCheck, 
  Ticket as TicketIcon, 
  QrCode, 
  Award, 
  Search, 
  Wallet, 
  ChevronDown,
  Sparkles,
  Radio,
  Sliders,
  ShieldAlert,
  GraduationCap,
  Building,
  LogIn,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';

export type NavTabType = 
  | 'auth-page'
  | 'events' 
  | 'my-tickets' 
  | 'check-in' 
  | 'organizer-center' 
  | 'sbt-wallet' 
  | 'verifier';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenWalletModal: () => void;
  onOpenCreateEvent?: () => void;
  ticketCount: number;
  sbtCount: number;
  organizerEventCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenWalletModal,
  onOpenCreateEvent,
  ticketCount,
  sbtCount,
  organizerEventCount
}) => {
  const { wallet, switchRole, logout } = useWallet();

  const isBTC = wallet.role === 'organizer';

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = () => {
    logout();
    setActiveTab('auth-page');
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(isBTC ? 'organizer-center' : 'events')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  EventPass
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isBTC 
                    ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                  {isBTC ? 'QUẢN TRỊ ADMIN' : 'SINH VIÊN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isBTC 
                  ? 'Bảng điều khiển tổ chức & Radar kiểm soát an ninh' 
                  : 'Điểm danh chống gian lận & Chứng nhận On-chain'}
              </p>
            </div>
          </div>

          {/* Nav Items - Role Dependent */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            
            {/* Dedicated Auth Page Tab */}
            <button
              onClick={() => setActiveTab('auth-page')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'auth-page'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-400/90 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Trang Đăng Nhập</span>
            </button>

            {/* If BTC: show Organizer Command Center as primary */}
            {isBTC ? (
              <>
                <button
                  onClick={() => setActiveTab('organizer-center')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'organizer-center'
                      ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-500/25'
                      : 'text-fuchsia-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Building className="w-4 h-4 text-fuchsia-400" />
                  <span>Sự kiện BTC & An Ninh</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-fuchsia-500/30 text-fuchsia-200 font-bold">
                    {organizerEventCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('organizer-center');
                    onOpenCreateEvent?.();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  title="Thêm sự kiện mới"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-200" />
                  <span>+ Thêm sự kiện</span>
                </button>

                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TicketIcon className="w-4 h-4" />
                  Khám phá Sự kiện
                </button>

                <button
                  onClick={() => setActiveTab('verifier')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'verifier'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Tra cứu On-chain
                </button>
              </>
            ) : (
              /* If Student: PURE STUDENT VIEWS */
              <>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TicketIcon className="w-4 h-4" />
                  Sự kiện & Vé
                </button>

                <button
                  onClick={() => setActiveTab('my-tickets')}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'my-tickets'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>Vé của tôi</span>
                  {ticketCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white font-bold">
                      {ticketCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('check-in')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'check-in'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  Điểm danh & Ký ví
                </button>

                <button
                  onClick={() => setActiveTab('sbt-wallet')}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'sbt-wallet'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  Ví SBT ({sbtCount})
                </button>

                <button
                  onClick={() => setActiveTab('verifier')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'verifier'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Tra cứu On-chain
                </button>
              </>
            )}

          </nav>

          {/* Right Controls: Role & Wallet */}
          <div className="flex items-center gap-2.5">
            {/* Dedicated Login Page button */}
            <button
              onClick={() => setActiveTab('auth-page')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                activeTab === 'auth-page'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-400 text-amber-300 hover:text-white'
              }`}
              title="Chuyển sang Trang Đăng Nhập Riêng Biệt (Cổng BTC & Cổng Khách)"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang Đăng Nhập</span>
              <span className="sm:hidden">Đăng nhập</span>
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 text-xs font-medium transition-all"
              title="Đăng xuất khỏi tài khoản hiện tại"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Wallet Button */}
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 transition-all text-xs font-semibold shadow-inner group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <Wallet className="w-4 h-4 text-cyan-400 group-hover:rotate-6 transition-transform" />
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  {truncateAddress(wallet.address)}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[9px] text-cyan-400 truncate max-w-[110px]">
                  {wallet.name}
                </div>
              </div>
              <span className="sm:hidden text-[11px] text-slate-200 font-bold">
                {truncateAddress(wallet.address)}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2.5 gap-2 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('auth-page')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'auth-page' ? 'bg-amber-500 text-black' : 'text-amber-300 bg-slate-900 border border-amber-500/30'
            }`}
          >
            Trang Đăng Nhập
          </button>

          {isBTC ? (
            <>
              <button
                onClick={() => setActiveTab('organizer-center')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold ${
                  activeTab === 'organizer-center' ? 'bg-fuchsia-600 text-white' : 'text-fuchsia-300 bg-slate-900'
                }`}
              >
                Quản trị BTC ({organizerEventCount})
              </button>
              <button
                onClick={() => {
                  setActiveTab('organizer-center');
                  onOpenCreateEvent?.();
                }}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-fuchsia-600 text-white flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                + Thêm sự kiện
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'events' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Sự kiện
              </button>
              <button
                onClick={() => setActiveTab('verifier')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'verifier' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Xác minh
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('events')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'events' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Sự kiện
              </button>
              <button
                onClick={() => setActiveTab('my-tickets')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'my-tickets' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Vé của tôi ({ticketCount})
              </button>
              <button
                onClick={() => setActiveTab('check-in')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'check-in' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Điểm danh & Ký
              </button>
              <button
                onClick={() => setActiveTab('sbt-wallet')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'sbt-wallet' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Ví SBT ({sbtCount})
              </button>
              <button
                onClick={() => setActiveTab('verifier')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                  activeTab === 'verifier' ? 'bg-cyan-500 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                Xác minh
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
