import express from "express";
const router = express.Router();

/**
 * @route   GET /api/auth/test
 * @desc    Test auth route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder for auth routes - will be implemented in next step
router.post("/signup", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in next step" },
  });
});

router.post("/login", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in next step" },
  });
});

router.get("/profile", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in next step" },
  });
});

export default router;
