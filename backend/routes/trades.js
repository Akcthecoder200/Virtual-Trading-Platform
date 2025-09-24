import express from "express";
import {
  getMarketData,
  placeTrade,
  getTrades,
  closeTrade,
  getPortfolio,
  getOpenPositions,
  getPendingOrders,
  cancelOrder,
} from "../controllers/tradingController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/trades/test
 * @desc    Test trades route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Trading routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Specific routes must come BEFORE general routes to avoid conflicts

// Market data endpoints
/**
 * @route   GET /api/trades/market-data
 * @desc    Get current market data for available stocks
 * @access  Private
 */
router.get("/market-data", auth, getMarketData);

// Portfolio endpoints
/**
 * @route   GET /api/trades/portfolio
 * @desc    Get user's portfolio summary
 * @access  Private
 */
router.get("/portfolio", auth, getPortfolio);

/**
 * @route   GET /api/trades/positions
 * @desc    Get user's open positions
 * @access  Private
 */
router.get("/positions", auth, getOpenPositions);

/**
 * @route   GET /api/trades/pending
 * @desc    Get user's pending orders
 * @access  Private
 */
router.get("/pending", auth, getPendingOrders);

/**
 * @route   DELETE /api/trades/pending/:orderId
 * @desc    Cancel a pending order
 * @access  Private
 */
router.delete("/pending/:orderId", auth, cancelOrder);

// Trading endpoints
/**
 * @route   POST /api/trades
 * @desc    Place a new trade (buy or sell)
 * @access  Private
 */
router.post("/", auth, placeTrade);

/**
 * @route   GET /api/trades
 * @desc    Get user's trade history with pagination
 * @access  Private
 */
router.get("/", auth, getTrades);

/**
 * @route   PUT /api/trades/:id/close
 * @desc    Close an open trade
 * @access  Private
 */
router.put("/:id/close", auth, closeTrade);

// Legacy routes for backward compatibility
router.post("/buy", auth, placeTrade);
router.post("/sell", auth, placeTrade);
router.get("/history", auth, getTrades);

export default router;
