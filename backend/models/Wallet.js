import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Transaction History Schema
 * Records all wallet transactions
 */
const transactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "trade_profit",
        "trade_loss",
        "bonus",
        "fee",
        "reset",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    reference: {
      type: String, // Trade ID, Admin ID, etc.
      maxlength: [100, "Reference cannot exceed 100 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed, // Additional data like trade details, admin notes, etc.
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Balance History Schema
 * Daily snapshots for analytics
 */
const balanceHistorySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
    },
    equity: {
      type: Number,
      required: true,
      min: 0,
    },
    margin: {
      type: Number,
      default: 0,
      min: 0,
    },
    freeMargin: {
      type: Number,
      required: true,
      min: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/**
 * Main Wallet Schema
 */
const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Main balance fields
    balance: {
      type: Number,
      required: true,
      default: () => parseFloat(process.env.DEFAULT_DEMO_BALANCE) || 10000,
      min: [0, "Balance cannot be negative"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value >= 0;
        },
        message: "Balance must be a valid positive number",
      },
    },
    equity: {
      type: Number,
      required: true,
      default: function () {
        return this.balance;
      },
      min: [0, "Equity cannot be negative"],
    },
    margin: {
      type: Number,
      default: 0,
      min: [0, "Margin cannot be negative"],
    },
    freeMargin: {
      type: Number,
      required: true,
      default: function () {
        return this.balance - this.margin;
      },
      min: [0, "Free margin cannot be negative"],
    },
    // Currency settings
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"],
      default: "USD",
    },
    // Trading limits and settings
    leverage: {
      type: Number,
      min: 1,
      max: 500,
      default: 1,
    },
    maxDrawdown: {
      type: Number,
      min: 0,
      max: 100,
      default: 50, // 50% max drawdown
    },
    dailyLossLimit: {
      type: Number,
      min: 0,
      default: 1000, // $1000 daily loss limit
    },
    // Risk management
    riskSettings: {
      maxRiskPerTrade: {
        type: Number,
        min: 0.1,
        max: 100,
        default: 2, // 2% of balance
      },
      maxOpenPositions: {
        type: Number,
        min: 1,
        max: 100,
        default: 10,
      },
      stopOutLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 20, // Stop out at 20% margin level
      },
    },
    // Transaction history
    transactions: [transactionSchema],
    // Daily balance snapshots
    balanceHistory: [balanceHistorySchema],
    // Statistics
    statistics: {
      totalDeposits: {
        type: Number,
        default: 0,
      },
      totalWithdrawals: {
        type: Number,
        default: 0,
      },
      totalTradingProfit: {
        type: Number,
        default: 0,
      },
      totalTradingLoss: {
        type: Number,
        default: 0,
      },
      totalFees: {
        type: Number,
        default: 0,
      },
      highestBalance: {
        type: Number,
        default: function () {
          return this.balance;
        },
      },
      lowestBalance: {
        type: Number,
        default: function () {
          return this.balance;
        },
      },
      lastResetDate: {
        type: Date,
      },
      daysActive: {
        type: Number,
        default: 0,
      },
    },
    // Status and flags
    status: {
      type: String,
      enum: ["active", "suspended", "frozen", "closed"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Metadata
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
walletSchema.index({ user: 1 });
walletSchema.index({ status: 1, isActive: 1 });
walletSchema.index({ "transactions.createdAt": -1 });
walletSchema.index({ "balanceHistory.date": -1 });
walletSchema.index({ lastActivity: -1 });

// Virtual fields
walletSchema.virtual("netProfit").get(function () {
  return this.statistics.totalTradingProfit - this.statistics.totalTradingLoss;
});

walletSchema.virtual("profitLossPercentage").get(function () {
  const initialBalance = parseFloat(process.env.DEFAULT_DEMO_BALANCE) || 10000;
  return ((this.balance - initialBalance) / initialBalance) * 100;
});

walletSchema.virtual("marginLevel").get(function () {
  if (this.margin === 0) return Infinity;
  return (this.equity / this.margin) * 100;
});

walletSchema.virtual("drawdown").get(function () {
  if (this.statistics.highestBalance === 0) return 0;
  return (
    ((this.statistics.highestBalance - this.balance) /
      this.statistics.highestBalance) *
    100
  );
});

// Pre-save middleware
walletSchema.pre("save", function (next) {
  // Update equity (balance + floating P/L)
  this.equity = this.balance; // In demo, equity = balance (no floating P/L for simplicity)

  // Update free margin
  this.freeMargin = this.equity - this.margin;

  // Update statistics
  if (this.balance > this.statistics.highestBalance) {
    this.statistics.highestBalance = this.balance;
  }

  if (this.balance < this.statistics.lowestBalance) {
    this.statistics.lowestBalance = this.balance;
  }

  // Update last activity
  this.lastActivity = new Date();

  next();
});

// Instance methods
walletSchema.methods.addTransaction = function (transactionData) {
  const { type, amount, description, reference, metadata } = transactionData;

  const balanceBefore = this.balance;
  let balanceAfter;

  // Calculate new balance based on transaction type
  switch (type) {
    case "deposit":
    case "trade_profit":
    case "bonus":
      balanceAfter = balanceBefore + Math.abs(amount);
      break;
    case "withdrawal":
    case "trade_loss":
    case "fee":
      balanceAfter = balanceBefore - Math.abs(amount);
      break;
    case "reset":
      balanceAfter = amount;
      break;
    default:
      throw new Error(`Invalid transaction type: ${type}`);
  }

  // Ensure balance doesn't go negative
  if (balanceAfter < 0) {
    throw new Error("Insufficient balance for this transaction");
  }

  // Create transaction record
  const transaction = {
    type,
    amount: type === "reset" ? amount : Math.abs(amount),
    balanceBefore,
    balanceAfter,
    description,
    reference,
    metadata,
    status: "completed",
  };

  // Add transaction to history
  this.transactions.push(transaction);

  // Update balance
  this.balance = balanceAfter;

  // Update statistics
  this.updateStatistics(type, Math.abs(amount));

  return this;
};

walletSchema.methods.updateStatistics = function (transactionType, amount) {
  switch (transactionType) {
    case "deposit":
      this.statistics.totalDeposits += amount;
      break;
    case "withdrawal":
      this.statistics.totalWithdrawals += amount;
      break;
    case "trade_profit":
      this.statistics.totalTradingProfit += amount;
      break;
    case "trade_loss":
      this.statistics.totalTradingLoss += amount;
      break;
    case "fee":
      this.statistics.totalFees += amount;
      break;
    case "reset":
      this.statistics.lastResetDate = new Date();
      break;
  }
};

walletSchema.methods.resetBalance = function (newBalance, adminId, reason) {
  const resetAmount =
    newBalance || parseFloat(process.env.DEFAULT_DEMO_BALANCE) || 10000;

  return this.addTransaction({
    type: "reset",
    amount: resetAmount,
    description: `Balance reset to $${resetAmount}. Reason: ${
      reason || "Admin reset"
    }`,
    reference: adminId,
    metadata: {
      adminId,
      reason,
      previousBalance: this.balance,
    },
  });
};

walletSchema.methods.takeSnapshot = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if snapshot already exists for today
  const existingSnapshot = this.balanceHistory.find(
    (snapshot) => snapshot.date.getTime() === today.getTime()
  );

  if (existingSnapshot) {
    // Update existing snapshot
    existingSnapshot.balance = this.balance;
    existingSnapshot.equity = this.equity;
    existingSnapshot.margin = this.margin;
    existingSnapshot.freeMargin = this.freeMargin;
    existingSnapshot.profitLoss = this.netProfit;
  } else {
    // Create new snapshot
    this.balanceHistory.push({
      date: today,
      balance: this.balance,
      equity: this.equity,
      margin: this.margin,
      freeMargin: this.freeMargin,
      profitLoss: this.netProfit,
    });
  }

  // Keep only last 365 days of history
  if (this.balanceHistory.length > 365) {
    this.balanceHistory = this.balanceHistory
      .sort((a, b) => b.date - a.date)
      .slice(0, 365);
  }

  return this;
};

walletSchema.methods.canMakeTrade = function (tradeAmount, leverage = 1) {
  const requiredMargin = tradeAmount / leverage;
  return this.freeMargin >= requiredMargin;
};

walletSchema.methods.calculateRequiredMargin = function (
  tradeAmount,
  leverage = 1
) {
  return tradeAmount / leverage;
};

// Static methods
walletSchema.statics.findByUser = function (userId) {
  return this.findOne({ user: userId, isActive: true });
};

walletSchema.statics.createForUser = function (userId, initialBalance) {
  const balance =
    initialBalance || parseFloat(process.env.DEFAULT_DEMO_BALANCE) || 10000;

  return this.create({
    user: userId,
    balance,
    equity: balance,
    freeMargin: balance,
    statistics: {
      highestBalance: balance,
      lowestBalance: balance,
    },
  });
};

// Export the model
const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
