#!/bin/bash

# Smart Resume Screener - Complete Setup Script
# This script will set up everything needed to run the project

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Smart Resume Screener - Complete Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if MongoDB is installed
print_info "Checking MongoDB installation..."
if command -v mongod &> /dev/null; then
    print_success "MongoDB is installed"
    MONGODB_VERSION=$(mongod --version | head -n 1)
    echo "  Version: $MONGODB_VERSION"
else
    print_warning "MongoDB is not installed"
    print_info "Installing MongoDB via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed. Please install it from https://brew.sh/"
        exit 1
    fi
    
    # Install MongoDB
    brew tap mongodb/brew
    brew install mongodb-community@8.0
    print_success "MongoDB installed successfully"
fi

# Start MongoDB
print_info "Starting MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    print_success "MongoDB is already running"
else
    brew services start mongodb-community@8.0
    sleep 3  # Wait for MongoDB to start
    
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        print_info "Try running manually: brew services start mongodb-community@8.0"
        exit 1
    fi
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if .env file exists
print_info "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from .env.example..."
    cp .env.example .env
    print_success "Created .env file"
    print_warning "IMPORTANT: Please update the following in backend/.env:"
    echo "  - MISTRAL_API_KEY (get from https://console.mistral.ai/)"
    echo "  - JWT_SECRET (generate a random string)"
    echo ""
    read -p "Press Enter after updating .env file..."
else
    print_success ".env file exists"
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Check if axios is installed (needed for Mistral API)
if ! npm list axios &> /dev/null; then
    print_info "Installing axios for Mistral API..."
    npm install axios
fi

# Run database seed (optional)
print_info "Would you like to seed the database with sample data? (y/n)"
read -p "> " seed_db
if [ "$seed_db" = "y" ] || [ "$seed_db" = "Y" ]; then
    print_info "Seeding database..."
    node seedData.js || print_warning "Seeding failed or file not found"
fi

print_success "Setup completed successfully!"
echo ""
print_info "Next steps:"
echo "  1. Make sure your MISTRAL_API_KEY is set in backend/.env"
echo "  2. Start the backend: cd backend && npm start"
echo "  3. Run tests: cd backend && node test-api.js"
echo ""
print_info "To start MongoDB manually: brew services start mongodb-community@8.0"
print_info "To stop MongoDB: brew services stop mongodb-community@8.0"
echo ""
