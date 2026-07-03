#!/bin/bash

# Deployment script for the Room Management Dashboard

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_API_URL environment variable is not set"
    echo "Please set it to your backend API URL (e.g., https://your-api-domain.com)"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"

# Check if we're in a CI/CD environment
if [ "$CI" = "true" ]; then
    echo "🤖 Running in CI/CD environment"
    # Additional CI/CD specific steps can be added here
else
    echo "💻 Running locally"
    # Local deployment steps
    echo "🎉 Application is ready for deployment!"
    echo "📋 Next steps:"
    echo "   1. Upload the .next folder to your hosting platform"
    echo "   2. Set environment variables on your hosting platform"
    echo "   3. Start the application with: npm start"
fi

echo "🚀 Deployment process completed!"
