from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancers.
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return Response({
            'status': 'healthy',
            'version': '1.0.0',
            'debug': settings.DEBUG,
            'database': 'connected'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return Response({
            'status': 'unhealthy',
            'error': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([AllowAny])
def ready_check(request):
    """
    Readiness check for Kubernetes deployments.
    """
    try:
        # More comprehensive checks can be added here
        from django.contrib.auth import get_user_model
        User = get_user_model()
        User.objects.count()  # Simple query to check if migrations are applied
        
        return Response({
            'status': 'ready'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return Response({
            'status': 'not ready',
            'error': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
