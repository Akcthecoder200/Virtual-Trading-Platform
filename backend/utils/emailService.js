import nodemailer from "nodemailer";
import crypto from "crypto";

/**
 * Email Service for sending authentication emails
 * Handles email verification, password reset, and notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  /**
   * Initialize email transporter
   */
  init() {
    if (process.env.NODE_ENV === "production" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Production email configuration (use your email service)
      this.transporter = nodemailer.createTransport({
        service: "gmail", // or your email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Development or Production without email credentials: Use console logging
      const mode = process.env.NODE_ENV === "production" ? "Production (No Email Config)" : "Development";
      this.transporter = {
        sendMail: async (mailOptions) => {
          console.log(`📧 EMAIL WOULD BE SENT (${mode}):`);
          console.log("To:", mailOptions.to);
          console.log("Subject:", mailOptions.subject);
          console.log("Content:", mailOptions.text || mailOptions.html);
          console.log("---");
          return { messageId: "console-mode-" + Date.now() };
        },
      };
    }
  }

  /**
   * Generate email verification token
   * @param {string} userId - User ID
   * @returns {string} Verification token
   */
  generateVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    // In production, store this token in database with expiration
    return token;
  }

  /**
   * Generate password reset token
   * @param {string} userId - User ID
   * @returns {Object} Reset token and expiry
   */
  generatePasswordResetToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    return {
      token,
      expires,
    };
  }

  /**
   * Send welcome email
   * @param {Object} user - User object
   * @param {string} verificationToken - Email verification token
   */
  async sendWelcomeEmail(user, verificationToken = null) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@virtualtrading.com",
      to: user.email,
      subject: "Welcome to Virtual Trading Platform!",
      html: this.generateWelcomeEmailHTML(user, verificationToken),
      text: this.generateWelcomeEmailText(user, verificationToken),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Welcome email sent to:", user.email);
      return result;
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
      throw error;
    }
  }

  /**
   * Send email verification
   * @param {Object} user - User object
   * @param {string} verificationToken - Verification token
   */
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@virtualtrading.com",
      to: user.email,
      subject: "Verify Your Email Address",
      html: this.generateVerificationEmailHTML(user, verificationUrl),
      text: this.generateVerificationEmailText(user, verificationUrl),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Verification email sent to:", user.email);
      return result;
    } catch (error) {
      console.error("❌ Error sending verification email:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @param {string} resetToken - Password reset token
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@virtualtrading.com",
      to: user.email,
      subject: "Password Reset Request",
      html: this.generatePasswordResetEmailHTML(user, resetUrl),
      text: this.generatePasswordResetEmailText(user, resetUrl),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Password reset email sent to:", user.email);
      return result;
    } catch (error) {
      console.error("❌ Error sending password reset email:", error);
      throw error;
    }
  }

  /**
   * Send login notification email
   * @param {Object} user - User object
   * @param {Object} loginInfo - Login information (IP, device, etc.)
   */
  async sendLoginNotification(user, loginInfo) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@virtualtrading.com",
      to: user.email,
      subject: "New Login to Your Account",
      html: this.generateLoginNotificationHTML(user, loginInfo),
      text: this.generateLoginNotificationText(user, loginInfo),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Login notification sent to:", user.email);
      return result;
    } catch (error) {
      console.error("❌ Error sending login notification:", error);
      // Don't throw error for notifications - they're not critical
    }
  }

  // HTML Email Templates
  generateWelcomeEmailHTML(user, verificationToken) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Virtual Trading Platform!</h1>
        <p>Hello ${user.firstName},</p>
        <p>Thank you for registering with Virtual Trading Platform. Your account has been successfully created with a demo balance of $${
          process.env.DEFAULT_DEMO_BALANCE || 10000
        }.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Demo Balance:</strong> $${
            process.env.DEFAULT_DEMO_BALANCE || 10000
          }</p>
        </div>
        ${
          verificationToken
            ? `
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/verify-email?token=${verificationToken}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        `
            : ""
        }
        <p>Happy trading!</p>
        <p>Best regards,<br>Virtual Trading Platform Team</p>
      </div>
    `;
  }

  generateWelcomeEmailText(user, verificationToken) {
    return `
Welcome to Virtual Trading Platform!

Hello ${user.firstName},

Thank you for registering with Virtual Trading Platform. Your account has been successfully created with a demo balance of $${
      process.env.DEFAULT_DEMO_BALANCE || 10000
    }.

Account Details:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- Demo Balance: $${process.env.DEFAULT_DEMO_BALANCE || 10000}

${
  verificationToken
    ? `Please verify your email address by visiting: ${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/verify-email?token=${verificationToken}`
    : ""
}

Happy trading!

Best regards,
Virtual Trading Platform Team
    `;
  }

  generateVerificationEmailHTML(user, verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verify Your Email Address</h1>
        <p>Hello ${user.firstName},</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If you can't click the button, copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>Virtual Trading Platform Team</p>
      </div>
    `;
  }

  generateVerificationEmailText(user, verificationUrl) {
    return `
Verify Your Email Address

Hello ${user.firstName},

Please visit the following link to verify your email address:
${verificationUrl}

This link will expire in 24 hours.

Best regards,
Virtual Trading Platform Team
    `;
  }

  generatePasswordResetEmailHTML(user, resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hello ${user.firstName},</p>
        <p>You requested a password reset for your Virtual Trading Platform account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If you can't click the button, copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Virtual Trading Platform Team</p>
      </div>
    `;
  }

  generatePasswordResetEmailText(user, resetUrl) {
    return `
Password Reset Request

Hello ${user.firstName},

You requested a password reset for your Virtual Trading Platform account.

Visit the following link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
Virtual Trading Platform Team
    `;
  }

  generateLoginNotificationHTML(user, loginInfo) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Login to Your Account</h1>
        <p>Hello ${user.firstName},</p>
        <p>We detected a new login to your Virtual Trading Platform account:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${loginInfo.ip || "Unknown"}</p>
          <p><strong>Location:</strong> ${loginInfo.location || "Unknown"}</p>
          <p><strong>Device:</strong> ${loginInfo.userAgent || "Unknown"}</p>
        </div>
        <p>If this was not you, please secure your account immediately by changing your password.</p>
        <p>Best regards,<br>Virtual Trading Platform Team</p>
      </div>
    `;
  }

  generateLoginNotificationText(user, loginInfo) {
    return `
New Login to Your Account

Hello ${user.firstName},

We detected a new login to your Virtual Trading Platform account:

Time: ${new Date().toLocaleString()}
IP Address: ${loginInfo.ip || "Unknown"}
Location: ${loginInfo.location || "Unknown"}
Device: ${loginInfo.userAgent || "Unknown"}

If this was not you, please secure your account immediately by changing your password.

Best regards,
Virtual Trading Platform Team
    `;
  }
}

// Create and export singleton instance
const emailService = new EmailService();
export default emailService;
