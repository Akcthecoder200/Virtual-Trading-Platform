import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import tradingService from "../../services/tradingService";

// Async thunks for trading operations
export const getMarketData = createAsyncThunk(
  "trading/getMarketData",
  async (symbols = [], { rejectWithValue }) => {
    try {
      console.log(
        "🔄 Redux getMarketData: Fetching market data from API",
        symbols
      );

      const response = await tradingService.getMarketData();

      if (response.success) {
        console.log(
          "✅ Redux getMarketData: Market data fetched successfully",
          response.data
        );
        return response;
      } else {
        throw new Error("Failed to fetch market data");
      }
    } catch (error) {
      const message = error.message || "Failed to fetch market data";
      console.error("❌ Redux getMarketData: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

export const placeTrade = createAsyncThunk(
  "trading/placeTrade",
  async (tradeData, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux placeTrade: Placing trade via API", tradeData);

      const response = await tradingService.placeTrade(tradeData);

      if (response.success) {
        console.log(
          "✅ Redux placeTrade: Trade placed successfully",
          response.data
        );

        const { action, symbol, quantity } = tradeData;
        const actionText = action.toLowerCase() === "buy" ? "bought" : "sold";
        toast.success(
          response.data.message ||
            `Successfully ${actionText} ${quantity} shares of ${symbol}`
        );

        return response.data;
      } else {
        throw new Error("Failed to place trade");
      }
    } catch (error) {
      const message = error.message || "Failed to place trade";
      console.error("❌ Redux placeTrade: Failed", {
        error: message,
        fullError: error,
      });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getTrades = createAsyncThunk(
  "trading/getTrades",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux getTrades: Fetching trades from API", params);

      const response = await tradingService.getTrades(params);

      if (response.success) {
        console.log(
          "✅ Redux getTrades: Trades fetched successfully",
          response.data
        );
        return response.data;
      } else {
        throw new Error("Failed to fetch trades");
      }
    } catch (error) {
      const message = error.message || "Failed to fetch trades";
      console.error("❌ Redux getTrades: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

export const closeTrade = createAsyncThunk(
  "trading/closeTrade",
  async ({ tradeId, exitPrice }, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux closeTrade: Closing trade via API", {
        tradeId,
        exitPrice,
      });

      const response = await tradingService.closeTrade(tradeId, exitPrice);

      if (response.success) {
        console.log(
          "✅ Redux closeTrade: Trade closed successfully",
          response.data
        );
        toast.success(response.data.message || "Trade closed successfully");
        return response.data;
      } else {
        throw new Error("Failed to close trade");
      }
    } catch (error) {
      const message = error.message || "Failed to close trade";
      console.error("❌ Redux closeTrade: Failed", {
        error: message,
        fullError: error,
      });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPortfolio = createAsyncThunk(
  "trading/getPortfolio",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux getPortfolio: Fetching portfolio from API");

      const response = await tradingService.getPortfolio();

      if (response.success) {
        console.log(
          "✅ Redux getPortfolio: Portfolio fetched successfully",
          response.data
        );
        return response.data;
      } else {
        throw new Error("Failed to fetch portfolio");
      }
    } catch (error) {
      const message = error.message || "Failed to fetch portfolio";
      console.error("❌ Redux getPortfolio: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

// Mock stock data for demonstration (will be replaced with real API)
const mockStocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 182.52,
    change: 2.41,
    changePercent: 1.34,
    volume: 45123000,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2750.84,
    change: -15.23,
    changePercent: -0.55,
    volume: 1234000,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.73,
    change: 12.45,
    changePercent: 5.27,
    volume: 23456000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.85,
    change: 4.12,
    changePercent: 1.1,
    volume: 12340000,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 3342.88,
    change: -8.75,
    changePercent: -0.26,
    volume: 2345000,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 504.2,
    change: 15.67,
    changePercent: 3.21,
    volume: 8765000,
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    price: 445.61,
    change: -2.34,
    changePercent: -0.52,
    volume: 3456000,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.28,
    change: 23.45,
    changePercent: 2.75,
    volume: 15678000,
  },
];

// Initial state
const initialState = {
  stocks: mockStocks,
  trades: [],
  positions: [],
  portfolio: null,
  watchlist: [],
  marketData: {},
  isLoading: false,
  isTradeLoading: false,
  error: null,
  tradeError: null,
  lastUpdated: null,
};

// Trading slice
const tradingSlice = createSlice({
  name: "trading",
  initialState,
  reducers: {
    clearTradingError: (state) => {
      state.error = null;
      state.tradeError = null;
    },
    clearTrading: () => {
      return { ...initialState, stocks: mockStocks };
    },
    updateStockPrice: (state, action) => {
      const { symbol, price, change, changePercent } = action.payload;
      const stockIndex = state.stocks.findIndex(
        (stock) => stock.symbol === symbol
      );
      if (stockIndex !== -1) {
        state.stocks[stockIndex] = {
          ...state.stocks[stockIndex],
          price,
          change,
          changePercent,
          lastUpdated: new Date().toISOString(),
        };
      }
    },
    addToWatchlist: (state, action) => {
      const symbol = action.payload;
      if (!state.watchlist.includes(symbol)) {
        state.watchlist.push(symbol);
      }
    },
    removeFromWatchlist: (state, action) => {
      const symbol = action.payload;
      state.watchlist = state.watchlist.filter((s) => s !== symbol);
    },
    // Simulate real-time price updates
    simulatePriceUpdate: (state) => {
      state.stocks = state.stocks.map((stock) => {
        const randomChange = (Math.random() - 0.5) * 0.02; // Random change between -1% and +1%
        const newPrice = stock.price * (1 + randomChange);
        const priceChange = newPrice - stock.price;
        const percentChange = (priceChange / stock.price) * 100;

        return {
          ...stock,
          price: Number(newPrice.toFixed(2)),
          change: Number(priceChange.toFixed(2)),
          changePercent: Number(percentChange.toFixed(2)),
          lastUpdated: new Date().toISOString(),
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Market Data cases
      .addCase(getMarketData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMarketData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastUpdated = action.payload.timestamp;
        // Update stocks with real market data
        if (action.payload.data) {
          state.stocks = action.payload.data;
        }
        state.error = null;
      })
      .addCase(getMarketData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Place Trade cases
      .addCase(placeTrade.pending, (state) => {
        state.isTradeLoading = true;
        state.tradeError = null;
      })
      .addCase(placeTrade.fulfilled, (state, action) => {
        state.isTradeLoading = false;
        // Add the new trade to the trades array
        if (action.payload.trade) {
          state.trades.unshift(action.payload.trade);
        }
        state.tradeError = null;
      })
      .addCase(placeTrade.rejected, (state, action) => {
        state.isTradeLoading = false;
        state.tradeError = action.payload;
      })

      // Get Trades cases
      .addCase(getTrades.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trades = action.payload.trades || [];
        state.error = null;
      })
      .addCase(getTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Close Trade cases
      .addCase(closeTrade.fulfilled, (state, action) => {
        // Update the trade with the closed trade data
        if (action.payload.trade) {
          const tradeIndex = state.trades.findIndex(
            (trade) => trade._id === action.payload.trade._id
          );
          if (tradeIndex !== -1) {
            state.trades[tradeIndex] = action.payload.trade;
          }
        }
      })

      // Get Portfolio cases
      .addCase(getPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store portfolio data
        state.portfolio = action.payload;
        state.error = null;
      })
      .addCase(getPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearTradingError,
  clearTrading,
  updateStockPrice,
  addToWatchlist,
  removeFromWatchlist,
  simulatePriceUpdate,
} = tradingSlice.actions;

export default tradingSlice.reducer;
