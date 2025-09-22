import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LandingPage />
                )
              }
            />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <SignupPage />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#22c55e",
              },
            },
            error: {
              duration: 5000,
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
