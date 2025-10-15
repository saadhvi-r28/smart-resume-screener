#!/bin/bash

# Smart Resume Screener - Easy Start Script
# This script starts everything you need in one command

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Smart Resume Screener - Startup${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check MongoDB
echo -e "${BLUE}Checking MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB not running, starting...${NC}"
    brew services start mongodb-community@8.0
    sleep 3
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✓ MongoDB started${NC}"
    else
        echo -e "${RED}✗ Failed to start MongoDB${NC}"
        echo -e "${YELLOW}Try manually: brew services start mongodb-community@8.0${NC}"
        exit 1
    fi
fi

# Check .env file
echo -e "\n${BLUE}Checking configuration...${NC}"
cd "$(dirname "$0")/backend"

if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ IMPORTANT: Please add your MISTRAL_API_KEY to backend/.env${NC}"
    echo -e "${YELLOW}Get your key from: https://console.mistral.ai/${NC}"
    exit 1
fi

# Check if API key is set
if grep -q "your_mistral_api_key_here" .env; then
    echo -e "${RED}✗ Mistral API key not configured!${NC}"
    echo -e "${YELLOW}Please update MISTRAL_API_KEY in backend/.env${NC}"
    echo -e "${YELLOW}Get your key from: https://console.mistral.ai/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuration looks good${NC}"

# Start backend server
echo -e "\n${BLUE}Starting backend server...${NC}"
echo -e "${YELLOW}Server will run on http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

npm start
