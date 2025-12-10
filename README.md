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

### Prerequisites

* Python 3.12+
* Node.js 18+
* npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jeevarani2406/SwiSys.git
cd SwiSys
```

2. **Backend Setup**
```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

* [API Endpoints Reference](API_ENDPOINT_REFERENCE.md)
* [Quick Start Testing](QUICK_START_TESTING.md)
* [Technical Details](TECHNICAL_DETAILS.md)

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

