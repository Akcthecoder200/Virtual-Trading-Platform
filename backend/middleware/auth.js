import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Access token is required",
          code: "NO_TOKEN",
        },
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Account is deactivated",
          code: "ACCOUNT_INACTIVE",
        },
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid token",
          code: "INVALID_TOKEN",
        },
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        },
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Authentication error",
        code: "AUTH_ERROR",
      },
    });
  }
};

// Legacy alias for backward compatibility
const auth = authenticateToken;

/**
 * Admin Authorization Middleware
 * Requires user to be authenticated and have admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
          code: "NOT_AUTHENTICATED",
        },
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: {
          message: "Admin access required",
          code: "INSUFFICIENT_PERMISSIONS",
        },
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      error: {
        message: "Authorization error",
        code: "AUTH_ERROR",
      },
    });
  }
};

// Legacy alias for backward compatibility
const adminAuth = requireAdmin;

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid or expired - continue without user
        console.log("Optional auth token invalid:", error.message);
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue without user
  }
};

/**
 * Generate JWT Token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = "24h") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/**
 * Verify Token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export { authenticateToken, auth, requireAdmin, adminAuth, optionalAuth };

export default {
  authenticateToken,
  auth,
  requireAdmin,
  adminAuth,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyToken,
};
