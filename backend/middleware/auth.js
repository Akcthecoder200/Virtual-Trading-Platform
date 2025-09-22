import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and adds user to request object
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: { message: "No token provided, authorization denied" },
      });
    }

    // Extract token from "Bearer TOKEN"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "No token provided, authorization denied" },
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and add to request
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Token is not valid - user not found" },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: "Account is deactivated" },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid token" },
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: { message: "Token expired" },
      });
    }

    res.status(500).json({
      success: false,
      error: { message: "Server error in authentication" },
    });
  }
};

/**
 * Admin authorization middleware
 * Requires user to be authenticated and have admin role
 */
const adminAuth = async (req, res, next) => {
  try {
    // First run auth middleware
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied. Admin privileges required." },
      });
    }

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Server error in admin authentication" },
    });
  }
};

/**
 * Optional authentication middleware
 * Adds user to request if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

export { auth, adminAuth, optionalAuth };
