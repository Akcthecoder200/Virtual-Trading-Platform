import mongoose from "mongoose";
import { User, Wallet } from "./models/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Connect to database
await mongoose.connect(process.env.MONGODB_URI);

try {
  console.log("🔍 Checking wallet data for admin user...");

  // Find admin user
  const admin = await User.findOne({ email: "admin@virtualtrading.com" });

  if (!admin) {
    console.log("❌ Admin user not found");
  } else {
    console.log("✅ Admin user found:", admin._id);

    // Find admin wallet
    const wallet = await Wallet.findOne({ user: admin._id });

    if (!wallet) {
      console.log("❌ No wallet found for admin user");

      // Create wallet for admin
      console.log("🔧 Creating wallet for admin...");
      const newWallet = new Wallet({
        user: admin._id,
        balance: 10000,
        currency: "USD",
        isActive: true,
        transactions: [],
        analytics: {
          totalTrades: 0,
          profitLoss: 0,
          winRate: 0,
          averageReturn: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
        },
      });

      await newWallet.save();
      console.log("✅ Wallet created successfully");
      console.log("   Balance:", newWallet.balance);
      console.log("   Currency:", newWallet.currency);
    } else {
      console.log("✅ Wallet found for admin:");
      console.log("   Wallet ID:", wallet._id);
      console.log("   Balance:", wallet.balance);
      console.log("   Currency:", wallet.currency);
      console.log("   Active:", wallet.isActive);
      console.log("   Transactions:", wallet.transactions?.length || 0);
      console.log("   Analytics:", !!wallet.analytics);

      // Check analytics structure
      if (wallet.analytics) {
        console.log("   Analytics Structure:");
        console.log("     Total Trades:", wallet.analytics.totalTrades);
        console.log("     Profit/Loss:", wallet.analytics.profitLoss);
        console.log("     Win Rate:", wallet.analytics.winRate);
        console.log("     Total Deposits:", wallet.analytics.totalDeposits);
        console.log(
          "     Total Withdrawals:",
          wallet.analytics.totalWithdrawals
        );
      } else {
        console.log("❌ Analytics missing - updating...");
        wallet.analytics = {
          totalTrades: 0,
          profitLoss: 0,
          winRate: 0,
          averageReturn: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
        };
        await wallet.save();
        console.log("✅ Analytics added to wallet");
      }
    }
  }

  // Check all wallets
  const allWallets = await Wallet.find({});
  console.log(`\n📊 Total wallets in database: ${allWallets.length}`);

  allWallets.forEach((wallet, index) => {
    console.log(
      `   ${index + 1}. User: ${wallet.user}, Balance: $${
        wallet.balance
      }, Active: ${wallet.isActive}`
    );
  });
} catch (error) {
  console.error("❌ Error:", error);
}

mongoose.connection.close();
