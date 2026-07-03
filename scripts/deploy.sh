#!/bin/bash

# Room Management System - Deployment Script
set -e

echo "🚀 Starting deployment of Room Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your production values before continuing."
    echo "   Important: Change JWT_SECRET and POSTGRES_PASSWORD!"
    read -p "Press Enter to continue after editing .env file..."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database if needed
echo "🌱 Seeding database..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Services are available at:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:5432"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
