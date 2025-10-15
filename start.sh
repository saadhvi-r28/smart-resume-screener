#!/bin/bash

# Smart Resume Screener - Quick Start Script

echo "🚀 Smart Resume Screener - Quick Start Setup"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod &> /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    # Attempt to start MongoDB (adjust path as needed)
    if command -v brew &> /dev/null; then
        brew services start mongodb-community || brew services start mongodb
    else
        sudo systemctl start mongod || mongod &
    fi
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🔧 Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit backend/.env file with your configuration:"
    echo "   - Add your OpenAI API key"
    echo "   - Verify MongoDB URI"
    echo ""
    read -p "Press Enter to continue after configuring .env file..."
fi

echo "🌱 Seeding sample data..."
node seedData.js

echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

cd ../frontend
echo "🌐 Starting frontend server..."
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080 &
elif command -v python &> /dev/null; then
    python -m http.server 8080 &
else
    echo "❌ Python is not installed. Please serve frontend manually."
    echo "   You can use: npx serve . -p 8080"
    exit 1
fi

FRONTEND_PID=$!

echo ""
echo "✅ Setup complete! Smart Resume Screener is now running:"
echo "   🖥️  Frontend Dashboard: http://localhost:8080"
echo "   🔧 Backend API: http://localhost:3000"
echo "   📊 Health Check: http://localhost:3000/health"
echo ""
echo "📖 Next steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Upload sample resumes (PDF/TXT format)"
echo "   3. Create job descriptions"
echo "   4. Run matching to see AI analysis"
echo ""
echo "🛑 To stop servers: Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"

# Keep script running
wait