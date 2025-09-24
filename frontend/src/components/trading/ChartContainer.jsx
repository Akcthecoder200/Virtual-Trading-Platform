import React, { useState, useEffect } from "react";
import { TrendingUp, BarChart3, Activity, Volume2 } from "lucide-react";
import StockChart from "./StockChart";
import { useStocks } from "../../store/hooks";

const ChartContainer = ({ selectedStock, className = "" }) => {
  const stocks = useStocks();
  const [chartType, setChartType] = useState("line");
  const [timeframe, setTimeframe] = useState("1D");
  const [currentStock, setCurrentStock] = useState(selectedStock || stocks[0]);

  useEffect(() => {
    if (selectedStock) {
      setCurrentStock(selectedStock);
    }
  }, [selectedStock]);

  const chartTypes = [
    { id: "line", label: "Line", icon: TrendingUp },
    { id: "candlestick", label: "Candlestick", icon: BarChart3 },
    { id: "volume", label: "Volume", icon: Volume2 },
  ];

  const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"];

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Activity className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-white">Market Charts</h2>
        </div>

        {/* Stock Selector */}
        <select
          value={currentStock?.symbol || ""}
          onChange={(e) => {
            const stock = stocks.find((s) => s.symbol === e.target.value);
            setCurrentStock(stock);
          }}
          className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
        >
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol} - {stock.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart Controls */}
      <div className="flex flex-wrap justify-between items-center mb-6 space-y-2 sm:space-y-0">
        {/* Chart Type Selector */}
        <div className="flex space-x-2">
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  chartType === type.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                timeframe === tf
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Component */}
      {currentStock && (
        <StockChart
          symbol={currentStock.symbol}
          chartType={chartType}
          timeframe={timeframe}
          onChartTypeChange={setChartType}
          onTimeframeChange={setTimeframe}
          className="mb-6"
        />
      )}

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Price</p>
              <p className="text-2xl font-bold text-white">
                ${currentStock?.price?.toFixed(2) || "0.00"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">24h Change</p>
              <p
                className={`text-2xl font-bold ${
                  (currentStock?.change || 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ${Math.abs(currentStock?.change || 0).toFixed(2)}
              </p>
              <p
                className={`text-sm ${
                  (currentStock?.change || 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ({(currentStock?.changePercent || 0) >= 0 ? "+" : ""}
                {(currentStock?.changePercent || 0).toFixed(2)}%)
              </p>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                (currentStock?.change || 0) >= 0 ? "bg-green-900" : "bg-red-900"
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${
                  (currentStock?.change || 0) >= 0
                    ? "text-green-400"
                    : "text-red-400 rotate-180"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Volume</p>
              <p className="text-2xl font-bold text-white">
                {(
                  Math.floor(Math.random() * 50000000) + 10000000
                ).toLocaleString()}
              </p>
            </div>
            <Volume2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Technical Indicators (Placeholder) */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Technical Indicators
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400 text-sm">RSI (14)</p>
            <p className="text-white font-semibold">
              {(Math.random() * 100).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">MACD</p>
            <p className="text-white font-semibold">
              {(Math.random() * 10 - 5).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Moving Avg (50)</p>
            <p className="text-white font-semibold">
              $
              {(
                currentStock?.price * (0.95 + Math.random() * 0.1) || 0
              ).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Moving Avg (200)</p>
            <p className="text-white font-semibold">
              $
              {(currentStock?.price * (0.9 + Math.random() * 0.2) || 0).toFixed(
                2
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;
