import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from django.http import HttpResponse

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'path', 'status'])
REQUEST_LATENCY = Histogram('http_request_latency_seconds', 'HTTP request latency', ['method', 'path'])


class PrometheusMiddleware:
    """Middleware to collect Prometheus metrics for requests."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        elapsed = time.time() - start
        method = request.method
        path = request.path
        status = str(getattr(response, 'status_code', '500'))

        REQUEST_COUNT.labels(method=method, path=path, status=status).inc()
        REQUEST_LATENCY.labels(method=method, path=path).observe(elapsed)
        return response


def metrics_view(request):
    """Expose Prometheus metrics."""
    data = generate_latest()
    return HttpResponse(data, content_type=CONTENT_TYPE_LATEST)
