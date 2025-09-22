# Virtual Trading Platform

A comprehensive virtual trading platform similar to Exness demo accounts, where users can practice trading with virtual money.

## Features

- 🔐 **Authentication**: JWT-based user authentication
- 💰 **Virtual Wallet**: $10,000 demo balance for each user
- 📊 **Market Data**: Real-time forex, stocks, and crypto prices
- 📈 **Charts**: TradingView-like charts with candlestick and line views
- 🔄 **Trading**: Buy/Sell with Market, Limit, Stop-Loss, Take-Profit orders
- 📜 **Trade History**: Complete trading history with P/L calculations
- 📊 **Analytics**: Portfolio performance metrics and dashboard
- 👨‍💼 **Admin Panel**: User management and monitoring

## Tech Stack

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Alpha Vantage API for market data

### Frontend

- React.js + Vite
- Tailwind CSS
- React Router
- TradingView Charting Library

## Project Structure

```
virtual-trading-platform/
├── backend/           # Node.js Express API
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Authentication & validation
│   ├── services/      # Market data & business logic
│   └── config/        # Database & environment config
├── frontend/          # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper functions
│   └── public/
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Alpha Vantage API key (free)

### Installation

1. Clone the repository
2. Set up backend:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Add your MongoDB URI and Alpha Vantage API key
   npm start
   ```

3. Set up frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Trading

- `GET /api/market/prices` - Get current market prices
- `POST /api/trades/buy` - Execute buy order
- `POST /api/trades/sell` - Execute sell order
- `GET /api/trades/history` - Get trade history

### Wallet

- `GET /api/wallet/balance` - Get current balance
- `POST /api/wallet/reset` - Reset demo balance (admin)

### Admin

- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/reset-balance/:id` - Reset user balance

## Development Status

🚧 **Currently in development** - Building step by step

## License

MIT License
