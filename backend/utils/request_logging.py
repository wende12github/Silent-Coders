import time
import logging

logger = logging.getLogger('request')


class RequestLoggingMiddleware:
    """Simple middleware to log request/response with timing and basic context."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = None
        try:
            response = self.get_response(request)
            return response
        finally:
            duration = (time.time() - start) * 1000.0
            user = getattr(request, 'user', None)
            username = user.username if getattr(user, 'is_authenticated', False) else None
            try:
                status_code = response.status_code if response is not None else 'N/A'
            except Exception:
                status_code = 'N/A'

            logger.info(
                "request",
                extra={
                    'method': request.method,
                    'path': request.get_full_path(),
                    'status_code': status_code,
                    'duration_ms': round(duration, 2),
                    'user': username,
                    'remote_addr': request.META.get('REMOTE_ADDR'),
                }
            )
