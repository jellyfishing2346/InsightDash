#!/bin/bash

# InsightDash One-Command Deployment
# This script starts both frontend and backend servers

echo "🚀 Starting InsightDash..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/InsightDash/frontend"
BACKEND_DIR="$SCRIPT_DIR/InsightDash/backend"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down InsightDash..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend server..."
cd "$BACKEND_DIR"
python3 mock_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! curl -s http://localhost:8000/api/v1/datasets >/dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend running on http://localhost:8000"

# Start frontend
echo "🌐 Starting frontend server..."
cd "$FRONTEND_DIR"
serve -s build -p 3000 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "🎉 InsightDash is now running!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait
