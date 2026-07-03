#!/bin/bash

# Room Management System - Development Script
set -e

echo "🚀 Starting development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start development services
echo "🔨 Starting development services..."
docker-compose down
docker-compose build
docker-compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database setup
echo "🗄️  Setting up database..."
cd room-management-backend-nest
npm install
npx prisma migrate dev
npx prisma db seed
cd ..

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services are available at:"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📝 To start backend development server:"
echo "   cd room-management-backend-nest && npm run start:dev"
echo ""
echo "📝 To start frontend development server:"
echo "   cd room-management-frontend-next && npm run dev"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
