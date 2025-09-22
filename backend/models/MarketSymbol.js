import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Price Data Schema
 * OHLCV data for charting
 */
const priceDataSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
      min: 0,
    },
    high: {
      type: Number,
      required: true,
      min: 0,
    },
    low: {
      type: Number,
      required: true,
      min: 0,
    },
    close: {
      type: Number,
      required: true,
      min: 0,
    },
    volume: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeframe: {
      type: String,
      enum: ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"],
      required: true,
    },
  },
  { _id: false }
);

/**
 * Market Symbol Schema
 * Configuration for tradeable instruments
 */
const marketSymbolSchema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["forex", "crypto", "stock", "commodity", "index"],
      required: true,
      index: true,
    },
    baseAsset: {
      type: String,
      uppercase: true,
      trim: true,
    },
    quoteAsset: {
      type: String,
      uppercase: true,
      trim: true,
    },
    // Current market data
    currentPrice: {
      type: Number,
      min: 0,
    },
    bid: {
      type: Number,
      min: 0,
    },
    ask: {
      type: Number,
      min: 0,
    },
    spread: {
      type: Number,
      min: 0,
    },
    // 24h statistics
    change24h: {
      type: Number,
      default: 0,
    },
    changePercent24h: {
      type: Number,
      default: 0,
    },
    high24h: {
      type: Number,
      min: 0,
    },
    low24h: {
      type: Number,
      min: 0,
    },
    volume24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Trading configuration
    minTradeSize: {
      type: Number,
      default: 0.01,
      min: 0,
    },
    maxTradeSize: {
      type: Number,
      default: 1000000,
      min: 0,
    },
    tickSize: {
      type: Number,
      default: 0.00001,
      min: 0,
    },
    lotSize: {
      type: Number,
      default: 100000, // Standard lot for forex
      min: 1,
    },
    maxLeverage: {
      type: Number,
      default: 100,
      min: 1,
      max: 500,
    },
    marginRate: {
      type: Number,
      default: 0.01, // 1% margin
      min: 0.001,
      max: 1,
    },
    // Market hours (in UTC)
    marketHours: {
      open: {
        type: String,
        default: "00:00", // 24/7 for crypto
      },
      close: {
        type: String,
        default: "23:59",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      isAlwaysOpen: {
        type: Boolean,
        default: false,
      },
    },
    // Status and metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isTradeable: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    category: {
      type: String,
      trim: true,
    },
    // Historical price data
    priceHistory: [priceDataSchema],
    // API configuration
    apiSymbol: {
      type: String, // Symbol used in external API
      trim: true,
    },
    dataSource: {
      type: String,
      enum: ["alpha_vantage", "yahoo_finance", "binance", "coinbase", "manual"],
      default: "alpha_vantage",
    },
    lastUpdated: {
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
marketSymbolSchema.index({ symbol: 1, type: 1 });
marketSymbolSchema.index({ type: 1, isActive: 1 });
marketSymbolSchema.index({ isTradeable: 1, isActive: 1 });
marketSymbolSchema.index({ "priceHistory.timestamp": -1 });
marketSymbolSchema.index({ lastUpdated: 1 });

// Virtual fields
marketSymbolSchema.virtual("spreadPercent").get(function () {
  if (!this.bid || !this.ask) return 0;
  return ((this.ask - this.bid) / this.bid) * 100;
});

marketSymbolSchema.virtual("isMarketOpen").get(function () {
  if (this.marketHours.isAlwaysOpen) return true;

  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const currentTime = utcHours * 100 + utcMinutes;

  const openTime = parseInt(this.marketHours.open.replace(":", ""));
  const closeTime = parseInt(this.marketHours.close.replace(":", ""));

  if (openTime <= closeTime) {
    return currentTime >= openTime && currentTime <= closeTime;
  } else {
    // Market crosses midnight
    return currentTime >= openTime || currentTime <= closeTime;
  }
});

marketSymbolSchema.virtual("displayName").get(function () {
  if (this.type === "forex") {
    return `${this.baseAsset}/${this.quoteAsset}`;
  }
  return this.name;
});

// Pre-save middleware
marketSymbolSchema.pre("save", function (next) {
  // Calculate spread
  if (this.bid && this.ask) {
    this.spread = this.ask - this.bid;
  }

  // Update last updated timestamp
  this.lastUpdated = new Date();

  next();
});

// Instance methods
marketSymbolSchema.methods.updatePrice = function (priceData) {
  const { price, bid, ask, high24h, low24h, volume24h, change24h } = priceData;

  const previousPrice = this.currentPrice;

  // Update current price data
  this.currentPrice = price;
  if (bid) this.bid = bid;
  if (ask) this.ask = ask;
  if (high24h) this.high24h = high24h;
  if (low24h) this.low24h = low24h;
  if (volume24h) this.volume24h = volume24h;

  // Calculate 24h change
  if (change24h !== undefined) {
    this.change24h = change24h;
    this.changePercent24h = previousPrice
      ? (change24h / previousPrice) * 100
      : 0;
  }

  this.lastUpdated = new Date();

  return this;
};

marketSymbolSchema.methods.addPriceCandle = function (
  candleData,
  timeframe = "1h"
) {
  const { timestamp, open, high, low, close, volume } = candleData;

  const candle = {
    timestamp: new Date(timestamp),
    open,
    high,
    low,
    close,
    volume: volume || 0,
    timeframe,
  };

  // Add to price history
  this.priceHistory.push(candle);

  // Keep only last 1000 candles to prevent document size issues
  if (this.priceHistory.length > 1000) {
    this.priceHistory = this.priceHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 1000);
  }

  // Update current price from latest candle
  this.currentPrice = close;

  return this;
};

marketSymbolSchema.methods.getPriceHistory = function (
  timeframe = "1h",
  limit = 100
) {
  return this.priceHistory
    .filter((candle) => candle.timeframe === timeframe)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

marketSymbolSchema.methods.calculateRequiredMargin = function (
  tradeSize,
  leverage
) {
  const actualLeverage = Math.min(leverage || 1, this.maxLeverage);
  return (tradeSize * this.currentPrice) / actualLeverage;
};

// Static methods
marketSymbolSchema.statics.findTradeable = function () {
  return this.find({
    isActive: true,
    isTradeable: true,
  }).sort({ symbol: 1 });
};

marketSymbolSchema.statics.findByType = function (type) {
  return this.find({
    type,
    isActive: true,
  }).sort({ symbol: 1 });
};

marketSymbolSchema.statics.searchSymbols = function (query) {
  const regex = new RegExp(query, "i");
  return this.find({
    $or: [
      { symbol: regex },
      { name: regex },
      { baseAsset: regex },
      { quoteAsset: regex },
    ],
    isActive: true,
  }).limit(20);
};

marketSymbolSchema.statics.updatePrices = async function (priceUpdates) {
  const bulkOps = priceUpdates.map((update) => ({
    updateOne: {
      filter: { symbol: update.symbol },
      update: {
        $set: {
          currentPrice: update.price,
          bid: update.bid,
          ask: update.ask,
          high24h: update.high24h,
          low24h: update.low24h,
          volume24h: update.volume24h,
          change24h: update.change24h,
          changePercent24h: update.changePercent24h,
          lastUpdated: new Date(),
        },
      },
    },
  }));

  return this.bulkWrite(bulkOps);
};

// Create default symbols
marketSymbolSchema.statics.createDefaultSymbols = async function () {
  const defaultSymbols = [
    // Major Forex Pairs
    {
      symbol: "EURUSD",
      name: "Euro vs US Dollar",
      type: "forex",
      baseAsset: "EUR",
      quoteAsset: "USD",
      currentPrice: 1.085,
      minTradeSize: 0.01,
      maxLeverage: 500,
      marginRate: 0.002,
    },
    {
      symbol: "GBPUSD",
      name: "British Pound vs US Dollar",
      type: "forex",
      baseAsset: "GBP",
      quoteAsset: "USD",
      currentPrice: 1.265,
      minTradeSize: 0.01,
      maxLeverage: 500,
      marginRate: 0.002,
    },
    {
      symbol: "USDJPY",
      name: "US Dollar vs Japanese Yen",
      type: "forex",
      baseAsset: "USD",
      quoteAsset: "JPY",
      currentPrice: 149.5,
      minTradeSize: 0.01,
      maxLeverage: 500,
      marginRate: 0.002,
      tickSize: 0.01,
    },
    // Major Cryptocurrencies
    {
      symbol: "BTCUSD",
      name: "Bitcoin vs US Dollar",
      type: "crypto",
      baseAsset: "BTC",
      quoteAsset: "USD",
      currentPrice: 42000,
      minTradeSize: 0.001,
      maxLeverage: 100,
      marginRate: 0.01,
      marketHours: { isAlwaysOpen: true },
    },
    {
      symbol: "ETHUSD",
      name: "Ethereum vs US Dollar",
      type: "crypto",
      baseAsset: "ETH",
      quoteAsset: "USD",
      currentPrice: 2500,
      minTradeSize: 0.01,
      maxLeverage: 100,
      marginRate: 0.01,
      marketHours: { isAlwaysOpen: true },
    },
    // Major Stocks
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      type: "stock",
      currentPrice: 175.5,
      minTradeSize: 1,
      maxLeverage: 5,
      marginRate: 0.2,
      marketHours: {
        open: "14:30",
        close: "21:00",
        timezone: "UTC",
      },
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      type: "stock",
      currentPrice: 140.5,
      minTradeSize: 1,
      maxLeverage: 5,
      marginRate: 0.2,
      marketHours: {
        open: "14:30",
        close: "21:00",
        timezone: "UTC",
      },
    },
  ];

  for (const symbolData of defaultSymbols) {
    await this.updateOne(
      { symbol: symbolData.symbol },
      { $setOnInsert: symbolData },
      { upsert: true }
    );
  }

  console.log("✅ Default market symbols created/updated");
};

// Export the model
const MarketSymbol = mongoose.model("MarketSymbol", marketSymbolSchema);
export default MarketSymbol;
