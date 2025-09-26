# 🔐 **ENVIRONMENT VARIABLES FOR RENDER DEPLOYMENT**

## **Backend Environment Variables**

Set these in your Render backend service dashboard:

```bash
NODE_ENV=production
PORT=10000

# Database - Use your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/virtual-trading-platform?retryWrites=true&w=majority

# JWT Secret - Generate a secure 32+ character string
JWT_SECRET=your-super-secure-jwt-secret-key-32-characters-minimum

# Alpha Vantage API - Your actual API key
ALPHA_VANTAGE_API_KEY=YOUR_ALPHA_VANTAGE_API_KEY

# Admin Credentials - Set secure values
ADMIN_EMAIL=admin@virtualtrading.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD

# Rate Limiting (can keep these values)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_DEMO_BALANCE=10000
```

## **Frontend Environment Variables**

Set this in your Render frontend service dashboard:

```bash
# API URL - Replace XXXX with your actual backend service URL
VITE_API_URL=https://virtual-trading-backend-XXXX.onrender.com/api
```

## **⚠️ SECURITY REMINDERS:**

1. **Never commit actual values to GitHub**
2. **Set all values manually in Render dashboard**
3. **Use strong passwords and secrets**
4. **Keep API keys private**
5. **Monitor usage and access logs**

## **🔍 How to Find Your Values:**

- **MongoDB URI**: From your MongoDB Atlas dashboard
- **Backend URL**: From your Render backend service URL
- **API Keys**: From your Alpha Vantage account
- **JWT Secret**: Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
