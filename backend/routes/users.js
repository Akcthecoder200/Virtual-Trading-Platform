import express from "express";
import bcrypt from "bcryptjs";
import { User, Wallet } from "../models/index.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { validateProfileUpdate, validatePasswordChange, validateEmailChange } from "../middleware/validation.js";
import emailService from "../utils/emailService.js";

const router = express.Router();

/**
 * @route   GET /api/users/test
 * @desc    Test users route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Users routes are working",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -security.refreshTokens");
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toObject(),
        wallet: wallet?.toObject(),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
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
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticateToken, validateProfileUpdate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.isEmailVerified;
    delete updateData.security;
    delete updateData.analytics;

    // Handle profile nested updates
    const profileUpdates = {};
    if (updateData.firstName) profileUpdates['profile.firstName'] = updateData.firstName;
    if (updateData.lastName) profileUpdates['profile.lastName'] = updateData.lastName;
    if (updateData.phone) profileUpdates['profile.phone'] = updateData.phone;
    if (updateData.dateOfBirth) profileUpdates['profile.dateOfBirth'] = new Date(updateData.dateOfBirth);
    if (updateData.country) profileUpdates['profile.country'] = updateData.country.toUpperCase();
    if (updateData.bio) profileUpdates['profile.bio'] = updateData.bio;

    // Handle address updates
    if (updateData.address) {
      if (updateData.address.street) profileUpdates['profile.address.street'] = updateData.address.street;
      if (updateData.address.city) profileUpdates['profile.address.city'] = updateData.address.city;
      if (updateData.address.state) profileUpdates['profile.address.state'] = updateData.address.state;
      if (updateData.address.zipCode) profileUpdates['profile.address.zipCode'] = updateData.address.zipCode;
    }

    // Handle preference updates
    if (updateData.preferences) {
      if (updateData.preferences.theme) profileUpdates['preferences.theme'] = updateData.preferences.theme;
      if (updateData.preferences.language) profileUpdates['preferences.language'] = updateData.preferences.language;
      if (updateData.preferences.currency) profileUpdates['preferences.currency'] = updateData.preferences.currency;
      if (updateData.preferences.timezone) profileUpdates['preferences.timezone'] = updateData.preferences.timezone;
      
      // Handle notification preferences
      if (updateData.preferences.notifications) {
        Object.keys(updateData.preferences.notifications).forEach(key => {
          profileUpdates[`preferences.notifications.${key}`] = updateData.preferences.notifications[key];
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: profileUpdates },
      { new: true, runValidators: true }
    ).select("-password -security.refreshTokens");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser.toObject(),
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
          })),
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update profile",
        code: "PROFILE_UPDATE_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post("/change-password", authenticateToken, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        },
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: "New password must be different from current password",
          code: "SAME_PASSWORD",
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
});

/**
 * @route   POST /api/users/change-email
 * @desc    Change user email address
 * @access  Private
 */
router.post("/change-email", authenticateToken, validateEmailChange, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Password is incorrect",
          code: "INVALID_PASSWORD",
        },
      });
    }

    // Check if new email is different
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: {
          message: "New email must be different from current email",
          code: "SAME_EMAIL",
        },
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Email address is already in use",
          code: "EMAIL_EXISTS",
        },
      });
    }

    // Update email and mark as unverified
    user.email = newEmail.toLowerCase();
    user.isEmailVerified = false;
    
    await user.save();

    // Send verification email to new address
    try {
      const verificationToken = emailService.generateVerificationToken(user._id);
      await emailService.sendEmailVerification(user, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail the email change if verification email fails
    }

    res.json({
      success: true,
      message: "Email address updated successfully. Please verify your new email address.",
      data: {
        newEmail: user.email,
        emailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Email change error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to change email address",
        code: "EMAIL_CHANGE_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/users/upload-avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post("/upload-avatar", authenticateToken, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Avatar URL is required",
          code: "AVATAR_URL_REQUIRED",
        },
      });
    }

    // Update user avatar
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "profile.avatar": avatarUrl } },
      { new: true, runValidators: true }
    ).select("-password -security.refreshTokens");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        user: updatedUser.toObject(),
      },
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to update avatar",
        code: "AVATAR_UPDATE_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/users/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
router.post("/deactivate", authenticateToken, async (req, res) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Password is required to deactivate account",
          code: "PASSWORD_REQUIRED",
        },
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Password is incorrect",
          code: "INVALID_PASSWORD",
        },
      });
    }

    // Deactivate account
    user.isActive = false;
    user.status = "inactive";
    user.security.refreshTokens = []; // Invalidate all tokens
    user.analytics.deactivationDate = new Date();
    user.analytics.deactivationReason = reason || "User requested";
    
    await user.save();

    res.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Account deactivation error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to deactivate account",
        code: "DEACTIVATION_ERROR",
      },
    });
  }
});

/**
 * @route   GET /api/users/analytics
 * @desc    Get user analytics and statistics
 * @access  Private
 */
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("analytics preferences");
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Calculate additional analytics
    const accountAge = Math.floor((new Date() - user.analytics.signupDate) / (1000 * 60 * 60 * 24));
    const avgLoginsPerDay = accountAge > 0 ? (user.analytics.totalLogins / accountAge).toFixed(2) : 0;

    const analytics = {
      user: {
        signupDate: user.analytics.signupDate,
        lastLoginAt: user.analytics.lastLoginAt,
        totalLogins: user.analytics.totalLogins,
        accountAge: accountAge,
        avgLoginsPerDay: parseFloat(avgLoginsPerDay),
        uniqueIpAddresses: user.analytics.ipAddresses?.length || 0,
        recentLoginHistory: user.analytics.loginHistory?.slice(-5) || [],
      },
      wallet: wallet ? {
        balance: wallet.balance,
        equity: wallet.equity,
        totalTrades: wallet.analytics?.totalTrades || 0,
        profitLoss: wallet.analytics?.profitLoss || 0,
        winRate: wallet.analytics?.winRate || 0,
        averageReturn: wallet.analytics?.averageReturn || 0,
      } : null,
      preferences: {
        theme: user.preferences?.theme || "light",
        language: user.preferences?.language || "en",
        currency: user.preferences?.currency || "USD",
        timezone: user.preferences?.timezone || "UTC",
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch analytics",
        code: "ANALYTICS_FETCH_ERROR",
      },
    });
  }
});

// Admin only routes
/**
 * @route   GET /api/users/all
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const role = req.query.role || "";

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password -security.refreshTokens")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch users",
        code: "USERS_FETCH_ERROR",
      },
    });
  }
});

/**
 * @route   GET /api/users/:userId
 * @desc    Get specific user by ID (Admin only)
 * @access  Private/Admin
 */
router.get("/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password -security.refreshTokens");
    const wallet = await Wallet.findOne({ user: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toObject(),
        wallet: wallet?.toObject(),
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch user",
        code: "USER_FETCH_ERROR",
      },
    });
  }
});

export default router;
