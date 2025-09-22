import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getMarketData } from '../store/slices/tradingSlice';
import DashboardHeader from '../components/DashboardHeader';
import StockList from '../components/trading/StockList';
import TradingForm from '../components/trading/TradingForm';
import TradeHistory from '../components/trading/TradeHistory';
import MarketWatch from '../components/trading/MarketWatch';
import { useTradingLoading, useTradingError } from '../store/hooks';
import toast from 'react-hot-toast';

const Trading = () => {
  const dispatch = useDispatch();
  const isLoading = useTradingLoading();
  const error = useTradingError();
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    // Load initial market data
    dispatch(getMarketData());

    // Set up real-time price updates (every 30 seconds)
    const interval = setInterval(() => {
      dispatch(getMarketData());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
  };

  const handleTradeComplete = () => {
    setSelectedStock(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Market Watch */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <MarketWatch />
          </div>

          {/* Stock List and Trading Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <StockList onSelectStock={handleStockSelect} />
              </div>
            </div>

            {/* Trading Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <TradingForm 
                  selectedStock={selectedStock} 
                  onTradeComplete={handleTradeComplete}
                />
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <TradeHistory />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trading;