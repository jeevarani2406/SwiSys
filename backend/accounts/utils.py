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
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Log the exception for monitoring
    if response is not None:
        logger.warning(f"API Exception: {exc} - {context.get('request').path}")
    else:
        logger.error(f"Unhandled Exception: {exc} - {context.get('request').path}")
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'error': True,
            'message': 'An error occurred',
            'details': response.data
        }
        
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['message'] = response.data['detail']
            elif 'non_field_errors' in response.data:
                custom_response_data['message'] = response.data['non_field_errors'][0]
        
        response.data = custom_response_data
    
    # Handle Django ValidationError
    if isinstance(exc, ValidationError):
        return Response({
            'error': True,
            'message': 'Validation error',
            'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle 404 errors
    if isinstance(exc, Http404):
        return Response({
            'error': True,
            'message': 'Resource not found',
            'details': str(exc)
        }, status=status.HTTP_404_NOT_FOUND)
    
    return response
