import mongoose from "mongoose";
import { User } from "./models/index.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to database
await mongoose.connect(process.env.MONGODB_URI);

try {
  // Find admin user
  const admin = await User.findOne({
    email: "admin@virtualtrading.com",
  }).select("+password");

  if (!admin) {
    console.log("❌ Admin user not found");
  } else {
    console.log("✅ Admin user found:");
    console.log("  Email:", admin.email);
    console.log("  Role:", admin.role);
    console.log("  Active:", admin.isActive);
    console.log("  Status:", admin.status);
    console.log("  Email Verified:", admin.isEmailVerified);
    console.log("  Login Attempts:", admin.security.loginAttempts);
    console.log("  Lock Until:", admin.security.lockUntil);
    console.log("  Password exists:", !!admin.password);
    console.log("  Password length:", admin.password?.length || 0);

    if (admin.password) {
      // Test password
      const testPassword = "admin123456";
      const isValidPassword = await bcrypt.compare(
        testPassword,
        admin.password
      );
      console.log("  Password Valid:", isValidPassword);
    } else {
      console.log("  ❌ Password field is empty/undefined!");
    }
  }

  // List all users
  const users = await User.find({}).select("email role isActive status");
  console.log("\n📋 All users in database:");
  users.forEach((user) => {
    console.log(
      `  - ${user.email} (${user.role}) - Active: ${user.isActive}, Status: ${user.status}`
    );
  });
} catch (error) {
  console.error("❌ Error:", error);
}

mongoose.connection.close();
