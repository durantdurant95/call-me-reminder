#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Call Me Reminder (Local Development)${NC}"

# Check if PostgreSQL container is running
if ! docker ps | grep -q call-me-reminder-db; then
    echo -e "${YELLOW}📦 Starting PostgreSQL container...${NC}"
    docker-compose up -d postgres
    sleep 3
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Start backend in background
echo -e "${YELLOW}🔧 Starting Backend (FastAPI)...${NC}"
cd backend
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/call_me_reminder"
export VAPI_API_KEY="${VAPI_API_KEY:-}"
export VAPI_PHONE_NUMBER_ID="${VAPI_PHONE_NUMBER_ID:-}"
export ENVIRONMENT="development"
export DEBUG="True"
export CORS_ORIGINS='["http://localhost:3000"]'

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
alembic upgrade head

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend started on http://localhost:8000${NC}"

# Start frontend
echo -e "${YELLOW}⚛️  Starting Frontend (Next.js)...${NC}"
cd frontend
export NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"
pnpm dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Application is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "Backend:  ${YELLOW}http://localhost:8000${NC}"
echo -e "API Docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

# Trap Ctrl+C and cleanup
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for processes
wait
