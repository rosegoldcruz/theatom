#!/bin/bash

# ATOM Trading System - Deployment Script
echo "🚀 Deploying ATOM Arbitrage Trading System..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Check if Next.js is in dependencies
if ! grep -q '"next"' package.json; then
    echo "❌ Error: Next.js not found in package.json dependencies."
    exit 1
fi

echo "✅ Next.js detected in package.json"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Type check
echo "🔍 Running type check..."
pnpm run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors before deploying."
    exit 1
fi

echo "✅ Type check passed"

# Build locally to test
echo "🏗️ Testing build locally..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📱 Your ATOM Trading System is now live!"
