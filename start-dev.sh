#!/bin/bash

# ==============================================================================
# Sunrise Medical - Development Startup Script
# ==============================================================================
# This script is designed for new developers (and interns!) to easily start 
# the entire application stack without needing to manually run separate commands.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Sunrise Medical Clinic - Dev Environment Startup   ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# 1. Check Prerequisites
echo -e "${YELLOW}[1/4] Checking prerequisites...${NC}"
command -v java >/dev/null 2>&1 || { echo -e "${RED}Error: Java is not installed.${NC} Please install Java 21."; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js is not installed.${NC} Please install Node 20+."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is not installed.${NC} Please install npm."; exit 1; }
echo -e "${GREEN}✓ All prerequisites found.${NC}\n"

# 2. Start Backend
echo -e "${YELLOW}[2/4] Initializing Backend (Spring Boot)...${NC}"
cd backend
echo "Fetching Java dependencies (this may take a moment on first run)..."
chmod +x mvnw
./mvnw clean install -DskipTests > /dev/null
echo "Starting Spring Boot on port 8080..."
# Run backend in background
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✓ Backend process started (PID: $BACKEND_PID). Logs are being written to backend/backend.log${NC}\n"

# 3. Start Frontend
echo -e "${YELLOW}[3/4] Initializing Frontend (React/Vite)...${NC}"
cd frontend
echo "Fetching Node dependencies..."
npm install > /dev/null 2>&1
echo "Starting Vite dev server..."
# Run frontend in background
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend process started (PID: $FRONTEND_PID). Logs are being written to frontend/frontend.log${NC}\n"

# 4. Ready Status
echo -e "${YELLOW}[4/4] Finalizing Startup...${NC}"
echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🚀 Application is now starting up!${NC}"
echo -e "Wait about 10-15 seconds for the backend to fully boot."
echo -e ""
echo -e "🌐 ${BLUE}Frontend Web App:${NC}  http://localhost:5173"
echo -e "⚙️  ${BLUE}Backend API Docs:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "👤 ${BLUE}Default Login:${NC}     admin / Admin@123"
echo -e "${GREEN}======================================================${NC}"
echo -e "\n${YELLOW}Press [CTRL+C] at any time to safely shut down both the Frontend and Backend servers.${NC}"

# Cleanup function to kill background processes when script is terminated
cleanup() {
    echo -e "\n${RED}Shutting down development servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Shutdown complete. Goodbye!${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Keep script running to keep trap active
wait $BACKEND_PID $FRONTEND_PID
