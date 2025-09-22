import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const persistedState = JSON.parse(
      localStorage.getItem("persist:auth") || "{}"
    );
    const token = persistedState.token
      ? JSON.parse(persistedState.token)
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const persistedState = JSON.parse(
          localStorage.getItem("persist:auth") || "{}"
        );
        const refreshToken = persistedState.refreshToken
          ? JSON.parse(persistedState.refreshToken)
          : null;

        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.tokens;

          // Update stored tokens in Redux persist format
          const updatedState = {
            ...persistedState,
            token: JSON.stringify(accessToken),
            refreshToken: JSON.stringify(newRefreshToken),
          };
          localStorage.setItem("persist:auth", JSON.stringify(updatedState));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem("persist:auth");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Authentication endpoints
  login: (credentials) => apiClient.post("/auth/login", credentials),

  signup: (userData) => apiClient.post("/auth/signup", userData),

  logout: () => apiClient.post("/auth/logout"),

  refreshToken: (refreshToken) =>
    apiClient.post("/auth/refresh-token", { refreshToken }),

  requestPasswordReset: (email) =>
    apiClient.post("/auth/request-password-reset", { email }),

  resetPassword: (token, newPassword) =>
    apiClient.post("/auth/reset-password", { token, password: newPassword }),

  verifyEmail: (token) => apiClient.post("/auth/verify-email", { token }),

  // User profile endpoints
  getProfile: () => apiClient.get("/users/profile"),

  updateProfile: (profileData) => apiClient.put("/users/profile", profileData),

  changePassword: (passwordData) =>
    apiClient.post("/users/change-password", passwordData),

  changeEmail: (emailData) => apiClient.post("/users/change-email", emailData),

  uploadAvatar: (avatarUrl) =>
    apiClient.post("/users/upload-avatar", { avatarUrl }),

  deactivateAccount: (password, reason) =>
    apiClient.post("/users/deactivate", { password, reason }),

  getUserAnalytics: () => apiClient.get("/users/analytics"),
};

export const walletService = {
  // Wallet endpoints
  getBalance: () => apiClient.get("/wallet/balance"),

  getTransactions: (params = {}) =>
    apiClient.get("/wallet/transactions", { params }),

  addFunds: (amount, description) =>
    apiClient.post("/wallet/add-funds", { amount, description }),

  withdrawFunds: (amount, description) =>
    apiClient.post("/wallet/withdraw-funds", { amount, description }),

  resetWallet: (reason) => apiClient.post("/wallet/reset", { reason }),

  getAnalytics: () => apiClient.get("/wallet/analytics"),
};

export const tradingService = {
  // Trading endpoints (placeholder for future implementation)
  getMarketData: () => apiClient.get("/market/data"),

  placeTrade: (tradeData) => apiClient.post("/trades", tradeData),

  getTrades: (params = {}) => apiClient.get("/trades", { params }),

  closeTrade: (tradeId) => apiClient.post(`/trades/${tradeId}/close`),
};

export default apiClient;
