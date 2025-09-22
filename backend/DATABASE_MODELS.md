# Database Models Documentation

## Overview

The Virtual Trading Platform uses MongoDB with Mongoose ODM for data modeling. The database is designed to support a comprehensive trading simulation with user management, virtual wallets, trade execution, market data, and system configuration.

## Model Architecture

### 1. User Model (`User.js`)

**Purpose**: Complete user management with authentication, profiles, preferences, and analytics.

#### Key Features:

- **Authentication**: JWT-based with password hashing, login attempts tracking, account locking
- **Profile Management**: Personal information, contact details, address
- **Preferences**: UI settings, trading preferences, notifications, risk management
- **Security**: Two-factor authentication, password reset, email verification
- **Analytics**: Trading statistics, win rates, profit/loss tracking

#### Schema Structure:

```javascript
{
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed, select: false),
  role: Enum ['user', 'admin', 'moderator'],
  status: Enum ['active', 'inactive', 'suspended', 'pending'],
  profile: {
    firstName, lastName, dateOfBirth, phone, country, address, avatar
  },
  preferences: {
    theme, language, currency, timezone, notifications, trading
  },
  security: {
    lastLogin, loginAttempts, lockUntil, tokens, 2FA
  },
  analytics: {
    totalTrades, winRate, totalProfit, totalLoss, bestTrade, worstTrade
  }
}
```

#### Key Methods:

- `comparePassword()` - Verify user password
- `incLoginAttempts()` - Handle failed login attempts
- `updateTradingAnalytics()` - Update user trading statistics
- `findByCredentials()` - Static method for authentication

### 2. Wallet Model (`Wallet.js`)

**Purpose**: Virtual trading account with balance management, transaction history, and risk controls.

#### Key Features:

- **Balance Management**: Real-time balance, equity, margin calculations
- **Transaction History**: Complete audit trail of all balance changes
- **Risk Management**: Leverage settings, drawdown limits, position sizing
- **Analytics**: Daily snapshots, performance metrics
- **Multi-currency**: Support for different base currencies

#### Schema Structure:

```javascript
{
  user: ObjectId (ref: User, unique),
  balance: Number (default: $10,000),
  equity: Number,
  margin: Number,
  freeMargin: Number,
  currency: Enum ['USD', 'EUR', 'GBP', ...],
  leverage: Number (1-500),
  riskSettings: {
    maxRiskPerTrade, maxOpenPositions, stopOutLevel
  },
  transactions: [{
    type, amount, balanceBefore, balanceAfter, description, reference
  }],
  balanceHistory: [{
    date, balance, equity, margin, freeMargin, profitLoss
  }],
  statistics: {
    totalDeposits, totalWithdrawals, totalTradingProfit, totalTradingLoss
  }
}
```

#### Key Methods:

- `addTransaction()` - Record balance changes
- `resetBalance()` - Admin balance reset
- `takeSnapshot()` - Daily balance snapshot
- `canMakeTrade()` - Check trading eligibility
- `calculateRequiredMargin()` - Margin calculations

### 3. Trade Model (`Trade.js`)

**Purpose**: Complete trade lifecycle management with execution, monitoring, and analytics.

#### Key Features:

- **Order Types**: Market, Limit, Stop, Stop-Limit orders
- **Position Management**: Long/short positions with quantity tracking
- **Risk Management**: Stop-loss, take-profit, margin requirements
- **Real-time Monitoring**: Price updates, P&L calculations
- **Trade Analytics**: Performance metrics, holding periods, pip calculations

#### Schema Structure:

```javascript
{
  user: ObjectId (ref: User),
  symbol: String (e.g., 'EURUSD', 'BTCUSD'),
  symbolType: Enum ['forex', 'crypto', 'stock', 'commodity', 'index'],
  type: Enum ['buy', 'sell'],
  orderType: Enum ['market', 'limit', 'stop', 'stop-limit'],
  quantity: Number,
  entryPrice: Number,
  currentPrice: Number,
  exitPrice: Number,
  stopLoss: Number,
  takeProfit: Number,
  status: Enum ['pending', 'open', 'closed', 'cancelled', 'expired'],
  openTime: Date,
  closeTime: Date,
  profit: Number,
  loss: Number,
  netProfitLoss: Number,
  leverage: Number,
  margin: Number,
  marketConditions: { volatility, spread, liquidity },
  execution: { requestedPrice, executedPrice, slippage, commission }
}
```

#### Key Methods:

- `calculateProfitLoss()` - Real-time P&L calculations
- `closeTrade()` - Execute trade closure
- `updateCurrentPrice()` - Update with market prices
- `modifyTrade()` - Modify stop-loss/take-profit
- `calculateUserStats()` - Static method for user analytics

### 4. MarketSymbol Model (`MarketSymbol.js`)

**Purpose**: Tradeable instrument configuration with real-time pricing and market data.

#### Key Features:

- **Multi-Asset Support**: Forex, cryptocurrencies, stocks, commodities, indices
- **Real-time Pricing**: Bid/ask spreads, 24h statistics
- **Trading Configuration**: Lot sizes, leverage limits, margin requirements
- **Price History**: OHLCV candlestick data for charting
- **Market Hours**: Trading session management

#### Schema Structure:

```javascript
{
  symbol: String (unique, e.g., 'EURUSD'),
  name: String,
  type: Enum ['forex', 'crypto', 'stock', 'commodity', 'index'],
  baseAsset: String,
  quoteAsset: String,
  currentPrice: Number,
  bid: Number,
  ask: Number,
  spread: Number,
  change24h: Number,
  changePercent24h: Number,
  high24h: Number,
  low24h: Number,
  volume24h: Number,
  minTradeSize: Number,
  maxTradeSize: Number,
  maxLeverage: Number,
  marginRate: Number,
  marketHours: { open, close, timezone, isAlwaysOpen },
  priceHistory: [{
    timestamp, open, high, low, close, volume, timeframe
  }]
}
```

#### Key Methods:

- `updatePrice()` - Update current market prices
- `addPriceCandle()` - Add OHLCV data
- `getPriceHistory()` - Retrieve historical data
- `calculateRequiredMargin()` - Margin calculations
- `createDefaultSymbols()` - Static method to seed data

### 5. SystemSettings Model (`SystemSettings.js`)

**Purpose**: Global application configuration and feature management.

#### Key Features:

- **Application Settings**: Version, maintenance mode, environment
- **Trading Configuration**: Default limits, leverage, risk parameters
- **Security Settings**: JWT, rate limiting, CORS configuration
- **Feature Flags**: Enable/disable platform features
- **Performance Settings**: Caching, connection pools, compression

#### Schema Structure:

```javascript
{
  app: { name, version, environment, maintenanceMode },
  trading: { defaultBalance, maxLeverage, marginCallLevel, stopOutLevel },
  marketData: { updateInterval, enableRealTimeData, apiProvider },
  user: { maxRegistrationsPerDay, sessionTimeout, maxLoginAttempts },
  security: { jwtExpiresIn, rateLimitWindowMs, corsOrigins },
  notifications: { emailEnabled, smsEnabled, adminNotifications },
  features: { socialTrading, copyTrading, algorithmicTrading, newsIntegration }
}
```

#### Key Methods:

- `getSettings()` - Retrieve current settings (singleton)
- `updateSettings()` - Update configuration
- `enableMaintenanceMode()` - System maintenance
- `getTradingLimits()` - Get trading constraints

## Database Relationships

### Primary Relationships:

```
User (1) ←→ (1) Wallet
User (1) ←→ (n) Trade
MarketSymbol (1) ←→ (n) Trade
User (1) ←→ (n) Transaction (via Wallet)
```

### Model Hooks & Automation:

1. **User Creation** → Automatically creates Wallet
2. **Trade Closure** → Updates User analytics & Wallet balance
3. **Price Updates** → Triggers stop-loss/take-profit checks
4. **Daily Snapshots** → Wallet balance history for analytics

## Indexes & Performance

### Optimized Queries:

```javascript
// User indexes
{ email: 1, username: 1 }
{ role: 1, status: 1 }
{ 'security.lastLogin': -1 }

// Trade indexes
{ user: 1, status: 1 }
{ user: 1, symbol: 1 }
{ user: 1, createdAt: -1 }

// MarketSymbol indexes
{ symbol: 1, type: 1 }
{ type: 1, isActive: 1 }

// Wallet indexes
{ user: 1 }
{ 'transactions.createdAt': -1 }
```

## Data Validation

### Input Validation:

- **Email**: Valid email format
- **Passwords**: Minimum length, complexity requirements
- **Numbers**: Range validation, finite number checks
- **Trading**: Logical validation (stop-loss direction, margin requirements)

### Business Rules:

- **Balance**: Cannot go negative
- **Leverage**: Within platform limits
- **Trade Size**: Minimum/maximum constraints
- **Risk Management**: Position limits, drawdown controls

## Security Features

### Data Protection:

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure token generation
- **Rate Limiting**: Request throttling
- **Account Locking**: Failed login protection
- **Data Encryption**: Sensitive field encryption

### Audit Trail:

- **Transaction History**: Complete balance change records
- **User Activity**: Login tracking, modification logs
- **Trade Records**: Full execution details
- **System Changes**: Configuration update tracking

## Scalability Considerations

### Performance Optimizations:

- **Compound Indexes**: Multi-field query optimization
- **Virtual Fields**: Computed properties without storage
- **Pagination**: Large dataset handling
- **Aggregation Pipelines**: Complex analytics queries

### Data Management:

- **Document Size Limits**: Price history truncation
- **Archive Strategy**: Old data cleanup
- **Connection Pooling**: Database connection optimization
- **Caching**: Frequently accessed data

## Development Utilities

### Model Helpers:

```javascript
// Initialize default data
await initializeDefaultData();

// Setup model relationships
setupModelRelationships();

// Get database statistics
const stats = await getDatabaseStats();

// Validate all schemas
validateSchemas();
```

This comprehensive database design supports a full-featured virtual trading platform with robust user management, real-time trading simulation, and advanced analytics capabilities.
