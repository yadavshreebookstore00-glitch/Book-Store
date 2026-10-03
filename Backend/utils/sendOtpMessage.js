// utils/sendOtpMessage.js
// Delivers OTP by email (Brevo HTTP API) or SMS (Fast2SMS).
// Uses HTTPS APIs only, because hosts like Render block SMTP ports (25/465/587)
// on free instances, which silently breaks nodemailer/Gmail.
// Requires Node 18+ (built-in fetch).

const withTimeout = async (url, options = {}, ms = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// ---------- EMAIL (Brevo) ----------
const sendEmailOtp = async (email, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM; // must be a verified sender in Brevo
  if (!apiKey || !senderEmail) {
    throw new Error(
      "Email service not configured (BREVO_API_KEY / EMAIL_FROM missing)",
    );
  }

  const res = await withTimeout("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || "Book Store",
        email: senderEmail,
      },
      to: [{ email }],
      subject: `Your OTP is ${otp}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
          <h2>Your verification code</h2>
          <p style="font-size:32px;letter-spacing:6px;font-weight:bold">${otp}</p>
          <p>This code is valid for 5 minutes. Do not share it with anyone.</p>
        </div>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
};

// ---------- SMS (Fast2SMS, OTP route) ----------
const sendSmsOtp = async (mobile, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error("SMS service not configured (FAST2SMS_API_KEY missing)");
  }

  const url =
    `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}` +
    `&route=otp&variables_values=${otp}&numbers=${mobile}`;

  const res = await withTimeout(url, { method: "GET" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.return === false) {
    throw new Error(`Fast2SMS error: ${data.message || res.status}`);
  }
};

export const sendOtpMessage = async (type, identifier, otp) => {
  if (type === "email") return sendEmailOtp(identifier, otp);
  return sendSmsOtp(identifier, otp);
};
