import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { useMarketData } from "../../hooks/useMarketData";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const StockChart = ({
  symbol,
  data = [],
  chartType = "line",
  timeframe = "1D",
  className = "",
  onChartTypeChange,
  onTimeframeChange,
}) => {
  const chartRef = useRef();

  // Map timeframe to API parameters
  const getApiParams = (timeframe) => {
    const params = {
      "1D": { interval: "5m", range: "1d" },
      "1W": { interval: "1h", range: "1wk" },
      "1M": { interval: "1d", range: "1mo" },
      "3M": { interval: "1d", range: "3mo" },
      "1Y": { interval: "1wk", range: "1y" },
    };
    return params[timeframe] || params["1D"];
  };

  const { interval, range } = getApiParams(timeframe);

  // Use real market data
  const {
    data: marketData,
    quote,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useMarketData(symbol, interval, range);

  // Generate mock historical data for demonstration (fallback)
  const generateMockData = (symbol, days = 30) => {
    const data = [];
    const basePrice =
      {
        AAPL: 175,
        GOOGL: 2847,
        TSLA: 248,
        AMZN: 3247,
        MSFT: 412,
        NFLX: 487,
        META: 334,
        NVDA: 891,
      }[symbol] || 100;

    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + randomVariation);

      // Generate OHLCV data
      const open = price * (1 + (Math.random() - 0.5) * 0.02);
      const close = price * (1 + (Math.random() - 0.5) * 0.02);
      const high = Math.max(open, close) * (1 + Math.random() * 0.03);
      const low = Math.min(open, close) * (1 - Math.random() * 0.03);
      const volume = Math.floor(Math.random() * 10000000) + 1000000;

      data.push({
        date: date.toISOString().split("T")[0],
        time: date.getTime(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
      });
    }

    return data;
  };

  // Use real market data if available, otherwise use passed data or fallback to mock
  const chartData =
    marketData.length > 0
      ? marketData
      : data.length > 0
      ? data
      : generateMockData(symbol);

  // Get current price from quote or latest data point
  const currentPrice =
    quote?.price || chartData[chartData.length - 1]?.close || 0;
  const previousPrice =
    chartData.length > 1
      ? chartData[chartData.length - 2]?.close
      : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent =
    previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;

  // Prepare line chart data
  const lineChartData = {
    labels: chartData.map((item) => item.date),
    datasets: [
      {
        label: `${symbol} Price`,
        data: chartData.map((item) => item.close),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  // Prepare candlestick-like bar chart data (simplified)
  const candlestickData = {
    labels: chartData.map((item) => item.date),
    datasets: [
      {
        label: "High",
        data: chartData.map((item) => item.high),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
      {
        label: "Low",
        data: chartData.map((item) => item.low),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
      },
      {
        label: "Close",
        data: chartData.map((item) => item.close),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  // Volume chart data
  const volumeData = {
    labels: chartData.map((item) => item.date),
    datasets: [
      {
        label: "Volume",
        data: chartData.map((item) => item.volume),
        backgroundColor: "rgba(156, 163, 175, 0.6)",
        borderColor: "rgb(156, 163, 175)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9CA3AF",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `${symbol} - ${timeframe}`,
        color: "#F9FAFB",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "#374151",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            if (context.dataset.label === "Volume") {
              return `${context.dataset.label}: ${value.toLocaleString()}`;
            }
            return `${context.dataset.label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        ticks: {
          color: "#9CA3AF",
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(75, 85, 99, 0.3)",
        },
        ticks: {
          color: "#9CA3AF",
          callback: function (value) {
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  const volumeOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: `${symbol} Volume - ${timeframe}`,
        color: "#F9FAFB",
        font: {
          size: 14,
        },
      },
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          color: "#9CA3AF",
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "candlestick":
        return (
          <Bar ref={chartRef} data={candlestickData} options={chartOptions} />
        );
      case "volume":
        return <Bar ref={chartRef} data={volumeData} options={volumeOptions} />;
      case "line":
      default:
        return (
          <Line ref={chartRef} data={lineChartData} options={chartOptions} />
        );
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center h-80">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-400">Loading market data...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-80 text-center">
          <div>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-gray-400 mb-2">Failed to load market data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="h-80">{renderChart()}</div>

          {/* Data source and last updated */}
          <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
            <span>
              {marketData.length > 0 ? "Real market data" : "Demo data"} •{" "}
              {symbol}
            </span>
            {lastUpdated && (
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
        </>
      )}

      {/* Chart Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded text-sm ${
              chartType === "line"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onChartTypeChange?.("line")}
          >
            Line
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              chartType === "candlestick"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onChartTypeChange?.("candlestick")}
          >
            Candlestick
          </button>
          <button
            className={`px-3 py-1 rounded text-sm ${
              chartType === "volume"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onChartTypeChange?.("volume")}
          >
            Volume
          </button>

          {/* Refresh button */}
          <button
            onClick={refresh}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="flex space-x-2">
          {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === tf
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => onTimeframeChange?.(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Current Price Display */}
      <div className="mt-4 p-3 bg-gray-700 rounded">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">{symbol}</h3>
            <p className="text-2xl font-bold text-blue-400">
              ${currentPrice.toFixed(2)}
            </p>
            {quote && (
              <p className="text-xs text-gray-400">
                Volume: {quote.volume?.toLocaleString() || "N/A"}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">24h Change</p>
            <p
              className={`text-lg font-semibold ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}(
              {priceChange >= 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}%)
            </p>
            {quote && (
              <p className="text-xs text-gray-400 mt-1">Real-time data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
