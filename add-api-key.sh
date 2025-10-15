#!/bin/bash

# Interactive API Key Setup Script

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                      ║${NC}"
echo -e "${BLUE}║       Mistral API Key Setup Assistant               ║${NC}"
echo -e "${BLUE}║                                                      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}\n"

cd "$(dirname "$0")/backend"

# Check current status
echo -e "${YELLOW}Checking current configuration...${NC}\n"

if [ -f ".env" ]; then
    if grep -q "your_mistral_api_key_here" .env; then
        echo -e "${RED}✗ API key not configured${NC}"
        NEEDS_KEY=true
    else
        echo -e "${GREEN}✓ API key appears to be set${NC}"
        echo -e "\n${YELLOW}Do you want to update it? (y/n)${NC}"
        read -p "> " update_key
        if [ "$update_key" != "y" ] && [ "$update_key" != "Y" ]; then
            echo -e "\n${GREEN}Using existing API key${NC}"
            exit 0
        fi
        NEEDS_KEY=true
    fi
else
    echo -e "${RED}✗ .env file not found!${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    cp .env.example .env
    NEEDS_KEY=true
fi

if [ "$NEEDS_KEY" = true ]; then
    echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}To get your Mistral API key:${NC}"
    echo -e "  1. Go to: ${GREEN}https://console.mistral.ai/${NC}"
    echo -e "  2. Sign up or log in"
    echo -e "  3. Navigate to 'API Keys'"
    echo -e "  4. Create a new key"
    echo -e "  5. Copy the key"
    echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}Would you like me to open the Mistral console in your browser? (y/n)${NC}"
    read -p "> " open_browser
    
    if [ "$open_browser" = "y" ] || [ "$open_browser" = "Y" ]; then
        open "https://console.mistral.ai/" 2>/dev/null || echo "Please visit: https://console.mistral.ai/"
        echo -e "${GREEN}✓ Opening browser...${NC}\n"
        sleep 2
    fi
    
    echo -e "${YELLOW}Enter your Mistral API key:${NC}"
    read -p "> " api_key
    
    if [ -z "$api_key" ]; then
        echo -e "${RED}✗ No key entered. Exiting.${NC}"
        exit 1
    fi
    
    # Update the .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/MISTRAL_API_KEY=.*/MISTRAL_API_KEY=$api_key/" .env
    else
        # Linux
        sed -i "s/MISTRAL_API_KEY=.*/MISTRAL_API_KEY=$api_key/" .env
    fi
    
    echo -e "\n${GREEN}✓ API key configured successfully!${NC}"
    
    # Verify
    if grep -q "$api_key" .env; then
        echo -e "${GREEN}✓ Verification passed${NC}"
    else
        echo -e "${RED}✗ Verification failed - please check .env manually${NC}"
        exit 1
    fi
fi

echo -e "\n${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Start the server: ${GREEN}./start-server.sh${NC}"
echo -e "  2. Test the API: ${GREEN}cd backend && node test-api.js${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}\n"
