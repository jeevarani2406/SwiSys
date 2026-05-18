# SwiSys - Complete Setup Guide

Complete step-by-step guide to clone and run the SwiSys project on your system.

## 📋 Prerequisites

Before you start, ensure you have these installed:

- **Python 3.12+** - Download from [python.org](https://www.python.org/downloads/)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - Download from [git-scm.com](https://git-scm.com/)

### Verify Installation

```bash
python --version  # Should show Python 3.12+
node --version    # Should show v18+
npm --version     # Should show 8+
git --version     # Should show git version
```

## 🔄 Step 1: Clone the Repository

```bash
git clone https://github.com/jeevarani2406/SwiSys.git
cd SwiSys
```

## ⚙️ Step 2: Backend Setup

### 2.1 Create Python Virtual Environment

```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2.2 Navigate to Backend

```bash
cd backend
```

### 2.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Expected packages to install:**
- Django 4.2.17
- Django REST Framework
- djangorestframework-simplejwt
- mysqlclient/psycopg2
- pandas, numpy, openpyxl
- Other utilities

### 2.4 Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# On Windows PowerShell:
# Copy-Item .env.example .env
```

**Edit `.backend/.env` with your values:**

```env
# Database (default SQLite - works without MySQL)
DATABASE_URL=sqlite:///db.sqlite3

# Security
SECRET_KEY=your-generated-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Email (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
EMAIL_USE_TLS=True
```

**To generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.5 Run Database Migrations

```bash
python manage.py migrate
```

**Output should show:**
```
Running migrations:
  Applying contenttypes...
  Applying accounts...
  Applying Main...
  ...
```

### 2.6 Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

**Follow prompts:**
```
Username: admin
Email: admin@example.com
Password: ••••••••
```

### 2.7 Start Backend Server

```bash
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

✅ **Backend is running at:** `http://localhost:8000`

**Keep this terminal open!**

---

## 🎨 Step 3: Frontend Setup

### 3.1 Open New Terminal Window

Keep the backend running and open a new terminal.

### 3.2 Navigate to Frontend

```bash
cd frontend
```

### 3.3 Install Node Dependencies

```bash
npm install
```

**This installs:**
- Next.js 16.1.0
- React 19.2.3
- Tailwind CSS 4
- Axios for API calls
- And other utilities

### 3.4 Verify Environment Configuration

The `.env.local` file should already be configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=SwiSys
```

✅ Default values are already set - **no changes needed for local development**

### 3.5 Start Frontend Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.1.0
- Local: http://localhost:3000
- Environments: .env.local
```

✅ **Frontend is running at:** `http://localhost:3000`

---

## 🧪 Step 4: Verify Everything Works

### 4.1 Check Backend API

Open browser and visit:
```
http://localhost:8000/api/
```

You should see the API endpoint list.

### 4.2 Check Admin Panel

Open browser and visit:
```
http://localhost:8000/admin/
```

Login with superuser credentials created in Step 2.6

### 4.3 Check Frontend

Open browser and visit:
```
http://localhost:3000
```

You should see the SwiSys homepage.

### 4.4 Test Authentication

1. Click "Login" on the frontend
2. Use the superuser credentials
3. You should be redirected to the dashboard

---

## 🚀 Running Both Servers

You need **2 terminals** open simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
.\.venv\Scripts\Activate.ps1  # Windows
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 📱 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000/api | REST API endpoints |
| Django Admin | http://localhost:8000/admin | Admin panel |
| API Docs | http://localhost:8000/api/schema/swagger/ | API documentation |

---

## 🔧 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"

**Solution:** Activate virtual environment and reinstall

```bash
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
```

### Issue: "Port 8000 already in use"

**Solution:** Run on different port

```bash
python manage.py runserver 8001
```

Then update frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

### Issue: "Port 3000 already in use"

**Solution:** Run on different port

```bash
npm run dev -- -p 3001
```

### Issue: "CORS errors in browser console"

**Solution:** Restart both servers:
1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Restart both

### Issue: "Database doesn't exist"

**Solution:** Run migrations

```bash
python manage.py migrate
```

### Issue: "No module named 'mysqlclient'"

**Solution:** Install using pip

```bash
pip install mysqlclient
```

---

## 📦 For Production Deployment

### Backend Production Build

```bash
cd backend
python manage.py collectstatic
gunicorn SwiSysBackend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend Production Build

```bash
cd frontend
npm run build
npm run start
```

### Environment Setup for Production

Update `backend/.env`:

```env
DEBUG=False
SECRET_KEY=generate-a-new-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@host:port/dbname
```

---

## 📚 Additional Resources

- [Backend README](backend/README_UPLOAD.md) - Upload endpoints and J1939 file handling
- [API Reference](API_ENDPOINT_REFERENCE.md) - Complete API documentation
- [Technical Details](TECHNICAL_DETAILS.md) - Architecture and design
- [Quick Start Testing](QUICK_START_TESTING.md) - Testing guide

---

## ✅ Quick Start Checklist

- [ ] Git cloned successfully
- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed
- [ ] Virtual environment created
- [ ] Backend dependencies installed
- [ ] `.env` file configured
- [ ] Database migrations ran
- [ ] Superuser created
- [ ] Backend server running (port 8000)
- [ ] Frontend dependencies installed
- [ ] `.env.local` configured
- [ ] Frontend server running (port 3000)
- [ ] Can access http://localhost:3000
- [ ] Can login with superuser
- [ ] API endpoints accessible

---

## 🆘 Need Help?

1. Check error messages carefully
2. Verify all prerequisites are installed
3. Ensure both servers are running
4. Check that ports 8000 and 3000 are not blocked
5. Review logs in backend terminal

---

**Last Updated:** May 18, 2026
**Version:** 1.0.0
