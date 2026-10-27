import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Clock, 
  Lock, 
  Sparkles,
  Download,
  AlertTriangle
} from 'lucide-react';
import type { EventItem, DynamicCheckInToken } from '../types/index.js';
import { playBlockSound } from '../utils/audio.js';

interface DynamicQRDisplayProps {
  events: EventItem[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onRefreshEvents: () => void;
}

export const DynamicQRDisplay: React.FC<DynamicQRDisplayProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onRefreshEvents
}) => {
  const [tokenData, setTokenData] = useState<DynamicCheckInToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState<{
    totalCheckIns: number;
    replayAttemptsBlocked: number;
    expiredTokensRejected: number;
    recentAuditLogs: Array<{ id: string; timestamp: string; type: string; detail: string; status: string }>;
  } | null>(null);
  const [simulateFraudMessage, setSimulateFraudMessage] = useState<string | null>(null);

  const currentEvent = events.find(e => e.id === activeEventId) || events[0];

  const fetchDynamicQR = async (eventId: string) => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/dynamic-qr`);
      const data = await res.json();
      if (data.success && data.dynamicToken) {
        setTokenData(data.dynamicToken);
        setCountdown(data.dynamicToken.expiresInSeconds || 10);
      }
    } catch (err) {
      console.error("Error fetching dynamic QR", err);
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

  // Polling dynamic QR every interval
  useEffect(() => {
    if (!currentEvent) return;
    fetchDynamicQR(currentEvent.id);
    fetchStats();

    const interval = setInterval(() => {
      fetchDynamicQR(currentEvent.id);
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentEvent?.id]);

  // Second-by-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (currentEvent) fetchDynamicQR(currentEvent.id);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentEvent?.id]);

  // Test fraud replay simulation to demonstrate security mechanism
  const handleSimulateReplayFraud = async () => {
    if (!currentEvent) return;
    playBlockSound();
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentEvent.id,
          walletAddress: "0xBadActor99999999999999999999999999999999",
          nonce: "EXPIRED_NONCE_FAKE_999", // Intentional stale nonce
          attendeeName: "Kẻ gian lận điểm danh hộ"
        })
      });
      const data = await res.json();
      setSimulateFraudMessage(data.error || "Hệ thống đã chặn thành công!");
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ["Event ID", "Event Title", "Organizer", "Max Attendees", "Checked In"],
      [currentEvent.id, `"${currentEvent.title}"`, `"${currentEvent.organizer}"`, currentEvent.maxAttendees, currentEvent.checkedInCount]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EventPass_Report_${currentEvent.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentEvent) {
    return <div className="text-white p-6">Chưa có sự kiện nào.</div>;
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8 overflow-y-auto' : ''}`}>
      
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Màn hình Máy chiếu Ban Tổ Chức (Organizer Console)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Phát mã Dynamic QR Check-in Thời gian thực
          </h2>
          <p className="text-xs text-slate-400">
            Mã QR tự động đổi Nonce mỗi 10 giây – Vô hiệu hóa việc chụp màn hình gửi check-in hộ.
          </p>
        </div>

        {/* Event Selector & Projector Button */}
        <div className="flex items-center gap-2">
          <select
            value={currentEvent.id}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Thu nhỏ' : 'Chế độ toàn màn hình máy chiếu'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: QR Center & Fraud Prevention Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic QR Center Display (Cols 7) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Event title */}
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
            EVENT ID: {currentEvent.id}
          </span>
          <h3 className="text-2xl font-black text-white max-w-lg mb-2">
            {currentEvent.title}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Người tham dự dùng điện thoại quét mã QR bên dưới trên ứng dụng EventPass để ký số ví và nhận ngay chứng nhận Soulbound Token.
          </p>

          {/* QR Code Container */}
          <div className="relative p-5 rounded-3xl bg-white shadow-2xl shadow-cyan-500/10 border-4 border-cyan-400/80 transition-all">
            {tokenData?.qrDataUrl ? (
              <img 
                src={tokenData.qrDataUrl} 
                alt="Dynamic QR Code"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
              />
            ) : (
              <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-slate-400 text-xs">
                Đang tạo mã QR bảo mật...
              </div>
            )}

            {/* Central icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Countdown & Rotating Nonce Status */}
          <div className="w-full max-w-md mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                Làm mới mã sau:
              </span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                00:{countdown.toString().padStart(2, '0')}s
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 10) * 100}%` }}
              />
            </div>

            {/* Cryptographic metadata tags */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-left">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">CURRENT NONCE</div>
                <div className="text-emerald-400 font-bold truncate">{tokenData?.nonce || '---'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">HMAC SECRET HASH</div>
                <div className="text-slate-300 truncate">{tokenData?.secretHash?.slice(0, 16) || '---'}...</div>
              </div>
            </div>
          </div>

          {/* Manual refresh button */}
          <button
            onClick={() => fetchDynamicQR(currentEvent.id)}
            className="mt-5 flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới Nonce thủ công ngay
          </button>
        </div>

        {/* Anti-Fraud Radar & Realtime Analytics (Cols 5) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Realtime Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Đã Check-in</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {currentEvent.checkedInCount} <span className="text-xs text-slate-500 font-normal">/ {currentEvent.registeredCount}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                Tỷ lệ có mặt: {currentEvent.registeredCount > 0 ? Math.round((currentEvent.checkedInCount / currentEvent.registeredCount) * 100) : 0}%
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900 border border-rose-950/60 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Gian lận bị chặn</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">
                {stats?.replayAttemptsBlocked || 0}
              </div>
              <div className="text-[10px] text-slate-400">
                Ngăn chặn điểm danh hộ
              </div>
            </div>
          </div>

          {/* Interactive Fraud Prevention Demonstration */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-rose-950/30 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h4 className="text-sm font-bold text-white">
                Thử nghiệm Cơ chế Chống Gian lận
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              Trong Web2, sinh viên có thể chụp ảnh mã QR gửi qua Zalo/Telegram để bạn bè điểm danh hộ. Với EventPass, Dynamic Nonce sẽ vô hiệu hóa ngay tức khắc!
            </p>

            <button
              onClick={handleSimulateReplayFraud}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Giả lập hành vi dùng mã QR cũ (Replay Attack)
            </button>

            {simulateFraudMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-[11px] text-rose-200">
                ⚠️ <span className="font-bold">Kết quả:</span> {simulateFraudMessage}
              </div>
            )}
          </div>

          {/* Live Audit Log Stream */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Nhật ký Xác thực On-chain Thời gian thực
                </h4>
              </div>
              <button
                onClick={handleExportCSV}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Xuất CSV
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {stats?.recentAuditLogs?.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                    log.type === 'BLOCKED_REPLAY' || log.type === 'BLOCKED_SIGNATURE'
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

    </div>
  );
};
