import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const { Schema } = mongoose;

/**
 * User Profile Schema
 * Contains additional user information
 */
const profileSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, "Street address cannot exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, "City name cannot exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, "State name cannot exceed 50 characters"],
      },
      zipCode: {
        type: String,
        trim: true,
        maxlength: [20, "Zip code cannot exceed 20 characters"],
      },
    },
    avatar: {
      type: String,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return validator.isURL(value);
        },
        message: "Avatar must be a valid URL",
      },
    },
  },
  { _id: false }
);

/**
 * User Preferences Schema
 * Trading and UI preferences
 */
const preferencesSchema = new Schema(
  {
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    language: {
      type: String,
      enum: ["en", "es", "fr", "de", "zh", "ja"],
      default: "en",
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"],
      default: "USD",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      trades: {
        type: Boolean,
        default: true,
      },
      market: {
        type: Boolean,
        default: false,
      },
    },
    trading: {
      defaultLeverage: {
        type: Number,
        min: 1,
        max: 500,
        default: 1,
      },
      riskManagement: {
        maxRiskPerTrade: {
          type: Number,
          min: 0.1,
          max: 100,
          default: 2, // 2% max risk per trade
        },
        stopLossEnabled: {
          type: Boolean,
          default: true,
        },
        takeProfitEnabled: {
          type: Boolean,
          default: true,
        },
      },
    },
  },
  { _id: false }
);

/**
 * User Security Schema
 * Security-related fields
 */
const securitySchema = new Schema(
  {
    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    twoFactorSecret: {
      type: String,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Main User Schema
 */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      type: profileSchema,
      required: true,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    security: {
      type: securitySchema,
      default: () => ({}),
    },
    // Virtual wallet reference
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    // Analytics and tracking
    analytics: {
      totalTrades: {
        type: Number,
        default: 0,
      },
      winRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalProfit: {
        type: Number,
        default: 0,
      },
      totalLoss: {
        type: Number,
        default: 0,
      },
      bestTrade: {
        type: Number,
        default: 0,
      },
      worstTrade: {
        type: Number,
        default: 0,
      },
      averageTradeSize: {
        type: Number,
        default: 0,
      },
      tradingDays: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1, username: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ "security.lastLogin": -1 });
userSchema.index({ createdAt: -1 });

// Virtual fields
userSchema.virtual("fullName").get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.virtual("isLocked").get(function () {
  return this.security.lockUntil && this.security.lockUntil > Date.now();
});

userSchema.virtual("netProfit").get(function () {
  return this.analytics.totalProfit - this.analytics.totalLoss;
});

// Pre-save middleware
userSchema.pre("save", async function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Set email verification status
  if (this.isModified("email") && !this.isNew) {
    this.isEmailVerified = false;
    this.status = "pending";
  }

  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { "security.lockUntil": 1 },
      $set: { "security.loginAttempts": 1 },
    });
  }

  const updates = { $inc: { "security.loginAttempts": 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { "security.lockUntil": Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { "security.loginAttempts": 1, "security.lockUntil": 1 },
    $set: { "security.lastLogin": new Date() },
  });
};

userSchema.methods.updateTradingAnalytics = function (tradeData) {
  const { profit, loss, tradeSize } = tradeData;

  this.analytics.totalTrades += 1;

  if (profit > 0) {
    this.analytics.totalProfit += profit;
    if (profit > this.analytics.bestTrade) {
      this.analytics.bestTrade = profit;
    }
  } else if (loss > 0) {
    this.analytics.totalLoss += loss;
    if (loss > Math.abs(this.analytics.worstTrade)) {
      this.analytics.worstTrade = -loss;
    }
  }

  // Calculate win rate
  const profitableTrades = this.analytics.totalProfit > 0 ? 1 : 0;
  this.analytics.winRate =
    (profitableTrades / this.analytics.totalTrades) * 100;

  // Update average trade size
  this.analytics.averageTradeSize =
    (this.analytics.averageTradeSize * (this.analytics.totalTrades - 1) +
      tradeSize) /
    this.analytics.totalTrades;

  return this.save();
};

// Static methods
userSchema.statics.findByCredentials = async function (
  emailOrUsername,
  password
) {
  const user = await this.findOne({
    $or: [
      { email: emailOrUsername.toLowerCase() },
      { username: emailOrUsername.toLowerCase() },
    ],
    isActive: true,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.isLocked) {
    throw new Error(
      "Account is temporarily locked due to too many failed login attempts"
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incLoginAttempts();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  if (user.security.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  return user;
};

userSchema.statics.findActiveUsers = function (filters = {}) {
  return this.find({
    isActive: true,
    status: "active",
    ...filters,
  });
};

// Export the model
const User = mongoose.model("User", userSchema);
export default User;
