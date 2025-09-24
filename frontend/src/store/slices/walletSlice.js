import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Async thunks for wallet operations
export const getWalletBalance = createAsyncThunk(
  "wallet/getBalance",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux getWalletBalance: Fetching wallet balance");

      const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to fetch wallet balance"
        );
      }

      console.log(
        "✅ Redux getWalletBalance: Balance fetched successfully",
        data
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        "Failed to fetch wallet balance";
      console.error("❌ Redux getWalletBalance: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

export const getWalletTransactions = createAsyncThunk(
  "wallet/getTransactions",
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log(
        "🔄 Redux getWalletTransactions: Fetching transactions",
        params
      );

      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/wallet/transactions${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch transactions");
      }

      console.log(
        "✅ Redux getWalletTransactions: Transactions fetched successfully",
        data
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to fetch transactions";
      console.error("❌ Redux getWalletTransactions: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

export const addFunds = createAsyncThunk(
  "wallet/addFunds",
  async ({ amount, description }, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux addFunds: Adding funds", { amount, description });

      const response = await fetch(`${API_BASE_URL}/wallet/add-funds`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to add funds");
      }

      console.log("✅ Redux addFunds: Funds added successfully", data);
      toast.success(
        `Successfully added $${amount.toLocaleString()} to your wallet`
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to add funds";
      console.error("❌ Redux addFunds: Failed", {
        error: message,
        fullError: error,
      });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  "wallet/withdrawFunds",
  async ({ amount, description }, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux withdrawFunds: Withdrawing funds", {
        amount,
        description,
      });

      const response = await fetch(`${API_BASE_URL}/wallet/withdraw-funds`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to withdraw funds");
      }

      console.log("✅ Redux withdrawFunds: Funds withdrawn successfully", data);
      toast.success(
        `Successfully withdrew $${amount.toLocaleString()} from your wallet`
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to withdraw funds";
      console.error("❌ Redux withdrawFunds: Failed", {
        error: message,
        fullError: error,
      });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getWalletAnalytics = createAsyncThunk(
  "wallet/getAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux getWalletAnalytics: Fetching analytics");

      const response = await fetch(`${API_BASE_URL}/wallet/analytics`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch analytics");
      }

      console.log(
        "✅ Redux getWalletAnalytics: Analytics fetched successfully",
        data
      );
      return data;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to fetch analytics";
      console.error("❌ Redux getWalletAnalytics: Failed", {
        error: message,
        fullError: error,
      });
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  balance: 0,
  transactions: [],
  analytics: null,
  isLoading: false,
  isTransactionLoading: false,
  error: null,
  transactionError: null,
  lastUpdated: null,
};

// Wallet slice
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
      state.transactionError = null;
    },
    clearWallet: (state) => {
      return initialState;
    },
    updateBalance: (state, action) => {
      state.balance = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Balance cases
      .addCase(getWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance || 0;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Transactions cases
      .addCase(getWalletTransactions.pending, (state) => {
        state.isTransactionLoading = true;
        state.transactionError = null;
      })
      .addCase(getWalletTransactions.fulfilled, (state, action) => {
        state.isTransactionLoading = false;
        state.transactions = action.payload.transactions || [];
        state.transactionError = null;
      })
      .addCase(getWalletTransactions.rejected, (state, action) => {
        state.isTransactionLoading = false;
        state.transactionError = action.payload;
      })

      // Add Funds cases
      .addCase(addFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.newBalance || state.balance;
        // Add the new transaction to the beginning of the list
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(addFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Withdraw Funds cases
      .addCase(withdrawFunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.newBalance || state.balance;
        // Add the new transaction to the beginning of the list
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Analytics cases
      .addCase(getWalletAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const { clearWalletError, clearWallet, updateBalance } =
  walletSlice.actions;
export default walletSlice.reducer;
