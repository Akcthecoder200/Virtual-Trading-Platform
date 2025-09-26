# 🚀 **SECURE RENDER DEPLOYMENT GUIDE**

## 🔐 **Security-First Deployment for Virtual Trading Platform**

This guide ensures all sensitive data is set manually in Render dashboard, never exposed in code.

---

## 📋 **Prerequisites (5 minutes)**

### **1. Render Account**

- Sign up at [render.com](https://render.com)
- Connect your GitHub account

### **2. MongoDB Atlas**

- Your existing cluster: `cluster0.kwawvsk.mongodb.net`
- Database user: `akchoudhary2411_db_user`
- Password: `TAvLWvuMxCvGacde`

### **3. Alpha Vantage API**

- Your API key: `VMFAF630EBQ1HFBK`

---

## 🚀 **Step 1: Deploy Backend (5 minutes)**

### **1.1 Create Backend Service**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Virtual-Trading-Platform`
4. Configure:
   - **Name**: `virtual-trading-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### **1.2 Set Environment Variables (CRITICAL)**

In your backend service settings, add these **exact** environment variables:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://akchoudhary2411_db_user:TAvLWvuMxCvGacde@cluster0.kwawvsk.mongodb.net/virtual-trading-platform?retryWrites=true&w=majority
JWT_SECRET=virtual-trading-platform-super-secret-jwt-key-2024-production-render
ALPHA_VANTAGE_API_KEY=VMFAF630EBQ1HFBK
ADMIN_EMAIL=admin@virtualtrading.com
ADMIN_PASSWORD=SecureRenderAdmin2024!
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_DEMO_BALANCE=10000
```

**⚠️ Security Notes:**

- Change `ADMIN_PASSWORD` to something secure
- Optionally change `JWT_SECRET` to a new 32+ character string
- Never commit these values to GitHub

### **1.3 Deploy Backend**

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Note your backend URL: `https://virtual-trading-backend-XXXX.onrender.com`

---

## 🌐 **Step 2: Deploy Frontend (3 minutes)**

### **2.1 Create Frontend Service**

1. Click **"New +"** → **"Static Site"**
2. Connect same repository: `Virtual-Trading-Platform`
3. Configure:
   - **Name**: `virtual-trading-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### **2.2 Set Frontend Environment Variable**

Add this environment variable (replace with your actual backend URL):

```bash
VITE_API_URL=https://virtual-trading-backend-XXXX.onrender.com/api
```

**Replace `XXXX`** with your actual backend service identifier from Step 1.3

### **2.3 Deploy Frontend**

1. Click **"Create Static Site"**
2. Wait 2-3 minutes for deployment
3. Get your live URL: `https://virtual-trading-frontend-YYYY.onrender.com`

---

## ✅ **Step 3: Test Your Deployment**

### **3.1 Test Backend API**

Visit: `https://virtual-trading-backend-XXXX.onrender.com/api/health`
Should return: `{"status": "OK", "message": "Server is running"}`

### **3.2 Test Full Application**

1. Visit your frontend URL
2. Try to register a new account
3. Login with the new account
4. Check if wallet balance loads
5. Test admin login with your admin credentials

---

## 🔧 **Step 4: Custom Domains (Optional)**

### **For Production Use:**

1. In each service settings → **"Custom Domains"**
2. Add your domains:
   - Frontend: `yourapp.com`
   - Backend: `api.yourapp.com`
3. Update `VITE_API_URL` to `https://api.yourapp.com/api`

---

## 🐛 **Troubleshooting**

### **Backend Issues:**

- Check **"Logs"** tab for errors
- Verify all environment variables are set
- Ensure MongoDB allows Render IPs (0.0.0.0/0)

### **Frontend Issues:**

- Check if `VITE_API_URL` points to correct backend URL
- Verify backend is running first
- Check browser network tab for API call failures

### **Database Issues:**

- Verify MongoDB Atlas connection string
- Check if database user has read/write permissions
- Ensure network access allows all IPs

---

## 💰 **Cost Breakdown**

### **Free Tier (Perfect for Testing):**

- Backend: Free (sleeps after 15min inactivity)
- Frontend: Free (always on)
- Database: MongoDB Atlas Free Tier

### **Production (If Needed Later):**

- Backend: $7/month (always on)
- Frontend: Free (always on)
- Custom domains: Free

---

## 🎉 **Final Result**

Your Virtual Trading Platform will be live at:

- **Frontend**: `https://virtual-trading-frontend-YYYY.onrender.com`
- **Backend API**: `https://virtual-trading-backend-XXXX.onrender.com/api`

**Features Working:**

- ✅ User registration & authentication
- ✅ Virtual wallet management
- ✅ Real-time market data
- ✅ Trading functionality
- ✅ Admin panel
- ✅ Secure API endpoints

---

## 🔐 **Security Checklist**

- [ ] All sensitive data set in Render dashboard (not in code)
- [ ] Strong admin password set
- [ ] MongoDB allows only necessary IPs
- [ ] JWT secret is secure and unique
- [ ] API rate limiting enabled
- [ ] HTTPS enforced (automatic with Render)

---

**Your app will be live and secure! No sensitive data exposed in your codebase.** 🎯
