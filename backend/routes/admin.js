import express from "express";
const router = express.Router();

/**
 * @route   GET /api/admin/test
 * @desc    Test admin route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes are working",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder routes - will be implemented in later steps
router.get("/users", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.delete("/users/:id", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

router.post("/reset-balance/:id", (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: "Route not implemented yet - coming in later steps" },
  });
});

export default router;
