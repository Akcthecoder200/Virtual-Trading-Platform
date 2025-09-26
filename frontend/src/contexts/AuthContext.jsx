import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

const API_BASE_URL = "http://localhost:5000/api";  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    };
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        // Verify token is still valid by fetching profile
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear storage
          logout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Login failed");
      }

      const { user: userData, tokens } = result.data;

      // Store in localStorage
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(tokens.accessToken);
      setIsAuthenticated(true);

      return { user: userData, tokens };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.error?.message || "Signup failed";
        if (result.error?.details) {
          const details = result.error.details;
          errorMsg = details.map((d) => `${d.field}: ${d.message}`).join(", ");
        }
        throw new Error(errorMsg);
      }

      const { user: newUser, tokens } = result.data;

      // Store in localStorage
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      // Update state
      setUser(newUser);
      setToken(tokens.accessToken);
      setIsAuthenticated(true);

      return { user: newUser, tokens };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const authToken = localStorage.getItem("accessToken");
      if (authToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
      }
    } catch (error) {
      console.warn("Logout request failed, but continuing with local logout");
    } finally {
      // Clear localStorage and state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    signup,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
