import User from "../models/User.js";
import bcrypt from "bcryptjs";

/**
 * Create default admin user if it doesn't exist
 */
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@virtualtrading.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: "admin",
    });

    if (existingAdmin) {
      console.log("✅ Default admin user already exists");
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = new User({
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      profile: {
        firstName: "System",
        lastName: "Administrator",
        country: "System",
        phone: "+1234567890",
      },
    });

    await adminUser.save();
    console.log("✅ Default admin user created successfully");
    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`🔑 Admin Password: ${adminPassword}`);
    console.log("⚠️  Please change the default admin password in production!");
  } catch (error) {
    console.error("❌ Error creating default admin user:", error.message);
  }
};

export default createDefaultAdmin;
