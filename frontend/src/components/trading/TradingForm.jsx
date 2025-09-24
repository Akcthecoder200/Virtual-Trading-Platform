import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useWalletBalance, useTradingLoading } from "../../store/hooks";
import { executeTrade } from "../../store/slices/tradingSlice";
import { toast } from "react-hot-toast";

const TradingForm = ({ selectedStock, onTradeComplete }) => {
  const dispatch = useDispatch();
  const walletBalance = useWalletBalance();
  const isLoading = useTradingLoading();

  const [tradeData, setTradeData] = useState({
    symbol: "",
    action: "buy",
    orderType: "market",
    quantity: "",
    limitPrice: "",
    stopPrice: "",
    takeProfitPrice: "",
    timeInForce: "GTC",
    expiryDate: "",
  });

  const [errors, setErrors] = useState({});
  const [estimatedCost, setEstimatedCost] = useState(0);

  const orderTypes = [
    { value: "market", label: "Market Order" },
    { value: "limit", label: "Limit Order" },
    { value: "stop_loss", label: "Stop Loss" },
    { value: "stop_limit", label: "Stop Limit" },
    { value: "trailing_stop", label: "Trailing Stop" },
  ];

  const timeInForceOptions = [
    { value: "GTC", label: "Good Till Cancelled" },
    { value: "DAY", label: "Day Order" },
    { value: "IOC", label: "Immediate or Cancel" },
    { value: "FOK", label: "Fill or Kill" },
  ];

  useEffect(() => {
    if (selectedStock) {
      setTradeData((prev) => ({
        ...prev,
        symbol: selectedStock.symbol,
      }));
    }
  }, [selectedStock]);

  useEffect(() => {
    if (!selectedStock || !tradeData.quantity) {
      setEstimatedCost(0);
      return;
    }

    const quantity = parseFloat(tradeData.quantity);
    let price = 0;

    switch (tradeData.orderType) {
      case "market":
        price =
          tradeData.action === "buy"
            ? selectedStock.ask || selectedStock.currentPrice
            : selectedStock.bid || selectedStock.currentPrice;
        break;
      case "limit":
      case "stop_limit":
        price = parseFloat(tradeData.limitPrice) || 0;
        break;
      case "stop_loss":
      case "trailing_stop":
        price = parseFloat(tradeData.stopPrice) || 0;
        break;
      default:
        price = selectedStock.currentPrice;
    }

    const cost = quantity * price;
    setEstimatedCost(cost);
  }, [
    selectedStock,
    tradeData.quantity,
    tradeData.orderType,
    tradeData.action,
    tradeData.limitPrice,
    tradeData.stopPrice,
  ]);

  const validateForm = () => {
    const newErrors = {};

    if (!tradeData.symbol) {
      newErrors.symbol = "Please select a stock";
    }

    if (!tradeData.quantity || parseFloat(tradeData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    // Validate based on order type
    switch (tradeData.orderType) {
      case "limit":
        if (!tradeData.limitPrice || parseFloat(tradeData.limitPrice) <= 0) {
          newErrors.limitPrice = "Limit price is required for limit orders";
        }
        break;

      case "stop_loss":
        if (!tradeData.stopPrice || parseFloat(tradeData.stopPrice) <= 0) {
          newErrors.stopPrice = "Stop price is required for stop loss orders";
        }
        break;

      case "stop_limit":
        if (!tradeData.limitPrice || parseFloat(tradeData.limitPrice) <= 0) {
          newErrors.limitPrice =
            "Limit price is required for stop limit orders";
        }
        if (!tradeData.stopPrice || parseFloat(tradeData.stopPrice) <= 0) {
          newErrors.stopPrice = "Stop price is required for stop limit orders";
        }
        break;

      case "trailing_stop":
        if (!tradeData.stopPrice || parseFloat(tradeData.stopPrice) <= 0) {
          newErrors.stopPrice =
            "Trailing amount is required for trailing stop orders";
        }
        break;
    }

    if (tradeData.action === "buy" && estimatedCost > walletBalance) {
      newErrors.general = "Insufficient funds for this trade";
    }

    // Validate time in force with expiry
    if (tradeData.timeInForce === "DAY" && tradeData.expiryDate) {
      newErrors.expiryDate = "Day orders cannot have expiry dates";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getOrderTypeDescription = (orderType) => {
    const descriptions = {
      market: "Execute immediately at current market price",
      limit: "Execute only at specified price or better",
      stop_loss: "Execute when price reaches stop level",
      stop_limit: "Convert to limit order when stop price is reached",
      trailing_stop: "Stop price follows favorable price movements",
    };
    return descriptions[orderType] || "";
  };

  const handleSubmitTrade = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const tradePayload = {
        ...tradeData,
        quantity: parseFloat(tradeData.quantity),
        limitPrice: tradeData.limitPrice
          ? parseFloat(tradeData.limitPrice)
          : null,
        stopPrice: tradeData.stopPrice ? parseFloat(tradeData.stopPrice) : null,
        takeProfitPrice: tradeData.takeProfitPrice
          ? parseFloat(tradeData.takeProfitPrice)
          : null,
        estimatedCost,
      };

      await dispatch(executeTrade(tradePayload)).unwrap();

      toast.success(
        `${tradeData.action.toUpperCase()} order placed successfully!`
      );

      setTradeData({
        symbol: selectedStock?.symbol || "",
        action: "buy",
        orderType: "market",
        quantity: "",
        limitPrice: "",
        stopPrice: "",
        takeProfitPrice: "",
        timeInForce: "GTC",
        expiryDate: "",
      });

      if (onTradeComplete) {
        onTradeComplete();
      }
    } catch (error) {
      toast.error(error.message || "Failed to place trade");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6">
        {selectedStock
          ? `Trade ${selectedStock.symbol}`
          : "Select a Stock to Trade"}
      </h3>

      {selectedStock && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Current Price:</span>
              <span className="ml-2 text-white font-semibold">
                ${selectedStock.currentPrice?.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Change:</span>
              <span
                className={`ml-2 font-semibold ${
                  selectedStock.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {selectedStock.change >= 0 ? "+" : ""}
                {selectedStock.change?.toFixed(2)} (
                {selectedStock.changePercent?.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitTrade} className="space-y-6">
        {errors.general && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {errors.general}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Action
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "action", value: "buy" } })
              }
              className={`p-3 rounded-lg font-medium transition-colors ${
                tradeData.action === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() =>
                handleInputChange({ target: { name: "action", value: "sell" } })
              }
              className={`p-3 rounded-lg font-medium transition-colors ${
                tradeData.action === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Order Type
          </label>
          <select
            name="orderType"
            value={tradeData.orderType}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {orderTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            {getOrderTypeDescription(tradeData.orderType)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={tradeData.quantity}
            onChange={handleInputChange}
            placeholder="Enter number of shares"
            className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
              errors.quantity ? "border-red-500" : "border-gray-600"
            }`}
            min="1"
            step="1"
          />
          {errors.quantity && (
            <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Conditional Price Fields */}
        {(tradeData.orderType === "limit" ||
          tradeData.orderType === "stop_limit") && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Limit Price
            </label>
            <input
              type="number"
              name="limitPrice"
              value={tradeData.limitPrice}
              onChange={handleInputChange}
              placeholder="Enter limit price"
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors.limitPrice ? "border-red-500" : "border-gray-600"
              }`}
              step="0.01"
            />
            {errors.limitPrice && (
              <p className="text-red-400 text-sm mt-1">{errors.limitPrice}</p>
            )}
          </div>
        )}

        {(tradeData.orderType === "stop_loss" ||
          tradeData.orderType === "stop_limit" ||
          tradeData.orderType === "trailing_stop") && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {tradeData.orderType === "trailing_stop"
                ? "Trailing Amount"
                : "Stop Price"}
            </label>
            <input
              type="number"
              name="stopPrice"
              value={tradeData.stopPrice}
              onChange={handleInputChange}
              placeholder={
                tradeData.orderType === "trailing_stop"
                  ? "Enter trailing amount"
                  : "Enter stop price"
              }
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors.stopPrice ? "border-red-500" : "border-gray-600"
              }`}
              step="0.01"
            />
            {errors.stopPrice && (
              <p className="text-red-400 text-sm mt-1">{errors.stopPrice}</p>
            )}
          </div>
        )}

        {/* Take Profit (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Take Profit Price (Optional)
          </label>
          <input
            type="number"
            name="takeProfitPrice"
            value={tradeData.takeProfitPrice}
            onChange={handleInputChange}
            placeholder="Enter take profit price"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            step="0.01"
          />
        </div>

        {/* Time in Force */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Time in Force
          </label>
          <select
            name="timeInForce"
            value={tradeData.timeInForce}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            {timeInForceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Date (for GTC orders) */}
        {tradeData.timeInForce === "GTC" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              name="expiryDate"
              value={tradeData.expiryDate}
              onChange={handleInputChange}
              className={`w-full p-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                errors.expiryDate ? "border-red-500" : "border-gray-600"
              }`}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.expiryDate && (
              <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
            )}
          </div>
        )}

        {selectedStock && tradeData.quantity && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-white mb-3">
              Order Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white">{tradeData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className="text-white uppercase">{tradeData.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Type:</span>
                <span className="text-white">
                  {
                    orderTypes.find((ot) => ot.value === tradeData.orderType)
                      ?.label
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white">{tradeData.quantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time in Force:</span>
                <span className="text-white">
                  {
                    timeInForceOptions.find(
                      (tif) => tif.value === tradeData.timeInForce
                    )?.label
                  }
                </span>
              </div>
              {estimatedCost > 0 && (
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-400">Estimated Cost:</span>
                  <span className="text-white">
                    ${estimatedCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Available Balance:</span>
            <span className="text-white font-semibold">
              ${walletBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!selectedStock || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !selectedStock || isLoading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : tradeData.action === "buy"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `${tradeData.action.toUpperCase()} ${
              tradeData.quantity || 0
            } Shares`
          )}
        </button>
      </form>
    </div>
  );
};

export default TradingForm;
