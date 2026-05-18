# SwiSys - Complete Management System

A comprehensive business management system with role-based access control, bilingual support, and modern web architecture.

## 🚀 Features

### ✨ Core Features

* **🌍 Bilingual Support**: English and Chinese name support for users
* **🔐 Unified Authentication**: Single login endpoint for all user types
* **👥 Role-Based Access Control**: Admin, Employee, and Customer roles
* **📧 Email OTP Verification**: Secure customer registration with email verification
* **📊 Product Management**: Complete CRUD operations with role-based restrictions
* **📱 Responsive Design**: Modern, mobile-friendly interface
* **📈 Activity Logging**: Comprehensive login and product change tracking
* **🔧 J1939 File Analysis**: Upload and analyze J1939 CAN bus files with PGN/SPN mapping

### 🛡️ Security Features

* JWT Token Authentication
* CORS Protection
* Rate Limiting
* Permission-based API Access
* Secure Password Handling
* Email Verification System

## 🏗️ Architecture

```
SwiSys/
├── 🖥️ Frontend (Next.js 15.4.6)
│   ├── React 19.1.0
│   ├── Tailwind CSS 4
│   ├── Axios for API calls
│   └── Lucide React icons
│
├── ⚙️ Backend (Django 5.2.5)
│   ├── Django REST Framework
│   ├── JWT Authentication
│   ├── CORS Headers
│   ├── Email System
│   └── SQLite Database
│
└── 🧪 Comprehensive Test Suite
    ├── Model Tests
    ├── API Tests
    ├── Permission Tests
    └── Integration Tests
```

## 🚀 Quick Start

### ⚡ Super Quick (5 Minutes)

```bash
# 1. Clone repository
git clone https://github.com/jeevarani2406/SwiSys.git
cd SwiSys

# 2. Verify setup (optional but recommended)
python verify_setup.py

# 3. Start both servers (Windows)
.\startup.ps1

# 3. Start both servers (macOS/Linux)
# Terminal 1:
source .venv/bin/activate
cd backend && python manage.py runserver

# Terminal 2:
cd frontend && npm run dev
```

### ✅ Verify it works

- Open http://localhost:3000 in your browser
- Login with superuser credentials
- Start building!

### 📚 Detailed Setup Guide

For complete step-by-step instructions, configuration options, and troubleshooting, see **[SETUP.md](SETUP.md)**

### Prerequisites

* Python 3.12+ - [Download](https://www.python.org/downloads/)
* Node.js 18+ - [Download](https://nodejs.org/)
* Git - [Download](https://git-scm.com/)

## 📚 Documentation

### Getting Started
* **[Complete Setup Guide](SETUP.md)** - Step-by-step installation and configuration
* **[Setup Verification](verify_setup.py)** - Automated environment check
* **[Startup Helper](startup.ps1)** - One-command server startup (Windows)

### Project Documentation
* [Backend Upload & J1939 Files](backend/README_UPLOAD.md)
* [API Endpoints Reference](API_ENDPOINT_REFERENCE.md)
* [Quick Start Testing](QUICK_START_TESTING.md)
* [Technical Details](TECHNICAL_DETAILS.md)

### For Developers
* Run `python verify_setup.py` to check your environment
* Run `.\startup.ps1` (Windows) to start all servers
* Check `.env.example` and `frontend/.env.example` for configuration options

## 🆘 Troubleshooting

Having issues? Check these first:

1. **Module not found errors**: Run `pip install -r requirements.txt` in backend
2. **Port already in use**: Change port in server command
3. **CORS errors**: Restart both backend and frontend servers
4. **Database errors**: Run `python manage.py migrate`

See **[SETUP.md](SETUP.md#-troubleshooting)** for more troubleshooting tips.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

* Django - Robust backend framework
* Next.js - Modern React framework
* Tailwind CSS - Utility-first CSS framework

---

**🚀 Built with ❤️ by TitanNatesan**

