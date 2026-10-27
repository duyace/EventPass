import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Lock, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Printer, 
  CheckCircle,
  Database
} from 'lucide-react';
import type { SoulboundToken } from '../types/index.js';

interface SBTDetailModalProps {
  token: SoulboundToken | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (token: SoulboundToken) => void;
}

export const SBTDetailModal: React.FC<SBTDetailModalProps> = ({
  token,
  isOpen,
  onClose,
  onVerify
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'metadata'>('visual');

  if (!isOpen || !token) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const ipfsMetadataJson = {
    name: `${token.certificateType} - #${token.tokenId}`,
    description: `Chứng nhận tham gia sự kiện ${token.eventTitle} được xác thực bằng mật mã học và đúc dưới dạng Soulbound Token không thể chuyển nhượng (ERC-5192).`,
    image: token.ipfsImageUri,
    external_url: `https://eventpass.edu.vn/verify/${token.tokenId}`,
    attributes: [
      { trait_type: "Recipient Name", value: token.recipientName },
      { trait_type: "Student ID", value: token.recipientStudentId || "N/A" },
      { trait_type: "Issuer", value: token.issuerName },
      { trait_type: "Event ID", value: token.eventId },
      { trait_type: "ERC Standard", value: "ERC-5192" },
      { trait_type: "Locked", value: true },
      { trait_type: "Block Number", value: token.blockNumber },
      { trait_type: "Issue Date", value: token.issueDate },
      ...token.skills.map(sk => ({ trait_type: "Skill", value: sk }))
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden text-white my-8">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Chứng nhận Soulbound Token</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                  {token.tokenId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Tiêu chuẩn ERC-5192 • Gắn liền ví cá nhân</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-6 pt-4 border-b border-slate-800 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('visual')}
            className={`pb-3 transition-colors border-b-2 ${
              activeTab === 'visual'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Văn bằng chứng nhận (Certificate)
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'metadata'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            IPFS Metadata JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {activeTab === 'visual' ? (
            /* Visual Certificate */
            <div className="space-y-4">
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 shadow-xl text-center space-y-4 overflow-hidden">
                {/* Decorative border corners */}
                <div className="absolute top-2 left-2 text-[10px] font-mono text-amber-400/60">✦ ✦ ✦</div>
                <div className="absolute top-2 right-2 text-[10px] font-mono text-amber-400/60">✦ ✦ ✦</div>
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-amber-400/60">✦ ✦ ✦</div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-amber-400/60">✦ ✦ ✦</div>

                <div className="text-[11px] font-bold text-amber-300 tracking-widest uppercase">
                  VIETNAM WEB3 ACADEMIC REGISTRY
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white">
                  GIẤY CHỨNG NHẬN ĐIỆN TỬ
                </h3>

                <p className="text-xs text-slate-400 italic">
                  Chứng nhận xác thực quyền sở hữu học thuật không thể chuyển nhượng (SBT)
                </p>

                <div className="py-2">
                  <div className="text-xs text-slate-400">Chứng nhận được trao cho:</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {token.recipientName}
                  </div>
                  {token.recipientStudentId && (
                    <div className="text-xs font-mono text-cyan-400 font-bold">
                      Mã số sinh viên: {token.recipientStudentId}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto">
                  Đã hoàn thành xuất sắc điểm danh thực tế và tham gia sự kiện: <br/>
                  <span className="font-bold text-amber-300">{token.eventTitle}</span>
                </div>

                {/* Issuer seal */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-800/80 text-left text-xs">
                  <div>
                    <div className="text-[11px] text-slate-400">Đơn vị cấp phát:</div>
                    <div className="font-bold text-slate-200">{token.issuerName}</div>
                    <div className="text-[10px] font-mono text-slate-500">Contract: {token.issuerAddress.slice(0, 10)}...</div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      LOCKED ERC-5192
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical On-chain Spec */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Block Number:</span>
                  <span className="text-cyan-400 font-bold">#{token.blockNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Transaction Hash:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 truncate max-w-[200px]">{token.transactionHash}</span>
                    <button onClick={() => handleCopy(token.transactionHash, 'tx')} className="text-slate-500 hover:text-white">
                      {copied === 'tx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">IPFS URI:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300 truncate max-w-[200px]">{token.ipfsMetadataUri}</span>
                    <button onClick={() => handleCopy(token.ipfsMetadataUri, 'ipfs')} className="text-slate-500 hover:text-white">
                      {copied === 'ipfs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mã chữ ký thẩm quyền:</span>
                  <span className="text-indigo-400 truncate max-w-[200px]">{token.verificationSignature.slice(0, 18)}...</span>
                </div>
              </div>
            </div>
          ) : (
            /* IPFS Metadata JSON */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Chuẩn Metadata Token ERC-721 / ERC-5192 (IPFS Pinata Ready)
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(ipfsMetadataJson, null, 2), 'json')}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                >
                  {copied === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Sao chép JSON
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {JSON.stringify(ipfsMetadataJson, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            In chứng nhận
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onClose();
                onVerify(token);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Kiểm tra tính hợp lệ On-chain
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
