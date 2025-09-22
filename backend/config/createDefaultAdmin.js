import { User, Wallet } from "../models/index.js";
import bcrypt from "bcryptjs";

/**
 * Create default admin user if it doesn't exist
 * This function is called during server startup
 */
const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      role: "admin",
      email: process.env.ADMIN_EMAIL || "admin@virtualtrading.com",
    });

    if (existingAdmin) {
      console.log("✅ Default admin user already exists");
      return existingAdmin;
    }

    console.log("🔧 Creating default admin user...");

    // Hash the admin password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123456",
      salt
    );

    // Create admin user
    const adminUser = new User({
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      email: process.env.ADMIN_EMAIL || "admin@virtualtrading.com",
      password: hashedPassword,
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
      balance: parseFloat(process.env.DEFAULT_DEMO_BALANCE || 10000),
      currency: "USD",
      isActive: true,
      transactions: [],
    });

    await adminWallet.save();

    console.log("✅ Default admin user created successfully");
    console.log(`📧 Admin Email: ${adminUser.email}`);
    console.log(
      `🔑 Admin Password: ${process.env.ADMIN_PASSWORD || "admin123456"}`
    );
    console.log("⚠️  Please change the default password after first login!");

    return adminUser;
  } catch (error) {
    console.error("❌ Error creating default admin user:", error);

    // Don't throw error - server should continue even if admin creation fails
    if (error.code === 11000) {
      console.log("ℹ️  Admin user already exists (duplicate key error)");
    } else {
      console.error("ℹ️  Server will continue without default admin user");
    }

    return null;
  }
};

export default createDefaultAdmin;
