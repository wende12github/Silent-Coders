import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError, AuthenticationFailed, NotAuthenticated, PermissionDenied, NotFound

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    # Let DRF build the initial response
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize structure
        detail = None
        if isinstance(exc, ValidationError):
            detail = response.data
            code = 'validation_error'
            status_code = status.HTTP_400_BAD_REQUEST
        elif isinstance(exc, (AuthenticationFailed, NotAuthenticated)):
            detail = response.data
            code = 'authentication_failed'
            status_code = status.HTTP_401_UNAUTHORIZED
        elif isinstance(exc, PermissionDenied):
            detail = response.data
            code = 'permission_denied'
            status_code = status.HTTP_403_FORBIDDEN
        elif isinstance(exc, NotFound):
            detail = response.data
            code = 'not_found'
            status_code = status.HTTP_404_NOT_FOUND
        else:
            detail = response.data
            code = 'error'
            status_code = response.status_code

        payload = {
            'error': {
                'code': code,
                'message': _extract_message(detail),
                'details': detail,
            }
        }

        return Response(payload, status=status_code)

    # If DRF couldn't handle it, log and return generic 500
    logger.exception('Unhandled exception: %s', exc)
    return Response({
        'error': {
            'code': 'server_error',
            'message': 'An internal server error occurred.',
            'details': None,
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _extract_message(detail):
    # detail can be list/dict/str
    if isinstance(detail, dict):
        # try common keys
        if 'detail' in detail:
            return detail['detail']
        # return first message
        for v in detail.values():
            if isinstance(v, (list, tuple)) and v:
                return v[0]
            if isinstance(v, str):
                return v
        return str(detail)
    if isinstance(detail, list) and detail:
        return detail[0]
    return str(detail)
