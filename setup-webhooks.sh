#!/bin/bash

# Webhook Development Setup Script
# This script helps set up the webhook development environment

set -e

echo "🎧 Call Me Reminder - Webhook Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "Checking prerequisites..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok is not installed${NC}"
    echo "Install with: brew install ngrok"
    echo "Or download from: https://ngrok.com"
    exit 1
fi
echo -e "${GREEN}✓ ngrok is installed${NC}"

# Check if Vapi CLI is installed
if ! command -v vapi &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vapi CLI is not installed${NC}"
    echo "Install with: curl -sSL https://vapi.ai/install.sh | bash"
    echo "Then restart your terminal or run: source ~/.zshrc"
    exit 1
fi
echo -e "${GREEN}✓ Vapi CLI is installed${NC}"

echo ""
echo "Starting services..."
echo ""

# Check if Docker services are already running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Docker services already running${NC}"
else
    echo "Starting Docker services..."
    docker-compose up -d
    echo "Waiting for backend to be ready..."
    sleep 5
    echo -e "${GREEN}✓ Docker services started${NC}"
fi

# Check backend health
echo "Checking backend health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Check logs with: docker-compose logs backend"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo ""
echo "Next steps:"
echo ""
echo -e "${YELLOW}1. Start ngrok (Terminal 2):${NC}"
echo "   ngrok http 4242"
echo ""
echo -e "${YELLOW}2. Copy the ngrok URL (e.g., https://abc123.ngrok-free.app)${NC}"
echo ""
echo -e "${YELLOW}3. Start vapi listen (Terminal 3):${NC}"
echo "   vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi"
echo ""
echo -e "${YELLOW}4. Configure Vapi Dashboard:${NC}"
echo "   a. Go to https://dashboard.vapi.ai"
echo "   b. Find your phone number: 4f8c6faf-4c91-417e-a516-9e29d98068f3"
echo "   c. Set Server URL to your ngrok URL"
echo "   d. Save changes"
echo ""
echo -e "${YELLOW}5. Test with a reminder:${NC}"
echo "   cd backend"
echo "   python3 test_scheduler.py create +19362624172 2"
echo ""
echo "See WEBHOOK_DEV_SETUP.md for detailed instructions."
