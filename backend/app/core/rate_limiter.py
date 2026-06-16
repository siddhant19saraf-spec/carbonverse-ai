import uuid
import time
import logging
from collections import defaultdict

from fastapi import HTTPException, Request, status

from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    import redis as _redis

    _redis_available = True
except ImportError:
    _redis_available = False


class RateLimiter:
    """Sliding-window rate limiter backed by Redis when available, in-memory fallback."""

    def __init__(
        self,
        max_requests: int = settings.RATE_LIMIT_REQUESTS,
        window_seconds: int = settings.RATE_LIMIT_WINDOW,
    ):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._redis_client: _redis.Redis | None = None
        self._use_redis = _redis_available
        self._memory_store: dict[str, list[float]] = defaultdict(list)

    def _get_client(self) -> _redis.Redis | None:
        if not self._use_redis:
            return None
        if self._redis_client is None:
            try:
                self._redis_client = _redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2,
                )
                self._redis_client.ping()
            except Exception:
                self._use_redis = False
                self._redis_client = None
        return self._redis_client

    def _rate_limit_key(self, request: Request) -> str:
        client_ip = request.client.host if request.client else "unknown"
        return f"rate_limit:{client_ip}"

    def __call__(self, request: Request) -> None:
        key = self._rate_limit_key(request)
        now = time.time()
        window_start = now - self.window_seconds

        client = self._get_client()
        if client is not None:
            try:
                client.zremrangebyscore(key, 0, window_start)
                request_count = client.zcard(key)
                if request_count is not None and request_count >= self.max_requests:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Too many requests. Please try again later.",
                    )
                client.zadd(key, {str(now): now})
                client.expire(key, self.window_seconds)
                return
            except HTTPException:
                raise
            except Exception:
                pass

        self._memory_store[key] = [
            t for t in self._memory_store[key] if t > window_start
        ]
        if len(self._memory_store[key]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
        self._memory_store[key].append(now)
