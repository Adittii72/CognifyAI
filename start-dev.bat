@echo off
echo Starting AI Learning Assistant...
echo.

echo Checking if virtual environment exists...
if not exist "backend\venv" (
    echo Creating virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

echo.
echo Starting Backend Server...
start cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause > nul
