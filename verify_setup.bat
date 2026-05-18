@echo off
REM SwiSys Setup Verification Script for Windows

echo.
echo ========================================
echo  SwiSys Setup Verification
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not installed
    echo Please install Python 3.12+ from https://www.python.org/downloads/
    exit /b 1
)

REM Run the verification script
python verify_setup.py

REM Keep window open on error
if %errorlevel% neq 0 (
    echo.
    echo Press any key to exit...
    pause >nul
)
