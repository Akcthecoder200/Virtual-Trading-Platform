import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Market Conditions Schema
 * Captures market state when trade was placed
 */
const marketConditionsSchema = new Schema(
  {
    marketOpen: {
      type: Boolean,
      default: true,
    },
    volatility: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    spread: {
      type: Number,
      min: 0,
    },
    liquidity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "high",
    },
  },
  { _id: false }
);

/**
 * Trade Execution Schema
 * Details about how the trade was executed
 */
const executionSchema = new Schema(
  {
    requestedPrice: {
      type: Number,
      required: true,
    },
    executedPrice: {
      type: Number,
      required: true,
    },
    slippage: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
    },
    swap: {
      type: Number,
      default: 0,
    },
    executionTime: {
      type: Number, // milliseconds
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Main Trade Schema
 */
const tradeSchema = new Schema(
  {
    // User reference
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Basic trade information
    symbol: {
      type: String,
      required: [true, "Trading symbol is required"],
      uppercase: true,
      trim: true,
      maxlength: [10, "Symbol cannot exceed 10 characters"],
      match: [
        /^[A-Z0-9_\/]+$/,
        "Symbol can only contain uppercase letters, numbers, and underscores",
      ],
    },
    symbolType: {
      type: String,
      enum: ["forex", "crypto", "stock", "commodity", "index"],
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: [true, "Trade type is required"],
    },
    orderType: {
      type: String,
      enum: ["market", "limit", "stop", "stop-limit"],
      required: [true, "Order type is required"],
    },
    // Position sizing
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.001, "Quantity must be greater than 0.001"],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: "Quantity must be a valid positive number",
      },
    },
    lotSize: {
      type: Number,
      default: 0.01,
      min: 0.001,
    },
    // Pricing
    entryPrice: {
      type: Number,
      required: [true, "Entry price is required"],
      min: [0.00001, "Entry price must be greater than 0"],
    },
    currentPrice: {
      type: Number,
      min: [0.00001, "Current price must be greater than 0"],
    },
    exitPrice: {
      type: Number,
      min: [0.00001, "Exit price must be greater than 0"],
    },
    // Risk management
    stopLoss: {
      type: Number,
      min: [0.00001, "Stop loss must be greater than 0"],
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          if (this.type === "buy") {
            return value < this.entryPrice;
          } else {
            return value > this.entryPrice;
          }
        },
        message:
          "Stop loss must be in the correct direction relative to entry price",
      },
    },
    takeProfit: {
      type: Number,
      min: [0.00001, "Take profit must be greater than 0"],
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          if (this.type === "buy") {
            return value > this.entryPrice;
          } else {
            return value < this.entryPrice;
          }
        },
        message:
          "Take profit must be in the correct direction relative to entry price",
      },
    },
    // Position status
    status: {
      type: String,
      enum: ["pending", "open", "closed", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
    // Timing
    openTime: {
      type: Date,
      index: true,
    },
    closeTime: {
      type: Date,
    },
    expirationTime: {
      type: Date,
    },
    duration: {
      type: Number, // seconds
      min: 0,
    },
    // P&L Calculations
    profit: {
      type: Number,
      default: 0,
    },
    loss: {
      type: Number,
      default: 0,
    },
    netProfitLoss: {
      type: Number,
      default: 0,
    },
    profitLossPercentage: {
      type: Number,
      default: 0,
    },
    // Leverage and margin
    leverage: {
      type: Number,
      min: 1,
      max: 500,
      default: 1,
    },
    margin: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Market and execution details
    marketConditions: marketConditionsSchema,
    execution: executionSchema,
    // Analytics and metadata
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    strategy: {
      type: String,
      maxlength: [100, "Strategy name cannot exceed 100 characters"],
    },
    confidence: {
      type: Number,
      min: 1,
      max: 10,
      validate: {
        validator: Number.isInteger,
        message: "Confidence must be an integer between 1 and 10",
      },
    },
    // Risk metrics
    riskReward: {
      type: Number,
      min: 0,
    },
    maxDrawdown: {
      type: Number,
      default: 0,
    },
    maxRunup: {
      type: Number,
      default: 0,
    },
    // External references
    externalId: {
      type: String,
      maxlength: [100, "External ID cannot exceed 100 characters"],
    },
    brokerTradeId: {
      type: String,
      maxlength: [100, "Broker trade ID cannot exceed 100 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
tradeSchema.index({ user: 1, status: 1 });
tradeSchema.index({ user: 1, symbol: 1 });
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ user: 1, openTime: -1 });
tradeSchema.index({ user: 1, closeTime: -1 });
tradeSchema.index({ status: 1, openTime: 1 });
tradeSchema.index({ symbol: 1, symbolType: 1 });

// Virtual fields
tradeSchema.virtual("tradeValue").get(function () {
  return this.quantity * this.entryPrice;
});

tradeSchema.virtual("unrealizedPL").get(function () {
  if (this.status !== "open" || !this.currentPrice) {
    return 0;
  }

  const priceDiff =
    this.type === "buy"
      ? this.currentPrice - this.entryPrice
      : this.entryPrice - this.currentPrice;

  return priceDiff * this.quantity;
});

tradeSchema.virtual("isWinning").get(function () {
  return this.netProfitLoss > 0;
});

tradeSchema.virtual("holdingPeriod").get(function () {
  if (!this.openTime) return 0;
  const endTime = this.closeTime || new Date();
  return Math.floor((endTime - this.openTime) / 1000); // seconds
});

tradeSchema.virtual("pips").get(function () {
  if (!this.exitPrice) return 0;

  const priceDiff =
    this.type === "buy"
      ? this.exitPrice - this.entryPrice
      : this.entryPrice - this.exitPrice;

  // Calculate pips based on symbol type
  let pipMultiplier = 10000; // Default for major forex pairs

  if (this.symbol.includes("JPY")) {
    pipMultiplier = 100;
  } else if (this.symbolType === "crypto") {
    pipMultiplier = this.entryPrice > 1 ? 100 : 100000;
  }

  return Math.round(priceDiff * pipMultiplier * 10) / 10; // Round to 1 decimal
});

// Pre-save middleware
tradeSchema.pre("save", function (next) {
  // Set open time when status changes to open
  if (this.isModified("status") && this.status === "open" && !this.openTime) {
    this.openTime = new Date();
  }

  // Set close time when status changes to closed
  if (
    this.isModified("status") &&
    this.status === "closed" &&
    !this.closeTime
  ) {
    this.closeTime = new Date();
  }

  // Calculate duration for closed trades
  if (this.status === "closed" && this.openTime && this.closeTime) {
    this.duration = Math.floor((this.closeTime - this.openTime) / 1000);
  }

  // Calculate margin requirement
  if (this.leverage && this.quantity && this.entryPrice) {
    this.margin = (this.quantity * this.entryPrice) / this.leverage;
  }

  // Calculate risk-reward ratio
  if (this.stopLoss && this.takeProfit) {
    const risk = Math.abs(this.entryPrice - this.stopLoss) * this.quantity;
    const reward = Math.abs(this.takeProfit - this.entryPrice) * this.quantity;
    this.riskReward = reward / risk;
  }

  next();
});

// Instance methods
tradeSchema.methods.calculateProfitLoss = function (exitPrice) {
  if (!exitPrice) {
    exitPrice = this.exitPrice || this.currentPrice;
  }

  if (!exitPrice) {
    return { profit: 0, loss: 0, netProfitLoss: 0 };
  }

  const priceDiff =
    this.type === "buy"
      ? exitPrice - this.entryPrice
      : this.entryPrice - exitPrice;

  const grossPL = priceDiff * this.quantity;
  const commission = this.execution?.commission || 0;
  const swap = this.execution?.swap || 0;
  const netPL = grossPL - commission - swap;

  return {
    profit: netPL > 0 ? netPL : 0,
    loss: netPL < 0 ? Math.abs(netPL) : 0,
    netProfitLoss: netPL,
    profitLossPercentage: (netPL / this.tradeValue) * 100,
  };
};

tradeSchema.methods.closeTrade = function (exitPrice, reason = "manual") {
  if (this.status !== "open") {
    throw new Error("Cannot close a trade that is not open");
  }

  this.exitPrice = exitPrice;
  this.closeTime = new Date();
  this.status = "closed";

  const plData = this.calculateProfitLoss(exitPrice);
  this.profit = plData.profit;
  this.loss = plData.loss;
  this.netProfitLoss = plData.netProfitLoss;
  this.profitLossPercentage = plData.profitLossPercentage;

  // Add closing reason to notes
  if (reason) {
    this.notes = this.notes
      ? `${this.notes}. Closed: ${reason}`
      : `Closed: ${reason}`;
  }

  return this;
};

tradeSchema.methods.updateCurrentPrice = function (newPrice) {
  this.currentPrice = newPrice;

  // Check stop loss
  if (this.stopLoss && this.status === "open") {
    const shouldStopOut =
      this.type === "buy"
        ? newPrice <= this.stopLoss
        : newPrice >= this.stopLoss;

    if (shouldStopOut) {
      return this.closeTrade(this.stopLoss, "stop-loss");
    }
  }

  // Check take profit
  if (this.takeProfit && this.status === "open") {
    const shouldTakeProfit =
      this.type === "buy"
        ? newPrice >= this.takeProfit
        : newPrice <= this.takeProfit;

    if (shouldTakeProfit) {
      return this.closeTrade(this.takeProfit, "take-profit");
    }
  }

  return this;
};

tradeSchema.methods.modifyTrade = function (modifications) {
  const { stopLoss, takeProfit, quantity } = modifications;

  if (this.status !== "open") {
    throw new Error("Cannot modify a closed trade");
  }

  if (stopLoss !== undefined) {
    this.stopLoss = stopLoss;
  }

  if (takeProfit !== undefined) {
    this.takeProfit = takeProfit;
  }

  if (quantity !== undefined && quantity !== this.quantity) {
    this.quantity = quantity;
    // Recalculate margin
    this.margin = (this.quantity * this.entryPrice) / this.leverage;
  }

  return this;
};

// Static methods
tradeSchema.statics.findUserTrades = function (userId, filters = {}) {
  return this.find({
    user: userId,
    ...filters,
  }).sort({ createdAt: -1 });
};

tradeSchema.statics.findOpenTrades = function (userId) {
  return this.find({
    user: userId,
    status: "open",
  }).sort({ openTime: -1 });
};

tradeSchema.statics.findTradeHistory = function (userId, limit = 50, skip = 0) {
  return this.find({
    user: userId,
    status: "closed",
  })
    .sort({ closeTime: -1 })
    .limit(limit)
    .skip(skip);
};

tradeSchema.statics.calculateUserStats = async function (
  userId,
  timeframe = "all"
) {
  const matchCondition = {
    user: mongoose.Types.ObjectId(userId),
    status: "closed",
  };

  // Add time filter if specified
  if (timeframe !== "all") {
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    matchCondition.closeTime = { $gte: startDate };
  }

  const stats = await this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        winningTrades: {
          $sum: { $cond: [{ $gt: ["$netProfitLoss", 0] }, 1, 0] },
        },
        losingTrades: {
          $sum: { $cond: [{ $lt: ["$netProfitLoss", 0] }, 1, 0] },
        },
        totalProfit: { $sum: "$profit" },
        totalLoss: { $sum: "$loss" },
        netProfitLoss: { $sum: "$netProfitLoss" },
        bestTrade: { $max: "$netProfitLoss" },
        worstTrade: { $min: "$netProfitLoss" },
        avgTradeSize: { $avg: "$tradeValue" },
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfitLoss: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgTradeSize: 0,
      avgDuration: 0,
      profitFactor: 0,
    };
  }

  const result = stats[0];
  result.winRate =
    result.totalTrades > 0
      ? (result.winningTrades / result.totalTrades) * 100
      : 0;
  result.profitFactor =
    result.totalLoss > 0 ? result.totalProfit / result.totalLoss : 0;

  return result;
};

// Export the model
const Trade = mongoose.model("Trade", tradeSchema);
export default Trade;
