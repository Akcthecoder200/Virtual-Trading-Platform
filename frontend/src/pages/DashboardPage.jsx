import { useEffect } from "react";
import { useUser, useAppDispatch } from "../store/hooks";
import { getProfile } from "../store/slices/authSlice";
import { getWalletBalance } from "../store/slices/walletSlice";
import { useNavigate } from "react-router-dom";

// Components
import DashboardHeader from "../components/DashboardHeader";
import PortfolioOverview from "../components/PortfolioOverview";
import WalletWidget from "../components/WalletWidget";
import TransactionHistory from "../components/TransactionHistory";

const DashboardPage = () => {
  const user = useUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile and wallet data when component mounts
    dispatch(getProfile());
    dispatch(getWalletBalance());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Portfolio Overview */}
          <PortfolioOverview />

          {/* Wallet and Transactions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet Widget */}
            <div className="lg:col-span-1">
              <WalletWidget />
            </div>

            {/* Transaction History */}
            <div className="lg:col-span-2">
              <TransactionHistory limit={8} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/trading")}
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">$</span>
                </div>
                <span className="text-white text-sm font-medium">
                  Buy Stocks
                </span>
              </button>

              <button
                onClick={() => navigate("/trading")}
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">↓</span>
                </div>
                <span className="text-white text-sm font-medium">
                  Sell Stocks
                </span>
              </button>

              <button
                onClick={() => navigate("/trading")}
                className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">📊</span>
                </div>
                <span className="text-white text-sm font-medium">
                  Market Analysis
                </span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold">⚙️</span>
                </div>
                <span className="text-white text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
