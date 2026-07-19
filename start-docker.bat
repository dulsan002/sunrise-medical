@echo off
setlocal

echo ======================================================
echo    Sunrise Medical Clinic - Docker Startup (Windows)
echo ======================================================
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [1/2] Checking environment variables...
if not exist .env (
    echo Copying .env.example to .env...
    copy .env.example .env >nul
)
echo OK.
echo.

echo [2/2] Starting Docker Containers...
docker compose up -d --build

echo.
echo ======================================================
echo Application is running in Docker!
echo Wait a few seconds for all services to initialize.
echo.
echo Frontend Web App:  http://localhost
echo Backend API Docs:  http://localhost:8080/swagger-ui.html
echo Default Login:     admin / Admin@123
echo ======================================================
echo.
echo To stop the application, run: docker compose down
pause
