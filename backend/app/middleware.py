from prometheus_client import Counter
from starlette.middleware.base import BaseHTTPMiddleware

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["app_name", "method", "endpoint", "http_status"],
)


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        REQUEST_COUNT.labels(
            app_name="webapp",
            method=request.method,
            endpoint=request.url.path,
            http_status=str(response.status_code),
        ).inc()

        return response
