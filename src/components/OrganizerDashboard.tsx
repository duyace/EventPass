import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Award, 
  ShieldCheck, 
  Radio, 
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound } from '../utils/audio.js';
import type { EventItem, Ticket } from '../types/index.js';

interface OrganizerDashboardProps {
  events: EventItem[];
  tickets: Ticket[];
  onEventCreated: (newEvent: EventItem) => void;
  onOpenLiveQR: (eventId: string) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  events,
  tickets,
  onEventCreated,
  onOpenLiveQR
}) => {
  const { wallet } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState(wallet.name || 'Khoa Khoa Học & Kỹ Thuật Máy Tính');
  const [category, setCategory] = useState<'Tech' | 'Academic' | 'Hackathon' | 'Workshop' | 'Conference'>('Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Hội trường A5 - ĐH Bách Khoa');
  const [maxAttendees, setMaxAttendees] = useState(150);
  const [price, setPrice] = useState(0);
  const [sbtTitle, setSbtTitle] = useState('Certificate of Attendance & Academic Merit');
  const [sbtSkills, setSbtSkills] = useState('Web3, Decentralized Systems, Smart Contracts');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const skillsArray = sbtSkills.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          organizer,
          category,
          description,
          location,
          maxAttendees: Number(maxAttendees),
          price: Number(price),
          sbtTitle,
          skillsGranted: skillsArray.length > 0 ? skillsArray : ['Web3 Builder', 'Verified Participant']
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo sự kiện');
      }

      playSuccessSound();
      onEventCreated(data.event);
      setShowCreateModal(false);
      // Reset
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
              Bảng điều khiển Quản trị (Organizer Dashboard)
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Quản lý Sự kiện & Cấu hình Phát hành SBT
          </h2>
          <p className="text-xs text-slate-400">
            Tạo sự kiện mới, quản lý danh sách đăng ký và giám sát quy trình cấp chứng nhận On-chain.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Tạo sự kiện & Cấu hình SBT mới
        </button>
      </div>

      {/* Events Managed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((ev) => {
          const evTickets = tickets.filter(t => t.eventId === ev.id);
          const checkedInTickets = evTickets.filter(t => t.status === 'checked_in');
          const checkInRate = evTickets.length > 0 ? Math.round((checkedInTickets.length / evTickets.length) * 100) : 0;

          return (
            <div 
              key={ev.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    {ev.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {ev.registeredCount}/{ev.maxAttendees} vé
                  </span>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2">
                  {ev.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {ev.description}
                </p>

                {/* Progress bar */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Đã điểm danh:</span>
                    <span className="text-emerald-400 font-bold">{ev.checkedInCount} ({checkInRate}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${checkInRate}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span className="truncate">{ev.sbtCertificate.title}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => onOpenLiveQR(ev.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-300" />
                  Mở màn hình Live QR Máy Chiếu
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 text-white my-8">
            <h3 className="text-lg font-bold text-white mb-1">Tạo sự kiện & Thiết lập chứng nhận SBT</h3>
            <p className="text-xs text-slate-400 mb-5">Hệ thống sẽ chuẩn bị Smart Contract và phôi chứng nhận IPFS.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên sự kiện / Workshop:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Hội thảo Công nghệ Blockchain & AI 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Đơn vị tổ chức:</label>
                  <input
                    type="text"
                    required
                    value={organizer}
                    onChange={e => setOrganizer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Thể loại:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Academic">Academic</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả ngắn:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả nội dung chương trình..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Địa điểm:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Số lượng vé tối đa:</label>
                  <input
                    type="number"
                    value={maxAttendees}
                    onChange={e => setMaxAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* SBT Config */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Award className="w-4 h-4" />
                  Cấu hình Chứng nhận Soulbound Token (ERC-5192)
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tên văn bằng chứng nhận:</label>
                  <input
                    type="text"
                    value={sbtTitle}
                    onChange={e => setSbtTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Kỹ năng được công nhận (phân cách dấu phẩy):</label>
                  <input
                    type="text"
                    value={sbtSkills}
                    onChange={e => setSbtSkills(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-fuchsia-500/20 transition-all"
                >
                  {loading ? 'Đang tạo sự kiện...' : 'Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
