import express from "express";
const router = express.Router();

/**
 * @route   GET /api/wallet/test
 * @desc    Test wallet route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Wallet routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder routes - will be implemented in later steps
router.get("/balance", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.post("/reset", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

export default router;
