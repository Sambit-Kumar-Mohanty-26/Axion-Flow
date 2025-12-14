import axios from 'axios';

const { 
  EMAILJS_SERVICE_ID, 
  EMAILJS_TEMPLATE_ID, 
  EMAILJS_PUBLIC_KEY, 
  EMAILJS_PRIVATE_KEY,
  FRONTEND_URL 
} = process.env;

if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
  console.error("FATAL ERROR: EmailJS configuration is missing in .env");
}

interface SendInvitationEmailParams {
  to: string;
  token: string;
  inviterEmail: string; 
  orgName: string;      
}

export const sendInvitationEmail = async ({ to, token, inviterEmail, orgName }: SendInvitationEmailParams) => {
  const frontendUrl = FRONTEND_URL || 'http://localhost:5173';
  const invitationLink = `${frontendUrl}/accept-invite?token=${token}`;

  const htmlMessage = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Axion Flow</h1>
        </div>
        <div style="padding: 40px 20px; text-align: center; color: #334155;">
          <h2 style="font-size: 20px; margin-bottom: 10px;">Welcome to the Team!</h2>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
            You have been invited by <strong><a href="mailto:${inviterEmail}" style="color: #0052cc; text-decoration: none;">${inviterEmail}</a></strong> to join <strong>${orgName}</strong> on Axion Flow.
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Click the button below to set up your account and get started.
          </p>
          
          <a href="${invitationLink}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Accept Invitation
          </a>
          
          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This link will expire in 7 days. If you did not expect this invitation, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Axion Flow. All rights reserved.
        </div>
      </div>
  `;

  const data = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_PUBLIC_KEY,
    accessToken: EMAILJS_PRIVATE_KEY,
    template_params: {
      to_email: to,
      subject: `Invitation to join ${orgName} on Axion Flow`,
      html_content: htmlMessage, 
    },
  };

  try {
    await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`✅ [EmailJS] Invitation sent to ${to} from ${inviterEmail}`);
  } catch (error: any) {
    console.error("❌ [EmailJS] Failed:", error.response?.data || error.message);
    throw new Error("Failed to send invitation email.");
  }
};