import express from "express";
const router = express.Router();

/**
 * @route   GET /api/trades/test
 * @desc    Test trades route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Trades routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder routes - will be implemented in later steps
router.post("/buy", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.post("/sell", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.get("/history", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

export default router;
