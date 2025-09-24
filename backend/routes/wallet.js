import express from "express";
import { Wallet, User } from "../models/index.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  validateWalletFunds,
  validateAdminWalletReset,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @route   GET /api/wallet/test
 * @desc    Test wallet route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Wallet routes are working",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/wallet/balance
 * @desc    Get user's wallet balance and details
 * @access  Private
 */
router.get("/balance", authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Wallet not found",
          code: "WALLET_NOT_FOUND",
        },
      });
    }

    // Calculate additional wallet metrics
    const walletData = wallet.toObject();
    const netTradingProfit =
      (wallet.statistics?.totalTradingProfit || 0) -
      (wallet.statistics?.totalTradingLoss || 0);
    walletData.profitLossPercentage =
      wallet.balance > 0
        ? ((netTradingProfit / wallet.balance) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        wallet: walletData,
      },
    });
  } catch (error) {
    console.error("Get wallet balance error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch wallet balance",
        code: "WALLET_FETCH_ERROR",
      },
    });
  }
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type || "";
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Wallet not found",
          code: "WALLET_NOT_FOUND",
        },
      });
    }

    // Filter transactions
    let transactions = [...wallet.transactions];

    if (type) {
      transactions = transactions.filter((tx) => tx.type === type);
    }

    if (startDate && endDate) {
      transactions = transactions.filter(
        (tx) => tx.createdAt >= startDate && tx.createdAt <= endDate
      );
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    const totalTransactions = transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalTransactions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: {
          totalDeposits: wallet.statistics?.totalDeposits || 0,
          totalWithdrawals: wallet.statistics?.totalWithdrawals || 0,
          totalTrades: wallet.transactions?.length || 0,
          netProfitLoss:
            (wallet.statistics?.totalTradingProfit || 0) -
            (wallet.statistics?.totalTradingLoss || 0),
        },
      },
    });
  } catch (error) {
    console.error("Get wallet transactions error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch transaction history",
        code: "TRANSACTIONS_FETCH_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/wallet/reset
 * @desc    Reset wallet balance to default demo amount
 * @access  Private
 */
router.post("/reset", authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Wallet not found",
          code: "WALLET_NOT_FOUND",
        },
      });
    }

    const previousBalance = wallet.balance;
    const defaultBalance = parseFloat(
      process.env.DEFAULT_DEMO_BALANCE || 10000
    );

    // Reset wallet balance
    wallet.balance = defaultBalance;
    wallet.equity = defaultBalance;
    wallet.margin = 0;
    wallet.freeMargin = defaultBalance;

    // Add reset transaction
    const resetTransaction = {
      type: "reset",
      amount: defaultBalance - previousBalance,
      balanceBefore: previousBalance,
      balanceAfter: defaultBalance,
      description: `Wallet reset to default demo balance. ${
        reason ? `Reason: ${reason}` : ""
      }`,
      reference: `RESET_${Date.now()}`,
      status: "completed",
      metadata: {
        resetBy: "user",
        previousBalance,
        resetAmount: defaultBalance,
        reason: reason || "User requested reset",
      },
    };

    wallet.transactions.push(resetTransaction);

    // Reset analytics
    wallet.analytics.totalTrades = 0;
    wallet.analytics.profitLoss = 0;
    wallet.analytics.winRate = 0;
    wallet.analytics.averageReturn = 0;
    wallet.analytics.maxDrawdown = 0;
    wallet.analytics.sharpeRatio = 0;

    await wallet.save();

    res.json({
      success: true,
      message: "Wallet balance reset successfully",
      data: {
        wallet: wallet.toObject(),
        resetTransaction,
      },
    });
  } catch (error) {
    console.error("Wallet reset error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to reset wallet balance",
        code: "WALLET_RESET_ERROR",
      },
    });
  }
});

/**
 * @route   POST /api/wallet/add-funds
 * @desc    Add demo funds to wallet (simulation only)
 * @access  Private
 */
router.post(
  "/add-funds",
  authenticateToken,
  validateWalletFunds,
  async (req, res) => {
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Amount must be a positive number",
            code: "INVALID_AMOUNT",
          },
        });
      }

      if (amount > 100000) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Maximum demo deposit is $100,000",
            code: "AMOUNT_TOO_HIGH",
          },
        });
      }

      const wallet = await Wallet.findOne({ user: req.user._id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Wallet not found",
            code: "WALLET_NOT_FOUND",
          },
        });
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance + parseFloat(amount);

      // Update wallet balance
      wallet.balance = newBalance;
      wallet.equity = newBalance;
      wallet.freeMargin = newBalance - wallet.margin;

      // Add deposit transaction
      const depositTransaction = {
        type: "deposit",
        amount: parseFloat(amount),
        balanceBefore: previousBalance,
        balanceAfter: newBalance,
        description: description || `Demo funds deposit of $${amount}`,
        reference: `DEPOSIT_${Date.now()}`,
        status: "completed",
        metadata: {
          depositType: "demo",
          addedBy: "user",
        },
      };

      wallet.transactions.push(depositTransaction);

      // Update analytics
      wallet.analytics.totalDeposits += parseFloat(amount);

      await wallet.save();

      res.json({
        success: true,
        message: "Demo funds added successfully",
        data: {
          wallet: wallet.toObject(),
          transaction: depositTransaction,
        },
      });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to add demo funds",
          code: "ADD_FUNDS_ERROR",
        },
      });
    }
  }
);

/**
 * @route   POST /api/wallet/withdraw-funds
 * @desc    Withdraw demo funds from wallet (simulation only)
 * @access  Private
 */
router.post(
  "/withdraw-funds",
  authenticateToken,
  validateWalletFunds,
  async (req, res) => {
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Amount must be a positive number",
            code: "INVALID_AMOUNT",
          },
        });
      }

      const wallet = await Wallet.findOne({ user: req.user._id });

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Wallet not found",
            code: "WALLET_NOT_FOUND",
          },
        });
      }

      if (amount > wallet.freeMargin) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Insufficient free margin for withdrawal",
            code: "INSUFFICIENT_FUNDS",
            available: wallet.freeMargin,
          },
        });
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance - parseFloat(amount);

      // Update wallet balance
      wallet.balance = newBalance;
      wallet.equity = newBalance;
      wallet.freeMargin = newBalance - wallet.margin;

      // Add withdrawal transaction
      const withdrawalTransaction = {
        type: "withdrawal",
        amount: -parseFloat(amount),
        balanceBefore: previousBalance,
        balanceAfter: newBalance,
        description: description || `Demo funds withdrawal of $${amount}`,
        reference: `WITHDRAWAL_${Date.now()}`,
        status: "completed",
        metadata: {
          withdrawalType: "demo",
          requestedBy: "user",
        },
      };

      wallet.transactions.push(withdrawalTransaction);

      // Update analytics
      wallet.analytics.totalWithdrawals += parseFloat(amount);

      await wallet.save();

      res.json({
        success: true,
        message: "Demo funds withdrawn successfully",
        data: {
          wallet: wallet.toObject(),
          transaction: withdrawalTransaction,
        },
      });
    } catch (error) {
      console.error("Withdraw funds error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to withdraw demo funds",
          code: "WITHDRAW_FUNDS_ERROR",
        },
      });
    }
  }
);

/**
 * @route   GET /api/wallet/analytics
 * @desc    Get detailed wallet analytics
 * @access  Private
 */
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Wallet not found",
          code: "WALLET_NOT_FOUND",
        },
      });
    }

    // Calculate time-based analytics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentTransactions = wallet.transactions.filter(
      (tx) => new Date(tx.createdAt) >= thirtyDaysAgo
    );

    const last7DaysTransactions = wallet.transactions.filter(
      (tx) => new Date(tx.createdAt) >= sevenDaysAgo
    );

    // Transaction type summary
    const transactionSummary = {
      deposits: wallet.transactions.filter((tx) => tx.type === "deposit")
        .length,
      withdrawals: wallet.transactions.filter((tx) => tx.type === "withdrawal")
        .length,
      trades: wallet.transactions.filter(
        (tx) => tx.type === "trade_profit" || tx.type === "trade_loss"
      ).length,
      resets: wallet.transactions.filter((tx) => tx.type === "reset").length,
    };

    // Performance metrics
    const profitTransactions = wallet.transactions.filter(
      (tx) => tx.amount > 0
    );
    const lossTransactions = wallet.transactions.filter((tx) => tx.amount < 0);

    const analytics = {
      balance: {
        current: wallet.balance,
        equity: wallet.equity,
        margin: wallet.margin,
        freeMargin: wallet.freeMargin,
        profitLoss: wallet.analytics.profitLoss,
        profitLossPercentage:
          wallet.balance > 0
            ? ((wallet.analytics.profitLoss / wallet.balance) * 100).toFixed(2)
            : 0,
      },
      trading: {
        totalTrades: wallet.analytics.totalTrades,
        winRate: wallet.analytics.winRate,
        averageReturn: wallet.analytics.averageReturn,
        maxDrawdown: wallet.analytics.maxDrawdown,
        sharpeRatio: wallet.analytics.sharpeRatio,
      },
      transactions: {
        total: wallet.transactions.length,
        last30Days: recentTransactions.length,
        last7Days: last7DaysTransactions.length,
        summary: transactionSummary,
      },
      performance: {
        totalDeposits: wallet.analytics.totalDeposits,
        totalWithdrawals: wallet.analytics.totalWithdrawals,
        netFlow:
          wallet.analytics.totalDeposits - wallet.analytics.totalWithdrawals,
        profitableTrades: profitTransactions.length,
        losingTrades: lossTransactions.length,
      },
      risk: {
        leverageUsed: wallet.leverage,
        marginLevel:
          wallet.margin > 0
            ? ((wallet.equity / wallet.margin) * 100).toFixed(2)
            : 0,
        riskLevel:
          wallet.freeMargin < wallet.balance * 0.2
            ? "High"
            : wallet.freeMargin < wallet.balance * 0.5
            ? "Medium"
            : "Low",
      },
      settings: {
        currency: wallet.currency,
        isActive: wallet.isActive,
        leverage: wallet.leverage,
      },
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Wallet analytics error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch wallet analytics",
        code: "ANALYTICS_FETCH_ERROR",
      },
    });
  }
});

// Admin only routes
/**
 * @route   POST /api/wallet/admin/reset/:userId
 * @desc    Reset user's wallet balance (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/admin/reset/:userId",
  authenticateToken,
  requireAdmin,
  validateAdminWalletReset,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      const wallet = await Wallet.findOne({ user: userId });
      const user = await User.findById(userId);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Wallet not found",
            code: "WALLET_NOT_FOUND",
          },
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      const previousBalance = wallet.balance;
      const newBalance = amount
        ? parseFloat(amount)
        : parseFloat(process.env.DEFAULT_DEMO_BALANCE || 10000);

      // Reset wallet balance
      wallet.balance = newBalance;
      wallet.equity = newBalance;
      wallet.margin = 0;
      wallet.freeMargin = newBalance;

      // Add admin reset transaction
      const resetTransaction = {
        type: "reset",
        amount: newBalance - previousBalance,
        balanceBefore: previousBalance,
        balanceAfter: newBalance,
        description: `Admin wallet reset. ${reason ? `Reason: ${reason}` : ""}`,
        reference: `ADMIN_RESET_${Date.now()}`,
        status: "completed",
        metadata: {
          resetBy: "admin",
          adminId: req.user._id,
          adminEmail: req.user.email,
          previousBalance,
          resetAmount: newBalance,
          reason: reason || "Admin requested reset",
        },
      };

      wallet.transactions.push(resetTransaction);

      await wallet.save();

      res.json({
        success: true,
        message: `Wallet balance reset successfully for user ${user.email}`,
        data: {
          wallet: wallet.toObject(),
          resetTransaction,
          user: {
            id: user._id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
          },
        },
      });
    } catch (error) {
      console.error("Admin wallet reset error:", error);
      res.status(500).json({
        success: false,
        error: {
          message: "Failed to reset wallet balance",
          code: "ADMIN_WALLET_RESET_ERROR",
        },
      });
    }
  }
);

/**
 * @route   GET /api/wallet/admin/all
 * @desc    Get all wallets (Admin only)
 * @access  Private/Admin
 */
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "balance";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    const wallets = await Wallet.find({ isActive: true })
      .populate("user", "firstName lastName email username status isActive")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalWallets = await Wallet.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalWallets / limit);

    // Calculate summary statistics
    const allWallets = await Wallet.find({ isActive: true });
    const summary = {
      totalWallets: allWallets.length,
      totalBalance: allWallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      averageBalance:
        allWallets.length > 0
          ? (
              allWallets.reduce((sum, wallet) => sum + wallet.balance, 0) /
              allWallets.length
            ).toFixed(2)
          : 0,
      totalProfitLoss: allWallets.reduce(
        (sum, wallet) => sum + (wallet.analytics?.profitLoss || 0),
        0
      ),
    };

    res.json({
      success: true,
      data: {
        wallets,
        pagination: {
          currentPage: page,
          totalPages,
          totalWallets,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary,
      },
    });
  } catch (error) {
    console.error("Get all wallets error:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch wallets",
        code: "WALLETS_FETCH_ERROR",
      },
    });
  }
});

export default router;
