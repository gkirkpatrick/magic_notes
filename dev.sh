#!/bin/bash

# Development setup and run script for Notes Application
# This script sets up both backend and frontend and runs them concurrently

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory (project root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Notes Application - Dev Setup       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Backend Setup
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Setting up Backend (Django)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install/update dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
python manage.py migrate --no-input
echo -e "${GREEN}✓ Migrations complete${NC}"

# Check if superuser exists, if not prompt to create one
echo ""
echo -e "${YELLOW}Checking for Django superuser...${NC}"
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); exit(0 if User.objects.filter(is_superuser=True).exists() else 1)" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}No superuser found.${NC}"
    echo -e "${YELLOW}Would you like to create a superuser now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python manage.py createsuperuser
    else
        echo -e "${YELLOW}Skipping superuser creation. You can create one later with: python manage.py createsuperuser${NC}"
    fi
else
    echo -e "${GREEN}✓ Superuser exists${NC}"
fi

echo ""

# Frontend Setup
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Setting up Frontend (React)${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

cd "$FRONTEND_DIR"

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies (this may take a minute)...${NC}"
    npm install
    echo -e "${GREEN}✓ npm dependencies installed${NC}"
else
    echo -e "${GREEN}✓ node_modules already exists${NC}"
    echo -e "${YELLOW}Checking for updates...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies up to date${NC}"
fi

# Check for .env files
if [ ! -f ".env.development" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Creating .env.development from .env.example...${NC}"
        cp .env.example .env.development
        echo -e "${GREEN}✓ .env.development created${NC}"
    else
        echo -e "${YELLOW}Note: No .env.example found, using default configuration${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.development exists${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Starting development servers...${NC}"
echo ""
echo -e "${YELLOW}Backend:${NC}  http://localhost:8000"
echo -e "${YELLOW}API:${NC}      http://localhost:8000/api"
echo -e "${YELLOW}Admin:${NC}    http://localhost:8000/admin"
echo -e "${YELLOW}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servers stopped${NC}"
    exit 0
}

trap cleanup INT TERM

# Start backend server
cd "$BACKEND_DIR"
source venv/bin/activate
python manage.py runserver 8000 &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Start frontend server
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
