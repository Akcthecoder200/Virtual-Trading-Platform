import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Activity,
  Target,
  BarChart3,
} from "lucide-react";

const PortfolioOverview = ({ className = "" }) => {
  // Mock portfolio data - in real app this would come from Redux store
  const portfolioData = {
    totalValue: 125750.5,
    todayChange: 2341.25,
    todayChangePercent: 1.89,
    totalGainLoss: 25750.5,
    totalGainLossPercent: 25.75,
    cash: 15420.3,
    invested: 110330.2,
  };

  const topPositions = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 45,
      currentPrice: 182.52,
      value: 8213.4,
      gainLoss: 523.15,
      gainLossPercent: 6.8,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 12,
      currentPrice: 2750.84,
      value: 33010.08,
      gainLoss: -1205.32,
      gainLossPercent: -3.5,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 25,
      currentPrice: 248.73,
      value: 6218.25,
      gainLoss: 891.5,
      gainLossPercent: 16.7,
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      shares: 30,
      currentPrice: 378.85,
      value: 11365.5,
      gainLoss: 234.75,
      gainLossPercent: 2.1,
    },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const getColorClass = (value) => {
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  const getIconClass = (value) => {
    return value >= 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Portfolio
              </p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {portfolioData.todayChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${getColorClass(
                portfolioData.todayChange
              )}`}
            >
              {formatPercent(portfolioData.todayChangePercent)} today
            </span>
          </div>
        </div>

        {/* Today's Change */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Today's Change
              </p>
              <p
                className={`text-2xl font-bold ${getColorClass(
                  portfolioData.todayChange
                )}`}
              >
                {portfolioData.todayChange >= 0 ? "+" : ""}
                {formatCurrency(portfolioData.todayChange)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                portfolioData.todayChange >= 0
                  ? "bg-green-900/20"
                  : "bg-red-900/20"
              }`}
            >
              <Activity
                className={`w-6 h-6 ${getIconClass(portfolioData.todayChange)}`}
              />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm font-medium ${getColorClass(
                portfolioData.todayChange
              )}`}
            >
              {formatPercent(portfolioData.todayChangePercent)}
            </span>
            <span className="text-sm text-gray-400 ml-2">vs yesterday</span>
          </div>
        </div>

        {/* Total Gain/Loss */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Gain/Loss
              </p>
              <p
                className={`text-2xl font-bold ${getColorClass(
                  portfolioData.totalGainLoss
                )}`}
              >
                {portfolioData.totalGainLoss >= 0 ? "+" : ""}
                {formatCurrency(portfolioData.totalGainLoss)}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg ${
                portfolioData.totalGainLoss >= 0
                  ? "bg-green-900/20"
                  : "bg-red-900/20"
              }`}
            >
              <Target
                className={`w-6 h-6 ${getIconClass(
                  portfolioData.totalGainLoss
                )}`}
              />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm font-medium ${getColorClass(
                portfolioData.totalGainLoss
              )}`}
            >
              {formatPercent(portfolioData.totalGainLossPercent)}
            </span>
            <span className="text-sm text-gray-400 ml-2">all time</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Cash Balance</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.cash)}
              </p>
            </div>
            <div className="p-3 bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-400">
              {((portfolioData.cash / portfolioData.totalValue) * 100).toFixed(
                1
              )}
              % of portfolio
            </span>
          </div>
        </div>
      </div>

      {/* Top Positions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Positions</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Shares</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Value</th>
                <th className="pb-3">Gain/Loss</th>
                <th className="pb-3">%</th>
              </tr>
            </thead>
            <tbody>
              {topPositions.map((position) => (
                <tr
                  key={position.symbol}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3">
                    <div>
                      <div className="font-medium text-white">
                        {position.symbol}
                      </div>
                      <div className="text-sm text-gray-400">
                        {position.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-white">{position.shares}</td>
                  <td className="py-3 text-white">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className="py-3 text-white font-medium">
                    {formatCurrency(position.value)}
                  </td>
                  <td
                    className={`py-3 font-medium ${getColorClass(
                      position.gainLoss
                    )}`}
                  >
                    {position.gainLoss >= 0 ? "+" : ""}
                    {formatCurrency(position.gainLoss)}
                  </td>
                  <td
                    className={`py-3 font-medium ${getColorClass(
                      position.gainLoss
                    )}`}
                  >
                    {formatPercent(position.gainLossPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View all positions →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
