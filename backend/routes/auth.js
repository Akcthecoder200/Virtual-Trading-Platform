import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, Wallet } from "../models/index.js";
import {
  authenticateToken,
  generateToken,
  generateRefreshToken,
} from "../middleware/auth.js";
import {
  validateSignup,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validatePasswordChange,
  validateEmailChange,
} from "../middleware/validation.js";
import emailService from "../utils/emailService.js";

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", validateSignup, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      phone,
      country,
      agreeToTerms,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: "User with this email already exists",
          code: "EMAIL_EXISTS",
        },
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username: email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, ""), // Generate username from email
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      profile: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        country: country.toUpperCase(),
        phone,
      },
      analytics: {
        signupDate: new Date(),
        ipAddresses: [req.ip],
      },
    });

    await user.save();

    // Create demo wallet for the user
    const wallet = new Wallet({
      user: user._id,
      balance: parseFloat(process.env.DEFAULT_DEMO_BALANCE || 10000),
      currency: "USD",
    });

    await wallet.save();

    // Generate email verification token (if email verification is enabled)
    const verificationToken = emailService.generateVerificationToken(user._id);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user, verificationToken);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });

    // Update user with refresh token (in production, store in secure database)
    user.security.refreshTokens = [refreshToken];
    await user.save();

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        wallet: wallet.toObject(),
        tokens: {
          accessToken: token,
          refreshToken,
          expiresIn: "24h",
        },
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to register user",
        code: "REGISTRATION_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    // Check if account is locked
    if (user.security.lockUntil && user.security.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil(
        (user.security.lockUntil - Date.now()) / (1000 * 60)
      );
      return res.status(423).json({
        success: false,
        error: {
          message: `Account is locked. Try again in ${lockTimeRemaining} minutes`,
          code: "ACCOUNT_LOCKED",
          lockTimeRemaining,
        },
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Account is deactivated",
          code: "ACCOUNT_INACTIVE",
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment login attempts
      user.security.loginAttempts += 1;

      // Lock account after 5 failed attempts for 30 minutes
      if (user.security.loginAttempts >= 5) {
        user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await user.save();

      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
          attemptsRemaining: Math.max(0, 5 - user.security.loginAttempts),
        },
      });
    }

    // Reset login attempts on successful login
    user.security.loginAttempts = 0;
    user.security.lockUntil = null;

    // Update login analytics
    user.analytics.lastLoginAt = new Date();
    user.analytics.totalLogins += 1;
    user.analytics.loginHistory.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "Unknown",
      success: true,
    });

    // Keep only last 10 login records
    if (user.analytics.loginHistory.length > 10) {
      user.analytics.loginHistory = user.analytics.loginHistory.slice(-10);
    }

    // Add IP address to tracking
    if (!user.analytics.ipAddresses.includes(req.ip)) {
      user.analytics.ipAddresses.push(req.ip);
    }

    // Generate tokens
    const tokenExpiry = rememberMe ? "30d" : "24h";
    const token = generateToken(
      { id: user._id, email: user.email },
      tokenExpiry
    );
    const refreshToken = generateRefreshToken({ id: user._id });

    // Update refresh tokens
    user.security.refreshTokens = user.security.refreshTokens || [];
    user.security.refreshTokens.push(refreshToken);

    // Keep only last 5 refresh tokens
    if (user.security.refreshTokens.length > 5) {
      user.security.refreshTokens = user.security.refreshTokens.slice(-5);
    }

    await user.save();

    // Get user's wallet
    const wallet = await Wallet.findOne({ user: user._id });

    // Send login notification (optional)
    try {
      await emailService.sendLoginNotification(user, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        location: "Unknown", // You can integrate with IP geolocation service
      });
    } catch (emailError) {
      console.error("Failed to send login notification:", emailError);
      // Don't fail login if email notification fails
    }

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        wallet: wallet?.toObject(),
        tokens: {
          accessToken: token,
          refreshToken,
          expiresIn: tokenExpiry,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Login failed",
        code: "LOGIN_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Refresh token is required",
          code: "NO_REFRESH_TOKEN",
        },
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.id);
    if (!user || !user.security.refreshTokens?.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
      });
    }

    // Generate new access token
    const newAccessToken = generateToken({ id: user._id, email: user.email });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        expiresIn: "24h",
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      error: {
        message: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      },
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    // Remove refresh token from user's record
    if (refreshToken && user.security.refreshTokens) {
      user.security.refreshTokens = user.security.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Logout failed",
        code: "LOGOUT_ERROR",
      },
    });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const wallet = await Wallet.findOne({ user: user._id });

    // Return user data without sensitive information
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.security.refreshTokens;

    res.json({
      success: true,
      data: {
        user: userResponse,
        wallet: wallet?.toObject(),
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch profile",
        code: "PROFILE_FETCH_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  "/change-password",
  authenticateToken,
  validatePasswordChange,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Current password is incorrect",
            code: "INVALID_CURRENT_PASSWORD",
          },
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password and security info
      user.password = hashedNewPassword;
      user.security.passwordChangedAt = new Date();
      user.security.refreshTokens = []; // Invalidate all refresh tokens

      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to change password",
          code: "PASSWORD_CHANGE_ERROR",
        },
      });
    }
  }
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  validatePasswordResetRequest,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          success: true,
          message: "If the email exists, a password reset link has been sent",
        });
      }

      // Generate password reset token
      const resetTokenData = emailService.generatePasswordResetToken(user._id);

      // Store reset token in user record (in production, use a separate collection)
      user.security.passwordResetToken = resetTokenData.token;
      user.security.passwordResetExpires = resetTokenData.expires;
      await user.save();

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(user, resetTokenData.token);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);

        return res.status(500).json({
          success: false,
          error: {
            message: "Failed to send password reset email",
            code: "EMAIL_SEND_ERROR",
          },
        });
      }

      res.json({
        success: true,
        message: "Password reset link has been sent to your email",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to process password reset request",
          code: "PASSWORD_RESET_REQUEST_ERROR",
        },
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post("/reset-password", validatePasswordReset, async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      "security.passwordResetToken": token,
      "security.passwordResetExpires": { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid or expired password reset token",
          code: "INVALID_RESET_TOKEN",
        },
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.security.passwordChangedAt = new Date();
    user.security.passwordResetToken = undefined;
    user.security.passwordResetExpires = undefined;
    user.security.refreshTokens = []; // Invalidate all refresh tokens
    user.security.loginAttempts = 0; // Reset login attempts
    user.security.lockUntil = null;

    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to reset password",
        code: "PASSWORD_RESET_ERROR",
      },
    });
  }
});

/**
 * @route   GET /api/auth/test
 * @desc    Test auth route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

export default router;
