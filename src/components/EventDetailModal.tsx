import React from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Ticket, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import type { EventItem } from '../types/index.js';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (event: EventItem) => void;
  onCheckIn: (event: EventItem) => void;
  hasTicket: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onCheckIn,
  hasTicket
}) => {
  if (!isOpen || !event) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white my-8">
        
        {/* Banner with Close button */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-950">
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/60" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md uppercase">
              {event.category}
            </span>
            <h2 className="text-2xl font-black text-white mt-2 drop-shadow-md">
              {event.title}
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Đơn vị tổ chức: <span className="text-cyan-400 font-semibold">{event.organizer}</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key Metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Thời gian diễn ra</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{formatDate(event.startDate)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <MapPin className="w-5 h-5 text-indigo-400 mt-0.5" />
              <div>
                <div className="text-[11px] font-semibold text-slate-400">Địa điểm tổ chức</div>
                <div className="text-xs font-medium text-slate-200 mt-0.5">{event.location}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Giới thiệu sự kiện
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {event.detailedDescription || event.description}
            </p>
          </div>

          {/* Soulbound Token Specification */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Chứng nhận Soulbound Token (SBT)</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ERC-5192 Non-transferable
              </span>
            </div>

            <div className="text-xs text-slate-300">
              <span className="font-semibold text-amber-300">{event.sbtCertificate.title}</span>: {event.sbtCertificate.description}
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-400 font-semibold">Điều kiện cấp tự động on-chain:</div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{event.sbtCertificate.criteria}</span>
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="text-[11px] text-slate-400 font-semibold mb-1.5">
                Kỹ năng on-chain được chứng nhận:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.sbtCertificate.skillsGranted.map((sk, idx) => (
                  <span 
                    key={idx}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300"
                  >
                    #{sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Web3 Anti-fraud Guarantee badge */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <p>
              Sự kiện này được bảo vệ bởi công nghệ <span className="font-bold">EventPass Dynamic QR</span> & chữ ký mật mã học Web3, loại bỏ hoàn toàn việc điểm danh hộ và cấp chứng chỉ giả mạo.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Giá vé tham dự:</div>
            <div className="text-lg font-bold text-white">
              {event.price === 0 ? 'Miễn phí (Free Pass)' : `${event.price.toLocaleString('vi-VN')} ₫`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>

            {hasTicket ? (
              <button
                onClick={() => {
                  onClose();
                  onCheckIn(event);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Điểm danh vé này
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegister(event);
                }}
                disabled={event.status === 'completed'}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Nhận vé ngay
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
