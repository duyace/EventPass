import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  NavTabType 
} from './components/Navbar.js';
import { WalletProvider, useWallet } from './context/WalletContext.js';
import { WalletModal } from './components/WalletModal.js';
import { SignatureModal } from './components/SignatureModal.js';
import { EventCard } from './components/EventCard.js';
import { EventDetailModal } from './components/EventDetailModal.js';
import { TicketRegistrationModal } from './components/TicketRegistrationModal.js';
import { DigitalTicketPass } from './components/DigitalTicketPass.js';
import { AttendeeCheckIn } from './components/AttendeeCheckIn.js';
import { SBTCard } from './components/SBTCard.js';
import { SBTDetailModal } from './components/SBTDetailModal.js';
import { PublicVerifier } from './components/PublicVerifier.js';
import { OrganizerCenter } from './components/OrganizerCenter.js';
import { AuthModal } from './components/AuthModal.js';
import { AuthPage } from './components/AuthPage.js';
import type { EventItem, Ticket, SoulboundToken } from './types/index.js';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Ticket as TicketIcon, 
  Award, 
  ShieldCheck, 
  QrCode, 
  RefreshCw,
  PlusCircle,
  Flame,
  Building,
  GraduationCap,
  LogIn,
  UserPlus
} from 'lucide-react';

function EventPassMain() {
  const { 
    wallet, 
    switchRole, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    openAuthModal, 
    logout 
  } = useWallet();

  const isBTC = wallet.role === 'organizer';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTabType>(isBTC ? 'organizer-center' : 'events');
  const [organizerSubTab, setOrganizerSubTab] = useState<'my-events' | 'create-event' | 'live-qr' | 'anti-fraud'>('my-events');

  // Core Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sbts, setSbts] = useState<SoulboundToken[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForTicket, setSelectedEventForTicket] = useState<EventItem | null>(null);
  const [selectedSBTForDetail, setSelectedSBTForDetail] = useState<SoulboundToken | null>(null);
  const [verifierInitialQuery, setVerifierInitialQuery] = useState<string | undefined>(undefined);
  const [checkInTicketPreset, setCheckInTicketPreset] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, ticketsRes, sbtsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/tickets'),
        fetch('/api/sbts')
      ]);

      const eventsData = await eventsRes.json();
      const ticketsData = await ticketsRes.json();
      const sbtsData = await sbtsRes.json();

      if (eventsData.success) {
        setEvents(eventsData.events);
      }
      if (ticketsData.success) setTickets(ticketsData.tickets);
      if (sbtsData.success) setSbts(sbtsData.sbts);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Strict role redirection: Students NEVER see organizer center, Admin focuses on organizer center
  useEffect(() => {
    if (!isBTC && activeTab === 'organizer-center') {
      setActiveTab('events');
    } else if (isBTC && (activeTab === 'my-tickets' || activeTab === 'check-in' || activeTab === 'sbt-wallet')) {
      setActiveTab('organizer-center');
    }
  }, [isBTC, activeTab]);

  // Filtered events
  const filteredEvents = events.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Events organized by BTC
  const myOrganizedEvents = events.filter(
    e => !e.organizerAddress || e.organizerAddress.toLowerCase() === wallet.address.toLowerCase()
  );

  // User specific tickets and SBTs
  const myTickets = tickets.filter(
    t => t.ownerAddress.toLowerCase() === wallet.address.toLowerCase()
  );

  const mySbts = sbts.filter(
    s => s.ownerAddress.toLowerCase() === wallet.address.toLowerCase()
  );

  // Handlers
  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets(prev => [newTicket, ...prev]);
    setEvents(prev => prev.map(e => e.id === newTicket.eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
  };

  const handleCheckInSuccess = (token: SoulboundToken, updatedTicket: Ticket) => {
    setSbts(prev => [token, ...prev]);
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setEvents(prev => prev.map(e => e.id === updatedTicket.eventId ? { ...e, checkedInCount: e.checkedInCount + 1 } : e));
  };

  const handleGoToCheckInFromEvent = (event: EventItem) => {
    const userTicket = myTickets.find(t => t.eventId === event.id);
    if (userTicket) {
      setCheckInTicketPreset(userTicket.id);
    }
    setActiveTab('check-in');
  };

  const handleGoToCheckInFromTicket = (ticket: Ticket) => {
    setCheckInTicketPreset(ticket.id);
    setActiveTab('check-in');
  };

  const handleVerifyOnChain = (token: SoulboundToken) => {
    setVerifierInitialQuery(token.tokenId);
    setActiveTab('verifier');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenCreateEvent={() => {
          setActiveTab('organizer-center');
          setOrganizerSubTab('create-event');
        }}
        ticketCount={myTickets.length}
        sbtCount={mySbts.length}
        organizerEventCount={myOrganizedEvents.length > 0 ? myOrganizedEvents.length : events.length}
      />

      {/* Role Banner / Context Switcher */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Tài khoản hiện tại:</span>
            {isBTC ? (
              <span className="font-bold text-fuchsia-400 flex items-center gap-1.5 bg-fuchsia-950/60 border border-fuchsia-800/50 px-2.5 py-1 rounded-lg">
                <Building className="w-3.5 h-3.5" />
                {wallet.name} (Tài khoản Admin / Ban Tổ Chức)
              </span>
            ) : (
              <span className="font-bold text-cyan-400 flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg">
                <GraduationCap className="w-3.5 h-3.5" />
                {wallet.name} {wallet.studentId ? `(MSSV: ${wallet.studentId})` : '(Sinh viên)'}
              </span>
            )}
          </div>

          {/* Quick Access to the Dedicated Auth Page */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('auth-page')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                activeTab === 'auth-page'
                  ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-amber-500/25'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40'
              }`}
              title="Mở Trang Đăng Nhập (Tự động mở trang Admin hoặc Sinh viên)"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Trang Đăng Nhập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW: DEDICATED AUTHENTICATION PAGE (CỔNG BTC & CỔNG KHÁCH/SINH VIÊN RIÊNG BIỆT) */}
        {activeTab === 'auth-page' && (
          <div className="animate-fadeIn">
            <AuthPage
              onAuthSuccess={(redir) => {
                setActiveTab(redir as any);
              }}
              onExploreAsGuest={() => setActiveTab('events')}
            />
          </div>
        )}

        {/* VIEW: ORGANIZER CENTER (EXCLUSIVELY FOR BAN TỔ CHỨC) */}
        {isBTC && activeTab === 'organizer-center' && (
          <div className="animate-fadeIn">
            <OrganizerCenter
              events={events}
              tickets={tickets}
              initialSubTab={organizerSubTab}
              onEventCreated={(newEv) => {
                setEvents(prev => [newEv, ...prev]);
                fetchData();
              }}
              onDeleteEvent={(delId) => {
                setEvents(prev => prev.filter(e => e.id !== delId));
                fetchData();
              }}
              onRefreshData={fetchData}
            />
          </div>
        )}

        {/* VIEW: EVENTS & TICKETS EXPLORER */}
        {activeTab === 'events' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-10 overflow-hidden shadow-2xl">
              <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Hệ thống Đăng ký & Điểm danh Web3 Thế hệ mới
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  EventPass <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Anti-Fraud & SBT</span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Đăng ký vé sự kiện trực tuyến, check-in chống gian lận bằng mã QR động dùng một lần & ví Web3, nhận chứng nhận Soulbound Token (ERC-5192) vĩnh viễn trên blockchain.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {!isBTC ? (
                    <>
                      <button
                        onClick={() => setActiveTab('check-in')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        Quét điểm danh ngay
                      </button>

                      <button
                        onClick={() => setActiveTab('my-tickets')}
                        className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2"
                      >
                        <TicketIcon className="w-4 h-4 text-cyan-400" />
                        Xem vé của tôi ({myTickets.length})
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setOrganizerSubTab('create-event');
                          setActiveTab('organizer-center');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-fuchsia-600 hover:from-amber-400 hover:to-fuchsia-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4 text-amber-200" />
                        + Thêm sự kiện mới
                      </button>

                      <button
                        onClick={() => {
                          setOrganizerSubTab('my-events');
                          setActiveTab('organizer-center');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-fuchsia-500/40 text-fuchsia-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Building className="w-4 h-4 text-fuchsia-400" />
                        Quản trị sự kiện BTC
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setActiveTab('auth-page')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    Trang Đăng Nhập Riêng
                  </button>
                </div>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center overflow-x-auto gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 no-scrollbar">
                {['All', 'Tech', 'Hackathon', 'Academic', 'Workshop', 'Conference'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat === 'All' ? 'Tất cả sự kiện' : cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sự kiện, đơn vị..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Event List */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3">
                <TicketIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Không tìm thấy sự kiện phù hợp</h3>
                <p className="text-xs text-slate-400">Hãy thử đổi từ khóa tìm kiếm hoặc danh mục khác.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                  const hasTicket = myTickets.some(t => t.eventId === event.id);

                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSelectEvent={setSelectedEventForDetail}
                      onRegisterTicket={setSelectedEventForTicket}
                      onGoToCheckIn={handleGoToCheckInFromEvent}
                      hasTicket={hasTicket}
                    />
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* VIEW: MY TICKETS (FOR ATTENDEES/STUDENTS) */}
        {!isBTC && activeTab === 'my-tickets' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white">Vé sự kiện của tôi</h2>
                <p className="text-xs text-slate-400">
                  Danh sách vé tham dự đã liên kết với ví: <span className="font-mono text-cyan-400">{wallet.address}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveTab('events')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng ký thêm vé mới
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <TicketIcon className="w-14 h-14 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Chưa có vé tham dự nào trong ví</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Bạn chưa đăng ký sự kiện nào. Hãy khám phá danh sách sự kiện hấp dẫn và nhận vé!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('events')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Khám phá sự kiện
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTickets.map(ticket => (
                  <DigitalTicketPass
                    key={ticket.id}
                    ticket={ticket}
                    onGoToCheckIn={handleGoToCheckInFromTicket}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ATTENDEE CHECK-IN (FOR ATTENDEES/STUDENTS) */}
        {!isBTC && activeTab === 'check-in' && (
          <div className="animate-fadeIn">
            <AttendeeCheckIn
              events={events}
              tickets={tickets}
              initialSelectedTicketId={checkInTicketPreset}
              onCheckInSuccess={handleCheckInSuccess}
              onGoToSBT={(tokenId) => {
                const found = sbts.find(s => s.tokenId === tokenId);
                if (found) {
                  setSelectedSBTForDetail(found);
                }
                setActiveTab('sbt-wallet');
              }}
            />
          </div>
        )}

        {/* VIEW: SOULBOUND TOKEN WALLET (FOR STUDENTS) */}
        {!isBTC && activeTab === 'sbt-wallet' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header Profile Summary */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5" />
                  HỒ SƠ NĂNG LỰC ON-CHAIN (WEB3 RESUME)
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Kho Chứng chỉ Soulbound Token (SBT)
                </h2>

                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Bộ sưu tập các chứng nhận học thuật & giải thưởng số không thể chuyển nhượng (ERC-5192), gắn vĩnh viễn với ví của sinh viên.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
                  <div className="text-xl font-black text-amber-300">{mySbts.length}</div>
                  <div className="text-[11px] text-slate-400">SBT Sở hữu</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[90px]">
                  <div className="text-xl font-black text-cyan-400">100%</div>
                  <div className="text-[11px] text-slate-400">Chính chủ On-chain</div>
                </div>
              </div>
            </div>

            {/* SBT Cards Grid */}
            {mySbts.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <Award className="w-14 h-14 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">Bạn chưa có chứng nhận Soulbound nào</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Tham dự các sự kiện và quét mã check-in qua ví Web3 để nhận chứng nhận SBT đầu tiên!
                </p>
                <button
                  onClick={() => setActiveTab('events')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Tham gia sự kiện ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySbts.map(token => (
                  <SBTCard
                    key={token.tokenId}
                    token={token}
                    onVerifyOnChain={handleVerifyOnChain}
                    onViewDetails={setSelectedSBTForDetail}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW: PUBLIC VERIFIER (OPEN TO BOTH) */}
        {activeTab === 'verifier' && (
          <div className="animate-fadeIn">
            <PublicVerifier
              initialQuery={verifierInitialQuery}
              onClearInitialQuery={() => setVerifierInitialQuery(undefined)}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <span>EventPass • Web3 Anti-Fraud Check-In & SBT Certification</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sinh viên thực hiện: Nguyễn Đình Tấn Duy (MSSV: 24100484) • Lớp: CSE702051-1-1-26(N05)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('auth-page')}
              className="text-amber-300 hover:text-white font-semibold transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              Trang Đăng Nhập Riêng
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setActiveTab('verifier')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Cổng Tra cứu On-chain
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </footer>

      {/* Modals Container */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      <SignatureModal />

      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={!!selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onRegister={(ev) => {
          setSelectedEventForDetail(null);
          setSelectedEventForTicket(ev);
        }}
        onCheckIn={(ev) => {
          setSelectedEventForDetail(null);
          handleGoToCheckInFromEvent(ev);
        }}
        hasTicket={!!selectedEventForDetail && myTickets.some(t => t.eventId === selectedEventForDetail.id)}
      />

      <TicketRegistrationModal
        event={selectedEventForTicket}
        isOpen={!!selectedEventForTicket}
        onClose={() => setSelectedEventForTicket(null)}
        onTicketCreated={handleTicketCreated}
      />

      <SBTDetailModal
        token={selectedSBTForDetail}
        isOpen={!!selectedSBTForDetail}
        onClose={() => setSelectedSBTForDetail(null)}
        onVerify={handleVerifyOnChain}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(redirectTo) => {
          setActiveTab(redirectTo as any);
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <EventPassMain />
    </WalletProvider>
  );
}
