# 🚀 Vercel Deployment Guide for Virtual Trading Platform

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Push your code to GitHub
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **Alpha Vantage API Key**: Get free API key from [alphavantage.co](https://www.alphavantage.co/support/#api-key)

---

## 🔧 Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with password
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string - it should look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/virtual-trading-platform?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Get Alpha Vantage API Key

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Save the API key - you'll need it for Vercel environment variables

---

## 🔧 Step 3: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Virtual Trading Platform"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Name it `virtual-trading-platform`
   - Don't initialize with README (since you already have code)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/virtual-trading-platform.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Step 4: Deploy to Vercel

### 4.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Virtual Trading Platform" repository

### 4.2 Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: `./` (keep as root)
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### 4.3 Environment Variables
Add these environment variables in your Vercel project settings:

**For Backend (these will be available to your API routes):**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-trading-platform?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key-here
ADMIN_EMAIL=admin@virtualtrading.com
ADMIN_PASSWORD=your-secure-admin-password
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_DEMO_BALANCE=10000
```

**Important Security Notes:**
- Generate a strong JWT_SECRET (at least 32 characters)
- Use a secure ADMIN_PASSWORD (not the default one)
- Keep your MONGODB_URI and API keys secret

### 4.4 Deploy
1. Click "Deploy" 
2. Wait for build to complete (should take 2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

---

## 🔍 Step 5: Test Your Deployment

1. **Visit your live site**: `https://your-project-name.vercel.app`
2. **Test Registration**: Create a new account
3. **Test Login**: Login with your new account
4. **Test API**: Check if wallet balance loads
5. **Test Admin**: Login with admin credentials

---

## 🐛 Troubleshooting

### Build Errors
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set correctly

### API Errors
- Check Function logs in Vercel dashboard
- Verify MongoDB connection string is correct
- Ensure MongoDB Atlas allows connections from 0.0.0.0/0

### CORS Issues
- The CORS is already configured for production
- If issues persist, check browser console for error details

---

## 📝 Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## 🔐 Production Security Checklist

- [ ] Changed default admin password
- [ ] Used strong JWT secret (32+ characters)
- [ ] MongoDB user has minimum required permissions
- [ ] Environment variables are set in Vercel (not in code)
- [ ] API rate limiting is enabled
- [ ] HTTPS is enforced (automatic with Vercel)

---

## 📊 Monitoring

- **Vercel Analytics**: Monitor page views and performance
- **Function Logs**: Check API endpoint performance
- **MongoDB Atlas Monitoring**: Monitor database performance

---

## 🚀 You're Ready!

Your Virtual Trading Platform is now live! Share the URL with users and start virtual trading!

**Live URL**: `https://your-project-name.vercel.app`

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel build/function logs
2. Verify all environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection

Good luck with your deployment! 🎉