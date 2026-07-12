@echo off
echo ========================================================
echo DeckFlow - Prerequisite Installer for Windows
echo ========================================================
echo This script will use 'winget' (Windows Package Manager) 
echo to automatically install Python and Node.js.
echo.

where winget >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Winget is not installed on this system.
    echo Please install Python and Node manually using the links in the README.
    pause
    exit /b
)

echo Installing Python 3...
winget install --id Python.Python.3.11 -e --accept-package-agreements --accept-source-agreements

echo.
echo Installing Node.js (LTS)...
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements

echo.
echo ========================================================
echo Installation Complete!
echo.
echo IMPORTANT: You MUST close this window and open a NEW 
echo Command Prompt or PowerShell before proceeding to Step 1.
echo This ensures your system recognizes 'python' and 'npm'.
echo ========================================================
pause
