import nodemailer from 'nodemailer';

const { SMTP_USER, SMTP_PASS, SMTP_FROM, FRONTEND_URL } = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("FATAL ERROR: SMTP_USER or SMTP_PASS is missing.");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface SendInvitationEmailParams {
  to: string;
  token: string;
}

export const sendInvitationEmail = async ({ to, token }: SendInvitationEmailParams) => {
  const baseUrl = FRONTEND_URL || 'http://localhost:5173';
  const invitationLink = `${baseUrl}/accept-invite?token=${token}`;

  const mailOptions = {
    from: `"Axion Flow" <${SMTP_USER}>`,
    to: to,
    subject: 'You have been invited to join Axion Flow',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Axion Flow</h1>
        </div>
        <div style="padding: 40px 20px; text-align: center; color: #334155;">
          <h2 style="font-size: 20px; margin-bottom: 10px;">Welcome to the Team!</h2>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            You have been invited to join an Axion Flow organization. Click the button below to activate your account.
          </p>
          <a href="${invitationLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Accept Invitation
          </a>
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This link will expire in 7 days. If you did not expect this, please ignore this email.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Axion Flow. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Sent to ${to}. ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ [Email Service] Error:", error);
    throw new Error("Email sending failed."); 
  }
};