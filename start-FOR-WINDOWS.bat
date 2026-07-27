@echo off
cd /d "%~dp0Application Files"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo Download it from: https://nodejs.org
    echo Choose the LTS version, then run this script again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo ==========================================
echo   ScreenTimeScore Server
echo ==========================================
echo.
node server.js
echo.
pause
