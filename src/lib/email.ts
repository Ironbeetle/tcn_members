import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, code: string) {
  try {
    console.log('[Email Service] Attempting to send password reset email to:', email);
    console.log('[Email Service] Resend API Key present:', !!process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [email],
      subject: 'Password Reset Request - TCN Member Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #b45309 0%, #78350f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
              .code-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .code { font-size: 36px; font-weight: bold; color: #78350f; letter-spacing: 8px; font-family: monospace; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
              .warning { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your Tataskweyak Cree Nation Member Portal account.</p>
                
                <div class="code-box">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #78350f;">Your Reset Code:</p>
                  <div class="code">${code}</div>
                </div>
                
                <p>Enter this 6-digit code on the password reset page to create a new password.</p>
                
                <p class="warning">⚠️ This code will expire in 15 minutes.</p>
                
                <p style="margin-top: 30px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                
                <p style="margin-top: 20px;">For security questions, contact the TCN administration office.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Tataskweyak Cree Nation. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    });

    if (error) {
      console.error('[Email Service] Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email Service] Email sent successfully! Email ID:', data?.id);
    return { success: true, data };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}
