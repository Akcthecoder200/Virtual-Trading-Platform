/**
 * Market Data Service
 * Provides real-time and historical stock market data
 * Using Alpha Vantage API (free tier: 25 requests/day, 5 requests/minute)
 */

const ALPHA_VANTAGE_API_KEY =
  import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "demo";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Fallback to Yahoo Finance API for more requests
const YAHOO_FINANCE_BASE_URL =
  "https://query1.finance.yahoo.com/v8/finance/chart";

class MarketDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.rateLimitDelay = 12000; // 12 seconds between requests (Alpha Vantage limit)
    this.lastRequestTime = 0;
  }

  /**
   * Wait for rate limit if needed
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  /**
   * Get cached data or return null
   */
  getCachedData(cacheKey) {
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get real-time quote for a symbol
   */
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Try Yahoo Finance first (no API key required)
      const quote = await this.getYahooQuote(symbol);
      this.setCachedData(cacheKey, quote);
      return quote;
    } catch (error) {
      console.warn(
        `Yahoo Finance failed for ${symbol}, trying Alpha Vantage:`,
        error
      );

      try {
        await this.waitForRateLimit();
        const quote = await this.getAlphaVantageQuote(symbol);
        this.setCachedData(cacheKey, quote);
        return quote;
      } catch (alphaError) {
        console.error(`Both APIs failed for ${symbol}:`, alphaError);
        throw new Error(`Failed to fetch quote for ${symbol}`);
      }
    }
  }

  /**
   * Get historical data for a symbol
   */
  async getHistoricalData(symbol, interval = "1day", range = "1mo") {
    const cacheKey = `historical_${symbol}_${interval}_${range}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      // Try Yahoo Finance first
      const data = await this.getYahooHistoricalData(symbol, interval, range);
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.warn(
        `Yahoo Finance historical data failed for ${symbol}:`,
        error
      );

      try {
        await this.waitForRateLimit();
        const data = await this.getAlphaVantageHistoricalData(symbol, interval);
        this.setCachedData(cacheKey, data);
        return data;
      } catch (alphaError) {
        console.error(
          `Both APIs failed for historical data ${symbol}:`,
          alphaError
        );
        throw new Error(`Failed to fetch historical data for ${symbol}`);
      }
    }
  }

  /**
   * Yahoo Finance Quote API
   */
  async getYahooQuote(symbol) {
    const response = await fetch(`${YAHOO_FINANCE_BASE_URL}/${symbol}`);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];

    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: meta.symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || null,
      high: quote.high[quote.high.length - 1] || currentPrice,
      low: quote.low[quote.low.length - 1] || currentPrice,
      open: quote.open[quote.open.length - 1] || currentPrice,
      previousClose: previousClose,
      currency: meta.currency || "USD",
      timestamp: Date.now(),
    };
  }

  /**
   * Yahoo Finance Historical Data API
   */
  async getYahooHistoricalData(symbol, interval = "1d", range = "1mo") {
    const response = await fetch(
      `${YAHOO_FINANCE_BASE_URL}/${symbol}?interval=${interval}&range=${range}`
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    return timestamps
      .map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split("T")[0],
        time: timestamp * 1000,
        open: quote.open[index] || 0,
        high: quote.high[index] || 0,
        low: quote.low[index] || 0,
        close: quote.close[index] || 0,
        volume: quote.volume[index] || 0,
      }))
      .filter((item) => item.open && item.high && item.low && item.close);
  }

  /**
   * Alpha Vantage Quote API (fallback)
   */
  async getAlphaVantageQuote(symbol) {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
    }

    if (data["Note"]) {
      throw new Error("Alpha Vantage rate limit exceeded");
    }

    const quote = data["Global Quote"];

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      volume: parseInt(quote["06. volume"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      open: parseFloat(quote["02. open"]),
      previousClose: parseFloat(quote["08. previous close"]),
      currency: "USD",
      timestamp: Date.now(),
    };
  }

  /**
   * Alpha Vantage Historical Data API (fallback)
   */
  async getAlphaVantageHistoricalData(symbol, interval = "daily") {
    const functionMap = {
      "1d": "TIME_SERIES_DAILY",
      daily: "TIME_SERIES_DAILY",
      "1wk": "TIME_SERIES_WEEKLY",
      weekly: "TIME_SERIES_WEEKLY",
      "1mo": "TIME_SERIES_MONTHLY",
      monthly: "TIME_SERIES_MONTHLY",
    };

    const func = functionMap[interval] || "TIME_SERIES_DAILY";
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
    }

    if (data["Note"]) {
      throw new Error("Alpha Vantage rate limit exceeded");
    }

    const timeSeriesKey = Object.keys(data).find((key) =>
      key.includes("Time Series")
    );
    const timeSeries = data[timeSeriesKey];

    return Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        time: new Date(date).getTime(),
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .sort((a, b) => a.time - b.time);
  }

  /**
   * Get multiple quotes at once
   */
  async getMultipleQuotes(symbols) {
    const promises = symbols.map((symbol) =>
      this.getQuote(symbol).catch((error) => ({
        symbol,
        error: error.message,
        price: 0,
        change: 0,
        changePercent: 0,
      }))
    );

    return Promise.all(promises);
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query) {
    if (ALPHA_VANTAGE_API_KEY === "demo") {
      // Return mock search results for demo
      const mockResults = [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          type: "Equity",
          region: "United States",
          currency: "USD",
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          type: "Equity",
          region: "United States",
          currency: "USD",
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc.",
          type: "Equity",
          region: "United States",
          currency: "USD",
        },
      ].filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      );

      return mockResults;
    }

    try {
      await this.waitForRateLimit();
      const url = `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();

      if (data["Error Message"]) {
        throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
      }

      return (
        data["bestMatches"]?.map((match) => ({
          symbol: match["1. symbol"],
          name: match["2. name"],
          type: match["3. type"],
          region: match["4. region"],
          currency: match["8. currency"],
        })) || []
      );
    } catch (error) {
      console.error("Symbol search failed:", error);
      return [];
    }
  }

  /**
   * Get market status
   */
  async getMarketStatus() {
    // Simple market hours check (NYSE/NASDAQ)
    const now = new Date();
    const hours = now.getHours();
    const day = now.getDay();

    // Market is open Monday-Friday, 9:30 AM - 4:00 PM ET
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hours >= 9 && hours < 16;

    return {
      isOpen: isWeekday && isMarketHours,
      nextOpen:
        isWeekday && !isMarketHours
          ? hours < 9
            ? "Today at 9:30 AM ET"
            : "Tomorrow at 9:30 AM ET"
          : "Monday at 9:30 AM ET",
      timezone: "Eastern Time",
    };
  }
}

// Create singleton instance
const marketDataService = new MarketDataService();

export default marketDataService;
