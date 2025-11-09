# SwiSys - Complete Management System

![SwiSys Banner](https://img.shields.io/badge/SwiSys-Management%20System-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.2.5-green?style=flat-square&logo=django)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)
![Python](https://img.shields.io/badge/Python-3.13.3-yellow?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)

A comprehensive business management system with role-based access control, bilingual support, and modern web architecture.

## 🚀 Features

### ✨ Core Features
- **🌍 Bilingual Support**: English and Chinese name support for users
- **🔐 Unified Authentication**: Single login endpoint for all user types
- **👥 Role-Based Access Control**: Admin, Employee, and Customer roles
- **📧 Email OTP Verification**: Secure customer registration with email verification
- **📊 Product Management**: Complete CRUD operations with role-based restrictions
- **📱 Responsive Design**: Modern, mobile-friendly interface
- **📈 Activity Logging**: Comprehensive login and product change tracking

### 🛡️ Security Features
- JWT Token Authentication
- CORS Protection
- Rate Limiting
- Permission-based API Access
- Secure Password Handling
- Email Verification System

### 🎯 User Roles & Permissions

| Role         | Login              | Product View | Product Create/Edit | Product Delete | User Management |
| ------------ | ------------------ | ------------ | ------------------- | -------------- | --------------- |
| **Admin**    | ✅                  | ✅            | ✅                   | ✅              | ✅               |
| **Employee** | ✅ (after approval) | ✅            | ✅                   | ✅              | ❌               |
| **Customer** | ✅ (after OTP)      | ✅            | ❌                   | ❌              | ❌               |

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

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.13+** 🐍
- **Node.js 18+** 📦
- **npm or yarn** 📦
- **Git** 🔧

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

## ⚡ Quick Start

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/TitanNatesan/SwiSys.git
cd SwiSys
```

## 🔧 Backend Setup (Django)

### 1. 🐍 Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.venv\Scripts\activate.bat

# macOS/Linux
source .venv/bin/activate
```

### 2. 📦 Install Backend Dependencies

```bash
cd backend

# Install required packages
pip install Django==5.2.5
pip install djangorestframework==3.16.1
pip install django-cors-headers==4.7.0
pip install django-environ==0.12.0
pip install django-filter==25.1
pip install djangorestframework-simplejwt==5.5.1
pip install django-jazzmin==3.0.1
pip install pillow  # For image handling
```

### 3. ⚙️ Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
# The default settings work for development
```

**Important Environment Variables:**
```env
# Database (SQLite for development)
DATABASE_URL=sqlite:///db.sqlite3

# Security
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=true

# CORS for Frontend
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. 🗄️ Database Setup

```bash
# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (Admin)
python manage.py createsuperuser
```

### 5. 🚀 Start Backend Server

```bash
# Start Django development server
python manage.py runserver

# Server will be available at: http://localhost:8000
```

### 6. ✅ Verify Backend Setup

Visit these URLs to verify:
- **Admin Panel**: http://localhost:8000/admin/
- **API Root**: http://localhost:8000/api/
- **API Documentation**: http://localhost:8000/api/docs/

## 🎨 Frontend Setup (Next.js)

### 1. 📦 Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 2. ⚙️ Environment Configuration

```bash
# Create environment file
touch .env.local

# Add the following content:
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

### 3. 🚀 Start Frontend Development Server

```bash
# Start Next.js development server
npm run dev

# Or using yarn
yarn dev

# Frontend will be available at: http://localhost:3000
```

### 4. ✅ Verify Frontend Setup

Visit: http://localhost:3000

You should see the SwiSys login page.

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test tests

# Run specific test categories
python manage.py test tests.test_models      # Model tests
python manage.py test tests.test_api         # API tests
python manage.py test tests.test_permissions # Permission tests

# Run with verbose output
python manage.py test tests -v 2

# Using custom test runner
python tests/test_runner.py

# Quick environment check
python tests/check_tests.py --run-quick
```

### Frontend Tests

```bash
cd frontend

# Run tests (when available)
npm test

# Lint code
npm run lint
```

## 📚 API Documentation

### 🔑 Authentication Endpoints

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/api/accounts/login/`             | Unified login for all user types |
| POST   | `/api/accounts/register/`          | Register new admin/employee      |
| POST   | `/api/accounts/register-customer/` | Register new customer            |
| POST   | `/api/accounts/verify-otp/`        | Verify customer OTP              |
| GET    | `/api/accounts/me/`                | Get current user info            |

### 📦 Product Management

| Method | Endpoint                       | Description         | Permissions       |
| ------ | ------------------------------ | ------------------- | ----------------- |
| GET    | `/api/accounts/products/`      | List products       | All authenticated |
| POST   | `/api/accounts/products/`      | Create product      | Admin, Employee   |
| GET    | `/api/accounts/products/{id}/` | Get product details | All authenticated |
| PUT    | `/api/accounts/products/{id}/` | Update product      | Admin, Employee   |
| DELETE | `/api/accounts/products/{id}/` | Delete product      | Admin, Employee   |

### 👥 User Management (Admin Only)

| Method | Endpoint                                  | Description        |
| ------ | ----------------------------------------- | ------------------ |
| GET    | `/api/accounts/admin/users/`              | List all users     |
| PUT    | `/api/accounts/admin/users/{id}/approve/` | Approve employee   |
| GET    | `/api/accounts/admin/logs/`               | View activity logs |

## 🎭 User Roles Guide

### 👑 Admin Users
- **Access**: Full system access
- **Capabilities**:
  - Manage all products
  - Approve employee accounts
  - View all system logs
  - Manage user accounts
- **Login**: Direct access after account creation

### 👷 Employee Users
- **Access**: Product management
- **Capabilities**:
  - Create, edit, and delete products
  - View product analytics
  - Cannot manage users
- **Login**: Requires admin approval first

### 👤 Customer Users
- **Access**: Read-only product access
- **Capabilities**:
  - View products
  - Search and filter products
  - Download product data (CSV)
- **Login**: Requires email OTP verification

## 🔄 Development Workflow

### 1. 🚀 Daily Development Setup

```bash
# Start backend
cd backend
.venv\Scripts\Activate.ps1  # Windows
python manage.py runserver

# Start frontend (new terminal)
cd frontend
npm run dev
```

### 2. 🧪 Testing Before Commits

```bash
# Backend tests
cd backend
python tests/check_tests.py --run-quick

# Frontend linting
cd frontend
npm run lint
```

### 3. 📝 Making Changes

1. **Backend Changes**:
   - Models → Run migrations
   - APIs → Update tests
   - Permissions → Test access control

2. **Frontend Changes**:
   - Components → Test in browser
   - API calls → Verify with backend
   - Styling → Check responsiveness

## 🚀 Production Deployment

### 🐳 Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### 🌐 Manual Deployment

#### Backend (Django)
```bash
# Install production dependencies
pip install gunicorn
pip install whitenoise

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn SwiSysBackend.wsgi:application
```

#### Frontend (Next.js)
```bash
# Build for production
npm run build

# Start production server
npm start
```

### ⚙️ Production Environment Variables

```env
# Security
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@localhost:5432/swisys

# Email (Production SMTP)
EMAIL_HOST=your-smtp-server.com
EMAIL_HOST_USER=your-production-email
EMAIL_HOST_PASSWORD=your-production-password

# Security Headers
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## 🐛 Troubleshooting

### Common Issues

#### ❌ Backend Won't Start
```bash
# Check Python version
python --version

# Verify virtual environment
which python  # macOS/Linux
where python   # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### ❌ Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### ❌ Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version
npm --version
```

#### ❌ CORS Issues
- Verify `CORS_ALLOWED_ORIGINS` in backend `.env`
- Check frontend `NEXT_PUBLIC_API_BASE_URL`
- Ensure both servers are running

#### ❌ Authentication Issues
- Check JWT token expiration
- Verify user roles and permissions
- Clear browser localStorage

### 📋 Debug Mode

#### Backend Debug
```bash
# Enable Django debug mode
DEBUG=True in .env

# View detailed error logs
python manage.py runserver --verbosity=2
```

#### Frontend Debug
```bash
# Run with debug info
npm run dev

# Check browser console for errors
# Open DevTools → Console
```

## 📁 Project Structure

```
SwiSys/
├── 📁 backend/                    # Django Backend
│   ├── 📁 accounts/               # User & Product management
│   │   ├── 📄 models.py          # Database models
│   │   ├── 📄 views.py           # API endpoints
│   │   ├── 📄 serializers.py     # Data serialization
│   │   ├── 📄 permissions.py     # Access control
│   │   └── 📄 urls.py            # URL routing
│   ├── 📁 SwiSysBackend/         # Django settings
│   ├── 📁 tests/                 # Comprehensive test suite
│   ├── 📄 manage.py              # Django management
│   ├── 📄 .env.example           # Environment template
│   └── 📄 db.sqlite3             # Development database
│
├── 📁 frontend/                   # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js 13+ App Router
│   │   │   ├── 📄 page.js        # Home/Login page
│   │   │   ├── 📁 admin-dashboard/
│   │   │   ├── 📁 employee-dashboard/
│   │   │   └── 📁 customer-dashboard/
│   │   ├── 📁 components/        # React components
│   │   │   ├── 📁 pages/         # Page components
│   │   │   ├── 📄 Header.jsx     # Navigation
│   │   │   └── 📄 Footer.jsx     # Footer
│   │   └── 📁 services/          # API services
│   ├── 📄 package.json           # Dependencies
│   ├── 📄 next.config.mjs        # Next.js config
│   └── 📄 tailwind.config.js     # Styling config
│
├── 📁 .venv/                     # Python virtual environment
├── 📄 README.md                  # This file
└── 📄 .gitignore                 # Git ignore rules
```

## 🤝 Contributing

### Development Guidelines

1. **🔀 Branch Strategy**:
   - `main` - Production ready code
   - `develop` - Development branch
   - `feature/*` - New features
   - `bugfix/*` - Bug fixes

2. **📝 Commit Messages**:
   ```
   feat: add bilingual user support
   fix: resolve authentication issue
   docs: update API documentation
   test: add product management tests
   ```

3. **🧪 Testing Requirements**:
   - All new features must include tests
   - Backend: Django test coverage
   - Frontend: Component testing (when applicable)

4. **📚 Documentation**:
   - Update README for new features
   - Document API changes
   - Add inline code comments

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Update documentation
6. Submit pull request

## 📞 Support & Contact

### 📧 Getting Help

- **Issues**: [GitHub Issues](https://github.com/TitanNatesan/SwiSys/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TitanNatesan/SwiSys/discussions)
- **Email**: [Support Email](mailto:support@swisys.com)

### 📖 Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Django** - Robust backend framework
- **Next.js** - Modern React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Django REST Framework** - Powerful API toolkit
- **React** - Frontend library

---

<div align="center">

**🚀 Built with ❤️ by [TitanNatesan](https://github.com/TitanNatesan)**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)

</div>
