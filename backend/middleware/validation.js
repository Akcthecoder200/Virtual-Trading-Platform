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
  body("firstName")
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters")
    .isAlpha("en-US", { ignore: " -'" })
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim(),

  body("lastName")
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters")
    .isAlpha("en-US", { ignore: " -'" })
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email address is too long"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

  body("dateOfBirth")
    .isISO8601()
    .withMessage("Date of birth must be a valid date")
    .custom((value) => {
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        throw new Error("You must be at least 18 years old to register");
      }

      if (age > 120) {
        throw new Error("Please provide a valid date of birth");
      }

      return true;
    }),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("country")
    .isLength({ min: 2, max: 2 })
    .withMessage("Country code must be a valid 2-letter ISO country code")
    .isAlpha()
    .withMessage("Country code must contain only letters")
    .toUpperCase(),

  body("agreeToTerms")
    .isBoolean()
    .withMessage("Agreement to terms must be a boolean value")
    .custom((value) => {
      if (value !== true) {
        throw new Error("You must agree to the terms and conditions");
      }
      return true;
    }),

  handleValidationErrors,
];

// Alias for backward compatibility
const validateSignup = validateRegistration;

/**
 * User login validation rules
 */
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),

  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("Remember me must be a boolean value"),

  handleValidationErrors,
];

/**
 * Password reset request validation rules
 */
const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  handleValidationErrors,
];

/**
 * Password reset validation rules
 */
const validatePasswordReset = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 1 })
    .withMessage("Reset token cannot be empty"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),

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
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage("First name must be between 2 and 30 characters")
    .isAlpha("en-US", { ignore: " -'" })
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim(),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage("Last name must be between 2 and 30 characters")
    .isAlpha("en-US", { ignore: " -'" })
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim(),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date")
    .custom((value) => {
      if (value) {
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) {
          throw new Error("You must be at least 18 years old");
        }

        if (age > 120) {
          throw new Error("Please provide a valid date of birth");
        }
      }
      return true;
    }),

  body("country")
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage("Country code must be a valid 2-letter ISO country code")
    .isAlpha()
    .withMessage("Country code must contain only letters")
    .toUpperCase(),

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
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),

  body("confirmNewPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),

  handleValidationErrors,
];

/**
 * Email change validation rules
 */
const validateEmailChange = [
  body("newEmail")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email address is too long"),
    
  body("password")
    .notEmpty()
    .withMessage("Password is required to change email"),
    
  handleValidationErrors,
];

/**
 * Wallet funds operation validation rules
 */
const validateWalletFunds = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be a positive number greater than 0.01")
    .custom((value) => {
      if (value > 1000000) {
        throw new Error("Amount cannot exceed $1,000,000");
      }
      return true;
    }),
    
  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters")
    .trim(),
    
  handleValidationErrors,
];

/**
 * Admin wallet reset validation rules
 */
const validateAdminWalletReset = [
  body("amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
    
  body("reason")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters")
    .trim(),
    
  handleValidationErrors,
];

export {
  validateRegistration,
  validateSignup,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateTrade,
  validateProfileUpdate,
  validatePasswordChange,
  validateEmailChange,
  validateWalletFunds,
  validateAdminWalletReset,
  handleValidationErrors,
};