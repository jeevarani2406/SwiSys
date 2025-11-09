"""
WSGI config for SwiSysBackend project optimized for production.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SwiSysBackend.settings')

application = get_wsgi_application()

# Optional: Add Whitenoise middleware for static files
try:
    from whitenoise import WhiteNoise
    application = WhiteNoise(application)
except ImportError:
    pass
