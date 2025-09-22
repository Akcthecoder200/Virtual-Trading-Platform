import React from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useStocks, useWatchlist } from "../../store/hooks";

const MarketWatch = () => {
  const stocks = useStocks();
  const watchlist = useWatchlist();

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatChange = (change, changePercent) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? "+" : ""}${formatPrice(change)}`,
      percent: `${isPositive ? "+" : ""}${changePercent.toFixed(2)}%`,
      color: isPositive ? "text-green-400" : "text-red-400",
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
    };
  };

  const getMarketSentiment = () => {
    const positiveStocks = stocks.filter((stock) => stock.change >= 0).length;
    const totalStocks = stocks.length;
    const positivePercentage = (positiveStocks / totalStocks) * 100;

    if (positivePercentage >= 70)
      return {
        sentiment: "Bullish",
        color: "text-green-400 bg-green-500/20 border-green-500/30",
      };
    if (positivePercentage >= 40)
      return {
        sentiment: "Neutral",
        color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
      };
    return {
      sentiment: "Bearish",
      color: "text-red-400 bg-red-500/20 border-red-500/30",
    };
  };

  const marketSentiment = getMarketSentiment();
  const watchlistStocks = stocks.filter((stock) =>
    watchlist.includes(stock.symbol)
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-semibold text-white">Market Watch</h3>
        <span
          className={`inline-flex px-3 py-1 rounded-lg text-sm border ${marketSentiment.color}`}
        >
          Market: {marketSentiment.sentiment}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Market Overview */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Market Overview</h4>
          <p className="text-lg font-semibold text-white mb-3">
            {stocks.length} Stocks
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">
                {stocks.filter((s) => s.change >= 0).length} Up
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">
                {stocks.filter((s) => s.change < 0).length} Down
              </span>
            </div>
          </div>
        </div>

        {/* Top Gainer */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Top Gainer</h4>
          {(() => {
            const topGainer = stocks.reduce(
              (max, stock) =>
                stock.changePercent > max.changePercent ? stock : max,
              stocks[0] || {}
            );

            if (!topGainer)
              return <span className="text-gray-400 text-sm">No data</span>;

            const change = formatChange(
              topGainer.change,
              topGainer.changePercent
            );
            return (
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  {topGainer.symbol}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  {formatPrice(topGainer.price)}
                </p>
                <div className="flex items-center gap-1">
                  {change.icon}
                  <span className={`text-sm ${change.color}`}>
                    {change.percent}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Top Loser */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Top Loser</h4>
          {(() => {
            const topLoser = stocks.reduce(
              (min, stock) =>
                stock.changePercent < min.changePercent ? stock : min,
              stocks[0] || {}
            );

            if (!topLoser)
              return <span className="text-gray-400 text-sm">No data</span>;

            const change = formatChange(
              topLoser.change,
              topLoser.changePercent
            );
            return (
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  {topLoser.symbol}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  {formatPrice(topLoser.price)}
                </p>
                <div className="flex items-center gap-1">
                  {change.icon}
                  <span className={`text-sm ${change.color}`}>
                    {change.percent}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Most Active */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-2">Most Active</h4>
          {(() => {
            const mostActive = stocks.reduce(
              (max, stock) => (stock.volume > max.volume ? stock : max),
              stocks[0] || {}
            );

            if (!mostActive)
              return <span className="text-gray-400 text-sm">No data</span>;

            return (
              <div>
                <p className="text-lg font-semibold text-white mb-1">
                  {mostActive.symbol}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  {formatPrice(mostActive.price)}
                </p>
                <p className="text-sm text-gray-400">
                  Vol: {mostActive.volume.toLocaleString()}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Watchlist Quick View */}
      {watchlistStocks.length > 0 && (
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm text-gray-400 mb-4">Your Watchlist</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlistStocks.map((stock) => {
              const change = formatChange(stock.change, stock.changePercent);
              return (
                <div key={stock.symbol} className="text-center">
                  <p className="text-sm font-semibold text-white mb-1">
                    {stock.symbol}
                  </p>
                  <p className="text-sm text-gray-300 mb-1">
                    {formatPrice(stock.price)}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {change.icon}
                    <span className={`text-xs ${change.color}`}>
                      {change.percent}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketWatch;
