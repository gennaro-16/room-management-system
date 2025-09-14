#!/bin/bash

# alBaraka Room Booking System - Start Script
echo "🚀 Starting alBaraka Room Booking System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Check if we're in the right directory
if [ ! -d "room-management-internship" ] || [ ! -d "room-booking-dashboard" ]; then
    echo -e "${RED}❌ Please run this script from the internship-banque directory${NC}"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo -e "${BLUE}📁 Project structure found${NC}"

# Start Backend API
echo -e "${YELLOW}🔧 Starting Backend API...${NC}"
cd room-management-internship

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Check if port 3000 is available
if check_port 3000; then
    echo -e "${GREEN}✅ Starting backend on port 3000${NC}"
    npm run start:dev &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
else
    echo -e "${RED}❌ Port 3000 is busy. Please stop the service using port 3000 first.${NC}"
    exit 1
fi

# Wait a moment for backend to start
sleep 3

# Start Frontend Dashboard
echo -e "${YELLOW}🎨 Starting Frontend Dashboard...${NC}"
cd ../room-booking-dashboard

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Check if port 3001 is available (3000 is taken by backend)
if check_port 3001; then
    echo -e "${GREEN}✅ Starting frontend on port 3001${NC}"
    PORT=3001 npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
elif check_port 3002; then
    echo -e "${GREEN}✅ Starting frontend on port 3002${NC}"
    PORT=3002 npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
else
    echo -e "${RED}❌ No available ports (3001, 3002). Please free up a port.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 alBaraka Room Booking System is starting up!${NC}"
echo ""
echo -e "${BLUE}📊 Backend API:${NC} http://localhost:3000"
echo -e "${BLUE}🎨 Frontend Dashboard:${NC} http://localhost:3001 (or 3002)"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • Backend API provides the data"
echo "   • Frontend Dashboard displays the calendar and booking interface"
echo "   • Both services need to run simultaneously"
echo ""
echo -e "${YELLOW}🛑 To stop both services:${NC} Press Ctrl+C"
echo ""

# Wait for user to stop
wait
