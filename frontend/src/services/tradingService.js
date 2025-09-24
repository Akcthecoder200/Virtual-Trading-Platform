import axiosInstance from "./api";

export const tradingService = {
  // Get market data from backend API
  getMarketData: async () => {
    try {
      const response = await axiosInstance.get("/trading/market-data");
      return response.data;
    } catch (error) {
      console.error("Market data API error:", error);
      throw error.response?.data || { message: "Failed to fetch market data" };
    }
  },

  // Place a trade
  placeTrade: async (tradeData) => {
    try {
      const response = await axiosInstance.post("/trading", tradeData);
      return response.data;
    } catch (error) {
      console.error("Place trade error:", error);
      throw error.response?.data || { message: "Failed to place trade" };
    }
  },

  // Get user's trades
  getTrades: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/trading", { params });
      return response.data;
    } catch (error) {
      console.error("Get trades error:", error);
      throw error.response?.data || { message: "Failed to fetch trades" };
    }
  },

  // Close a trade
  closeTrade: async (tradeId, exitPrice) => {
    try {
      const response = await axiosInstance.put(`/trading/${tradeId}/close`, {
        exitPrice,
      });
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

  // Get open positions
  getOpenPositions: async () => {
    try {
      const response = await axiosInstance.get("/trading/positions");
      return response.data;
    } catch (error) {
      console.error("Get open positions error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch open positions" }
      );
    }
  },

  // Get pending orders
  getPendingOrders: async () => {
    try {
      const response = await axiosInstance.get("/trading/pending");
      return response.data;
    } catch (error) {
      console.error("Get pending orders error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch pending orders" }
      );
    }
  },

  // Cancel a pending order
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.delete(
        `/trading/pending/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error.response?.data || { message: "Failed to cancel order" };
    }
  },
};

export default tradingService;
