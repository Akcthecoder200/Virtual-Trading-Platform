import express from "express";
import { User, Wallet, Trade } from "../models/index.js";
import { auth, requireAdmin } from "../middleware/auth.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   GET /api/admin/test
 * @desc    Test admin route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin routes are working",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Admin
 */
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = search
      ? {
          $or: [
            { "profile.firstName": { $regex: search, $options: "i" } },
            { "profile.lastName": { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("-password")
      .populate("wallet")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch users" },
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    // Delete user's trades
    await Trade.deleteMany({ user: userId }).session(session);

    // Delete user's wallet
    await Wallet.deleteOne({ user: userId }).session(session);

    // Delete user
    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to delete user" },
    });
  } finally {
    session.endSession();
  }
});

/**
 * @route   PUT /api/admin/users/:id/reset-balance
 * @desc    Reset user's wallet balance
 * @access  Admin
 */
router.put("/users/:id/reset-balance", auth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { balance = 10000 } = req.body;

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: { message: "User wallet not found" },
      });
    }

    const oldBalance = wallet.balance;
    wallet.balance = balance;
    wallet.transactions.push({
      type: "reset",
      amount: balance - oldBalance,
      balanceBefore: oldBalance,
      balanceAfter: balance,
      description: "Balance reset by admin",
      adminReset: true,
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      data: {
        oldBalance,
        newBalance: balance,
        message: "Balance reset successfully",
      },
    });
  } catch (error) {
    console.error("Reset balance error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to reset balance" },
    });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform statistics
 * @access  Admin
 */
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrades = await Trade.countDocuments();
    const totalVolume = await Trade.aggregate([
      { $group: { _id: null, volume: { $sum: "$quantity" } } },
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    const topTraders = await Trade.aggregate([
      { $group: { _id: "$user", tradeCount: { $sum: 1 } } },
      { $sort: { tradeCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTrades,
        totalVolume: totalVolume[0]?.volume || 0,
        recentUsers,
        topTraders,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch statistics" },
    });
  }
});

export default router;
