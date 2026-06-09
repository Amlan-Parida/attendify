const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If no email credentials are provided, just log the OTP to the console
  if (!process.env.SMTP_HOST || !process.env.EMAIL_USER) {
    console.log('\n========================================================');
    console.log(`✉️  MOCK EMAIL SENT TO: ${options.email}`);
    console.log(`🔑 OTP CODE: ${options.otp}`);
    console.log('========================================================\n');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Welcome to Attendify!</h2>
      <p style="font-size: 16px; color: #333;">Please use the following OTP to verify your email address. This OTP is valid for 10 minutes.</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${options.otp}</span>
      </div>
      <p style="font-size: 14px; color: #666; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const message = {
    from: `${process.env.FROM_NAME || 'Attendify'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject || 'Your OTP for Attendify',
    html: htmlContent,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
