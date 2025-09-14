#!/bin/bash

# Deployment script for Al Baraka Room Management API

set -e

echo "🚀 Starting API deployment process..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your PostgreSQL database URL"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

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
    echo "🎉 API is ready for deployment!"
    echo "📋 Next steps:"
    echo "   1. Upload the dist folder to your server"
    echo "   2. Set environment variables on your server"
    echo "   3. Start the application with: npm run start:prod"
fi

echo "🚀 API deployment process completed!"
