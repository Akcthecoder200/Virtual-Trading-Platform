import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useStocks, useWalletBalance, useTradingLoading } from '../../store/hooks';
import { placeTrade } from '../../store/slices/tradingSlice';
import toast from 'react-hot-toast';

const TradingForm = ({ selectedStock, onTradeComplete }) => {
  const dispatch = useDispatch();
  const stocks = useStocks();
  const walletBalance = useWalletBalance();
  const isLoading = useTradingLoading();

  const [formData, setFormData] = useState({
    symbol: selectedStock?.symbol || '',
    action: selectedStock?.action || 'buy',
    quantity: '',
    orderType: 'market'
  });

  const [orderValue, setOrderValue] = useState(0);

  useEffect(() => {
    if (selectedStock) {
      setFormData(prev => ({
        ...prev,
        symbol: selectedStock.symbol,
        action: selectedStock.action
      }));
    }
  }, [selectedStock]);

  useEffect(() => {
    if (formData.symbol && formData.quantity) {
      const stock = stocks.find(s => s.symbol === formData.symbol);
      if (stock) {
        const value = stock.price * parseInt(formData.quantity || 0);
        setOrderValue(value);
      }
    } else {
      setOrderValue(0);
    }
  }, [formData.symbol, formData.quantity, stocks]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (formData.action === 'buy' && orderValue > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      const result = await dispatch(placeTrade({
        symbol: formData.symbol,
        action: formData.action,
        quantity: quantity,
        orderType: formData.orderType
      })).unwrap();

      toast.success(`${formData.action.toUpperCase()} order placed successfully!`);
      
      // Reset form
      setFormData({
        symbol: '',
        action: 'buy',
        quantity: '',
        orderType: 'market'
      });

      if (onTradeComplete) {
        onTradeComplete(result);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to place trade');
    }
  };

  const selectedStockData = stocks.find(s => s.symbol === formData.symbol);
  const maxQuantity = formData.action === 'buy' && selectedStockData 
    ? Math.floor(walletBalance / selectedStockData.price)
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-6">Place Order</h3>

      {/* Stock Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Stock Symbol
        </label>
        <select
          value={formData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a stock</option>
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.symbol} - {stock.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Action
        </label>
        <select
          value={formData.action}
          onChange={(e) => handleInputChange('action', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      {/* Order Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Order Type
        </label>
        <select
          value={formData.orderType}
          onChange={(e) => handleInputChange('orderType', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="market">Market Order</option>
          <option value="limit">Limit Order</option>
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quantity
        </label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter quantity"
        />
        {formData.action === 'buy' && maxQuantity !== null && (
          <p className="text-sm text-gray-400 mt-1">
            Max affordable: {maxQuantity} shares
          </p>
        )}
      </div>

      {/* Order Summary */}
      {selectedStockData && formData.quantity && (
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Stock:</span>
              <span className="text-sm text-white font-medium">{selectedStockData.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Price:</span>
              <span className="text-sm text-white">${selectedStockData.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Quantity:</span>
              <span className="text-sm text-white">{formData.quantity}</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-300">Total:</span>
                <span className="text-sm font-bold text-white">${orderValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance */}
      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
        <span className="text-sm text-blue-200">
          Wallet Balance: <span className="font-medium">${walletBalance.toFixed(2)}</span>
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.symbol || !formData.quantity}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          formData.action === 'buy'
            ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/50'
            : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
        } text-white disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Processing...' : `${formData.action.toUpperCase()} ${formData.symbol || 'Stock'}`}
      </button>
    </form>
  );
};

export default TradingForm;