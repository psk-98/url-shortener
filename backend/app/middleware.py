import time

from prometheus_client import Counter, Histogram
from starlette.middleware.base import BaseHTTPMiddleware

from app.logger import logger

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["app_name", "method", "endpoint", "http_status"],
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency",
    ["app_name", "method", "endpoint"],
)


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.perf_counter()

        method = request.method
        path = request.url.path
        query = str(request.query_params) if request.query_params else ""
        client_ip = request.client.host if request.client else "unknown"

        logger.info(
            f"Request started: {method} {path}",
            extra={
                "method": method,
                "path": path,
                "query": query,
                "client_ip": client_ip,
            },
        )

        response = await call_next(request)

        # Calculate request duration in milliseconds
        duration_ms = (time.perf_counter() - start_time) * 1000

        # Log completed request with response details
        logger.info(
            f"Request completed: {method} {path} - {response.status_code} ({duration_ms:.2f}ms)",
            extra={
                "method": method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "client_ip": client_ip,
            },
        )

        return response


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):

        REQUEST_LATENCY.labels(
            app_name="fastapi",
            method=request.method,
            endpoint=request.url.path,
        ).time()

        response = await call_next(request)

        REQUEST_COUNT.labels(
            app_name="fastapi",
            method=request.method,
            endpoint=request.url.path,
            http_status=str(response.status_code),
        ).inc()

        return response
