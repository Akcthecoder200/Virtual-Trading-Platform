import Trade from "../models/Trade.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import mongoose from "mongoose";

// Mock market data for 8 major stocks
const MOCK_STOCKS = {
  AAPL: {
    name: "Apple Inc.",
    price: 175.43,
    change: 2.31,
    changePercent: 1.34,
  },
  GOOGL: {
    name: "Alphabet Inc.",
    price: 2847.63,
    change: -15.42,
    changePercent: -0.54,
  },
  TSLA: {
    name: "Tesla Inc.",
    price: 248.87,
    change: 8.94,
    changePercent: 3.72,
  },
  AMZN: {
    name: "Amazon.com Inc.",
    price: 3247.15,
    change: -21.33,
    changePercent: -0.65,
  },
  MSFT: {
    name: "Microsoft Corp.",
    price: 412.87,
    change: 5.67,
    changePercent: 1.39,
  },
  NFLX: {
    name: "Netflix Inc.",
    price: 487.21,
    change: -12.45,
    changePercent: -2.49,
  },
  META: {
    name: "Meta Platforms Inc.",
    price: 334.56,
    change: 7.89,
    changePercent: 2.41,
  },
  NVDA: {
    name: "NVIDIA Corp.",
    price: 891.23,
    change: 34.78,
    changePercent: 4.06,
  },
};

/**
 * @desc    Get current market data
 * @route   GET /api/trading/market-data
 * @access  Private
 */
export const getMarketData = async (req, res) => {
  try {
    // Add some random variation to prices to simulate real market movement
    const marketData = Object.keys(MOCK_STOCKS).map((symbol) => {
      const stock = MOCK_STOCKS[symbol];
      // Add random variation between -2% to +2%
      const variation = (Math.random() - 0.5) * 0.04;
      const newPrice = stock.price * (1 + variation);
      const priceChange = newPrice - stock.price;
      const changePercent = (priceChange / stock.price) * 100;

      return {
        symbol,
        companyName: stock.name,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(priceChange.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        sentiment:
          changePercent > 1
            ? "Bullish"
            : changePercent < -1
            ? "Bearish"
            : "Neutral",
        lastUpdated: new Date(),
      };
    });

    res.status(200).json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get market data error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch market data" },
    });
  }
};

/**
 * @desc    Place a new trade
 * @route   POST /api/trading/trades
 * @access  Private
 */
export const placeTrade = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      symbol,
      action,
      quantity,
      orderType = "market",
      limitPrice,
      stopPrice,
      takeProfitPrice,
      timeInForce = "GTC",
      expiryDate,
      estimatedCost,
    } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!symbol || !action || !quantity) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Missing required fields: symbol, action, quantity",
        },
      });
    }

    if (!["buy", "sell"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: { message: "Action must be 'buy' or 'sell'" },
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "Quantity must be a positive number" },
      });
    }

    // Validate order type specific requirements
    const validOrderTypes = [
      "market",
      "limit",
      "stop_loss",
      "stop_limit",
      "trailing_stop",
    ];
    if (!validOrderTypes.includes(orderType)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid order type" },
      });
    }

    // Order type specific validation
    if (
      (orderType === "limit" || orderType === "stop_limit") &&
      (!limitPrice || limitPrice <= 0)
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "Limit price is required for limit orders" },
      });
    }

    if (
      (orderType === "stop_loss" ||
        orderType === "stop_limit" ||
        orderType === "trailing_stop") &&
      (!stopPrice || stopPrice <= 0)
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "Stop price is required for stop orders" },
      });
    }

    // Get current market price for the symbol
    const marketData = MOCK_STOCKS[symbol.toUpperCase()];
    if (!marketData) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { message: "Symbol not found or not supported" },
      });
    }

    // Determine execution price based on order type
    let executionPrice;
    let shouldExecuteImmediately = false;

    switch (orderType) {
      case "market":
        executionPrice = marketData.price;
        shouldExecuteImmediately = true;
        break;

      case "limit":
        executionPrice = limitPrice;
        // For limit orders, check if they can be filled immediately
        if (action === "buy" && limitPrice >= marketData.price) {
          shouldExecuteImmediately = true;
          executionPrice = marketData.price; // Better fill at market
        } else if (action === "sell" && limitPrice <= marketData.price) {
          shouldExecuteImmediately = true;
          executionPrice = marketData.price; // Better fill at market
        }
        break;

      case "stop_loss":
        executionPrice = stopPrice;
        // Stop loss executes at market when triggered
        if (action === "buy" && marketData.price >= stopPrice) {
          shouldExecuteImmediately = true;
          executionPrice = marketData.price;
        } else if (action === "sell" && marketData.price <= stopPrice) {
          shouldExecuteImmediately = true;
          executionPrice = marketData.price;
        }
        break;

      case "stop_limit":
        executionPrice = limitPrice;
        // Stop limit converts to limit order when stop price is hit
        if (action === "buy" && marketData.price >= stopPrice) {
          if (limitPrice >= marketData.price) {
            shouldExecuteImmediately = true;
            executionPrice = marketData.price;
          }
        } else if (action === "sell" && marketData.price <= stopPrice) {
          if (limitPrice <= marketData.price) {
            shouldExecuteImmediately = true;
            executionPrice = marketData.price;
          }
        }
        break;

      case "trailing_stop":
        executionPrice = marketData.price;
        // Trailing stop logic would need more complex implementation
        // For now, treat as stop loss
        shouldExecuteImmediately = false;
        break;

      default:
        executionPrice = marketData.price;
        shouldExecuteImmediately = true;
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: "Wallet not found" },
      });
    }

    const totalValue = quantity * executionPrice;
    const commission = totalValue * 0.001; // 0.1% commission
    const totalCost = totalValue + commission;

    // Check if user has sufficient balance for buy orders
    if (action === "buy" && wallet.balance < totalCost) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { message: "Insufficient balance" },
      });
    }

    // For sell orders, check if user has enough shares (simplified - in real app, track holdings)
    if (action === "sell") {
      const existingHoldings = await Trade.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            symbol: symbol,
            status: "closed",
          },
        },
        {
          $group: {
            _id: null,
            totalBought: {
              $sum: {
                $cond: [{ $eq: ["$type", "buy"] }, "$quantity", 0],
              },
            },
            totalSold: {
              $sum: {
                $cond: [{ $eq: ["$type", "sell"] }, "$quantity", 0],
              },
            },
          },
        },
      ]).session(session);

      const currentHoldings =
        existingHoldings.length > 0
          ? existingHoldings[0].totalBought - existingHoldings[0].totalSold
          : 0;

      if (currentHoldings < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: { message: "Insufficient shares to sell" },
        });
      }
    }

    // Determine trade status based on execution
    const tradeStatus = shouldExecuteImmediately ? "closed" : "pending";

    // Set expiry date if provided
    let expirationTime = null;
    if (expiryDate && timeInForce === "GTC") {
      expirationTime = new Date(expiryDate);
    } else if (timeInForce === "DAY") {
      // Set expiry to end of day
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      expirationTime = endOfDay;
    }

    // Create the trade
    const trade = new Trade({
      user: userId,
      symbol: symbol.toUpperCase(),
      symbolType: "stock",
      type: action,
      orderType:
        orderType === "stop_loss"
          ? "stop"
          : orderType === "stop_limit"
          ? "stop-limit"
          : orderType,
      quantity: quantity,
      entryPrice: executionPrice,
      currentPrice: marketData.price,
      status: tradeStatus,
      stopLoss: orderType.includes("stop") ? stopPrice : null,
      takeProfit: takeProfitPrice || null,
      expirationTime: expirationTime,
      execution: {
        requestedPrice: limitPrice || stopPrice || marketData.price,
        executedPrice: shouldExecuteImmediately ? executionPrice : null,
        commission: shouldExecuteImmediately ? commission : 0,
        slippage: 0,
        executionTime: shouldExecuteImmediately
          ? Math.floor(Math.random() * 100)
          : null,
      },
      marketConditions: {
        marketOpen: true,
        volatility:
          Math.abs(marketData.changePercent) > 3
            ? "high"
            : Math.abs(marketData.changePercent) > 1
            ? "medium"
            : "low",
        spread: Math.abs(marketData.price * 0.001), // 0.1% spread simulation
        liquidity: "high",
      },
    });

    // For executed trades, calculate P&L and set times
    if (shouldExecuteImmediately) {
      trade.openTime = new Date();
      trade.closeTime = new Date();
      trade.exitPrice = executionPrice;

      const plData = trade.calculateProfitLoss(executionPrice);
      trade.profit = plData.profit;
      trade.loss = plData.loss;
      trade.netProfitLoss = plData.netProfitLoss;
      trade.profitLossPercentage = plData.profitLossPercentage;
    }

    await trade.save({ session });

    // Update wallet balance only for executed trades
    if (shouldExecuteImmediately) {
      if (action === "buy") {
        wallet.balance -= totalCost;
        wallet.transactions.push({
          type: "trade_buy",
          amount: -totalCost,
          description: `Bought ${quantity} shares of ${symbol} (${orderType.toUpperCase()})`,
          relatedTrade: trade._id,
        });
      } else {
        const proceeds = totalValue - commission;
        wallet.balance += proceeds;
        wallet.transactions.push({
          type: "trade_sell",
          amount: proceeds,
          description: `Sold ${quantity} shares of ${symbol} (${orderType.toUpperCase()})`,
          relatedTrade: trade._id,
        });
      }
      await wallet.save({ session });
    } else {
      // For pending orders, reserve funds for buy orders
      if (action === "buy") {
        // You might want to implement fund reservation logic here
        // For now, we'll just validate the balance without reserving
      }
    }

    await session.commitTransaction();

    // Generate appropriate response message
    let message;
    if (shouldExecuteImmediately) {
      message = `Successfully ${
        action === "buy" ? "bought" : "sold"
      } ${quantity} shares of ${symbol} at $${executionPrice.toFixed(2)}`;
    } else {
      message = `${orderType
        .replace("_", " ")
        .toUpperCase()} order placed for ${quantity} shares of ${symbol}`;
    }

    res.status(201).json({
      success: true,
      data: {
        trade: trade,
        newBalance: wallet.balance,
        executed: shouldExecuteImmediately,
        orderType: orderType,
        executionPrice: shouldExecuteImmediately ? executionPrice : null,
        message: message,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Place trade error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to place trade" },
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get user's trade history
 * @route   GET /api/trading/trades
 * @access  Private
 */
export const getTrades = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, status, symbol } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;
    if (symbol) filter.symbol = symbol.toUpperCase();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trades = await Trade.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("user", "username email");

    const total = await Trade.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        trades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get trades error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch trades" },
    });
  }
};

/**
 * @desc    Close an open trade
 * @route   PUT /api/trading/trades/:id/close
 * @access  Private
 */
export const closeTrade = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tradeId = req.params.id;
    const userId = req.user.id;
    const { exitPrice } = req.body;

    const trade = await Trade.findOne({
      _id: tradeId,
      user: userId,
      status: "open",
    }).session(session);

    if (!trade) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: "Open trade not found" },
      });
    }

    if (!exitPrice || exitPrice <= 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { message: "Valid exit price is required" },
      });
    }

    // Close the trade
    trade.closeTrade(exitPrice, "manual");
    await trade.save({ session });

    // Update wallet with P&L
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (wallet) {
      wallet.balance += trade.netProfitLoss;
      wallet.transactions.push({
        type: "trade_close",
        amount: trade.netProfitLoss,
        description: `Closed ${trade.type} position for ${
          trade.symbol
        } - P&L: ${trade.netProfitLoss.toFixed(2)}`,
        relatedTrade: trade._id,
      });
      await wallet.save({ session });
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        trade,
        message: `Trade closed successfully with P&L: ${trade.netProfitLoss.toFixed(
          2
        )}`,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Close trade error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to close trade" },
    });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get user's portfolio summary
 * @route   GET /api/trading/portfolio
 * @access  Private
 */
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current holdings (simplified calculation)
    const holdings = await Trade.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          status: "closed",
        },
      },
      {
        $group: {
          _id: "$symbol",
          totalBought: {
            $sum: {
              $cond: [{ $eq: ["$type", "buy"] }, "$quantity", 0],
            },
          },
          totalSold: {
            $sum: {
              $cond: [{ $eq: ["$type", "sell"] }, "$quantity", 0],
            },
          },
          totalInvested: {
            $sum: {
              $cond: [
                { $eq: ["$type", "buy"] },
                { $multiply: ["$quantity", "$entryPrice"] },
                0,
              ],
            },
          },
          totalReturns: {
            $sum: {
              $cond: [
                { $eq: ["$type", "sell"] },
                { $multiply: ["$quantity", "$exitPrice"] },
                0,
              ],
            },
          },
          avgBuyPrice: {
            $avg: {
              $cond: [{ $eq: ["$type", "buy"] }, "$entryPrice", null],
            },
          },
        },
      },
      {
        $addFields: {
          currentQuantity: { $subtract: ["$totalBought", "$totalSold"] },
          symbol: "$_id",
        },
      },
      {
        $match: {
          currentQuantity: { $gt: 0 },
        },
      },
    ]);

    // Get trading statistics
    const stats = await Trade.calculateUserStats(userId, "all");

    // Get wallet balance
    const wallet = await Wallet.findOne({ user: userId });

    // Calculate portfolio value (using current mock prices)
    let totalPortfolioValue = wallet ? wallet.balance : 0;
    const enrichedHoldings = holdings.map((holding) => {
      const currentPrice =
        MOCK_STOCKS[holding.symbol]?.price || holding.avgBuyPrice;
      const currentValue = holding.currentQuantity * currentPrice;
      const unrealizedPL =
        currentValue - holding.currentQuantity * holding.avgBuyPrice;

      totalPortfolioValue += currentValue;

      return {
        ...holding,
        currentPrice,
        currentValue,
        unrealizedPL,
        unrealizedPLPercent:
          (unrealizedPL / (holding.currentQuantity * holding.avgBuyPrice)) *
          100,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
        cashBalance: wallet ? wallet.balance : 0,
        holdings: enrichedHoldings,
        stats: {
          ...stats,
          totalTrades: stats.totalTrades || 0,
          winRate: parseFloat((stats.winRate || 0).toFixed(2)),
          netProfitLoss: parseFloat((stats.netProfitLoss || 0).toFixed(2)),
          profitFactor: parseFloat((stats.profitFactor || 0).toFixed(2)),
        },
      },
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch portfolio" },
    });
  }
};

/**
 * @desc    Get open positions
 * @route   GET /api/trading/positions
 * @access  Private
 */
export const getOpenPositions = async (req, res) => {
  try {
    const userId = req.user.id;

    const openTrades = await Trade.find({
      user: userId,
      status: "open",
    }).sort({ openTime: -1 });

    // Enrich with current market prices
    const enrichedTrades = openTrades.map((trade) => {
      const currentPrice =
        MOCK_STOCKS[trade.symbol]?.price || trade.currentPrice;
      const unrealizedPL =
        trade.type === "buy"
          ? (currentPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - currentPrice) * trade.quantity;

      return {
        ...trade.toObject(),
        currentPrice,
        unrealizedPL: parseFloat(unrealizedPL.toFixed(2)),
        unrealizedPLPercent: parseFloat(
          ((unrealizedPL / trade.tradeValue) * 100).toFixed(2)
        ),
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedTrades,
    });
  } catch (error) {
    console.error("Get open positions error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch open positions" },
    });
  }
};

/**
 * @desc    Get pending orders
 * @route   GET /api/trading/pending
 * @access  Private
 */
export const getPendingOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const pendingOrders = await Trade.find({
      user: userId,
      status: "pending",
    }).sort({ createdAt: -1 });

    // Enrich with current market data and status
    const enrichedOrders = pendingOrders.map((order) => {
      const currentPrice = MOCK_STOCKS[order.symbol]?.price || 0;

      // Determine if order would execute at current price
      let wouldExecute = false;
      let distanceToTrigger = 0;

      switch (order.orderType) {
        case "limit":
          if (order.type === "buy") {
            wouldExecute = currentPrice <= order.execution.requestedPrice;
            distanceToTrigger = order.execution.requestedPrice - currentPrice;
          } else {
            wouldExecute = currentPrice >= order.execution.requestedPrice;
            distanceToTrigger = currentPrice - order.execution.requestedPrice;
          }
          break;

        case "stop":
          if (order.type === "buy") {
            wouldExecute = currentPrice >= order.stopLoss;
            distanceToTrigger = order.stopLoss - currentPrice;
          } else {
            wouldExecute = currentPrice <= order.stopLoss;
            distanceToTrigger = currentPrice - order.stopLoss;
          }
          break;

        case "stop-limit":
          const stopTriggered =
            order.type === "buy"
              ? currentPrice >= order.stopLoss
              : currentPrice <= order.stopLoss;

          if (stopTriggered) {
            wouldExecute =
              order.type === "buy"
                ? currentPrice <= order.execution.requestedPrice
                : currentPrice >= order.execution.requestedPrice;
            distanceToTrigger =
              order.type === "buy"
                ? order.execution.requestedPrice - currentPrice
                : currentPrice - order.execution.requestedPrice;
          } else {
            distanceToTrigger =
              order.type === "buy"
                ? order.stopLoss - currentPrice
                : currentPrice - order.stopLoss;
          }
          break;
      }

      return {
        ...order.toObject(),
        currentPrice,
        wouldExecute,
        distanceToTrigger: parseFloat(distanceToTrigger.toFixed(2)),
        distancePercent: parseFloat(
          ((distanceToTrigger / currentPrice) * 100).toFixed(2)
        ),
        isExpired: order.expirationTime && new Date() > order.expirationTime,
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedOrders,
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch pending orders" },
    });
  }
};

// Cancel a pending order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Validate order ID format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid order ID format" },
      });
    }

    // Find the order
    const order = await Trade.findOne({
      _id: orderId,
      userId,
      status: "pending",
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: "Pending order not found" },
      });
    }

    // Update order status to cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to cancel order" },
    });
  }
};
