import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../services/authService";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      login: async (credentials) => {
        try {
          const response = await authService.login(credentials);
          const { user, tokens } = response.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
          });

          toast.success(`Welcome back, ${user.firstName}!`);
          return response;
        } catch (error) {
          toast.error(error.response?.data?.error?.message || "Login failed");
          throw error;
        }
      },

      signup: async (userData) => {
        try {
          const response = await authService.signup(userData);
          const { user, tokens } = response.data;

          set({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
          });

          toast.success(
            `Welcome, ${user.firstName}! Account created successfully.`
          );
          return response;
        } catch (error) {
          toast.error(error.response?.data?.error?.message || "Signup failed");
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        toast.success("Logged out successfully");
      },

      updateProfile: (updatedUser) => {
        set({
          user: { ...get().user, ...updatedUser },
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Initialize auth state
      initializeAuth: async () => {
        const { token } = get();

        if (token) {
          try {
            // Verify token is still valid by fetching user profile
            const response = await authService.getProfile();
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Token is invalid, clear auth state
            get().clearAuth();
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          get().clearAuth();
          return false;
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } =
            response.data.tokens;

          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });

          return true;
        } catch (error) {
          get().clearAuth();
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
