#!/bin/bash

# InsightDash Quick Deployment Script
# This script sets up InsightDash for local or demo deployment

echo "🚀 InsightDash Quick Deployment Setup"
echo "====================================="

# Check if we're in the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/InsightDash/frontend"
BACKEND_DIR="$SCRIPT_DIR/InsightDash/backend"

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ Error: Frontend directory not found at $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Install global serve if not already installed
echo "📦 Installing static server..."
npm install -g serve 2>/dev/null || echo "serve already installed"

# Build the project if build directory doesn't exist or is outdated
if [ ! -d "build" ] || [ "src" -nt "build" ]; then
    echo "🏗️  Building production version..."
    npm run build
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 To deploy InsightDash:"
echo ""
echo "1. Start the backend server:"
echo "   cd $BACKEND_DIR && python3 mock_server.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   serve -s $FRONTEND_DIR/build -p 3000"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "4. The app will connect to backend at:"
echo "   http://localhost:8000"
echo ""
echo "🎉 InsightDash will be running locally!"
