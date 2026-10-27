import React, { useState } from 'react';
import { 
  X, 
  Ticket as TicketIcon, 
  ShieldCheck, 
  User, 
  Mail, 
  Hash, 
  Wallet, 
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound } from '../utils/audio.js';
import type { EventItem, Ticket } from '../types/index.js';

interface TicketRegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (newTicket: Ticket) => void;
}

export const TicketRegistrationModal: React.FC<TicketRegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onTicketCreated
}) => {
  const { wallet } = useWallet();

  const [name, setName] = useState(wallet.name || 'Nguyễn Đình Tấn Duy');
  const [email, setEmail] = useState(wallet.email || 'duyndtk8cpascal@gmail.com');
  const [studentId, setStudentId] = useState(wallet.studentId || '24100484');
  const [tierName, setTierName] = useState('Standard Pass (Sinh viên)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  if (!isOpen || !event) return null;

  const handleUseDuyPreset = () => {
    setName('Nguyễn Đình Tấn Duy');
    setEmail('duyndtk8cpascal@gmail.com');
    setStudentId('24100484');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: wallet.address,
          ownerName: name,
          ownerEmail: email,
          ownerStudentId: studentId,
          tierName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Đăng ký vé thất bại');
      }

      playSuccessSound();
      setCreatedTicket(data.ticket);
      onTicketCreated(data.ticket);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi đăng ký vé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <TicketIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Đăng ký vé sự kiện trực tuyến</h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{event.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdTicket ? (
          /* Success Ticket View */
          <div className="my-5 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Đăng ký vé thành công!</h4>
              <p className="text-xs text-slate-400">
                Vé điện tử EventPass đã được gắn vào ví Web3 của bạn.
              </p>
            </div>

            {/* Render Ticket stub */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 text-left space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Mã vé định danh:</div>
                  <div className="text-sm font-mono font-bold text-white">{createdTicket.ticketCode}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  Hợp lệ (Active)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Người tham gia:</div>
                  <div className="font-semibold text-slate-200">{createdTicket.ownerName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Mã số SV:</div>
                  <div className="font-semibold text-slate-200">{createdTicket.ownerStudentId || 'N/A'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center font-mono">
                <span>Ví: {createdTicket.ownerAddress.slice(0, 8)}...{createdTicket.ownerAddress.slice(-6)}</span>
                <span className="text-cyan-400">{createdTicket.tierName}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                Hoàn tất & Xem trong "Vé của tôi"
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="my-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick pre-fill button */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <span className="text-slate-400">Sinh viên đề tài:</span>
              <button
                type="button"
                onClick={handleUseDuyPreset}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Điền nhanh thông tin Nguyễn Đình Tấn Duy
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên người tham gia:
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Nguyễn Đình Tấn Duy"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mã số sinh viên (MSSV):
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="VD: 24100484"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email nhận thông báo:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@student.edu.vn"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hạng vé (Pass Tier):
                </label>
                <select
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white focus:outline-none"
                >
                  <option value="Standard Pass (Sinh viên)">Standard Pass (Dành cho sinh viên - 0đ)</option>
                  <option value="Builder / Hacker Pass">Builder / Hacker Pass (Truy cập workshop đặc biệt)</option>
                  <option value="VIP Researcher Pass">VIP Researcher Pass (Bao gồm tài liệu lưu trữ)</option>
                </select>
              </div>

              {/* Wallet binding indicator */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                  Gắn vé vào địa chỉ Ví Web3:
                </div>
                <div className="font-mono text-cyan-300 text-[11px] truncate">
                  {wallet.address}
                </div>
                <p className="text-[10px] text-slate-500">
                  Khi check-in, bạn cần dùng ví này để ký xác thực và nhận chứng nhận Soulbound Token (SBT).
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Đang xác thực On-chain...' : 'Xác nhận Đăng ký vé'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
