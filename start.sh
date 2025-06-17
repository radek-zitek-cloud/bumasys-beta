#!/bin/bash

# Fulcrum Project Startup Script
# This script sets up and starts both backend and frontend development servers

set -e  # Exit on any error

echo "🚀 Starting Fulcrum development environment..."
# Stash any local changes to avoid conflicts (we do not develop here)
echo "🗄️  Stashing local changes (if any)..."
git stash push -u -m "Auto-stash by start.sh"

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Setup and start backend
echo "🔧 Setting up backend..."
cd be

# Source environment variables
if [ -f ".env.sh" ]; then
    echo "📋 Loading backend environment variables..."
    source .env.sh
else
    echo "⚠️  Warning: .env.sh not found in backend directory"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
pnpm install

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Start backend in background with logging
echo "🔄 Starting backend development server..."
nohup pnpm dev > ../logs/be.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Setup and start frontend
echo "🎨 Setting up frontend..."
cd ../fe

# Install dependencies
echo "📦 Installing frontend dependencies..."
pnpm install

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Start frontend in background with logging
echo "🔄 Starting frontend development server..."
nohup pnpm dev --host 0.0.0.0 > ../logs/fe.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"

# Return to root directory
cd ..

echo ""
echo "🎉 Development environment started successfully!"
echo "📊 Backend PID: $BACKEND_PID (logs: logs/be.log)"
echo "🌐 Frontend PID: $FRONTEND_PID (logs: logs/fe.log)"
echo ""
echo "📝 To monitor logs:"
echo "   Backend:  tail -f logs/be.log"
echo "   Frontend: tail -f logs/fe.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "✨ Happy coding!"

while true; do
    read -n1 -s -r -p "Press [k] to kill both servers and exit, [q] to quit without stopping servers: " key
    echo ""
    if [[ "$key" == "k" ]]; then
        echo "🛑 Stopping backend (PID: $BACKEND_PID) and frontend (PID: $FRONTEND_PID)..."
        kill $BACKEND_PID $FRONTEND_PID
        echo "✅ Both servers stopped. Exiting."
        exit 0
    elif [[ "$key" == "q" ]]; then
        echo "🚪 Exiting script without stopping servers."
        exit 0
    else
        echo "❓ Invalid key. Press [k] to kill servers, [q] to quit."
    fi
done