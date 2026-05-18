# SwiSys Development Startup Script for Windows PowerShell
# This script starts both backend and frontend servers in separate windows

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All,
    [switch]$Help
)

function Show-Help {
    Write-Host @"
╔═════════════════════════════════════════════════════════╗
║        SwiSys Development Startup Helper               ║
╚═════════════════════════════════════════════════════════╝

Usage: .\startup.ps1 [OPTIONS]

OPTIONS:
  -Backend    Start only backend server
  -Frontend   Start only frontend server
  -All        Start both backend and frontend (default)
  -Help       Show this help message

EXAMPLES:
  .\startup.ps1                # Start both servers
  .\startup.ps1 -Backend       # Start only backend
  .\startup.ps1 -Frontend      # Start only frontend
  .\startup.ps1 -Help          # Show this message

REQUIREMENTS:
  • Python 3.12+ with virtual environment activated
  • Node.js 18+ installed
  • Backend dependencies installed (pip install -r requirements.txt)
  • Frontend dependencies installed (npm install)

"@
}

function Start-Backend {
    Write-Host "`n[Backend] Starting Django development server..." -ForegroundColor Cyan
    
    $backendPath = Join-Path $PSScriptRoot "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Host "[Backend] Error: backend directory not found" -ForegroundColor Red
        return $false
    }
    
    $env_path = Join-Path $backendPath ".env"
    if (-not (Test-Path $env_path)) {
        Write-Host "[Backend] Warning: .env file not found" -ForegroundColor Yellow
        Write-Host "[Backend] Copy from .env.example and configure" -ForegroundColor Yellow
    }
    
    Start-Process powershell -ArgumentList @"
        Set-Location '$backendPath'
        
        # Activate virtual environment if exists
        `$venv_path = Join-Path (Split-Path -Parent '$PSScriptRoot') '.venv\Scripts\Activate.ps1'
        if (Test-Path `$venv_path) {
            & `$venv_path
        }
        
        Write-Host "`n===== SwiSys Backend Server =====" -ForegroundColor Cyan
        Write-Host "Starting at http://localhost:8000" -ForegroundColor Green
        Write-Host "Admin panel at http://localhost:8000/admin" -ForegroundColor Green
        Write-Host "API docs at http://localhost:8000/api/schema/swagger/" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host "================================`n" -ForegroundColor Cyan
        
        python manage.py runserver
"@
    
    Write-Host "[Backend] Server started in new window" -ForegroundColor Green
    return $true
}

function Start-Frontend {
    Write-Host "`n[Frontend] Starting Next.js development server..." -ForegroundColor Cyan
    
    $frontendPath = Join-Path $PSScriptRoot "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Host "[Frontend] Error: frontend directory not found" -ForegroundColor Red
        return $false
    }
    
    $env_path = Join-Path $frontendPath ".env.local"
    if (-not (Test-Path $env_path)) {
        Write-Host "[Frontend] Warning: .env.local file not found" -ForegroundColor Yellow
        Write-Host "[Frontend] Run: cd frontend && npm install" -ForegroundColor Yellow
    }
    
    Start-Process powershell -ArgumentList @"
        Set-Location '$frontendPath'
        
        Write-Host "`n===== SwiSys Frontend Server =====" -ForegroundColor Cyan
        Write-Host "Starting at http://localhost:3000" -ForegroundColor Green
        Write-Host "API Backend at http://localhost:8000" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host "==================================`n" -ForegroundColor Cyan
        
        npm run dev
"@
    
    Write-Host "[Frontend] Server started in new window" -ForegroundColor Green
    return $true
}

# Main script execution

if ($Help) {
    Show-Help
    exit
}

# Default to starting both if no option specified
if (-not $Backend -and -not $Frontend) {
    $All = $true
}

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔═════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        SwiSys Development Environment Startup          ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verify prerequisites
Write-Host "[Info] Verifying prerequisites..." -ForegroundColor Cyan

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Python not found. Please install Python 3.12+" -ForegroundColor Red
    exit 1
}

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Python installed" -ForegroundColor Green
Write-Host "[OK] Node.js installed" -ForegroundColor Green

# Start servers
$started_services = @()

if ($All -or $Backend) {
    if (Start-Backend) {
        $started_services += "Backend"
    }
}

if ($All -or $Frontend) {
    Start-Sleep -Seconds 2
    if (Start-Frontend) {
        $started_services += "Frontend"
    }
}

# Print summary
Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             Servers Started Successfully                ║" -ForegroundColor Green
Write-Host "╚═════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Started Services:" -ForegroundColor Green
$started_services | ForEach-Object { Write-Host "  • $_" -ForegroundColor Green }
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  • Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "  • Admin Panel: http://localhost:8000/admin" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "  2. Login with your superuser credentials" -ForegroundColor White
Write-Host "  3. Start developing!" -ForegroundColor White
Write-Host ""
Write-Host "Note: Each server runs in a separate window. Close the window to stop the server." -ForegroundColor Yellow
Write-Host ""
