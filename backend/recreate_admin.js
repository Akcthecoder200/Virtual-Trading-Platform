import mongoose from "mongoose";
import { User, Wallet } from "./models/index.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to database
await mongoose.connect(process.env.MONGODB_URI);

try {
  console.log("🔧 Recreating admin user with correct password...");

  // Delete existing admin user
  await User.deleteOne({ email: "admin@virtualtrading.com" });
  await Wallet.deleteOne({ user: { $exists: false } }); // Clean up orphaned wallets

  // Create new admin user with raw password (let the pre-save hook handle hashing)
  const adminUser = new User({
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@virtualtrading.com",
    password: "admin123456", // Raw password - pre-save hook will hash it
    role: "admin",
    status: "active",
    isEmailVerified: true,
    isActive: true,
    profile: {
      firstName: "Admin",
      lastName: "User",
      dateOfBirth: new Date("1990-01-01"),
      country: "US",
      phone: "+12345678901",
      bio: "Default system administrator account",
    },
    security: {
      twoFactorEnabled: false,
      loginAttempts: 0,
      lockUntil: null,
      passwordChangedAt: new Date(),
    },
    preferences: {
      theme: "dark",
      language: "en",
      currency: "USD",
      timezone: "UTC",
      notifications: {
        email: true,
        push: false,
        sms: false,
        trading: true,
        security: true,
        news: false,
      },
    },
    analytics: {
      signupDate: new Date(),
      lastLoginAt: new Date(),
      totalLogins: 0,
      loginHistory: [],
      ipAddresses: [],
    },
  });

  await adminUser.save();

  // Create admin wallet
  const adminWallet = new Wallet({
    user: adminUser._id,
    balance: 10000,
    currency: "USD",
    isActive: true,
    transactions: [],
  });

  await adminWallet.save();

  // Test the password using the model method
  const isPasswordValid = await adminUser.comparePassword("admin123456");

  console.log("✅ Admin user recreated successfully!");
  console.log("📧 Email:", adminUser.email);
  console.log("🔑 Password test:", isPasswordValid ? "PASSED" : "FAILED");
  console.log("💰 Wallet created with balance:", adminWallet.balance);
} catch (error) {
  console.error("❌ Error:", error);
}

mongoose.connection.close();
