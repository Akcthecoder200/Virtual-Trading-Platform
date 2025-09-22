import express from "express";
import bcrypt from "bcryptjs";
import { User, Wallet } from "../models/index.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/auth/test-login
 * @desc    Simplified login for testing (no email service)
 * @access  Public
 */
router.post("/test-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Testing login for:", email);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    console.log("✅ User found:", user.email, "Role:", user.role);

    // Check if account is active
    if (!user.isActive) {
      console.log("❌ Account inactive");
      return res.status(401).json({
        success: false,
        error: {
          message: "Account is deactivated",
          code: "ACCOUNT_INACTIVE",
        },
      });
    }

    // Verify password using model method
    console.log("🔐 Testing password...");
    const isPasswordValid = await user.comparePassword(password);
    console.log("🔐 Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    console.log("🎯 Generating tokens...");
    // Generate tokens
    const token = generateToken({ id: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id });
    console.log("✅ Tokens generated");

    // Get user's wallet
    const wallet = await Wallet.findOne({ user: user._id });
    console.log("💰 Wallet found:", !!wallet);

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("✅ Login successful for:", userResponse.email);

    res.json({
      success: true,
      message: "Test login successful",
      data: {
        user: userResponse,
        wallet: wallet?.toObject(),
        tokens: {
          accessToken: token,
          refreshToken,
          expiresIn: "24h",
        },
      },
    });
  } catch (error) {
    console.error("❌ Test login error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Test login failed",
        code: "TEST_LOGIN_ERROR",
        details: error.message,
      },
    });
  }
});

export default router;
