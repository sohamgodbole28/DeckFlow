@echo off
echo ==========================================
echo       Stopping DeckFlow Services...
echo ==========================================

echo [1/4] Stopping Backend Server (Port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a /T 2>NUL
)
wmic process where "name='python.exe' and commandline like '%%uvicorn%%'" call terminate >nul 2>&1

echo [2/4] Stopping Frontend Server (Port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a /T 2>NUL
)

echo [3/4] Stopping Desktop Agent...
wmic process where "name='python.exe' and commandline like '%%agent.py%%'" call terminate >nul 2>&1

echo [4/4] Stopping DeckFlow Launcher...
wmic process where "name='python.exe' and commandline like '%%launcher.py%%'" call terminate >nul 2>&1
wmic process where "name='pythonw.exe' and commandline like '%%launcher.py%%'" call terminate >nul 2>&1

echo ==========================================
echo        All Services Stopped!
echo ==========================================
pause
