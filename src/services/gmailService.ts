import { getAccessToken } from './googleAuth.js';

export function createBase64Email(to: string, subject: string, htmlBody: string): string {
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    '',
    htmlBody
  ];
  const email = emailLines.join('\r\n');
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendOtpEmailViaGmail(
  recipientEmail: string,
  recipientName: string,
  otpCode: string,
  explicitToken?: string
): Promise<{ success: boolean; messageId?: string }> {
  const accessToken = explicitToken || (await getAccessToken());
  if (!accessToken) {
    throw new Error('Chưa đăng nhập Google hoặc chưa có quyền gửi email. Vui lòng kết nối tài khoản Google.');
  }

  const subject = `[EventPass] Mã OTP khôi phục mật khẩu: ${otpCode}`;
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; margin: 0;">
        <div style="max-width: 520px; margin: 0 auto; background: #131c2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #6366f1); border-radius: 12px; padding: 8px 16px; color: #fff; font-weight: bold; font-size: 18px; letter-spacing: 1px;">
              EVENTPASS
            </div>
          </div>
          <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; text-align: center;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Xin chào <strong style="color: #38bdf8;">${recipientName}</strong>,
          </p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hệ thống EventPass vừa nhận được yêu cầu tìm lại mật khẩu cho tài khoản sinh viên/quản trị viên của bạn.
          </p>
          <div style="background: #0f172a; border: 1px dashed #06b6d4; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
            <div style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Mã xác thực OTP (hiệu lực 10 phút)</div>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">
              ${otpCode}
            </div>
          </div>
          <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Mật khẩu của bạn vẫn được bảo vệ an toàn.
          </p>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <div style="text-align: center; color: #475569; font-size: 11px;">
            Hệ thống Quản lý Vé & Sự kiện Đại học EventPass
          </div>
        </div>
      </body>
    </html>
  `;

  const raw = createBase64Email(recipientEmail, subject, htmlBody);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Gmail API error:', data);
    throw new Error(data.error?.message || 'Không thể gửi email qua Gmail API');
  }

  return { success: true, messageId: data.id };
}
