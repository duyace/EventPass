import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Copy, 
  Check, 
  User, 
  ShieldAlert, 
  RefreshCw, 
  Key, 
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { useWallet } from '../context/WalletContext.js';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { wallet, connectWallet, switchRole, openAuthModal } = useWallet();
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectMetaMask = async () => {
    const anyWindow = window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } };
    if (anyWindow.ethereum) {
      try {
        const accounts = await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          connectWallet('custom', accounts[0]);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Trình duyệt chưa cài MetaMask extension! Đang tiếp tục sử dụng Ví Web3 Simulator tiêu chuẩn cho sinh viên.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ví Web3 & Định danh số (DID)</h3>
              <p className="text-xs text-slate-400">Quản lý Private Key & Quyền điểm danh</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Account Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-400">Đã kết nối On-chain</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {wallet.network}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="text-base font-bold text-white">{wallet.name}</div>
              {wallet.studentId && (
                <div className="text-xs text-cyan-400 font-mono">
                  MSSV: {wallet.studentId}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Số dư Testnet</div>
              <div className="text-sm font-mono font-bold text-slate-200">
                {wallet.balanceEth} POL / ETH
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400 truncate max-w-[280px]">
              {wallet.address}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
            </button>
          </div>
        </div>

        {/* Switch Persona / Account Presets */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Chọn tài khoản mô phỏng (Persona):
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                connectWallet('duy');
                switchRole('student');
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                wallet.studentId === '24100484'
                  ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">Sinh viên Duy</span>
              </div>
              <p className="text-[11px] text-slate-400">MSSV: 24100484</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Role: Thí sinh / Attendee
              </span>
            </button>

            <button
              onClick={() => {
                connectWallet('organizer');
                switchRole('organizer');
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                wallet.role === 'organizer'
                  ? 'border-fuchsia-500 bg-fuchsia-950/30 shadow-md shadow-fuchsia-500/10'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-bold text-white">Ban Tổ Chức (BTC)</span>
              </div>
              <p className="text-[11px] text-slate-400">Smart Contract Deployer</p>
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300">
                Role: Issuer / Admin
              </span>
            </button>
          </div>
        </div>

        {/* Real MetaMask Connect & Account Abstraction note */}
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleConnectMetaMask}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-colors"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="w-4 h-4" 
              />
              Kết nối ví MetaMask thật
            </button>

            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              ERC-4337 Ready
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Định danh phi tập trung & Kháng kiểm duyệt:
            </div>
            <p>
              Ví Web3 chứa mã định danh tự chủ (DID) của bạn. Mọi chứng nhận SBT sau khi được cấp sẽ thuộc sở hữu của bạn vĩnh viễn, không thể bị thu hồi đơn phương hoặc chỉnh sửa bởi bất kỳ máy chủ nào.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              onClose();
              openAuthModal(wallet.role === 'organizer' ? 'btc-login' : 'student-login');
            }}
            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Đăng nhập tài khoản khác
          </button>
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
