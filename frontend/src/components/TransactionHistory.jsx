import React, { useEffect } from "react";
import {
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useWallet, useAppDispatch } from "../store/hooks";
import { getWalletTransactions } from "../store/slices/walletSlice";

const TransactionHistory = ({ limit = 10 }) => {
  const { transactions, isTransactionLoading, transactionError } = useWallet();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getWalletTransactions({ limit }));
  }, [dispatch, limit]);

  const handleRefresh = () => {
    dispatch(getWalletTransactions({ limit }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
      case "add_funds":
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case "withdrawal":
      case "withdraw_funds":
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case "trade_buy":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "trade_sell":
        return <TrendingDown className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
      case "add_funds":
        return "text-green-400";
      case "withdrawal":
      case "withdraw_funds":
        return "text-red-400";
      case "trade_buy":
        return "text-blue-400";
      case "trade_sell":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  const getAmountDisplay = (transaction) => {
    const { type, amount } = transaction;
    const isNegative =
      type?.toLowerCase().includes("withdraw") ||
      type?.toLowerCase().includes("sell");
    const prefix = isNegative ? "-" : "+";
    const color = isNegative ? "text-red-400" : "text-green-400";

    return (
      <span className={`font-medium ${color}`}>
        {prefix}
        {formatCurrency(Math.abs(amount))}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Recent Transactions
        </h3>
        <button
          onClick={handleRefresh}
          disabled={isTransactionLoading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh transactions"
        >
          <RefreshCw
            className={`w-4 h-4 ${isTransactionLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {transactionError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{transactionError}</p>
        </div>
      )}

      {isTransactionLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-400">Loading transactions...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Your wallet activity will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, limit).map((transaction) => {
            const formatted = formatDate(
              transaction.createdAt || transaction.timestamp
            );
            return (
              <div
                key={transaction._id || transaction.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {transaction.description ||
                        transaction.type?.replace("_", " ") ||
                        "Transaction"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatted.date} at {formatted.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${getTransactionColor(
                      transaction.type
                    )}`}
                  >
                    {getAmountDisplay(transaction)}
                  </div>
                  {transaction.balanceAfter && (
                    <p className="text-xs text-gray-500">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {transactions.length > limit && (
            <div className="text-center pt-3">
              <button
                onClick={() =>
                  dispatch(getWalletTransactions({ limit: limit + 10 }))
                }
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Load more transactions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
