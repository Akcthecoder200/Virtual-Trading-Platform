import React, { useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useTrades, useTradingLoading } from '../../store/hooks';
import { getTrades, closeTrade } from '../../store/slices/tradingSlice';
import toast from 'react-hot-toast';

const TradeHistory = () => {
  const dispatch = useDispatch();
  const trades = useTrades();
  const isLoading = useTradingLoading();

  useEffect(() => {
    dispatch(getTrades());
  }, [dispatch]);

  const handleCloseTrade = async (tradeId) => {
    try {
      await dispatch(closeTrade(tradeId)).unwrap();
      toast.success('Trade closed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to close trade');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getActionColor = (action) => {
    return action === 'buy' 
      ? 'bg-green-500/20 text-green-300 border-green-500/30' 
      : 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const calculatePnL = (trade) => {
    if (trade.status !== 'closed' || !trade.closePrice) return null;
    
    const buyPrice = trade.action === 'buy' ? trade.price : trade.closePrice;
    const sellPrice = trade.action === 'buy' ? trade.closePrice : trade.price;
    const pnl = (sellPrice - buyPrice) * trade.quantity;
    
    return {
      value: pnl,
      formatted: `${pnl >= 0 ? '+' : ''}${formatPrice(pnl)}`,
      isPositive: pnl >= 0
    };
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-6">Trade History</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left pb-3 text-gray-400 font-medium">Date</th>
              <th className="text-left pb-3 text-gray-400 font-medium">Symbol</th>
              <th className="text-left pb-3 text-gray-400 font-medium">Action</th>
              <th className="text-right pb-3 text-gray-400 font-medium">Quantity</th>
              <th className="text-right pb-3 text-gray-400 font-medium">Price</th>
              <th className="text-right pb-3 text-gray-400 font-medium">Total Value</th>
              <th className="text-center pb-3 text-gray-400 font-medium">Status</th>
              <th className="text-right pb-3 text-gray-400 font-medium">P&L</th>
              <th className="text-center pb-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center">
                  <span className="text-gray-400">No trades found</span>
                </td>
              </tr>
            ) : (
              trades.map((trade) => {
                const pnl = calculatePnL(trade);
                const totalValue = trade.price * trade.quantity;

                return (
                  <tr key={trade._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                    <td className="py-4">
                      <span className="text-gray-300 text-sm">
                        {formatDateTime(trade.createdAt)}
                      </span>
                    </td>

                    <td className="py-4">
                      <span className="text-white font-semibold">
                        {trade.symbol}
                      </span>
                    </td>

                    <td className="py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-sm border ${getActionColor(trade.action)}`}>
                        {trade.action.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <span className="text-gray-300">
                        {trade.quantity}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <span className="text-gray-300">
                        {formatPrice(trade.price)}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <span className="text-white font-semibold">
                        {formatPrice(totalValue)}
                      </span>
                    </td>

                    <td className="py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-sm border ${getStatusColor(trade.status)}`}>
                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      {pnl ? (
                        <div className="flex items-center justify-end gap-1">
                          <span className={`font-semibold ${pnl.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.formatted}
                          </span>
                          {pnl.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    <td className="py-4 text-center">
                      {trade.status === 'open' && (
                        <button
                          onClick={() => handleCloseTrade(trade._id)}
                          disabled={isLoading}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Close Trade"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;