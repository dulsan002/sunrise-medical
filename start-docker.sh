#!/bin/bash

# ==============================================================================
# Sunrise Medical - Docker Startup Script
# ==============================================================================
# This script starts the entire application stack using Docker Compose.
# It is the easiest way to run the application without installing dependencies.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Sunrise Medical Clinic - Docker Startup            ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# Check for Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not installed.${NC} Please install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

echo -e "${YELLOW}[1/2] Checking environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "Copying .env.example to .env..."
    cp .env.example .env
fi
echo -e "${GREEN}✓ Environment ready.${NC}\n"

echo -e "${YELLOW}[2/2] Starting Docker Containers...${NC}"
docker compose up -d --build

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🚀 Application is running in Docker!${NC}"
echo -e "Wait a few seconds for all services to initialize."
echo -e ""
echo -e "🌐 ${BLUE}Frontend Web App:${NC}  http://localhost"
echo -e "⚙️  ${BLUE}Backend API Docs:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "👤 ${BLUE}Default Login:${NC}     admin / Admin@123"
echo -e "${GREEN}======================================================${NC}"
echo -e "\n${YELLOW}To stop the application, run: docker compose down${NC}"
