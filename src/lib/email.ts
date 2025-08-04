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

export async function sendRotaEmail(
  email: string, 
  firstName: string, 
  lastName: string, 
  restaurantName: string, 
  weekStartDate: string, 
  shifts: Array<{
    day: string;
    startTime: string;
    endTime: string;
    shiftHours: number;
    breakDuration: number;
    notes?: string;
    shiftLabel?: string;
  }>
) {
  try {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (time: string) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    const totalHours = shifts.reduce((sum, shift) => sum + (Number(shift.shiftHours) || 0), 0);

    // Group shifts by day to handle multiple shifts per day
    const shiftsByDay = new Map();
    shifts.forEach(shift => {
      if (!shiftsByDay.has(shift.day)) {
        shiftsByDay.set(shift.day, []);
      }
      shiftsByDay.get(shift.day).push(shift);
    });

    const shiftsHtml = Array.from(shiftsByDay.entries()).map(([day, dayShifts]) => {
      const dayShiftsHtml = dayShifts.map((shift, index) => `
        <div style="background: white; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 4px solid #667eea;">
          ${dayShifts.length > 1 ? `<div style="font-size: 12px; color: #667eea; margin-bottom: 5px; font-weight: bold;">Shift ${index + 1}${shift.shiftLabel ? ` - ${shift.shiftLabel}` : ''}</div>` : ''}
          <p style="color: #666; margin: 5px 0;">
            <strong>Time:</strong> ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}
          </p>
          <p style="color: #666; margin: 5px 0;">
            <strong>Hours:</strong> ${Number(shift.shiftHours)} hours
          </p>
          ${shift.breakDuration > 0 ? `<p style="color: #666; margin: 5px 0;"><strong>Break:</strong> ${shift.breakDuration} minutes</p>` : ''}
          ${shift.notes ? `<p style="color: #666; margin: 5px 0;"><strong>Notes:</strong> ${shift.notes}</p>` : ''}
        </div>
      `).join('');

      const dayTotalHours = dayShifts.reduce((sum, shift) => sum + (Number(shift.shiftHours) || 0), 0);
      
      return `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">${day}</h3>
          ${dayShifts.length > 1 ? `<p style="color: #667eea; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Day Total: ${dayTotalHours} hours</p>` : ''}
          ${dayShiftsHtml}
        </div>
      `;
    }).join('');

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `${restaurantName} - Your Weekly Schedule`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">${restaurantName}</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Weekly Schedule</h2>
            <p style="color: #666; margin-bottom: 20px;">
              Hi ${firstName} ${lastName},
            </p>
            <p style="color: #666; margin-bottom: 30px;">
              Your schedule for the week of <strong>${formatDate(weekStartDate)}</strong> has been published.
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">Schedule Summary</h3>
              <p style="color: #666; margin-bottom: 10px;">
                <strong>Week:</strong> ${formatDate(weekStartDate)} - ${formatDate(weekEndDate.toISOString().split('T')[0])}
              </p>
              <p style="color: #666; margin-bottom: 10px;">
                <strong>Total Hours:</strong> ${totalHours} hours
              </p>
              <p style="color: #666; margin-bottom: 10px;">
                <strong>Shifts:</strong> ${shifts.length} shifts across ${shiftsByDay.size} days
              </p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 15px;">Your Shifts</h3>
              ${shiftsHtml}
            </div>
            <p style="color: #666; font-size: 14px;">
              If you have any questions about your schedule, please contact your manager.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 ${restaurantName}. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Rota email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending rota email: ', error);
    throw new Error('Failed to send rota email');
  }
} 