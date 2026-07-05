// ============================================================
// EMAIL UTILITY - BREVO INTEGRATION
// ============================================================

const fetch = require('node-fetch');

class EmailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.senderEmail = process.env.BREVO_SENDER_EMAIL;
        this.senderName = process.env.BREVO_SENDER_NAME || 'FreeTranslate';
    }

    async sendVerificationCode(email, code, action) {
        const subjectMap = {
            signup: 'Verify Your Email - FreeTranslate',
            signin: 'Your Sign In Code - FreeTranslate',
            reset: 'Reset Your Password - FreeTranslate',
            email: 'Change Email Verification - FreeTranslate',
            password: 'Change Password Verification - FreeTranslate',
            delete: 'Delete Account Verification - FreeTranslate'
        };

        const subject = subjectMap[action] || 'Your Verification Code - FreeTranslate';

        const htmlContent = this.getEmailTemplate(code, action);

        const payload = {
            sender: {
                name: this.senderName,
                email: this.senderEmail
            },
            to: [{ email: email, name: email.split('@')[0] }],
            subject: subject,
            htmlContent: htmlContent
        };

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ Email sent to:', email);
                return { success: true };
            } else {
                console.error('❌ Brevo error:', result);
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('❌ Email error:', error);
            return { success: false, error: error.message };
        }
    }

    getEmailTemplate(code, action) {
        const actionMap = {
            signup: 'verify your email',
            signin: 'sign in to your account',
            reset: 'reset your password',
            email: 'change your email',
            password: 'change your password',
            delete: 'delete your account'
        };

        const actionText = actionMap[action] || 'verify your account';

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #4f46e5; margin: 0;">🔐 FreeTranslate</h1>
                    <p style="color: #6b7280; font-size: 16px;">${actionText}</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #1f2937;">Hello,</p>
                    <p style="font-size: 16px; color: #1f2937;">Your verification code is:</p>
                    <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">
                        <h2 style="font-size: 36px; letter-spacing: 8px; color: #4f46e5; margin: 0;">${code}</h2>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">This code will expire in 15 minutes.</p>
                    <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
                    © 2026 FreeTranslate | Built by Ornella Mutuyimana
                </div>
            </div>
        `;
    }
}

module.exports = new EmailService();
