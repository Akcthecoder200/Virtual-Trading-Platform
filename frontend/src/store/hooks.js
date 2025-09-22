import { useSelector, useDispatch } from "react-redux";

// Typed hooks for better developer experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);

// Auth-specific hooks
export const useAuth = () => {
  return useAppSelector((state) => state.auth);
};

export const useUser = () => {
  return useAppSelector((state) => state.auth.user);
};

export const useIsAuthenticated = () => {
  return useAppSelector((state) => state.auth.isAuthenticated);
};

export const useAuthLoading = () => {
  return useAppSelector((state) => state.auth.isLoading);
};

export const useAuthError = () => {
  return useAppSelector((state) => state.auth.error);
};

// Wallet-specific hooks
export const useWallet = () => {
  return useAppSelector((state) => state.wallet);
};

export const useWalletBalance = () => {
  return useAppSelector((state) => state.wallet.balance);
};

export const useWalletTransactions = () => {
  return useAppSelector((state) => state.wallet.transactions);
};

export const useWalletLoading = () => {
  return useAppSelector((state) => state.wallet.isLoading);
};

export const useWalletError = () => {
  return useAppSelector((state) => state.wallet.error);
};

// Trading-specific hooks
export const useTrading = () => {
  return useAppSelector((state) => state.trading);
};

export const useStocks = () => {
  return useAppSelector((state) => state.trading.stocks);
};

export const useTrades = () => {
  return useAppSelector((state) => state.trading.trades);
};

export const useWatchlist = () => {
  return useAppSelector((state) => state.trading.watchlist);
};

export const useTradingLoading = () => {
  return useAppSelector((state) => state.trading.isLoading);
};

export const useTradingError = () => {
  return useAppSelector((state) => state.trading.error);
};
