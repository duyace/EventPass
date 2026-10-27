import React, { useState } from 'react';
import { 
  Award, 
  Lock, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Share2,
  FileCode2,
  QrCode
} from 'lucide-react';
import type { SoulboundToken } from '../types/index.js';

interface SBTCardProps {
  token: SoulboundToken;
  onVerifyOnChain: (token: SoulboundToken) => void;
  onViewDetails: (token: SoulboundToken) => void;
}

export const SBTCard: React.FC<SBTCardProps> = ({
  token,
  onVerifyOnChain,
  onViewDetails
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(token.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="relative group bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/80 hover:border-amber-400/50 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:shadow-amber-400/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      
      {/* Holographic shimmer beam */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/15 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-400/10 text-amber-300 border border-amber-400/30">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-300 tracking-wider">
              ERC-5192 SOULBOUND
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700">
            {token.tokenId}
          </span>
        </div>

        {/* Certificate Emblem & Title */}
        <div className="my-5 text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-purple-600 p-0.5 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Award className="w-10 h-10 text-amber-300" />
            </div>
            {/* Non-transferable badge */}
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-400">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
              {token.certificateType}
            </h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {token.eventTitle}
            </p>
          </div>
        </div>

        {/* Recipient & Issuer Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">Cấp cho:</span>
            <span className="font-bold text-slate-200">
              {token.recipientName} {token.recipientStudentId ? `(${token.recipientStudentId})` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">Đơn vị cấp:</span>
            <span className="text-cyan-400 truncate max-w-[170px]">{token.issuerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[11px]">Ngày phát hành:</span>
            <span className="text-slate-300">{formatDate(token.issueDate)}</span>
          </div>
        </div>

        {/* Skills Tag Cloud */}
        {token.skills && token.skills.length > 0 && (
          <div className="mt-3.5 space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Kỹ năng on-chain đã chứng nhận:
            </div>
            <div className="flex flex-wrap gap-1">
              {token.skills.map((sk, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-amber-300/90 border border-amber-500/20"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* On-chain Proof Snippet */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate max-w-[200px]">
            Tx: {token.transactionHash.slice(0, 10)}...{token.transactionHash.slice(-6)}
          </span>
          <button
            onClick={handleCopyHash}
            className="text-slate-400 hover:text-white p-1"
            title="Sao chép Tx Hash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center gap-2">
        <button
          onClick={() => onViewDetails(token)}
          className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
          Chi tiết Metadata
        </button>
        <button
          onClick={() => onVerifyOnChain(token)}
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Xác minh On-chain
        </button>
      </div>

    </div>
  );
};
