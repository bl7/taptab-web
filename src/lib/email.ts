import nodemailer from 'nodemailer';

// Create transporter for Zoho SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Taptab POS - Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Taptab POS</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Login Code</h2>
            <p style="color: #666; margin-bottom: 30px;">
              Use this 6-digit code to sign in to your Taptab POS account:
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                ${otp}
              </h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Taptab POS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email');
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Taptab POS - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Taptab POS</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; margin-bottom: 30px;">
              You requested to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Taptab POS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email: ', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Welcome to Taptab POS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Taptab POS</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Taptab POS!</h2>
            <p style="color: #666; margin-bottom: 20px;">
              Hi ${name},
            </p>
            <p style="color: #666; margin-bottom: 30px;">
              Welcome to Taptab POS! Your restaurant management account has been successfully created.
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
              <ul style="color: #666; text-align: left;">
                <li>Set up your menu items and categories</li>
                <li>Configure your printers for receipts</li>
                <li>Add staff members to your team</li>
                <li>Start taking orders and managing your restaurant</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Taptab POS. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email: ', error);
    throw new Error('Failed to send welcome email');
  }
} 