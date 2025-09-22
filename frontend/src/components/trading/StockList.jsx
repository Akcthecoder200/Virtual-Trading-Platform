import React, { useState } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { useStocks, useWatchlist } from "../../store/hooks";
import { useDispatch } from "react-redux";
import {
  addToWatchlist,
  removeFromWatchlist,
} from "../../store/slices/tradingSlice";

const StockList = ({ onSelectStock }) => {
  const dispatch = useDispatch();
  const stocks = useStocks();
  const watchlist = useWatchlist();

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const formatChange = (change, changePercent) => {
    const isPositive = change >= 0;
    return {
      value: `${isPositive ? "+" : ""}${formatPrice(change)} (${
        isPositive ? "+" : ""
      }${changePercent.toFixed(2)}%)`,
      color: isPositive ? "text-green-400" : "text-red-400",
      bgColor: isPositive ? "bg-green-500/20" : "bg-red-500/20",
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
    };
  };

  const handleWatchlistToggle = (symbol) => {
    if (watchlist.includes(symbol)) {
      dispatch(removeFromWatchlist(symbol));
    } else {
      dispatch(addToWatchlist(symbol));
    }
  };

  const handleSelectStock = (stock) => {
    if (onSelectStock) {
      onSelectStock(stock);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-6">Stock Market</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left pb-3 text-gray-400 font-medium"></th>
              <th className="text-left pb-3 text-gray-400 font-medium">
                Symbol
              </th>
              <th className="text-left pb-3 text-gray-400 font-medium">
                Company
              </th>
              <th className="text-right pb-3 text-gray-400 font-medium">
                Price
              </th>
              <th className="text-right pb-3 text-gray-400 font-medium">
                Change
              </th>
              <th className="text-right pb-3 text-gray-400 font-medium">
                Volume
              </th>
              <th className="text-center pb-3 text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const change = formatChange(stock.change, stock.changePercent);
              const isInWatchlist = watchlist.includes(stock.symbol);

              return (
                <tr
                  key={stock.symbol}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-4">
                    <button
                      onClick={() => handleWatchlistToggle(stock.symbol)}
                      className={`p-1 rounded-lg transition-colors ${
                        isInWatchlist
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-gray-500 hover:text-gray-400"
                      }`}
                      title={
                        isInWatchlist
                          ? "Remove from watchlist"
                          : "Add to watchlist"
                      }
                    >
                      {isInWatchlist ? (
                        <Star className="w-4 h-4 fill-current" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="py-4">
                    <span className="text-white font-semibold">
                      {stock.symbol}
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="text-gray-300">{stock.name}</span>
                  </td>

                  <td className="py-4 text-right">
                    <span className="text-white font-semibold">
                      {formatPrice(stock.price)}
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${change.color} ${change.bgColor}`}
                      >
                        {change.icon}
                        {change.value}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-right">
                    <span className="text-gray-400">
                      {stock.volume.toLocaleString()}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleSelectStock({ ...stock, action: "buy" })
                        }
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() =>
                          handleSelectStock({ ...stock, action: "sell" })
                        }
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockList;
