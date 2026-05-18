"""
Django settings for SwiSysBackend project.
Optimized for Django 4.2 LTS and MySQL 5.7 (cPanel).
"""

import os
from pathlib import Path
import environ

# ==============================================================
# 🔧 CRITICAL PATCH: FORCE DJANGO TO ACCEPT MYSQL 5.7
# ==============================================================
# This bypasses the "MySQL 8 or later is required" error
import django.db.backends.mysql.base
django.db.backends.mysql.base.DatabaseWrapper.check_database_version_supported = lambda self: None
# ==============================================================

# -------------------------
# BASE_DIR
# -------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------
# ENVIRONMENT VARIABLES
# -------------------------
env = environ.Env(
    DEBUG=(bool, False),
    SECRET_KEY=(str, 'django-insecure-change-me'),
    CORS_ALLOW_ALL_ORIGINS=(bool, False), 
    LOG_LEVEL=(str, 'INFO'),
    # Database defaults (fallback to SQLite if .env is missing)
    DB_ENGINE=(str, 'django.db.backends.sqlite3'),
    DB_NAME=(str, str(BASE_DIR / 'db.sqlite3')),
    DB_USER=(str, ''),
    DB_PASSWORD=(str, ''),
    DB_HOST=(str, ''),
    DB_PORT=(str, ''),
)

# Read .env if exists
environ.Env.read_env(BASE_DIR / '.env')

# -------------------------
# SECURITY SETTINGS
# -------------------------
SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
# Parse list correctly from .env (e.g., "host1,host2")
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# -------------------------
# APPLICATIONS
# -------------------------
INSTALLED_APPS = [
    'jazzmin',  # Admin theme must be before admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'drf_spectacular',
    'django_filters',

    # Local apps
    'Main',
    'accounts',
]

# -------------------------
# MIDDLEWARE
# -------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# -------------------------
# URLS & TEMPLATES
# -------------------------
ROOT_URLCONF = 'SwiSysBackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'SwiSysBackend.wsgi.application'

# -------------------------
# DATABASE
# -------------------------
DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE'),
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        } if 'mysql' in env('DB_ENGINE') else {},
    }
}

# -------------------------
# PASSWORD VALIDATORS
# -------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -------------------------
# INTERNATIONALIZATION
# -------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------------
# STATIC & MEDIA FILES
# -------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -------------------------
# DEFAULT AUTO FIELD
# -------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -------------------------
# CUSTOM USER MODEL
# -------------------------
AUTH_USER_MODEL = 'accounts.User'

# -------------------------
# DRF CONFIG
# -------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.TokenAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'user': '1000/day',
        'anon': '100/day',
        'otp': '5/min',
        'login': '10/min',
        'register': '5/min',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'accounts.utils.custom_exception_handler',
}

# -------------------------
# EMAIL BACKEND
# -------------------------
if env('EMAIL_HOST', default=''):
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = env('EMAIL_HOST')
    EMAIL_PORT = env('EMAIL_PORT', default=587)
    EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
    EMAIL_USE_TLS = env('EMAIL_USE_TLS', default=True)
    EMAIL_USE_SSL = env('EMAIL_USE_SSL', default=False)
    DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)
else: EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# -------------------------
# CORS SETTINGS
# -------------------------
CORS_ALLOW_ALL_ORIGINS = env('CORS_ALLOW_ALL_ORIGINS')
if CORS_ALLOW_ALL_ORIGINS: CORS_ALLOW_ALL_ORIGINS = True
else: CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:3000'])

CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=['http://localhost:3000'])

# -------------------------
# API DOCUMENTATION
# -------------------------
SPECTACULAR_SETTINGS = {
    'TITLE': 'SwiSys API',
    'DESCRIPTION': 'CAN Bus, OBD II, and SAE J1939 solutions API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}

# -------------------------
# SECURITY SETTINGS
# -------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = env('SECURE_SSL_REDIRECT', default=True)
    SECURE_HSTS_SECONDS = env('SECURE_HSTS_SECONDS', default=31536000)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=True)
    SECURE_HSTS_PRELOAD = env('SECURE_HSTS_PRELOAD', default=True)
    SESSION_COOKIE_SECURE = env('SESSION_COOKIE_SECURE', default=True)
    CSRF_COOKIE_SECURE = env('CSRF_COOKIE_SECURE', default=True)

SECURE_CONTENT_TYPE_NOSNIFF = env('SECURE_CONTENT_TYPE_NOSNIFF', default=True)
SECURE_BROWSER_XSS_FILTER = env('SECURE_BROWSER_XSS_FILTER', default=True)
X_FRAME_OPTIONS = 'DENY'

# -------------------------
# LOGGING
# -------------------------
# Ensure log directory exists to prevent crash
LOG_DIR = BASE_DIR / 'logs'
if not LOG_DIR.exists(): os.makedirs(LOG_DIR)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}', 'style': '{'},
        'simple': {'format': '{levelname} {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'simple'},
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_DIR / 'swisys.log',
            'maxBytes': 1024*1024*5,
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {'handlers': ['console', 'file'], 'level': env('LOG_LEVEL')},
    'loggers': {
        'django': {'handlers': ['console', 'file'], 'level': env('LOG_LEVEL'), 'propagate': False},
        'accounts': {'handlers': ['console', 'file'], 'level': 'DEBUG' if DEBUG else env('LOG_LEVEL'), 'propagate': False},
    },
}