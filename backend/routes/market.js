import express from "express";
const router = express.Router();

/**
 * @route   GET /api/market/test
 * @desc    Test market route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Market routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder routes - will be implemented in later steps
router.get("/prices", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.get("/prices/:symbol", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

export default router;
