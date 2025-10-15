import sgMail from '@sendgrid/mail';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
    console.error("FATAL ERROR: SENDGRID_API_KEY is not defined.");
}
else {
    sgMail.setApiKey(SENDGRID_API_KEY);
}
const VERIFIED_FROM_EMAIL = 'contact.axion.flow@gmail.com';
export const sendInvitationEmail = async ({ to, token }) => {
    const invitationLink = `http://localhost:5173/accept-invite?token=${token}`;
    const msg = {
        to: to,
        from: `Axion Flow <${VERIFIED_FROM_EMAIL}>`,
        subject: 'You have been invited to join Axion Flow',
        html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to Axion Flow!</h2>
          <p>You've been invited to join your team's workspace.</p>
          <p>Please click the button below to set up your account and get started.</p>
          <a 
            href="${invitationLink}" 
            style="display: inline-block; padding: 12px 24px; background-color: #0052cc; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;"
          >
            Accept Invitation
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This link is valid for 7 days. If you did not expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    };
    try {
        if (!SENDGRID_API_KEY) {
            throw new Error("SendGrid API key is not configured.");
        }
        await sgMail.send(msg);
        console.log(`✅ Invitation email successfully sent to ${to} via SendGrid.`);
    }
    catch (error) {
        console.error("SendGrid API Error:", error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw new Error("Failed to send invitation email via SendGrid.");
    }
};
//# sourceMappingURL=email.service.js.map