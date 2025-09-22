import { body, validationResult } from "express-validator";

/**
 * Validation middleware to handle express-validator results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      },
    });
  }

  next();
};

/**
 * User registration validation rules
 */
const validateRegistration = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("firstName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),

  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),

  handleValidationErrors,
];

/**
 * User login validation rules
 */
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

/**
 * Trade validation rules
 */
const validateTrade = [
  body("symbol")
    .notEmpty()
    .withMessage("Trading symbol is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("Symbol must be between 2 and 10 characters"),

  body("type")
    .isIn(["buy", "sell"])
    .withMessage("Trade type must be either buy or sell"),

  body("orderType")
    .isIn(["market", "limit", "stop-loss", "take-profit"])
    .withMessage("Order type must be market, limit, stop-loss, or take-profit"),

  body("quantity")
    .isFloat({ min: 0.001 })
    .withMessage("Quantity must be a positive number greater than 0.001"),

  body("price")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Price must be a positive number"),

  body("stopLoss")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Stop loss must be a positive number"),

  body("takeProfit")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Take profit must be a positive number"),

  handleValidationErrors,
];

/**
 * Profile update validation rules
 */
const validateProfileUpdate = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("firstName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),

  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("country")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),

  handleValidationErrors,
];

/**
 * Password change validation rules
 */
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),

  handleValidationErrors,
];

export {
  validateRegistration,
  validateLogin,
  validateTrade,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors,
};
