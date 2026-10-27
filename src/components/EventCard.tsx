import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  Ticket, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { EventItem } from '../types/index.js';

interface EventCardProps {
  event: EventItem;
  onSelectEvent: (event: EventItem) => void;
  onRegisterTicket: (event: EventItem) => void;
  onGoToCheckIn: (event: EventItem) => void;
  hasTicket: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onSelectEvent,
  onRegisterTicket,
  onGoToCheckIn,
  hasTicket
}) => {
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.maxAttendees) * 100));

  const formatShortDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const categoryBadgeColors: Record<string, string> = {
    Tech: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    Hackathon: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    Academic: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    Workshop: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Conference: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Community: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between hover:shadow-cyan-500/10 hover:-translate-y-1">
      
      {/* Banner & Badges */}
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-slate-950">
          <img 
            src={event.bannerUrl} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${categoryBadgeColors[event.category] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {event.category}
            </span>
            {event.status === 'ongoing' && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Đang diễn ra
              </span>
            )}
            {event.status === 'completed' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Đã kết thúc
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-950/80 text-white backdrop-blur-md border border-slate-700/60 shadow">
              {event.price === 0 ? 'Miễn phí' : `${event.price.toLocaleString('vi-VN')} ₫`}
            </span>
          </div>

          {/* Ticket owned indicator */}
          {hasTicket && (
            <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
              <Ticket className="w-3.5 h-3.5 text-indigo-400" />
              Bạn đã có vé
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <h3 
              onClick={() => onSelectEvent(event)}
              className="text-lg font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2 cursor-pointer"
            >
              {event.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1">
              Bởi {event.organizer}
            </p>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Details (Date & Location) */}
          <div className="space-y-2 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{formatShortDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Soulbound Token reward preview */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Phần thưởng tham gia</div>
                <div className="text-xs font-bold text-amber-300 truncate max-w-[170px]">
                  {event.sbtCertificate.title}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              SBT
            </span>
          </div>

          {/* Capacity bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                Đăng ký: {event.registeredCount}/{event.maxAttendees}
              </span>
              <span>{percentFilled}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-5 sm:p-6 pt-0 flex items-center gap-2">
        <button
          onClick={() => onSelectEvent(event)}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          Chi tiết
        </button>

        {hasTicket ? (
          <button
            onClick={() => onGoToCheckIn(event)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Điểm danh ngay
          </button>
        ) : (
          <button
            onClick={() => onRegisterTicket(event)}
            disabled={event.status === 'completed' || event.registeredCount >= event.maxAttendees}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5" />
            Đăng ký vé
          </button>
        )}
      </div>

    </div>
  );
};
