🎟️ EventPass - Web3 Anti-Fraud Check-In & Ticketing Platform

EventPass là hệ thống quản lý và phát hành vé sự kiện minh bạch dựa trên công nghệ Blockchain (ERC-721 / ERC-5192 Soulbound Tokens) kết hợp cơ chế Dynamic QR Code (HMAC-SHA256) nhằm triệt tiêu hoàn toàn nạn vé giả, bán chui, và chụp màn hình vé tại cổng check-in.

👨‍🎓 Thông Tin Đồ Án

Trường: Đại học Phenikaa

Khoa: Công nghệ Thông tin

Sinh viên thực hiện: Nguyễn Đình Tấn Duy

Mã sinh viên: 24100484

Lớp: K18-CNTT

Giảng viên hướng dẫn: ThS./TS. Võ Thái Anh

✨ Tính Năng Nổi Bật

Vé Dạng NFT / Soulbound Token (SBT):

Mỗi vé được mint dưới dạng Token duy nhất trên blockchain.

Áp dụng chuẩn ERC-5192 (Soulbound) khóa khả năng chuyển nhượng phi pháp khi đã kích hoạt vé.

Cơ Chế Dynamic QR Chống Chụp Màn Hình:

Mã QR tự động xoay và làm mới mỗi 10 giây bằng thuật toán HMAC-SHA256.

Hạn chế tối đa hành vi chụp ảnh màn hình truyền cho người khác.

Cơ Chế Chặn Quét Lặp (Single-Use Nonce & Replay Attack Prevention):

Server lưu trữ lịch sử Nonce vào bộ nhớ tạm (Redis/Memory).

Mỗi mã QR chỉ được phép quét thành công đúng 1 lần, các lần quét tiếp theo sẽ trả về lỗi HTTP 409 Conflict.

Xác Minh Trực Tiếp Trên Trình Duyệt (Verifier App):

Thiết bị soát vé tại cổng truy vấn trực tiếp hợp đồng thông minh (Smart Contract) để kiểm tra trạng thái vé real-time.

🛠️ Công Nghệ Sử Dụng

Frontend: React 19, Vite, TailwindCSS, Lucide Icons, Ethers.js / Wagmi / Viem

Backend Engine: Node.js, TypeScript, tsx, Express, Crypto (HMAC-SHA256)

Blockchain Layer: Solidity, ERC-721, ERC-5192 (Soulbound Non-Transferable Standard)

Tooling & Runtime: Node.js (v18+), npm

🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

Yêu Cầu Tiên Quyết

Đã cài đặt Node.js (Phiên bản v18.0.0 trở lên).

Trình duyệt đã cài ví MetaMask.

Các Bước Cài Đặt

Clone Repository về máy local:

git clone https://github.com/duyace/EventPass.git
cd EventPass


Cài đặt các gói phụ thuộc (Dependencies):
(Lưu ý: Bắt buộc dùng cờ --legacy-peer-deps để giải quyết xung đột phiên bản giữa các gói Web3 và React 19)

npm install --legacy-peer-deps


Cài đặt công cụ chạy TypeScript (nếu chưa cài):

npm install -D tsx --legacy-peer-deps


Khởi chạy ứng dụng ở chế độ Development:

npm run dev


Ứng dụng và server Backend sẽ khởi chạy tại: http://localhost:3000 hoặc cổng được chỉ định trên Terminal.

⚡ Hướng Dẫn Khắc Phục Lỗi Thường Gặp (Troubleshooting)

1. Lỗi 'tsx' is not recognized as an internal or external command

Nguyên nhân: Chưa cài gói tsx vào dự án.

Xử lý: Chạy lệnh npm install -D tsx --legacy-peer-deps hoặc sửa script trong package.json thành "dev": "npx tsx server.ts".

2. Lỗi ERESOLVE unable to resolve dependency tree

Nguyên nhân: Xung đột phiên bản giữa React 19 và các thư viện Web3.

Xử lý: Thêm cờ --legacy-peer-deps vào sau bất kỳ lệnh npm install nào.

3. Lỗi EPERM: operation not permitted

Nguyên nhân: Windows khóa quyền ghi file/thư mục node_modules.

Xử lý:

Đóng VS Code.

Mở lại VS Code với quyền Run as Administrator (Chạy dưới quyền Quản trị viên).

Chạy npm cache clean --force rồi tiến hành npm install --legacy-peer-deps.

📁 Cấu Trúc Dự Án Chính

EventPass/
├── server.ts              # Backend API sinh Dynamic QR & xác thực HMAC-SHA256
├── src/
│   ├── components/
│   │   ├── OrganizerCenter.tsx  # Giao diện Ban tổ chức & Quản lý xoay QR
│   │   ├── Verifier.tsx         # Cổng quét vé & Tra cứu Smart Contract
│   │   └── WalletContext.tsx    # Quản lý kết nối ví Web3 / MetaMask
│   ├── App.tsx                  # Luồng chính ứng dụng
│   └── main.tsx                 # Entry point React
├── package.json                 # Cấu hình dự án & Scripts
└── README.md                    # Tài liệu hướng dẫn

Bản quyền thuộc về Nguyễn Đình Tấn Duy (2026).