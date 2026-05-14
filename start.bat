@echo off
setlocal EnableDelayedExpansion
title News System - All Services

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ========================================
echo   News Scraping and Display System
echo ========================================
echo.

python --version >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
echo [OK] Python found

node --version >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

echo [1/6] Installing backend dependencies...
pip install -r "%ROOT%\backend\requirements.txt" -q 2>nul
echo [OK] Done

echo [2/6] Installing scraper dependencies...
pip install -r "%ROOT%\scraper\requirements.txt" -q 2>nul
echo [OK] Done

echo [3/6] Checking frontend dependencies...
if not exist "%ROOT%\frontend\node_modules" (
    echo      Installing frontend packages, please wait...
    cd /d "%ROOT%\frontend"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend install failed
        pause
        exit /b 1
    )
)
echo [OK] Done

if not exist "%ROOT%\data" mkdir "%ROOT%\data"

echo [4/6] Starting backend server...
cd /d "%ROOT%\backend"
start /b "" cmd /c "python main.py >> "%ROOT%\data\backend.log" 2>&1"

set RETRY=0
:WAIT_BACKEND
timeout /t 1 /nobreak >nul 2>nul
set /a RETRY+=1
curl -s http://localhost:8000/api/stats >nul 2>nul
if errorlevel 1 (
    if !RETRY! GEQ 20 (
        echo [WARN] Backend slow to start, continuing...
        goto BACKEND_DONE
    )
    goto WAIT_BACKEND
)
:BACKEND_DONE
echo [OK] Backend running on port 8000

echo      Filling demo data...
curl -s -X POST http://localhost:8000/api/seed >nul 2>nul

echo [5/6] Starting scraper in background...
cd /d "%ROOT%\scraper"
start /b "" cmd /c "python scraper.py >> "%ROOT%\data\scraper.log" 2>&1"
echo [OK] Scraper running

echo [6/6] Starting frontend...
cd /d "%ROOT%\frontend"
start /b "" cmd /c "npm run dev >> "%ROOT%\data\frontend.log" 2>&1"

set RETRY=0
:WAIT_FRONTEND
timeout /t 1 /nobreak >nul 2>nul
set /a RETRY+=1
curl -s http://localhost:3000 >nul 2>nul
if errorlevel 1 (
    if !RETRY! GEQ 20 (
        echo [WARN] Frontend slow to start
        goto FRONTEND_DONE
    )
    goto WAIT_FRONTEND
)
:FRONTEND_DONE
echo [OK] Frontend running on port 3000

echo.
echo Opening browser...
start "" http://localhost:3000

echo.
echo ========================================
echo   All services running in this window!
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API docs: http://localhost:8000/docs
echo.
echo   Logs: data\backend.log
echo         data\scraper.log
echo         data\frontend.log
echo.
echo   Press any key to STOP all services...
echo ========================================
pause >nul

echo.
echo Stopping all services...
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
echo All services stopped.
echo.
pause