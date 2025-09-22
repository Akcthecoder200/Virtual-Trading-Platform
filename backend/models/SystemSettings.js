import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * System Settings Schema
 * Global application configuration
 */
const systemSettingsSchema = new Schema(
  {
    // Application settings
    app: {
      name: {
        type: String,
        default: "Virtual Trading Platform",
      },
      version: {
        type: String,
        default: "1.0.0",
      },
      environment: {
        type: String,
        enum: ["development", "staging", "production"],
        default: "development",
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
      maintenanceMessage: {
        type: String,
        default: "System is under maintenance. Please try again later.",
      },
    },

    // Trading settings
    trading: {
      defaultBalance: {
        type: Number,
        default: 10000,
        min: 100,
        max: 1000000,
      },
      maxLeverage: {
        type: Number,
        default: 500,
        min: 1,
        max: 1000,
      },
      minTradeSize: {
        type: Number,
        default: 0.01,
        min: 0.001,
      },
      maxTradeSize: {
        type: Number,
        default: 1000000,
        min: 1,
      },
      maxOpenPositions: {
        type: Number,
        default: 100,
        min: 1,
        max: 1000,
      },
      marginCallLevel: {
        type: Number,
        default: 50, // 50%
        min: 10,
        max: 90,
      },
      stopOutLevel: {
        type: Number,
        default: 20, // 20%
        min: 5,
        max: 50,
      },
      commissionRate: {
        type: Number,
        default: 0, // No commission for demo
        min: 0,
        max: 10,
      },
    },

    // Market data settings
    marketData: {
      updateInterval: {
        type: Number,
        default: 5000, // 5 seconds
        min: 1000,
        max: 300000,
      },
      priceDecimalPlaces: {
        type: Number,
        default: 5,
        min: 2,
        max: 8,
      },
      enableRealTimeData: {
        type: Boolean,
        default: true,
      },
      dataRetentionDays: {
        type: Number,
        default: 365,
        min: 30,
        max: 1095,
      },
      apiProvider: {
        type: String,
        enum: ["alpha_vantage", "yahoo_finance", "binance", "mock"],
        default: "alpha_vantage",
      },
      apiRateLimit: {
        type: Number,
        default: 5, // requests per minute
        min: 1,
        max: 100,
      },
    },

    // User settings
    user: {
      maxRegistrationsPerDay: {
        type: Number,
        default: 1000,
        min: 1,
      },
      passwordMinLength: {
        type: Number,
        default: 6,
        min: 4,
        max: 20,
      },
      sessionTimeoutMinutes: {
        type: Number,
        default: 1440, // 24 hours
        min: 15,
        max: 10080,
      },
      maxLoginAttempts: {
        type: Number,
        default: 5,
        min: 3,
        max: 10,
      },
      lockoutDurationMinutes: {
        type: Number,
        default: 120, // 2 hours
        min: 5,
        max: 1440,
      },
      emailVerificationRequired: {
        type: Boolean,
        default: false,
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
    },

    // Security settings
    security: {
      jwtExpiresIn: {
        type: String,
        default: "24h",
      },
      rateLimitWindowMs: {
        type: Number,
        default: 900000, // 15 minutes
        min: 60000,
      },
      rateLimitMaxRequests: {
        type: Number,
        default: 100,
        min: 10,
        max: 1000,
      },
      corsOrigins: [
        {
          type: String,
          default: "http://localhost:3000",
        },
      ],
      encryptionKey: {
        type: String,
      },
      enableHttps: {
        type: Boolean,
        default: false,
      },
    },

    // Notification settings
    notifications: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      smsEnabled: {
        type: Boolean,
        default: false,
      },
      pushEnabled: {
        type: Boolean,
        default: true,
      },
      adminNotifications: {
        newUserRegistration: {
          type: Boolean,
          default: true,
        },
        systemErrors: {
          type: Boolean,
          default: true,
        },
        highVolumeTrading: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Analytics settings
    analytics: {
      trackUserActivity: {
        type: Boolean,
        default: true,
      },
      trackTradingPatterns: {
        type: Boolean,
        default: true,
      },
      dataRetentionDays: {
        type: Number,
        default: 730, // 2 years
        min: 90,
      },
      anonymizeData: {
        type: Boolean,
        default: true,
      },
    },

    // Performance settings
    performance: {
      cacheTimeout: {
        type: Number,
        default: 300, // 5 minutes
        min: 60,
      },
      maxConcurrentUsers: {
        type: Number,
        default: 10000,
        min: 100,
      },
      dbConnectionPoolSize: {
        type: Number,
        default: 10,
        min: 5,
        max: 50,
      },
      enableCompression: {
        type: Boolean,
        default: true,
      },
    },

    // Feature flags
    features: {
      socialTrading: {
        type: Boolean,
        default: false,
      },
      copyTrading: {
        type: Boolean,
        default: false,
      },
      algorithmicTrading: {
        type: Boolean,
        default: false,
      },
      newsIntegration: {
        type: Boolean,
        default: true,
      },
      economicCalendar: {
        type: Boolean,
        default: true,
      },
      advancedCharting: {
        type: Boolean,
        default: true,
      },
      mobileTradingApp: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: "system_settings",
  }
);

// Ensure only one settings document exists
systemSettingsSchema.index({ _id: 1 }, { unique: true });

// Pre-save middleware
systemSettingsSchema.pre("save", function (next) {
  this.lastModified = new Date();
  this.version += 1;
  next();
});

// Static methods
systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();

  if (!settings) {
    settings = new this();
    await settings.save();
    console.log("✅ Default system settings created");
  }

  return settings;
};

systemSettingsSchema.statics.updateSettings = async function (updates, userId) {
  const settings = await this.getSettings();

  // Deep merge updates
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (!settings[key]) settings[key] = {};
      Object.assign(settings[key], value);
    } else {
      settings[key] = value;
    }
  }

  settings.modifiedBy = userId;
  await settings.save();

  return settings;
};

systemSettingsSchema.statics.isMaintenanceMode = async function () {
  const settings = await this.getSettings();
  return settings.app.maintenanceMode;
};

systemSettingsSchema.statics.getFeatureFlags = async function () {
  const settings = await this.getSettings();
  return settings.features;
};

systemSettingsSchema.statics.getTradingLimits = async function () {
  const settings = await this.getSettings();
  return {
    defaultBalance: settings.trading.defaultBalance,
    maxLeverage: settings.trading.maxLeverage,
    minTradeSize: settings.trading.minTradeSize,
    maxTradeSize: settings.trading.maxTradeSize,
    maxOpenPositions: settings.trading.maxOpenPositions,
    marginCallLevel: settings.trading.marginCallLevel,
    stopOutLevel: settings.trading.stopOutLevel,
  };
};

// Instance methods
systemSettingsSchema.methods.enableMaintenanceMode = function (
  message,
  userId
) {
  this.app.maintenanceMode = true;
  if (message) this.app.maintenanceMessage = message;
  this.modifiedBy = userId;
  return this.save();
};

systemSettingsSchema.methods.disableMaintenanceMode = function (userId) {
  this.app.maintenanceMode = false;
  this.modifiedBy = userId;
  return this.save();
};

systemSettingsSchema.methods.updateFeature = function (
  featureName,
  enabled,
  userId
) {
  if (!this.features.hasOwnProperty(featureName)) {
    throw new Error(`Feature '${featureName}' not found`);
  }

  this.features[featureName] = enabled;
  this.modifiedBy = userId;
  return this.save();
};

systemSettingsSchema.methods.updateTradingLimits = function (limits, userId) {
  Object.assign(this.trading, limits);
  this.modifiedBy = userId;
  return this.save();
};

systemSettingsSchema.methods.getPublicSettings = function () {
  return {
    app: {
      name: this.app.name,
      version: this.app.version,
      maintenanceMode: this.app.maintenanceMode,
      maintenanceMessage: this.app.maintenanceMessage,
    },
    trading: {
      defaultBalance: this.trading.defaultBalance,
      maxLeverage: this.trading.maxLeverage,
      minTradeSize: this.trading.minTradeSize,
      maxTradeSize: this.trading.maxTradeSize,
      maxOpenPositions: this.trading.maxOpenPositions,
    },
    features: this.features,
    marketData: {
      updateInterval: this.marketData.updateInterval,
      enableRealTimeData: this.marketData.enableRealTimeData,
    },
  };
};

// Export the model
const SystemSettings = mongoose.model("SystemSettings", systemSettingsSchema);
export default SystemSettings;
