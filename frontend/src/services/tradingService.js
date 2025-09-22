import axiosInstance from "./api";

export const tradingService = {
  // Get market data (mock data for now, can be replaced with real API)
  getMarketData: async () => {
    try {
      // This would typically be an API call to get real market data
      // For now, we'll return the mock data from the slice
      const response = await axiosInstance.get("/trading/market-data");
      return response.data;
    } catch (error) {
      // Fallback to mock data if API isn't available
      console.warn("Market data API not available, using mock data");
      throw error;
    }
  },

  // Place a trade
  placeTrade: async (tradeData) => {
    try {
      const response = await axiosInstance.post(
        "/trading/place-trade",
        tradeData
      );
      return response.data;
    } catch (error) {
      console.error("Place trade error:", error);
      throw error.response?.data || { message: "Failed to place trade" };
    }
  },

  // Get user's trades
  getTrades: async () => {
    try {
      const response = await axiosInstance.get("/trading/trades");
      return response.data;
    } catch (error) {
      console.error("Get trades error:", error);
      throw error.response?.data || { message: "Failed to fetch trades" };
    }
  },

  // Close a trade
  closeTrade: async (tradeId) => {
    try {
      const response = await axiosInstance.put(
        `/trading/trades/${tradeId}/close`
      );
      return response.data;
    } catch (error) {
      console.error("Close trade error:", error);
      throw error.response?.data || { message: "Failed to close trade" };
    }
  },

  // Get portfolio data
  getPortfolio: async () => {
    try {
      const response = await axiosInstance.get("/trading/portfolio");
      return response.data;
    } catch (error) {
      console.error("Get portfolio error:", error);
      throw error.response?.data || { message: "Failed to fetch portfolio" };
    }
  },
};

export default tradingService;
