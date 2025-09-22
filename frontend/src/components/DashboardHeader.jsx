import React from "react";
import {
  User,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  Menu,
  BarChart3,
  Home,
} from "lucide-react";
import { useUser, useAppDispatch } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { clearWallet } from "../store/slices/walletSlice";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const DashboardHeader = () => {
  const user = useUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(clearWallet());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return "User";
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and greeting */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">
              VirtualTrade
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/trading")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/trading"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Trading</span>
            </button>
          </nav>

          <div className="hidden lg:block">
            <h1 className="text-lg font-medium text-white">
              {getGreeting()}, {formatUserName()}!
            </h1>
            <p className="text-sm text-gray-400">
              Welcome to your trading dashboard
            </p>
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="p-2 text-gray-400 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </button>

          {/* Settings */}
          <button
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User profile dropdown */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">
                {formatUserName()}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>

            {/* User avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile greeting */}
      <div className="md:hidden mt-3">
        <h1 className="text-lg font-medium text-white">
          {getGreeting()}, {formatUserName()}!
        </h1>
        <p className="text-sm text-gray-400">
          Welcome to your trading dashboard
        </p>
      </div>
    </header>
  );
};

export default DashboardHeader;
