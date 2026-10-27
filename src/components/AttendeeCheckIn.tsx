import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  Key, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Ticket as TicketIcon,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';
import { playSuccessSound, playBlockSound } from '../utils/audio.js';
import type { EventItem, Ticket, SoulboundToken } from '../types/index.js';

interface AttendeeCheckInProps {
  events: EventItem[];
  tickets: Ticket[];
  onCheckInSuccess: (token: SoulboundToken, updatedTicket: Ticket) => void;
  onGoToSBT: (tokenId: string) => void;
  initialSelectedTicketId?: string | null;
}

export const AttendeeCheckIn: React.FC<AttendeeCheckInProps> = ({
  events,
  tickets,
  onCheckInSuccess,
  onGoToSBT,
  initialSelectedTicketId
}) => {
  const { wallet, signMessage } = useWallet();

  const userTickets = tickets.filter(
    t => t.ownerAddress.toLowerCase() === wallet.address.toLowerCase()
  );

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialSelectedTicketId || (userTickets.length > 0 ? userTickets[0].id : '')
  );

  const [dynamicNonce, setDynamicNonce] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mintedSBT, setMintedSBT] = useState<SoulboundToken | null>(null);

  // Synchronize when tickets load
  useEffect(() => {
    if (!selectedTicketId && userTickets.length > 0) {
      setSelectedTicketId(userTickets[0].id);
    }
  }, [userTickets, selectedTicketId]);

  const selectedTicket = userTickets.find(t => t.id === selectedTicketId) || userTickets[0];
  const relatedEvent = events.find(e => e.id === selectedTicket?.eventId);

  // Quick helper to fetch the latest dynamic token from the server to simulate scanning the screen
  const handleAutoSyncFromProjector = async () => {
    if (!relatedEvent) return;
    try {
      const res = await fetch(`/api/events/${relatedEvent.id}/dynamic-qr`);
      const data = await res.json();
      if (data.success && data.dynamicToken) {
        setDynamicNonce(data.dynamicToken.nonce);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePerformCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !relatedEvent) {
      setErrorMessage('Vui lòng chọn một vé tham dự hợp lệ');
      return;
    }

    if (!dynamicNonce) {
      setErrorMessage('Vui lòng nhập hoặc đồng bộ mã Nonce từ màn hình máy chiếu');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. Prepare EIP-712 / Web3 message to sign
      const messageToSign = `[EventPass Check-In Verification]
Event: ${relatedEvent.title} (ID: ${relatedEvent.id})
Ticket Code: ${selectedTicket.ticketCode}
Dynamic Nonce: ${dynamicNonce}
Student ID: ${selectedTicket.ownerStudentId || 'N/A'}
Wallet: ${wallet.address}
Timestamp: ${new Date().toISOString()}

I hereby verify my physical presence at the event and claim my ERC-5192 Soulbound Token.`;

      // 2. Prompt user to cryptographically sign via wallet
      const signature = await signMessage(messageToSign);

      // 3. Post to backend check-in endpoint
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: relatedEvent.id,
          walletAddress: wallet.address,
          nonce: dynamicNonce,
          signature,
          studentId: selectedTicket.ownerStudentId,
          attendeeName: selectedTicket.ownerName
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        playBlockSound();
        throw new Error(data.error || 'Check-in thất bại');
      }

      // 4. Success celebration
      playSuccessSound();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setMintedSBT(data.soulboundToken);
      onCheckInSuccess(data.soulboundToken, data.ticket);

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xác thực điểm danh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Xác thực Chữ ký Mật mã học & Đúc SBT Tức thì
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Điểm danh Sự kiện & Ký số Ví Web3
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Quét mã Dynamic QR đang chiếu tại hội trường và thực hiện ký số qua ví cá nhân để chứng minh sự hiện diện thực tế.
        </p>
      </div>

      {mintedSBT ? (
        /* Minted SBT Success Card */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-2xl space-y-6 animate-fadeIn text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-fuchsia-600 p-0.5 shadow-xl shadow-amber-400/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ERC-5192 SOULBOUND TOKEN (NON-TRANSFERABLE)
            </span>
            <h3 className="text-2xl font-black text-white pt-2">
              Điểm danh & Mint SBT thành công!
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Chứng nhận số đã được phát hành và gắn chặt vĩnh viễn vào địa chỉ ví cá nhân của bạn, không thể chuyển nhượng hoặc làm giả.
            </p>
          </div>

          {/* Certificate Snapshot */}
          <div className="max-w-lg mx-auto p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-slate-400">Token ID:</span>
              <span className="text-amber-400 font-bold text-sm">{mintedSBT.tokenId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Chủ sở hữu:</span>
              <span className="text-white font-sans font-bold">{mintedSBT.recipientName} ({mintedSBT.recipientStudentId})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Khối Block:</span>
              <span className="text-cyan-300">#{mintedSBT.blockNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Tx Hash:</span>
              <span className="text-indigo-400 truncate max-w-[220px]">{mintedSBT.transactionHash}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">IPFS Metadata:</span>
              <span className="text-slate-300 truncate max-w-[220px]">{mintedSBT.ipfsMetadataUri}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-emerald-400">
              <span>Trạng thái SBT:</span>
              <span className="font-bold">🔒 LOCKED (Gắn liền định danh)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={() => onGoToSBT(mintedSBT.tokenId)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Xem chứng nhận trong Ví SBT
            </button>
            <button
              onClick={() => {
                setMintedSBT(null);
                setDynamicNonce('');
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Điểm danh vé khác
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">Cảnh báo bảo mật / Lỗi xác thực</div>
                <div className="mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}

          {userTickets.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <TicketIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">Bạn chưa có vé tham dự nào</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Vui lòng chuyển qua mục "Sự kiện & Vé" để đăng ký vé tham dự trước khi thực hiện điểm danh.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePerformCheckIn} className="space-y-6">
              
              {/* Step 1: Select Ticket */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
                  Chọn vé cần điểm danh:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userTickets.map(t => {
                    const isSelected = t.id === selectedTicket?.id;
                    const isCheckedIn = t.status === 'checked_in';

                    return (
                      <div
                        key={t.id}
                        onClick={() => !isCheckedIn && setSelectedTicketId(t.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isCheckedIn 
                            ? 'opacity-60 bg-slate-950/40 border-slate-800 cursor-not-allowed'
                            : isSelected
                            ? 'border-cyan-400 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                            : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[11px] font-mono text-cyan-400 font-bold">{t.ticketCode}</span>
                          {isCheckedIn ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              Đã Check-in
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                              Chưa điểm danh
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-white truncate">{t.eventTitle}</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Người nhận: {t.ownerName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Dynamic QR Nonce */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">2</span>
                    Nhập mã Dynamic Nonce (từ màn hình máy chiếu BTC):
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSyncFromProjector}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Quét nhanh mã đang chiếu tại hội trường
                  </button>
                </div>

                <div className="relative">
                  <QrCode className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={dynamicNonce}
                    onChange={(e) => setDynamicNonce(e.target.value.trim())}
                    placeholder="VD: 7a8f9c0e2b (hoặc bấm Quét nhanh phía trên)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/20 border border-amber-800/30 p-2 rounded-xl">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    <strong>Cơ chế bảo mật Dùng 1 Lần:</strong> Mã QR trên màn hình BTC sẽ tự động tiêu hủy và làm mới ngay khi có 1 người quét thành công (hoặc sau 10s) để chống chụp ảnh gửi check-in hộ.
                  </span>
                </div>
              </div>

              {/* Step 3: Web3 Signer info */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Ví Web3 thực hiện ký số:
                </div>
                <div className="font-mono text-cyan-300 text-[11px]">
                  {wallet.address} ({wallet.name})
                </div>
                <div className="text-[11px] text-slate-400">
                  Sau khi bấm nút, cửa sổ ví sẽ yêu cầu bạn ký thông điệp EIP-712 để cấp quyền đúc SBT.
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || selectedTicket?.status === 'checked_in'}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {loading ? 'Đang thực hiện Ký số & Mint SBT...' : 'Xác thực Điểm danh & Nhận SBT On-chain'}
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  );
};
