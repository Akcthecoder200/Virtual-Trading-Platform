# 📊 Real-Time Market Data Integration

## Overview

The Virtual Trading Platform now includes real-time market data integration, replacing mock data with live stock prices, historical charts, and market information.

## Features Implemented

### 🔄 Real-Time Data Sources

- **Primary**: Yahoo Finance API (no API key required)
- **Fallback**: Alpha Vantage API (free tier: 25 requests/day)
- **Automatic fallback** between APIs for reliability

### 📈 Market Data Service

- **Real-time quotes**: Current price, change, volume, market cap
- **Historical data**: OHLCV data with configurable timeframes
- **Symbol search**: Search for stocks by symbol or company name
- **Market status**: Live market hours detection
- **Caching**: 5-minute cache to reduce API calls
- **Rate limiting**: Automatic rate limit management

### 🎨 Enhanced UI Components

#### StockChart Component

- **Real market data** instead of mock data
- **Loading states** with spinner and error handling
- **Auto-refresh** every 30 seconds during market hours
- **Data source indicators** (real-time vs demo)
- **Interactive controls** for chart types and timeframes

#### StockSearch Component

- **Live symbol search** with autocomplete
- **Popular stocks** with real-time quotes
- **Price change indicators** with trending arrows
- **Responsive dropdown** with click-outside handling

#### ChartContainer Component

- **Dynamic stock selection** from real market data
- **Integrated chart controls** with real-time updates
- **Market summary cards** with live data

### 🔧 Custom Hooks

#### useMarketData Hook

```javascript
const { data, quote, loading, error, refresh } = useMarketData(
  symbol,
  interval,
  range
);
```

- Fetches historical data and real-time quotes
- Auto-refresh during market hours
- Error handling and loading states

#### useMultipleQuotes Hook

```javascript
const { quotes, loading, refresh } = useMultipleQuotes([
  "AAPL",
  "GOOGL",
  "TSLA",
]);
```

- Fetch multiple stock quotes simultaneously
- Optimized for watchlists and market overviews

#### useSymbolSearch Hook

```javascript
const { results, loading, search } = useSymbolSearch();
```

- Search stocks by symbol or company name
- Debounced search with 500ms delay

#### useMarketStatus Hook

```javascript
const { status, loading } = useMarketStatus();
```

- Live market status (open/closed)
- Next market open time

## Setup Instructions

### 1. Environment Variables

```bash
# Copy the example file
cp frontend/.env.example frontend/.env

# Edit the file and add your API keys (optional)
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### 2. API Keys (Optional)

- **Alpha Vantage**: Get free API key at https://www.alphavantage.co/support/#api-key
- **Yahoo Finance**: No API key required (used as primary source)

### 3. Dependencies

All required dependencies are already installed:

- Chart.js for charting
- Date-fns for date handling
- Custom market data service

## API Rate Limits

### Yahoo Finance (Primary)

- **Rate Limit**: ~2000 requests/hour
- **Coverage**: Real-time quotes, historical data
- **Reliability**: High (no API key required)

### Alpha Vantage (Fallback)

- **Free Tier**: 25 requests/day, 5 requests/minute
- **Premium**: Up to 1200 requests/minute
- **Coverage**: Global markets, extended historical data

## Usage Examples

### Real-Time Stock Chart

```jsx
import StockChart from "./components/trading/StockChart";

<StockChart
  symbol="AAPL"
  chartType="line"
  timeframe="1D"
  onChartTypeChange={setChartType}
  onTimeframeChange={setTimeframe}
/>;
```

### Stock Search with Live Data

```jsx
import StockSearch from "./components/trading/StockSearch";

<StockSearch onStockSelect={(stock) => console.log("Selected:", stock)} />;
```

### Multiple Stock Quotes

```jsx
import { useMultipleQuotes } from "./hooks/useMarketData";

const { quotes } = useMultipleQuotes(["AAPL", "GOOGL", "TSLA"]);
```

## Error Handling

### Graceful Degradation

- Falls back to mock data if all APIs fail
- Shows clear error messages with retry options
- Maintains functionality even without internet

### Loading States

- Skeleton loaders during data fetching
- Progressive data loading (cached first, then fresh)
- Visual indicators for data freshness

### Network Resilience

- Automatic retry logic with exponential backoff
- Offline detection and appropriate messaging
- Cache persistence across page reloads

## Performance Optimizations

### Caching Strategy

- **5-minute cache** for historical data
- **30-second cache** for real-time quotes
- **Memory-based caching** with automatic cleanup

### Request Optimization

- **Debounced search** to reduce API calls
- **Batch requests** for multiple symbols
- **Conditional updates** only when data changes

### UI Performance

- **React.memo** for expensive chart components
- **Lazy loading** for chart data
- **Virtualized lists** for large stock lists

## Market Data Coverage

### Supported Markets

- **US Stocks**: NYSE, NASDAQ
- **Major ETFs**: SPY, QQQ, IWM, etc.
- **Crypto**: BTC, ETH (via symbols like BTC-USD)

### Available Data

- **Real-time**: Price, change, volume, market cap
- **Historical**: OHLCV data up to 2 years
- **Timeframes**: 1D, 1W, 1M, 3M, 6M, 1Y
- **Indicators**: RSI, MACD, Moving Averages (calculated)

## Troubleshooting

### Common Issues

#### API Rate Limits

```
Error: Alpha Vantage rate limit exceeded
Solution: Wait 1 minute or add API key for higher limits
```

#### CORS Issues

```
Error: CORS policy blocks request
Solution: APIs are configured for browser access, but some may require proxy in production
```

#### Symbol Not Found

```
Error: Invalid symbol
Solution: Use proper stock symbols (e.g., AAPL, not Apple)
```

### Debug Mode

Enable debug logging by adding to localStorage:

```javascript
localStorage.setItem("DEBUG_MARKET_DATA", "true");
```

## Future Enhancements

### Planned Features

- **WebSocket connections** for real-time streaming
- **Options data** integration
- **Fundamental data** (P/E ratios, earnings, etc.)
- **News sentiment** analysis
- **Technical indicators** calculations
- **Alerts system** for price movements

### API Integrations

- **IEX Cloud** for additional market data
- **Finnhub** for news and sentiment
- **Quandl** for economic indicators
- **TradingView** for advanced charting

## Contributing

When working with market data:

1. Always handle API failures gracefully
2. Implement proper caching to reduce API calls
3. Test with both real and mock data
4. Consider rate limits in your implementation
5. Add appropriate loading and error states

## License

This market data integration follows the same license as the main project.
