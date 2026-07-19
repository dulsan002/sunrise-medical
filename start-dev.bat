@echo off
setlocal

echo ======================================================
echo    Sunrise Medical Clinic - Dev Environment Startup
echo ======================================================
echo.

echo [1/4] Checking prerequisites...
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed. Please install Java 21.
    pause
    exit /b 1
)
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node 20+.
    pause
    exit /b 1
)
echo All prerequisites found.
echo.

echo [2/4] Initializing Backend (Spring Boot)...
cd backend
echo Fetching Java dependencies and starting Spring Boot on port 8080...
start "Backend (Spring Boot)" cmd /k "mvnw.cmd clean install -DskipTests && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev"
cd ..
echo Backend process started in a new window.
echo.

echo [3/4] Initializing Frontend (React/Vite)...
cd frontend
echo Fetching Node dependencies and starting Vite...
start "Frontend (React)" cmd /k "npm install && npm run dev"
cd ..
echo Frontend process started in a new window.
echo.

echo [4/4] Finalizing Startup...
echo ======================================================
echo Application is now starting up!
echo Wait about 10-15 seconds for the backend to fully boot.
echo.
echo Frontend Web App:  http://localhost:5173
echo Backend API Docs:  http://localhost:8080/swagger-ui.html
echo Default Login:     admin / Admin@123
echo ======================================================
echo Close the newly opened command windows to stop the servers.
pause
