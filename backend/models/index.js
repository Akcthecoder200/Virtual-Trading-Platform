/**
 * Models Index
 * Centralized export for all Mongoose models
 */

import User from "./User.js";
import Wallet from "./Wallet.js";
import Trade from "./Trade.js";
import MarketSymbol from "./MarketSymbol.js";
import SystemSettings from "./SystemSettings.js";

// Export all models
export { User, Wallet, Trade, MarketSymbol, SystemSettings };

// Default export with all models
export default {
  User,
  Wallet,
  Trade,
  MarketSymbol,
  SystemSettings,
};

/**
 * Initialize default data
 * Creates default system settings and market symbols
 */
export const initializeDefaultData = async () => {
  try {
    console.log("🔄 Initializing default data...");

    // Create default system settings
    await SystemSettings.getSettings();

    // Create default market symbols
    await MarketSymbol.createDefaultSymbols();

    console.log("✅ Default data initialization completed");
  } catch (error) {
    console.error("❌ Error initializing default data:", error.message);
    throw error;
  }
};

/**
 * Setup database relationships and hooks
 */
export const setupModelRelationships = () => {
  // When a user is created, create a wallet
  User.schema.post("save", async function (user) {
    if (this.isNew && user.role === "user") {
      try {
        const wallet = await Wallet.createForUser(user._id);
        user.wallet = wallet._id;
        await user.save();
        console.log(`✅ Wallet created for user: ${user.username}`);
      } catch (error) {
        console.error("❌ Error creating wallet for user:", error.message);
      }
    }
  });

  // When a trade is closed, update user analytics and wallet
  Trade.schema.post("save", async function (trade) {
    if (this.isModified("status") && trade.status === "closed") {
      try {
        // Update user analytics
        const user = await User.findById(trade.user);
        if (user) {
          await user.updateTradingAnalytics({
            profit: trade.profit,
            loss: trade.loss,
            tradeSize: trade.tradeValue,
          });
        }

        // Update wallet balance
        const wallet = await Wallet.findByUser(trade.user);
        if (wallet) {
          const transactionType =
            trade.netProfitLoss >= 0 ? "trade_profit" : "trade_loss";
          const amount = Math.abs(trade.netProfitLoss);

          wallet.addTransaction({
            type: transactionType,
            amount,
            description: `Trade ${trade.type} ${trade.symbol} - ${
              trade.netProfitLoss >= 0 ? "Profit" : "Loss"
            }`,
            reference: trade._id.toString(),
            metadata: {
              tradeId: trade._id,
              symbol: trade.symbol,
              type: trade.type,
              quantity: trade.quantity,
              entryPrice: trade.entryPrice,
              exitPrice: trade.exitPrice,
            },
          });

          await wallet.save();
        }

        console.log(
          `✅ Trade closed and analytics updated for user: ${trade.user}`
        );
      } catch (error) {
        console.error(
          "❌ Error updating analytics after trade close:",
          error.message
        );
      }
    }
  });

  console.log("✅ Model relationships and hooks setup completed");
};

/**
 * Validate model schemas
 */
export const validateSchemas = () => {
  const models = [User, Wallet, Trade, MarketSymbol, SystemSettings];
  const validationErrors = [];

  models.forEach((Model) => {
    try {
      // Test schema compilation
      const testInstance = new Model();
      console.log(`✅ ${Model.modelName} schema is valid`);
    } catch (error) {
      validationErrors.push(`❌ ${Model.modelName}: ${error.message}`);
    }
  });

  if (validationErrors.length > 0) {
    console.error("Schema validation errors:");
    validationErrors.forEach((error) => console.error(error));
    throw new Error("Schema validation failed");
  }

  console.log("✅ All model schemas validated successfully");
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
  try {
    const stats = {
      users: await User.countDocuments(),
      activeUsers: await User.countDocuments({
        isActive: true,
        status: "active",
      }),
      wallets: await Wallet.countDocuments(),
      trades: await Trade.countDocuments(),
      openTrades: await Trade.countDocuments({ status: "open" }),
      closedTrades: await Trade.countDocuments({ status: "closed" }),
      marketSymbols: await MarketSymbol.countDocuments(),
      activeSymbols: await MarketSymbol.countDocuments({ isActive: true }),
    };

    return stats;
  } catch (error) {
    console.error("❌ Error getting database stats:", error.message);
    throw error;
  }
};
