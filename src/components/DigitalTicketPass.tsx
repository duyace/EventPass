import React, { useState } from 'react';
import { 
  Ticket as TicketIcon, 
  QrCode, 
  CheckCircle, 
  Clock, 
  Copy, 
  Check, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import type { Ticket } from '../types/index.js';

interface DigitalTicketPassProps {
  ticket: Ticket;
  onGoToCheckIn: (ticket: Ticket) => void;
}

export const DigitalTicketPass: React.FC<DigitalTicketPassProps> = ({
  ticket,
  onGoToCheckIn
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCheckedIn = ticket.status === 'checked_in';

  return (
    <div className="relative group w-full max-w-sm mx-auto bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10">
      
      {/* Top Header Card */}
      <div className="p-5 pb-4 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-b border-dashed border-slate-700/80 relative">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <TicketIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              EventPass Ticket
            </span>
          </div>

          {isCheckedIn ? (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle className="w-3.5 h-3.5" />
              Đã Check-in & Có SBT
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Clock className="w-3.5 h-3.5" />
              Sẵn sàng Check-in
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-white line-clamp-2 leading-snug">
          {ticket.eventTitle}
        </h4>

        <div className="mt-2 text-xs text-cyan-400 font-semibold">
          {ticket.tierName}
        </div>
      </div>

      {/* Ticket Punch Notches (Visual cut-out circles for realistic physical ticket feel) */}
      <div className="relative flex items-center justify-between px-2 bg-slate-900 -my-3 z-10 pointer-events-none">
        <div className="w-5 h-5 -ml-4 rounded-full bg-slate-950 border-r border-slate-800" />
        <div className="w-full border-t border-dashed border-slate-700 mx-2" />
        <div className="w-5 h-5 -mr-4 rounded-full bg-slate-950 border-l border-slate-800" />
      </div>

      {/* Bottom Attendee Info & Actions */}
      <div className="p-5 pt-4 space-y-4 bg-slate-900/90">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Họ tên:</div>
            <div className="font-bold text-white truncate">{ticket.ownerName}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">MSSV:</div>
            <div className="font-bold text-white font-mono">{ticket.ownerStudentId || 'N/A'}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Ngày đăng ký:</div>
            <div className="text-slate-300 text-[11px]">
              {new Date(ticket.purchaseDate).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Ví sở hữu:</div>
            <div className="font-mono text-cyan-400 text-[11px]">
              {ticket.ownerAddress.slice(0, 6)}...{ticket.ownerAddress.slice(-4)}
            </div>
          </div>
        </div>

        {/* Ticket Code Box */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Mã vé tham dự:</div>
            <div className="font-mono text-xs font-bold text-cyan-300">{ticket.ticketCode}</div>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Sao chép mã vé"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Button */}
        {isCheckedIn ? (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
            <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Chứng chỉ: {ticket.sbtTokenId}
            </span>
          </div>
        ) : (
          <button
            onClick={() => onGoToCheckIn(ticket)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Điểm danh với mã này
          </button>
        )}
      </div>

    </div>
  );
};
