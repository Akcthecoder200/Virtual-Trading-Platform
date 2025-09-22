import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import {
  TrendingUp,
  DollarSign,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
} from "lucide-react";

const DashboardPage = () => {
  const { user, getProfile } = useAuthStore();

  useEffect(() => {
    // Fetch user profile and wallet data when component mounts
    getProfile();
  }, [getProfile]);

  // Mock data for demonstration
  const portfolioValue = 97534.5;
  const todayChange = 1234.56;
  const todayChangePercent = 1.28;
  const availableBalance = 15420.3;

  const recentTrades = [
    {
      id: 1,
      symbol: "AAPL",
      type: "BUY",
      quantity: 10,
      price: 150.25,
      timestamp: "2024-01-15 14:30",
    },
    {
      id: 2,
      symbol: "GOOGL",
      type: "SELL",
      quantity: 5,
      price: 2750.8,
      timestamp: "2024-01-15 13:15",
    },
    {
      id: 3,
      symbol: "TSLA",
      type: "BUY",
      quantity: 8,
      price: 238.5,
      timestamp: "2024-01-15 12:45",
    },
  ];

  const topHoldings = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 25,
      value: 3756.25,
      change: 2.5,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      quantity: 12,
      value: 33009.6,
      change: -1.2,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      quantity: 18,
      value: 6840.6,
      change: 0.8,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      quantity: 15,
      value: 3577.5,
      change: 3.2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName || "Trader"}!
            </h1>
            <p className="text-gray-400">Here's your trading overview</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
              <TrendingUp className="w-4 h-4 mr-2" />
              New Trade
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  ${portfolioValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              {todayChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span
                className={`text-sm ${
                  todayChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                ${Math.abs(todayChange).toLocaleString()} ({todayChangePercent}
                %)
              </span>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">
                  ${availableBalance.toLocaleString()}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-400">Ready to trade</span>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trades</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-400">This month</span>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold">68.5%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-green-500">
                +2.3% from last month
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Holdings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Top Holdings</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topHoldings.map((holding) => (
                  <div
                    key={holding.symbol}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {holding.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{holding.symbol}</p>
                        <p className="text-sm text-gray-400">{holding.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${holding.value.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm ${
                          holding.change >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {holding.change >= 0 ? "+" : ""}
                        {holding.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">Recent Trades</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          trade.type === "BUY" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <p className="font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-gray-400">
                          {trade.type} {trade.quantity} shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${trade.price}</p>
                      <p className="text-sm text-gray-400">{trade.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-blue-500 hover:text-blue-400 transition-colors">
                View All Trades
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex flex-col items-center transition-colors">
              <TrendingUp className="w-6 h-6 mb-2" />
              <span>Buy Stock</span>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex flex-col items-center transition-colors">
              <TrendingUp className="w-6 h-6 mb-2 rotate-180" />
              <span>Sell Stock</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg flex flex-col items-center transition-colors">
              <Plus className="w-6 h-6 mb-2" />
              <span>Add Funds</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex flex-col items-center transition-colors">
              <PieChart className="w-6 h-6 mb-2" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
