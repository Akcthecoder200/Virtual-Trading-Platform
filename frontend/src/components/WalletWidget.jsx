import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Minus,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
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

const WalletWidget = () => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const fetchWalletBalance = async () => {
    setIsLoading(true);
    setError(null);
    try {
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

      setBalance(data.balance || 0);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWalletBalance();
  };

  // Load balance on component mount
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/add-funds`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || "Funds added via dashboard",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to add funds");
      }

      setBalance(data.newBalance || balance);
      setLastUpdated(new Date().toISOString());
      toast.success(`Successfully added $${amount} to your wallet`);

      setAmount("");
      setDescription("");
      setShowAddFunds(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/withdraw-funds`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || "Funds withdrawn via dashboard",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to withdraw funds");
      }

      setBalance(data.newBalance || balance);
      setLastUpdated(new Date().toISOString());
      toast.success(`Successfully withdrew $${amount} from your wallet`);

      setAmount("");
      setDescription("");
      setShowWithdraw(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Wallet className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-white">Wallet Balance</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-gray-400" />
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-white mb-1">
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-gray-400">
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          </>
        )}
      </div>

      <div className="space-y-3">
        {!showAddFunds && !showWithdraw && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowAddFunds(true)}
              className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </button>
          </div>
        )}

        {(showAddFunds || showWithdraw) && (
          <form
            onSubmit={showAddFunds ? handleAddFunds : handleWithdraw}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction description"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !amount || parseFloat(amount) <= 0}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  showAddFunds
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  <>
                    {showAddFunds ? (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-2 inline" />
                        Add Funds
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-4 h-4 mr-2 inline" />
                        Withdraw
                      </>
                    )}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddFunds(false);
                  setShowWithdraw(false);
                  setAmount("");
                  setDescription("");
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default WalletWidget;
