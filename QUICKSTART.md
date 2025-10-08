# 🚀 SwiSys Quick Start Guide

This guide will get you up and running with SwiSys in under 10 minutes!

## ⚡ Option 1: Automated Setup (Recommended)

### Windows Users
```cmd
# Run the setup script
setup.bat
```

### Linux/macOS Users
```bash
# Make script executable and run
chmod +x setup.sh
./setup.sh
```

## ⚡ Option 2: Docker (Easiest)

### Prerequisites
- Docker
- Docker Compose

### Steps
```bash
# Clone and start
git clone https://github.com/TitanNatesan/SwiSys.git
cd SwiSys

# Development environment
docker-compose -f docker-compose.dev.yml up --build

# Production environment
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

## ⚡ Option 3: Manual Setup

### 1. Clone Repository
```bash
git clone https://github.com/TitanNatesan/SwiSys.git
cd SwiSys
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/macOS)
source .venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py createsuperuser

# Start backend
python manage.py runserver
```

### 3. Frontend Setup
```bash
# In new terminal
cd frontend
npm install
npm run dev
```

## 🎯 First Steps After Setup

1. **Access the Application**
   - Visit: http://localhost:3000
   - You'll see the login page

2. **Create Your First Admin User**
   - Use the superuser account you created
   - Login with role: Admin

3. **Test the System**
   - Create some products as Admin
   - Register an Employee (needs approval)
   - Register a Customer (needs OTP verification)

4. **Explore Features**
   - Admin Dashboard: Full system control
   - Employee Dashboard: Product management
   - Customer Dashboard: Product viewing

## 🔧 Common Issues

### Backend Won't Start
```bash
# Check Python version (need 3.13+)
python --version

# Check virtual environment is activated
which python  # Should show .venv path
```

### Frontend Won't Start
```bash
# Check Node version (need 18+)
node --version

# Clear cache if needed
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Reset database
rm backend/db.sqlite3
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### CORS Errors
- Ensure backend is running on port 8000
- Ensure frontend is running on port 3000
- Check .env files have correct URLs

## 📞 Need Help?

- 📖 Full Documentation: See [README.md](README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/TitanNatesan/SwiSys/issues)
- 💬 Questions: [GitHub Discussions](https://github.com/TitanNatesan/SwiSys/discussions)

---

**Happy Coding! 🎉**
