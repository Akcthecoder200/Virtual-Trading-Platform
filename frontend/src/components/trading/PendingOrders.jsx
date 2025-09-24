import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingOrders, cancelOrder } from "../../store/slices/tradingSlice";
import { toast } from "react-hot-toast";

const PendingOrders = () => {
  const dispatch = useDispatch();
  const { pendingOrders, isLoading, error } = useSelector(
    (state) => state.trading
  );

  useEffect(() => {
    dispatch(getPendingOrders());
  }, [dispatch]);

  const getOrderTypeDisplay = (orderType) => {
    const types = {
      market: "Market",
      limit: "Limit",
      stop: "Stop Loss",
      "stop-limit": "Stop Limit",
      trailing_stop: "Trailing Stop",
    };
    return types[orderType] || orderType;
  };

  const getStatusColor = (order) => {
    if (order.isExpired) return "text-gray-400";
    if (order.wouldExecute) return "text-green-400";
    return "text-yellow-400";
  };

  const getStatusText = (order) => {
    if (order.isExpired) return "Expired";
    if (order.wouldExecute) return "Ready to Execute";
    return "Pending";
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Pending Orders
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Pending Orders
        </h3>
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
          Failed to load pending orders: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Pending Orders</h3>
        <button
          onClick={() => dispatch(getPendingOrders())}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Refresh
        </button>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No pending orders</p>
          <p className="text-sm mt-2">
            Place limit or stop orders to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">
                      {order.symbol}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        order.type === "buy"
                          ? "bg-green-900 text-green-200"
                          : "bg-red-900 text-red-200"
                      }`}
                    >
                      {order.type.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {getOrderTypeDisplay(order.orderType)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    {order.quantity} shares
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${getStatusColor(order)}`}
                  >
                    {getStatusText(order)}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Current Price:</span>
                  <div className="text-white font-medium">
                    ${order.currentPrice?.toFixed(2)}
                  </div>
                </div>

                {order.execution.requestedPrice && (
                  <div>
                    <span className="text-gray-400">
                      {order.orderType === "limit"
                        ? "Limit Price:"
                        : order.orderType === "stop"
                        ? "Stop Price:"
                        : "Target Price:"}
                    </span>
                    <div className="text-white font-medium">
                      ${order.execution.requestedPrice.toFixed(2)}
                    </div>
                  </div>
                )}

                {order.stopLoss && (
                  <div>
                    <span className="text-gray-400">Stop Price:</span>
                    <div className="text-white font-medium">
                      ${order.stopLoss.toFixed(2)}
                    </div>
                  </div>
                )}

                {order.takeProfit && (
                  <div>
                    <span className="text-gray-400">Take Profit:</span>
                    <div className="text-white font-medium">
                      ${order.takeProfit.toFixed(2)}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-400">Distance:</span>
                  <div
                    className={`font-medium ${
                      order.distanceToTrigger > 0
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    ${Math.abs(order.distanceToTrigger || 0).toFixed(2)}
                    {order.distancePercent && (
                      <span className="text-xs ml-1">
                        ({Math.abs(order.distancePercent).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {order.expirationTime && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    Expires: {new Date(order.expirationTime).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="mt-3 flex justify-end space-x-2">
                <button
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-400 rounded hover:bg-red-900/20 transition-colors"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this order?"
                      )
                    ) {
                      try {
                        await dispatch(cancelOrder(order._id)).unwrap();
                        toast.success("Order cancelled successfully");
                      } catch (error) {
                        toast.error("Failed to cancel order: " + error);
                      }
                    }
                  }}
                >
                  Cancel
                </button>

                <button
                  className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 border border-blue-400 rounded hover:bg-blue-900/20 transition-colors"
                  onClick={() => {
                    // TODO: Implement modify order functionality
                    toast.error(
                      "Modify order functionality not yet implemented"
                    );
                  }}
                >
                  Modify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
