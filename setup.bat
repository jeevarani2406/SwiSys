@echo off
REM SwiSys Setup Script for Windows

echo 🚀 Setting up SwiSys Development Environment...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is required but not installed. Please install Python 3.13+ first.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Python and Node.js found

REM Create virtual environment
echo 📦 Creating Python virtual environment...
python -m venv .venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call .venv\Scripts\activate.bat

REM Install backend dependencies
echo 📚 Installing backend dependencies...
cd backend
pip install -r requirements.txt

REM Setup environment file
if not exist .env (
    echo ⚙️ Creating environment file...
    copy .env.example .env
    echo ✅ Environment file created. You may need to edit .env for email configuration.
)

REM Run database migrations
echo 🗄️ Setting up database...
python manage.py makemigrations
python manage.py migrate

REM Ask if user wants to create superuser
echo 👑 Do you want to create an admin superuser? (y/N)
set /p create_superuser=
if /i "%create_superuser%"=="y" (
    python manage.py createsuperuser
)

REM Install frontend dependencies
echo 🎨 Installing frontend dependencies...
cd ..\frontend
npm install

echo.
echo 🎉 Setup complete!
echo.
echo To start the development servers:
echo.
echo Backend (Django):
echo   cd backend
echo   .venv\Scripts\activate
echo   python manage.py runserver
echo.
echo Frontend (Next.js):
echo   cd frontend
echo   npm run dev
echo.
echo Then visit:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:8000/api/
echo   Admin Panel: http://localhost:8000/admin/
echo.
echo 📚 See README.md for detailed documentation.
pause
