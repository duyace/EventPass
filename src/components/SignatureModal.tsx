import React from 'react';
import { ShieldCheck, Key, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';

export const SignatureModal: React.FC = () => {
  const { 
    isSignModalOpen, 
    pendingSignMessage, 
    confirmSign, 
    rejectSign, 
    wallet 
  } = useWallet();

  if (!isSignModalOpen || !pendingSignMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Key className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Yêu cầu ký số Web3
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                EIP-712
              </span>
            </h3>
            <p className="text-xs text-slate-400">Xác thực quyền điểm danh & Nhận SBT</p>
          </div>
        </div>

        {/* Sign details */}
        <div className="my-4 space-y-3">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Ví thực hiện:</span>
              <span className="font-mono text-cyan-300 font-semibold">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Định danh chủ sở hữu:</span>
              <span className="text-slate-200 font-semibold">{wallet.name} {wallet.studentId ? `(${wallet.studentId})` : ''}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Phí Gas:</span>
              <span className="text-emerald-400 font-semibold">0 POL (Tài trợ bởi Ban Tổ Chức)</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Dữ liệu thông điệp cần ký (Plaintext Message):
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed border-l-2 border-l-cyan-500">
              {pendingSignMessage}
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
            <p>
              Chữ ký này chứng minh bạn đang có mặt tại sự kiện và sở hữu mã vé hợp lệ mà không làm lộ khóa bí mật (Private Key).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={rejectSign}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Từ chối ký
          </button>
          <button
            onClick={confirmSign}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Ký số & Gửi lên Chain
          </button>
        </div>

      </div>
    </div>
  );
};
