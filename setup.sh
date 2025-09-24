#!/bin/bash

# Environment Setup Script for Virtual Trading Platform

echo "🚀 Setting up Virtual Trading Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ All dependencies installed!"

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your actual values:"
    echo "   - MONGODB_URI (your MongoDB connection string)"
    echo "   - JWT_SECRET (a secure random string)"
    echo "   - ALPHA_VANTAGE_API_KEY (your API key)"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🔧 To start development:"
echo "   npm run dev"
echo ""
echo "🏗️  To build for production:"
echo "   npm run build"
echo ""
echo "📚 Check VERCEL_DEPLOYMENT_GUIDE.md for deployment instructions"