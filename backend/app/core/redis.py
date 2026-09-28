"""
Async Redis Cache & PubSub Connection Engine
Includes fallback in-memory dict cache if Redis server is not running locally.
"""
import logging
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisManager:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self._memory_cache = {}

    async def connect(self):
        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20
            )
            await self.redis.ping()
            logger.info("Successfully connected to Redis instance.")
        except Exception as e:
            logger.warning(f"Redis connection unavailable ({e}). Using in-memory fallback cache.")
            self.redis = None

    async def set(self, key: str, value: str, expire: int = 300):
        if self.redis:
            try:
                await self.redis.set(key, value, ex=expire)
                return
            except Exception:
                pass
        self._memory_cache[key] = value

    async def get(self, key: str) -> Optional[str]:
        if self.redis:
            try:
                return await self.redis.get(key)
            except Exception:
                pass
        return self._memory_cache.get(key)

    async def delete(self, key: str):
        if self.redis:
            try:
                await self.redis.delete(key)
                return
            except Exception:
                pass
        self._memory_cache.pop(key, None)

redis_manager = RedisManager()
