import { useState, useEffect, useCallback } from "react";
import marketDataService from "../services/marketData";

/**
 * Custom hook for fetching and managing market data
 */
export const useMarketData = (symbol, interval = "1d", range = "1mo") => {
  const [data, setData] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const historicalData = await marketDataService.getHistoricalData(
        symbol,
        interval,
        range
      );
      setData(historicalData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Failed to fetch historical data for ${symbol}:`, err);
      setError(err.message);
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [symbol, interval, range]);

  // Fetch current quote
  const fetchQuote = useCallback(async () => {
    if (!symbol) return;

    try {
      const currentQuote = await marketDataService.getQuote(symbol);
      setQuote(currentQuote);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Failed to fetch quote for ${symbol}:`, err);
      setError(err.message);
    }
  }, [symbol]);

  // Refresh both historical data and quote
  const refresh = useCallback(async () => {
    await Promise.all([fetchHistoricalData(), fetchQuote()]);
  }, [fetchHistoricalData, fetchQuote]);

  // Initial data fetch
  useEffect(() => {
    if (symbol) {
      refresh();
    }
  }, [symbol, interval, range, refresh]);

  // Auto-refresh quote every 30 seconds during market hours
  useEffect(() => {
    if (!symbol) return;

    const checkMarketAndRefresh = async () => {
      const marketStatus = await marketDataService.getMarketStatus();
      if (marketStatus.isOpen) {
        await fetchQuote();
      }
    };

    // Set up interval for quote updates
    const quoteInterval = setInterval(checkMarketAndRefresh, 30000); // 30 seconds

    return () => clearInterval(quoteInterval);
  }, [symbol, fetchQuote]);

  return {
    data,
    quote,
    loading,
    error,
    lastUpdated,
    refresh,
    fetchHistoricalData,
    fetchQuote,
  };
};

/**
 * Hook for multiple symbols
 */
export const useMultipleQuotes = (symbols = []) => {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const quotesData = await marketDataService.getMultipleQuotes(symbols);
      const quotesMap = quotesData.reduce((acc, quote) => {
        acc[quote.symbol] = quote;
        return acc;
      }, {});

      setQuotes(quotesMap);
    } catch (err) {
      console.error("Failed to fetch multiple quotes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Auto-refresh every minute during market hours
  useEffect(() => {
    if (symbols.length === 0) return;

    const checkMarketAndRefresh = async () => {
      const marketStatus = await marketDataService.getMarketStatus();
      if (marketStatus.isOpen) {
        await fetchQuotes();
      }
    };

    const interval = setInterval(checkMarketAndRefresh, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [symbols, fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    refresh: fetchQuotes,
  };
};

/**
 * Hook for market status
 */
export const useMarketStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const marketStatus = await marketDataService.getMarketStatus();
        setStatus(marketStatus);
      } catch (err) {
        console.error("Failed to fetch market status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Update market status every minute
    const interval = setInterval(fetchStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  return { status, loading };
};

/**
 * Hook for symbol search
 */
export const useSymbolSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await marketDataService.searchSymbols(query);
      setResults(searchResults);
    } catch (err) {
      console.error("Symbol search failed:", err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};
