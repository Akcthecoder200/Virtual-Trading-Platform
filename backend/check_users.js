import mongoose from "mongoose";
import { User } from "./models/index.js";
import dotenv from "dotenv";

dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all users
    const users = await User.find(
      {},
      "email username firstName lastName role status"
    );

    console.log("\n👥 Found Users:");
    console.log("================");

    if (users.length === 0) {
      console.log("No users found in database");
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log("   ---");
      });
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
};

checkUsers();
