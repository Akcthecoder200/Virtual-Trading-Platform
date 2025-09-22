import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux loginUser: Starting login request", { email: credentials.email });
      const response = await authService.login(credentials);
      const { user, tokens } = response.data;

      console.log("✅ Redux loginUser: Login successful", { user: user.email, hasTokens: !!tokens });
      toast.success(`Welcome back, ${user.firstName}!`);

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      const message = error.response?.data?.error?.message || "Login failed";
      console.error("❌ Redux loginUser: Login failed", { error: message, fullError: error });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux signupUser: Starting signup request", { email: userData.email, username: userData.username });
      const response = await authService.signup(userData);
      const { user, tokens } = response.data;

      console.log("✅ Redux signupUser: Signup successful", { user: user.email, hasTokens: !!tokens });
      toast.success(
        `Welcome, ${user.firstName}! Account created successfully.`
      );

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      const message = error.response?.data?.error?.message || "Signup failed";
      console.error("❌ Redux signupUser: Signup failed", { error: message, fullError: error });
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      toast.success("Logged out successfully");
      return null;
    } catch (error) {
      // Even if logout fails on server, we still clear local state
      toast.success("Logged out successfully");
      return null;
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshTokenValue, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken(refreshTokenValue);
      const { accessToken, refreshToken: newRefreshToken } =
        response.data.tokens;

      return {
        token: accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return rejectWithValue("Token refresh failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data.user;
    } catch (error) {
      return rejectWithValue("Failed to fetch profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      toast.success("Profile updated successfully");
      return response.data.user;
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Failed to update profile";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Signup cases
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Get profile cases
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Update profile cases
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { clearAuth, setLoading, clearError, setTokens } =
  authSlice.actions;
export default authSlice.reducer;
