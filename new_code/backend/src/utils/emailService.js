const nodemailer = require('nodemailer');

const sendOtpEmail = async (userEmail, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@smartbakehub.com',
            to: userEmail,
            subject: 'Your Smart Bake Hub OTP Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #2E1A12; margin: 0;">Smart Bake Hub</h2>
                        <p style="color: #C8843B; margin-top: 5px;">Verify your account</p>
                    </div>
                    <p style="color: #333; font-size: 16px;">Hello,</p>
                    <p style="color: #333; font-size: 16px;">Thank you for registering. Please use the following One-Time Password (OTP) to complete your verification process:</p>
                    <div style="background-color: #F7F4ED; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #C8843B; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendOtpEmail };
