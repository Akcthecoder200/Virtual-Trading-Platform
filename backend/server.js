import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Configure dotenv
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import testAuthRoutes from "./routes/test-auth.js";
import userRoutes from "./routes/users.js";
import walletRoutes from "./routes/wallet.js";
import tradeRoutes from "./routes/trades.js";
import marketRoutes from "./routes/market.js";
import adminRoutes from "./routes/admin.js";

// Import middleware
import errorHandler from "./middleware/errorHandler.js";

// Import models and database utilities
import {
  initializeDefaultData,
  setupModelRelationships,
  getDatabaseStats,
} from "./models/index.js";

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

// CORS configuration - simplified
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbStats = await getDatabaseStats();
    res.status(200).json({
      status: "OK",
      message: "Virtual Trading Platform API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: mongoose.connection.readyState === 1,
        stats: dbStats,
      },
    });
  } catch (error) {
    res.status(200).json({
      status: "OK",
      message: "Virtual Trading Platform API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: {
        connected: mongoose.connection.readyState === 1,
        stats: "Not available",
      },
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/test-auth", testAuthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/trading", tradeRoutes); // Also map to /api/trading path for frontend compatibility
app.use("/api/market", marketRoutes);
app.use("/api/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Virtual Trading Platform API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);

    // Setup model relationships and hooks
    setupModelRelationships();

    // Initialize default data
    await initializeDefaultData();

    // Create default admin user if it doesn't exist
    const createDefaultAdmin = await import("./config/createDefaultAdmin.js");
    await createDefaultAdmin.default();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

export default app;
