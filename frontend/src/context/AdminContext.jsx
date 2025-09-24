import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    recentUsers: [],
    topTraders: [],
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Get auth token from localStorage
  const getAuthToken = () => {
    const persistedState = JSON.parse(
      localStorage.getItem("persist:auth") || "{}"
    );
    return persistedState.token ? JSON.parse(persistedState.token) : null;
  };

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add auth interceptor
  apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const refreshStats = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const fetchAdminStats = async () => {
    try {
      const response = await apiClient.get("/admin/stats");
      if (response.data.success) {
        setAdminStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiClient.get("/admin/stats");
        if (response.data.success) {
          setAdminStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const value = {
    adminStats,
    refreshStats,
    fetchAdminStats,
    apiClient,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminProvider;
