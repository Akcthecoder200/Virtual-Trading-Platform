import mongoose from "mongoose";

/**
 * Database configuration and connection utilities
 */

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("📡 Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔌 Mongoose disconnected from MongoDB");
    });

    return conn;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

/**
 * Gracefully close database connection
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
};

/**
 * Check if database is connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connectDB,
  closeDB,
  isConnected,
};

export { connectDB, closeDB, isConnected };
