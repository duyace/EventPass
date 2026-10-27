import React, { useState, useEffect } from 'react';
import { 
  Building, 
  PlusCircle, 
  Radio, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Clock, 
  Lock, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Award, 
  X,
  Sparkles,
  Ticket as TicketIcon,
  Trash2,
  Image as ImageIcon,
  Check,
  Flame,
  Trophy,
  ExternalLink,
  Layers,
  ArrowRight,
  Globe,
  Tag,
  FileText
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound, playBlockSound } from '../utils/audio.js';
import type { EventItem, Ticket, DynamicCheckInToken } from '../types/index.js';

export const BANNER_PRESETS = [
  {
    label: 'AI & Machine Learning',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Blockchain & Web3',
    url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'An ninh Mạng & Bảo mật',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Hackathon & Lập trình',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Hội thảo & Diễn đàn',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Khoa học & Đổi mới',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  }
];

export type OrganizerSubTab = 'my-events' | 'create-event' | 'live-qr' | 'anti-fraud';

interface OrganizerCenterProps {
  events: EventItem[];
  tickets: Ticket[];
  onEventCreated: (newEvent: EventItem) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRefreshData: () => void;
  initialSubTab?: OrganizerSubTab;
}

export const OrganizerCenter: React.FC<OrganizerCenterProps> = ({
  events,
  tickets,
  onEventCreated,
  onDeleteEvent,
  onRefreshData,
  initialSubTab
}) => {
  const { wallet } = useWallet();

  // Sub-tab within BTC Center
  const [subTab, setSubTab] = useState<OrganizerSubTab>(initialSubTab || 'my-events');

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Filter events organized by this organizer address (or fallback to all events if organizer owns system)
  const myEvents = events.filter(
    e => !e.organizerAddress || e.organizerAddress.toLowerCase() === wallet.address.toLowerCase()
  );

  // If user has no specific events, fallback to all events managed by the demo organizer
  const displayEvents = myEvents.length > 0 ? myEvents : events;

  const [activeEventId, setActiveEventId] = useState<string>(
    displayEvents.length > 0 ? displayEvents[0].id : ''
  );

  // Ensure activeEventId is valid
  useEffect(() => {
    if ((!activeEventId || !displayEvents.some(e => e.id === activeEventId)) && displayEvents.length > 0) {
      setActiveEventId(displayEvents[0].id);
    }
  }, [displayEvents, activeEventId]);

  const currentEvent = displayEvents.find(e => e.id === activeEventId) || displayEvents[0];

  // Dynamic QR States
  const [tokenData, setTokenData] = useState<(DynamicCheckInToken & { version?: number }) | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrFlashUpdate, setQrFlashUpdate] = useState(false);

  // Anti-fraud Stats
  const [stats, setStats] = useState<{
    totalCheckIns: number;
    replayAttemptsBlocked: number;
    singleUseReplaysBlocked: number;
    expiredTokensRejected: number;
    recentAuditLogs: Array<{ id: string; timestamp: string; type: string; detail: string; status: string }>;
  } | null>(null);

  const [fraudSimResult, setFraudSimResult] = useState<string | null>(null);

  // Selected event for viewing attendee list modal
  const [inspectEventId, setInspectEventId] = useState<string | null>(null);

  // Event deletion state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ================= FORM STATE FOR ADDING EVENTS =================
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdSuccessEvent, setCreatedSuccessEvent] = useState<EventItem | null>(null);

  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState(wallet.name || 'Ban Tổ Chức ĐH Quốc Gia');
  const [category, setCategory] = useState<'Tech' | 'Academic' | 'Hackathon' | 'Workshop' | 'Conference' | 'Community'>('Tech');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [location, setLocation] = useState('Hội trường A5 - ĐH Bách Khoa TP.HCM');
  const [isOnline, setIsOnline] = useState(false);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 2 + 10800000).toISOString().slice(0, 16));
  const [maxAttendees, setMaxAttendees] = useState(150);
  const [price, setPrice] = useState(0);
  const [bannerUrl, setBannerUrl] = useState(BANNER_PRESETS[0].url);
  const [customBanner, setCustomBanner] = useState('');

  // SBT Config
  const [sbtTitle, setSbtTitle] = useState('Chứng nhận Tham gia & Năng lực Web3');
  const [sbtDescription, setSbtDescription] = useState('Hoàn thành tham dự và xác thực điểm danh on-chain qua hệ thống EventPass');
  const [sbtTheme, setSbtTheme] = useState<'gold' | 'cyan' | 'purple' | 'emerald'>('gold');
  const [sbtCriteria, setSbtCriteria] = useState('Quét mã QR động dùng một lần và ký số xác thực ví sinh viên');
  const [sbtSkills, setSbtSkills] = useState('Smart Contracts, ERC-5192, IPFS, Web3 Verification');
  const [sbtIcon, setSbtIcon] = useState('Award');

  // Fetch dynamic QR from server
  const fetchDynamicQR = async (eventId: string, force = false) => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/dynamic-qr${force ? '?force=true' : ''}`);
      const data = await res.json();
      if (data.success && data.dynamicToken) {
        if (tokenData && data.dynamicToken.version !== tokenData.version) {
          setQrFlashUpdate(true);
          setTimeout(() => setQrFlashUpdate(false), 1200);
        }
        setTokenData(data.dynamicToken);
        setCountdown(data.dynamicToken.expiresInSeconds || 10);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll Dynamic QR frequently
  useEffect(() => {
    if (!currentEvent) return;
    fetchDynamicQR(currentEvent.id);
    fetchStats();

    const interval = setInterval(() => {
      fetchDynamicQR(currentEvent.id);
      fetchStats();
    }, 2500);

    return () => clearInterval(interval);
  }, [currentEvent?.id]);

  // Second-by-second countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (currentEvent) fetchDynamicQR(currentEvent.id, true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentEvent?.id]);

  // Quick Preset Templates for Rapid Event Creation
  const handleApplyTemplate = (type: 'hackathon' | 'security-workshop' | 'academic-conf') => {
    if (type === 'hackathon') {
      setTitle('AI & Web3 Innovation Hackathon 2026: Ứng Dụng Phi Tập Trung');
      setCategory('Hackathon');
      setDescription('Cuộc thi lập trình 48h dành cho sinh viên phát triển các giải pháp AI Agents kết hợp Blockchain và Smart Contracts.');
      setDetailedDescription('Vòng chung kết diễn ra trực tiếp tại Innovation Hub ĐHQG. Các đội thi sẽ phát triển sản phẩm thực tế, thuyết trình trước hội đồng giám khảo từ các quỹ công nghệ lớn và nhận tài trợ phát triển.');
      setLocation('Innovation Hub - Khu Công nghệ Phần mềm ĐHQG-HCM');
      setIsOnline(false);
      setMaxAttendees(200);
      setPrice(0);
      setBannerUrl('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80');
      setSbtTitle('Top Builder • AI & Web3 Hackathon 2026');
      setSbtDescription('Chứng nhận hoàn thành dự án tại AI & Web3 Innovation Hackathon 2026');
      setSbtTheme('gold');
      setSbtCriteria('Tham gia thuyết trình vòng chung kết và nộp repo mã nguồn hợp lệ');
      setSbtSkills('Solidity, AI Agents, Prompt Engineering, Decentralized Identity');
      setSbtIcon('Trophy');
    } else if (type === 'security-workshop') {
      setTitle('Workshop: An Toàn Smart Contract & Chống Tấn Công Replay');
      setCategory('Workshop');
      setDescription('Buổi thực hành lab an ninh bảo mật hợp đồng thông minh, phân tích lỗ hổng reentrancy và cơ chế mã QR động dùng 1 lần.');
      setDetailedDescription('Người tham gia được cấp tài khoản máy ảo thử nghiệm để mô phỏng các đợt tấn công thực tế và thực hành vá lỗ hổng mã độc smart contract trực tiếp.');
      setLocation('Phòng Lab An Ninh Mạng 402 - ĐH Bách Khoa TP.HCM');
      setIsOnline(false);
      setMaxAttendees(80);
      setPrice(0);
      setBannerUrl('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80');
      setSbtTitle('Smart Contract Security Analyst • Level 1');
      setSbtDescription('Chứng nhận hoàn thành bài thi thực hành lab an toàn bảo mật smart contract');
      setSbtTheme('cyan');
      setSbtCriteria('Vượt qua 5 bài lab CTF an ninh hợp đồng thông minh');
      setSbtSkills('Reentrancy Protection, Nonce Invalidation, ECDSA Signature, Audit');
      setSbtIcon('ShieldCheck');
    } else if (type === 'academic-conf') {
      setTitle('Hội Thảo Khoa Học Sinh Viên: Điện Toán Lượng Tử & Mật Mã Web3');
      setCategory('Academic');
      setDescription('Diễn đàn học thuật của các nhà nghiên cứu trẻ và sinh viên xuất sắc về tương lai của mật mã học hậu lượng tử.');
      setDetailedDescription('Bao gồm 6 bài báo cáo khoa học xuất sắc nhất từ sinh viên các trường đại học thành viên ĐHQG TP.HCM cùng phiên tọa đàm hướng nghiệp.');
      setLocation('Hội trường Trần Chí Đáo - Nhà Điều hành ĐHQG TP.HCM');
      setIsOnline(false);
      setMaxAttendees(300);
      setPrice(0);
      setBannerUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');
      setSbtTitle('Young Scientist Certificate • Quantum Web3');
      setSbtDescription('Chứng nhận tham gia và đóng góp học thuật tại Hội thảo Khoa học Sinh viên 2026');
      setSbtTheme('purple');
      setSbtCriteria('Tham dự đầy đủ các phiên báo cáo và quét mã điểm danh One-Time QR');
      setSbtSkills('Post-Quantum Cryptography, Zero-Knowledge Proofs, Academic Research');
      setSbtIcon('Award');
    }
    playSuccessSound();
  };

  // Anti-fraud test
  const handleTestFraudReplay = async () => {
    playBlockSound();
    try {
      const res = await fetch('/api/test-fraud-replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentEvent?.id,
          staleNonce: tokenData?.nonce || "USED_NONCE_091"
        })
      });
      const data = await res.json();
      setFraudSimResult(data.message || "Hành vi dùng lại mã QR đã bị chặn đứng!");
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Create Event Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setCreateError('Vui lòng nhập tên sự kiện');
      return;
    }

    setCreateError(null);
    setCreateLoading(true);

    try {
      const skillsArray = sbtSkills.split(',').map(s => s.trim()).filter(Boolean);
      const chosenBanner = customBanner.trim() || bannerUrl || BANNER_PRESETS[0].url;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          organizer: organizerName.trim() || wallet.name,
          organizerAddress: wallet.address,
          category,
          description: description.trim(),
          detailedDescription: detailedDescription.trim() || description.trim(),
          location: location.trim(),
          isOnline,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          maxAttendees: Number(maxAttendees) || 100,
          price: Number(price) || 0,
          currency: 'VND',
          bannerUrl: chosenBanner,
          sbtTitle: sbtTitle.trim() || `Chứng nhận tham gia ${title}`,
          sbtDescription: sbtDescription.trim() || `Đã tham gia và hoàn thành điểm danh sự kiện ${title}`,
          sbtTheme,
          sbtCriteria: sbtCriteria.trim() || 'Quét mã QR động dùng một lần và xác thực ví Web3',
          sbtIcon,
          skillsGranted: skillsArray.length > 0 ? skillsArray : ['Web3 Verified', 'Participant']
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo sự kiện');
      }

      playSuccessSound();
      onEventCreated(data.event);
      setCreatedSuccessEvent(data.event);
      setActiveEventId(data.event.id);
      onRefreshData();
    } catch (err: unknown) {
      playBlockSound();
      setCreateError(err instanceof Error ? err.message : 'Có lỗi khi tạo sự kiện');
    } finally {
      setCreateLoading(false);
    }
  };

  // Delete Event Handler
  const handleDeleteEvent = async (eventId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể xóa sự kiện');
      }

      playSuccessSound();
      onDeleteEvent?.(eventId);
      onRefreshData();
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      playBlockSound();
      alert(err instanceof Error ? err.message : 'Có lỗi khi xóa sự kiện');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = (eventId: string) => {
    const targetEv = events.find(e => e.id === eventId) || currentEvent;
    const evTickets = tickets.filter(t => t.eventId === targetEv.id);

    const rows = [
      ["Event ID", "Event Title", "Organizer", "Ticket Code", "Attendee Name", "MSSV", "Email", "Wallet Address", "Status", "Check-in Time", "SBT Token ID"],
      ...evTickets.map(t => [
        targetEv.id,
        `"${targetEv.title}"`,
        `"${targetEv.organizer}"`,
        t.ticketCode,
        `"${t.ownerName}"`,
        t.ownerStudentId || '',
        t.ownerEmail,
        t.ownerAddress,
        t.status,
        t.checkInTime || '',
        t.sbtTokenId || ''
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EventPass_Attendance_${targetEv.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inspectedEvent = events.find(e => e.id === inspectEventId);
  const inspectedTickets = inspectedEvent ? tickets.filter(t => t.eventId === inspectedEvent.id) : [];

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      
      {/* Top Banner & Sub-Tabs */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-fuchsia-950/40 to-slate-900 border border-fuchsia-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40">
              <Building className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
              Khu Vực Dành Riêng Cho Ban Tổ Chức (BTC)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Trung Tâm Quản Trị Sự Kiện & Kiểm Soát Chống Gian Lận
          </h2>
          <p className="text-xs text-slate-300">
            Quản lý các sự kiện mình tổ chức, thêm sự kiện mới với chứng nhận SBT, phát mã QR 1 lần dùng và radar an ninh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSubTab('create-event');
              setCreatedSuccessEvent(null);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm sự kiện mới</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setSubTab('my-events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'my-events'
              ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Sự kiện tôi tổ chức ({displayEvents.length})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('create-event');
            setCreatedSuccessEvent(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'create-event'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-fuchsia-600 text-white shadow-lg shadow-amber-500/25 font-bold'
              : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-amber-300" />
          <span>+ Thêm sự kiện mới</span>
        </button>

        <button
          onClick={() => setSubTab('live-qr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'live-qr'
              ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Máy chiếu Dynamic QR (Dùng 1 Lần)</span>
        </button>

        <button
          onClick={() => setSubTab('anti-fraud')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            subTab === 'anti-fraud'
              ? 'bg-gradient-to-r from-rose-600 to-fuchsia-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Radar Kiểm Soát Chống Gian Lận (Chỉ BTC)</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: MY EVENTS (BTC) ================= */}
      {subTab === 'my-events' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Danh sách sự kiện do bạn quản trị</h3>
              <p className="text-xs text-slate-400">
                Được liên kết với địa chỉ ví BTC: <span className="font-mono text-cyan-400">{wallet.address}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setSubTab('create-event');
                setCreatedSuccessEvent(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Thêm sự kiện mới
            </button>
          </div>

          {displayEvents.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <Building className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Bạn chưa tạo sự kiện nào</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy bấm nút bên dưới để tạo sự kiện đầu tiên của đơn vị tổ chức bạn!
                </p>
              </div>
              <button
                onClick={() => setSubTab('create-event')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/25"
              >
                + Thêm sự kiện mới ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.map((ev) => {
                const evTickets = tickets.filter(t => t.eventId === ev.id);
                const checkedInCount = evTickets.filter(t => t.status === 'checked_in').length;
                const rate = evTickets.length > 0 ? Math.round((checkedInCount / evTickets.length) * 100) : 0;
                const isConfirmingDelete = deleteConfirmId === ev.id;

                return (
                  <div 
                    key={ev.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-fuchsia-500/40 transition-all shadow-xl group relative overflow-hidden"
                  >
                    {/* Event Banner preview thumbnail */}
                    {ev.bannerUrl && (
                      <div className="h-28 -mx-6 -mt-6 mb-4 overflow-hidden relative">
                        <img 
                          src={ev.bannerUrl} 
                          alt={ev.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                        <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-fuchsia-400 border border-fuchsia-500/30">
                          {ev.category}
                        </span>
                        <span className="absolute top-3 right-3 text-xs font-mono font-bold text-white bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-700">
                          {evTickets.length}/{ev.maxAttendees} vé
                        </span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {!ev.bannerUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                            {ev.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {evTickets.length}/{ev.maxAttendees} vé
                          </span>
                        </div>
                      )}

                      <h4 className="text-base font-bold text-white group-hover:text-fuchsia-300 transition-colors line-clamp-2">
                        {ev.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {ev.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>

                      {/* Progress */}
                      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Đã điểm danh & có SBT:</span>
                          <span className="text-emerald-400 font-bold">{checkedInCount} / {evTickets.length} ({rate}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5 truncate">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ev.sbtCertificate?.title || 'Chứng nhận SBT Web3'}</span>
                      </div>
                    </div>

                    {/* Actions & Delete Confirmation */}
                    <div className="pt-4 mt-3 border-t border-slate-800 flex flex-col gap-2">
                      {isConfirmingDelete ? (
                        <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 space-y-2 animate-fadeIn">
                          <p className="text-xs text-rose-200 font-medium">
                            Xác nhận xóa sự kiện này? Vé đã cấp cũng sẽ bị gỡ bỏ.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              disabled={deleteLoading}
                              className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                            >
                              {deleteLoading ? 'Đang xóa...' : 'Xóa ngay'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setActiveEventId(ev.id);
                              setSubTab('live-qr');
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Radio className="w-3.5 h-3.5 text-amber-300" />
                            Phát QR Máy Chiếu (Dùng 1 Lần)
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setInspectEventId(ev.id)}
                              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-cyan-400" />
                              Danh sách vé ({evTickets.length})
                            </button>
                            <button
                              onClick={() => handleExportCSV(ev.id)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                              title="Xuất file CSV danh sách tham dự"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(ev.id)}
                              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-400 hover:text-rose-200 text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
                              title="Xóa sự kiện này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 2: THÊM SỰ KIỆN MỚI (BTC STUDIO) ================= */}
      {subTab === 'create-event' && (
        <div className="space-y-8 animate-fadeIn">
          
          {createdSuccessEvent ? (
            /* Success Feedback Banner */
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5" />
                  ĐÃ TẠO SỰ KIỆN THÀNH CÔNG VÀO HỆ THỐNG
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {createdSuccessEvent.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sự kiện đã sẵn sàng mở cổng đăng ký vé cho sinh viên. Hệ thống bảo mật đã khởi tạo bộ mã QR tự hủy sau 1 lần quét và chứng chỉ Soulbound Token (ERC-5192) tự động.
                </p>
              </div>

              {/* Event card summary preview */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mã sự kiện: <span className="font-mono text-cyan-400">{createdSuccessEvent.id}</span></span>
                  <span className="font-bold text-amber-300">{createdSuccessEvent.category}</span>
                </div>
                <div className="text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{createdSuccessEvent.location}</span>
                </div>
                <div className="text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{createdSuccessEvent.sbtCertificate?.title}</span>
                </div>
              </div>

              {/* Quick Actions after creation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setActiveEventId(createdSuccessEvent.id);
                    setSubTab('live-qr');
                    setCreatedSuccessEvent(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-fuchsia-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-amber-300" />
                  <span>Bật máy chiếu Dynamic QR điểm danh ngay</span>
                </button>

                <button
                  onClick={() => {
                    setSubTab('my-events');
                    setCreatedSuccessEvent(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Xem trong danh sách sự kiện BTC</span>
                </button>

                <button
                  onClick={() => {
                    setCreatedSuccessEvent(null);
                    setTitle('');
                    setDescription('');
                    setDetailedDescription('');
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-semibold text-xs cursor-pointer"
                >
                  + Tiếp tục tạo sự kiện khác
                </button>
              </div>

            </div>
          ) : (
            /* Event Creation Studio */
            <div className="space-y-6">
              
              {/* Header Studio */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    BTC STUDIO • KHỞI TẠO SỰ KIỆN MỚI
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Thêm Sự Kiện & Cấu Hình Chứng Chỉ Soulbound Token
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1">
                    Điền thông tin sự kiện bên dưới hoặc sử dụng một trong các mẫu có sẵn để tự động thiết lập nhanh chóng.
                  </p>
                </div>

                {/* Quick Template Fill Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-slate-400">⚡ Điền nhanh từ mẫu có sẵn:</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('hackathon')}
                      className="px-3 py-1.5 rounded-xl bg-fuchsia-950/40 hover:bg-fuchsia-900/60 border border-fuchsia-700/50 text-fuchsia-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trophy className="w-3 h-3 text-amber-400" />
                      Mẫu Hackathon 48h
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('security-workshop')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      Mẫu Workshop Bảo Mật
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('academic-conf')}
                      className="px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3 h-3 text-purple-400" />
                      Mẫu Hội Thảo Khoa Học
                    </button>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Form Layout: 2 Columns */}
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left 7 cols: Main Event Fields */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: Basic Info */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>1. Thông tin sự kiện cơ bản</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tên sự kiện / Workshop: <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="VD: Hội thảo Công nghệ Blockchain & AI 2026"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Đơn vị tổ chức: <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={organizerName}
                          onChange={e => setOrganizerName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Thể loại:
                        </label>
                        <select
                          value={category}
                          onChange={e => setCategory(e.target.value as any)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                        >
                          <option value="Tech">Tech (Công nghệ)</option>
                          <option value="Academic">Academic (Học thuật)</option>
                          <option value="Hackathon">Hackathon (Thi đấu)</option>
                          <option value="Workshop">Workshop (Thực hành)</option>
                          <option value="Conference">Conference (Hội nghị)</option>
                          <option value="Community">Community (Cộng đồng)</option>
                        </select>
                      </div>
                    </div>

                    {/* Date and Time Picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Thời gian bắt đầu:
                        </label>
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Thời gian kết thúc:
                        </label>
                        <input
                          type="datetime-local"
                          value={endDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Location & Format */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="eventFormat"
                            checked={!isOnline}
                            onChange={() => setIsOnline(false)}
                            className="text-cyan-500"
                          />
                          <span>Trực tiếp tại Hội trường / Phòng Lab</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="eventFormat"
                            checked={isOnline}
                            onChange={() => setIsOnline(true)}
                            className="text-cyan-500"
                          />
                          <span>Trực tuyến (Zoom / Meet)</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Địa điểm tổ chức {isOnline ? 'hoặc Link phòng họp' : 'cụ thể'}:
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="VD: Hội trường A5 - ĐH Bách Khoa TP.HCM"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Ticket Quota & Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Số lượng vé tối đa:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5000}
                          value={maxAttendees}
                          onChange={e => setMaxAttendees(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Giá vé (0đ = Miễn phí cho sinh viên):
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10000}
                          value={price}
                          onChange={e => setPrice(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mô tả tóm tắt sự kiện:
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Tóm tắt ngắn gọn nội dung chương trình để thu hút người tham dự..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Lịch trình chi tiết & Agenda (tùy chọn):
                      </label>
                      <textarea
                        rows={3}
                        value={detailedDescription}
                        onChange={e => setDetailedDescription(e.target.value)}
                        placeholder="Nội dung các phiên thuyết trình, báo cáo viên, thể lệ thi đấu..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none leading-relaxed"
                      />
                    </div>

                  </div>

                  {/* Card 2: Banner Selection */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
                      <ImageIcon className="w-4 h-4 text-fuchsia-400" />
                      <span>2. Hình ảnh bìa sự kiện (Banner)</span>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-2">Chọn nhanh một trong các ảnh bìa độ nét cao:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {BANNER_PRESETS.map((p, idx) => {
                          const isSelected = bannerUrl === p.url && !customBanner;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setBannerUrl(p.url);
                                setCustomBanner('');
                              }}
                              className={`group relative h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                                isSelected ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/50 scale-[1.02]' : 'border-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-2">
                                <span className="text-[10px] font-bold text-white line-clamp-1">{p.label}</span>
                              </div>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Hoặc nhập URL ảnh tùy chỉnh:
                      </label>
                      <input
                        type="url"
                        value={customBanner}
                        onChange={e => setCustomBanner(e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                </div>

                {/* Right 5 cols: SBT Configuration & Live Badge Preview */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Card 3: SBT ERC-5192 Configuration */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-300 border-b border-purple-500/20 pb-3">
                      <Award className="w-4 h-4" />
                      <span>3. Chứng chỉ Soulbound Token (SBT ERC-5192)</span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Chứng chỉ số không thể chuyển nhượng (Non-transferable SBT) sẽ được tự động đúc vào ví sinh viên ngay sau khi quét mã Dynamic QR điểm danh.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tên văn bằng chứng nhận: <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={sbtTitle}
                        onChange={e => setSbtTitle(e.target.value)}
                        placeholder="VD: Top Builder • AI & Web3 Hackathon 2026"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mô tả chứng nhận:
                      </label>
                      <input
                        type="text"
                        value={sbtDescription}
                        onChange={e => setSbtDescription(e.target.value)}
                        placeholder="Mô tả năng lực được công nhận..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tiêu chí cấp chứng chỉ on-chain:
                      </label>
                      <input
                        type="text"
                        value={sbtCriteria}
                        onChange={e => setSbtCriteria(e.target.value)}
                        placeholder="Quét mã QR 1 lần và ký số ví Web3"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Color Theme Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Màu sắc văn bằng SBT:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'gold', name: 'Gold', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50' },
                          { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' },
                          { id: 'purple', name: 'Purple', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
                          { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSbtTheme(t.id as any)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              sbtTheme === t.id ? `${t.bg} ring-2 ring-white/50 scale-105` : 'border-slate-800 text-slate-400 bg-slate-950'
                            }`}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Kỹ năng on-chain công nhận (phân cách bằng dấu phẩy):
                      </label>
                      <input
                        type="text"
                        value={sbtSkills}
                        onChange={e => setSbtSkills(e.target.value)}
                        placeholder="Solidity, AI Agents, Anti-Fraud, Web3"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Card 4: LIVE PREVIEW OF THE SOULBOUND TOKEN */}
                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        Xem trước chứng chỉ SBT người nhận sẽ thấy:
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400">ERC-5192 SOULBOUND</span>
                    </div>

                    <div className={`p-5 rounded-2xl border transition-all ${
                      sbtTheme === 'gold' ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-amber-950/30 border-amber-500/50 text-amber-200' :
                      sbtTheme === 'cyan' ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-cyan-950/30 border-cyan-500/50 text-cyan-200' :
                      sbtTheme === 'purple' ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-purple-950/30 border-purple-500/50 text-purple-200' :
                      'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-emerald-950/30 border-emerald-500/50 text-emerald-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/20 flex items-center justify-center">
                          <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                          CHỨNG CHỈ SỐ #SBT-DEMO
                        </span>
                      </div>

                      <h4 className="text-base font-black text-white line-clamp-2">
                        {sbtTitle || 'Tên chứng nhận Soulbound'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {sbtDescription || 'Mô tả văn bằng chứng nhận năng lực on-chain'}
                      </p>

                      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
                        {sbtSkills.split(',').map((skill, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                        <span>ĐƠN VỊ CẤP: {organizerName || 'BTC ĐH Quốc Gia'}</span>
                        <span className="text-emerald-400">KHÔNG THỂ CHUYỂN NHƯỢNG</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-fuchsia-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {createLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang tạo sự kiện & khởi tạo hợp đồng SBT...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" />
                          <span>Xác nhận tạo sự kiện & Đăng tải lên hệ thống</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubTab('my-events')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Hủy và quay lại danh sách sự kiện
                    </button>
                  </div>

                </div>

              </form>

            </div>
          )}

        </div>
      )}

      {/* ================= SUB-TAB 3: ONE-TIME DYNAMIC QR DISPLAY ================= */}
      {subTab === 'live-qr' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Mã QR Dùng 1 Lần (One-Time Dynamic QR)
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Màn hình Phát Dynamic QR cho Sự kiện: {currentEvent?.title}
              </h3>
              <p className="text-xs text-slate-400">
                ⚡ <span className="font-semibold text-amber-300">Cơ chế tự hủy:</span> Mã QR sẽ <span className="text-white font-bold underline">lập tức làm mới ngay khi có 1 người quét thành công</span> hoặc sau 10 giây.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={currentEvent?.id}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
              >
                {displayEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Thu nhỏ' : 'Chế độ toàn màn hình máy chiếu hội trường'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* QR Display Card */}
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

            {qrFlashUpdate && (
              <div className="mb-4 py-2 px-4 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold animate-bounce flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Vừa có người quét thành công! Mã QR đã tự động làm mới mã mới.
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                PHIÊN BẢN QR: #{tokenData?.version || 1}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                DÙNG 1 LẦN DUY NHẤT
              </span>
            </div>

            <h3 className="text-2xl font-black text-white max-w-xl mb-1">
              {currentEvent?.title}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6">
              Người tham dự quét mã này trên ứng dụng EventPass để ký số và đúc chứng nhận Soulbound Token.
            </p>

            <div className={`relative p-5 rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
              qrFlashUpdate ? 'ring-8 ring-emerald-400 scale-105' : 'ring-4 ring-fuchsia-500/80'
            }`}>
              {tokenData?.qrDataUrl ? (
                <img 
                  src={tokenData.qrDataUrl} 
                  alt="Single-use Dynamic QR"
                  className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
                />
              ) : (
                <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center text-slate-400 text-xs">
                  Đang khởi tạo mã QR...
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-fuchsia-400 flex items-center justify-center shadow-lg">
                  <Lock className="w-6 h-6 text-fuchsia-400" />
                </div>
              </div>
            </div>

            {/* Countdown timer & Nonce specs */}
            <div className="w-full max-w-md mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-fuchsia-400 animate-spin" />
                  Tự đổi mã sau (nếu chưa ai quét):
                </span>
                <span className="font-mono font-bold text-fuchsia-400 text-sm">
                  00:{countdown.toString().padStart(2, '0')}s
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-left">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">CURRENT NONCE</div>
                  <div className="text-emerald-400 font-bold truncate">{tokenData?.nonce || '---'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">HMAC SIGNATURE HASH</div>
                  <div className="text-slate-300 truncate">{tokenData?.secretHash?.slice(0, 16) || '---'}...</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => fetchDynamicQR(currentEvent.id, true)}
              className="mt-5 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Làm mới mã thủ công ngay lập tức
            </button>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: ANTI-FRAUD CONTROL RADAR (EXCLUSIVELY FOR BTC) ================= */}
      {subTab === 'anti-fraud' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-rose-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Trung Tâm Kiểm Soát An Ninh & Chống Gian Lận (Anti-Fraud Radar)
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Giám Sát Bất Biến & Chặn Đứng Điểm Danh Hộ
              </h3>
              <p className="text-xs text-slate-400">
                Khu vực kiểm soát bảo mật dành riêng cho Ban Tổ Chức (Sinh viên không có quyền truy cập vào mục này).
              </p>
            </div>

            <button
              onClick={() => handleExportCSV(currentEvent?.id)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              Xuất báo cáo an ninh & điểm danh (CSV)
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Tổng lượt Check-in</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.totalCheckIns || 0}</div>
              <div className="text-[10px] text-emerald-400">Đã phát hành SBT hợp lệ</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-rose-950/60 space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Gian lận đã chặn</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">{stats?.replayAttemptsBlocked || 0}</div>
              <div className="text-[10px] text-slate-400">Ngăn chặn hành vi điểm danh hộ</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-amber-950/60 space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Chặn QR dùng 2 lần</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300">{stats?.singleUseReplaysBlocked || 0}</div>
              <div className="text-[10px] text-slate-400">Mã đã quét bị chặn tái sử dụng</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-950/60 space-y-1">
              <div className="flex justify-between items-center text-slate-400 text-xs">
                <span>Mã hết hạn bị từ chối</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-300">{stats?.expiredTokensRejected || 0}</div>
              <div className="text-[10px] text-slate-400">Quá hạn 10 giây</div>
            </div>
          </div>

          {/* Test Attack Tool & Live Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Attack test tool */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h4 className="text-sm font-bold text-white">Kiểm thử Cơ chế Chống Gian lận (BTC Testing)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ban tổ chức có thể bấm nút kiểm thử bên dưới để giả lập một kẻ xấu chụp màn hình mã QR đã dùng rồi gửi cho người khác check-in hộ. Hệ thống sẽ tự động bắt giữ và khóa phiên ngay lập tức.
              </p>

              <button
                onClick={handleTestFraudReplay}
                className="w-full py-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                Giả lập tấn công Replay Attack (Quét lại mã đã dùng)
              </button>

              {fraudSimResult && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 space-y-1 animate-fadeIn">
                  <div className="font-bold">🛡 Phản hồi của Hệ thống Bảo mật:</div>
                  <p>{fraudSimResult}</p>
                </div>
              )}
            </div>

            {/* Security Audit Log Stream */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Nhật ký An ninh & Chống Gian Lận Thời Gian Thực
                  </h4>
                </div>
                <button
                  onClick={fetchStats}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Làm mới nhật ký
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {stats?.recentAuditLogs?.map(log => (
                  <div 
                    key={log.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      log.type === 'BLOCKED_SINGLE_USE_REPLAY' || log.type === 'BLOCKED_EXPIRED'
                        ? 'bg-rose-950/30 border-rose-900/60 text-rose-300'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 font-mono">
                      <span>{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                      <span className="font-bold">{log.status}</span>
                    </div>
                    <p className="leading-snug">{log.detail}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= MODAL: VIEW ATTENDEES ROSTER ================= */}
      {inspectEventId && inspectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Danh sách người đăng ký vé tham dự</h3>
                <p className="text-xs text-slate-400 truncate max-w-md">{inspectedEvent.title}</p>
              </div>
              <button 
                onClick={() => setInspectEventId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inspectedTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Chưa có sinh viên nào đăng ký vé cho sự kiện này.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Mã vé</th>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3">MSSV</th>
                      <th className="p-3">Ví Web3</th>
                      <th className="p-3">Trạng thái Check-in</th>
                      <th className="p-3">SBT Token ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-sans">
                    {inspectedTickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-cyan-400">{t.ticketCode}</td>
                        <td className="p-3 font-semibold text-white">{t.ownerName}</td>
                        <td className="p-3 font-mono text-slate-300">{t.ownerStudentId || 'N/A'}</td>
                        <td className="p-3 font-mono text-slate-400">{t.ownerAddress.slice(0, 6)}...{t.ownerAddress.slice(-4)}</td>
                        <td className="p-3">
                          {t.status === 'checked_in' ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                              ✓ Đã Check-in
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              Chưa điểm danh
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-amber-300 font-bold">
                          {t.sbtTokenId || '---'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleExportCSV(inspectedEvent.id)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải file CSV
              </button>
              <button
                onClick={() => setInspectEventId(null)}
                className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
