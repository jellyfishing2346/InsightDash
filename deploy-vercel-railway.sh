#!/bin/bash

# InsightDash - Vercel + Railway Deployment Script

echo "🚀 InsightDash High-Performance Deployment"
echo "=========================================="

echo ""
echo "🎯 Deploying Frontend to Vercel..."
echo ""

# Check if in correct directory
if [ ! -f "InsightDash/frontend/package.json" ]; then
    echo "❌ Please run this script from the project root"
    exit 1
fi

cd InsightDash/frontend

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🏗️ Building and deploying frontend..."
vercel --prod

echo ""
echo "🚂 Next: Deploy Backend to Railway"
echo ""
echo "1. Install Railway CLI:"
echo "   npm install -g @railway/cli"
echo ""
echo "2. Login to Railway:"
echo "   railway login"
echo ""
echo "3. Deploy backend:"
echo "   cd ../backend"
echo "   railway init"
echo "   railway up"
echo ""
echo "4. Update frontend environment:"
echo "   Add REACT_APP_API_URL=https://your-railway-url.up.railway.app"
echo "   Redeploy with: vercel --prod"
echo ""
echo "✨ Your high-performance stack will be ready!"
