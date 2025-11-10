import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import Http404

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    and logs errors for monitoring.
    Only modifies error responses, leaves successful responses untouched.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Only process error responses (status code >= 400)
    if response is not None and response.status_code >= 400:
        # Log the exception for monitoring
        logger.warning(f"API Exception: {exc} - {context.get('request').path} - Status: {response.status_code}")
        
        # Customize the response format for errors
        # Preserve DRF's standard error format but add consistent structure
        if isinstance(response.data, dict):
            # If it's already a dict, keep it but ensure 'detail' or 'message' exists
            if 'detail' in response.data and 'message' not in response.data:
                response.data['message'] = response.data['detail']
            elif 'non_field_errors' in response.data and 'message' not in response.data:
                errors = response.data['non_field_errors']
                response.data['message'] = errors[0] if isinstance(errors, list) and len(errors) > 0 else str(errors)
        else:
            # If response.data is not a dict, wrap it
            response.data = {
                'detail': str(response.data),
                'message': str(response.data)
            }
    elif response is None:
        # Unhandled exception - log it
        logger.error(f"Unhandled Exception: {exc} - {context.get('request').path}")
    
    # Handle Django ValidationError (only if not already handled by DRF)
    if response is None and isinstance(exc, ValidationError):
        return Response({
            'detail': 'Validation error',
            'message': 'Validation error',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404 errors (only if not already handled by DRF)
    if response is None and isinstance(exc, Http404):
        return Response({
            'detail': 'Resource not found',
            'message': 'Resource not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    return response
