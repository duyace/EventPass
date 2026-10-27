import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  Lock, 
  ExternalLink, 
  Database,
  Calendar,
  Building,
  User,
  Sparkles
} from 'lucide-react';
import type { VerificationResult, SoulboundToken } from '../types/index.js';

interface PublicVerifierProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const PublicVerifier: React.FC<PublicVerifierProps> = ({
  initialQuery,
  onClearInitialQuery
}) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleVerify(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  const handleVerify = async (searchTarget?: string) => {
    const q = (searchTarget || query).trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(q)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        valid: false,
        message: 'Lỗi kết nối tới node Blockchain EventPass',
        verificationTimestamp: new Date().toISOString(),
        smartContractAddress: '0x89C71fE44bA87498c19Ce87654D9c6b73aA257e1',
        ercStandard: 'ERC-5192 (Soulbound Token)',
        transferable: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSearch = (preset: string) => {
    setQuery(preset);
    handleVerify(preset);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Search className="w-4 h-4" />
          Cổng Xác Minh Công Khai (Public Verification Portal)
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Tra cứu Tính Chính Chủ & Chống Giả Mạo
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Dành cho Nhà tuyển dụng, Trường học và Bên thứ ba kiểm tra tính xác thực của chứng chỉ Soulbound Token trực tiếp trên Blockchain mà không cần thông qua trung gian.
        </p>
      </div>

      {/* Search Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập Token ID (VD: SBT-001092) hoặc Transaction Hash..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <ShieldCheck className="w-5 h-5" />
            {loading ? 'Đang truy vấn on-chain...' : 'Xác thực ngay'}
          </button>
        </form>

        {/* Quick query presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-slate-500">Mẫu tra cứu nhanh:</span>
          <button
            onClick={() => handlePresetSearch('SBT-001092')}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-mono transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            SBT-001092 (Nguyễn Đình Tấn Duy)
          </button>
          <button
            onClick={() => handlePresetSearch('0x9d4a6e8b7c5f3e2a1b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a')}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono transition-colors"
          >
            Tx Hash mẫu
          </button>
        </div>
      </div>

      {/* Verification Result Display */}
      {searched && (
        <div className="space-y-6 animate-fadeIn">
          {result?.valid && result.token ? (
            /* Valid Verified Report */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/50 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-emerald-400">
                        CHỨNG CHỈ HỢP LỆ 100%
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        VERIFIED ON-CHAIN
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Đã xác thực chữ ký mật mã học & trạng thái khóa ERC-5192
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-400 font-mono">
                  <div>Thời gian xác thực:</div>
                  <div className="text-slate-200">
                    {new Date(result.verificationTimestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Certificate Details */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      TOKEN ID: #{result.token.tokenId}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {result.token.certificateType}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Sự kiện: <span className="font-semibold text-cyan-400">{result.token.eventTitle}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Người thụ hưởng:
                      </span>
                      <span className="font-bold text-white">
                        {result.token.recipientName} {result.token.recipientStudentId ? `(MSSV: ${result.token.recipientStudentId})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        Đơn vị cấp:
                      </span>
                      <span className="text-slate-200">{result.token.issuerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Ngày phát hành:
                      </span>
                      <span className="text-slate-300">
                        {new Date(result.token.issueDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Skills Granted */}
                  {result.token.skills && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400">
                        Kỹ năng được công nhận:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.token.skills.map((sk, idx) => (
                          <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/20">
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Cryptographic Proofs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-400" />
                    Bằng chứng Mật mã học (Cryptographic Proofs)
                  </h4>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-[11px]">
                    <div>
                      <div className="text-slate-500 text-[10px]">TIÊU CHUẨN TOKEN</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <Lock className="w-3.5 h-3.5" />
                        ERC-5192 (Soulbound Token - Không thể chuyển nhượng)
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">SMART CONTRACT ADDRESS</div>
                      <div className="text-slate-200 truncate">{result.smartContractAddress}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">TRANSACTION HASH (EVM)</div>
                      <div className="text-cyan-300 truncate">{result.token.transactionHash}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">IPFS METADATA STORAGE</div>
                      <div className="text-slate-300 truncate">{result.token.ipfsMetadataUri}</div>
                    </div>

                    <div>
                      <div className="text-slate-500 text-[10px]">CHỮ KÝ ĐIỆN TỬ CỦA TỔ CHỨC CẤP</div>
                      <div className="text-indigo-400 truncate">{result.token.verificationSignature}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300">
                    <span className="font-bold">Đánh giá tuyển dụng:</span> Ứng viên này đã thực sự có mặt tại sự kiện và hoàn thành các tiêu chí học thuật. Chứng chỉ này không thể bị sửa đổi hoặc làm giả bằng Photoshop.
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Invalid / Not Found Report */
            <div className="p-8 rounded-3xl bg-slate-900 border border-rose-900/60 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Không tìm thấy chứng chỉ!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {result?.message || 'Mã chứng chỉ hoặc Tx Hash không tồn tại trên sổ cái blockchain EventPass. Có thể đây là chứng chỉ giả mạo.'}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
