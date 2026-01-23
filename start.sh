#!/bin/bash

# Start script for Click application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================="
echo "Starting Click Application"
echo -e "==================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    echo "Run: cp .env.example .env"
    exit 1
fi

# Source .env
export $(cat .env | grep -v '^#' | xargs)

# Check if running in virtual environment
if [ -z "$VIRTUAL_ENV" ] && [ ! -f /.dockerenv ]; then
    echo -e "${YELLOW}⚠️  Not running in virtual environment${NC}"
    
    # Check if venv exists
    if [ -d "venv" ]; then
        echo "Activating virtual environment..."
        source venv/bin/activate
    else
        echo -e "${RED}❌ Virtual environment not found!${NC}"
        echo "Create it with: python -m venv venv"
        exit 1
    fi
fi

# Run health check
echo "Running health check..."
python healthcheck.py

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Health check failed!${NC}"
    echo "Please fix the issues before starting the application"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Health check passed!${NC}"
echo ""

# Start the application
echo "Starting server on ${HOST}:${PORT}..."
echo ""
echo -e "${GREEN}🚀 Application will be available at:${NC}"
echo -e "   ${GREEN}http://localhost:${PORT}${NC}"
echo -e "   ${GREEN}Demo: http://localhost:${PORT}/static/index.html${NC}"
if [ "$DEBUG" = "True" ]; then
    echo -e "   ${GREEN}API Docs: http://localhost:${PORT}/docs${NC}"
fi
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start with uvicorn
uvicorn app.main:app --host ${HOST:-0.0.0.0} --port ${PORT:-8000} --reload
