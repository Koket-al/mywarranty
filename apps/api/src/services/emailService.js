import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Global development store for testing OTP verification
export const devOtpStore = new Map();

let transporter = null;

if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_USER && env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
  });
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 */
export function generateOtp() {
  const buf = crypto.randomBytes(3);
  const num = (buf.readUIntBE(0, 3) % 900000) + 100000;
  return String(num);
}

/**
 * Hashes OTP with SHA-256 for secure database storage
 */
export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim(), 'utf8').digest('hex');
}

/**
 * Sends transactional email or logs to console
 */
export async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text: text || ''
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Sent to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] Failed to send to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // Development Console Provider
  console.log(`\n================== [MW DEV EMAIL] ==================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text || html}`);
  console.log(`====================================================\n`);
  return { success: true, simulated: true };
}

/**
 * Sends an OTP verification email and caches for dev convenience
 */
export async function sendOtpEmail(email, otp, purpose = 'Verification') {
  devOtpStore.set(`${email}:${purpose}`, otp);
  
  const subject = `Your MW (My Warranty) Verification Code: ${otp}`;
  const text = `Your MW (My Warranty) verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #dbe2e3; border-radius: 8px;">
      <h2 style="color: #202223; margin-top: 0;">MW (My Warranty)</h2>
      <p style="color: #475569;">You requested a verification code for <strong>${purpose}</strong>.</p>
      <div style="background-color: #e1f3f3; padding: 15px; border-radius: 6px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #202223; margin: 20px 0;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. If you did not make this request, please disregard this email.</p>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Sends an employee invitation email
 */
export async function sendInvitationEmail({ to, businessName, role, invitationLink }) {
  const subject = `You're invited to join ${businessName} on MW (My Warranty)`;
  const text = `You have been invited to join ${businessName} on MW (My Warranty) as a ${role}. Click this link to accept your invitation: ${invitationLink}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #092032; margin-top: 0;">MW (My Warranty) Staff Invitation</h2>
      <p style="color: #475569;">You have been invited to join <strong>${businessName}</strong> as a <strong>${role}</strong>.</p>
      <div style="margin: 25px 0; text-align: center;">
        <a href="${invitationLink}" style="background-color: #092032; color: #f1a501; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">Or copy and paste this link in your browser:<br/><a href="${invitationLink}" style="color: #092032;">${invitationLink}</a></p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

