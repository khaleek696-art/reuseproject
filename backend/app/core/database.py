"""
RE:USE Async Database Engine & Session Pool Management
Supports PostgreSQL + PostGIS (Production) and SQLite Async (Local Development Fallback)
"""
import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

logger = logging.getLogger("reuse_db")

# Base Model Class for SQLAlchemy ORM
Base = declarative_base()

# Primary PostgreSQL Async Engine
postgres_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,  # Auto-reconnect lost DB pool connections
    pool_size=20,         # High concurrency connection pool size
    max_overflow=10       # Peak traffic burst buffer
)

# SQLite Fallback Async Engine (For zero-config local development without Postgres daemon)
sqlite_engine = create_async_engine(
    settings.SQLITE_FALLBACK_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)

# Active engine & sessionmaker (defaults to postgres_engine initially)
engine = postgres_engine
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def init_db_connection():
    """
    Attempts PostgreSQL connection during startup. If local Postgres service is down,
    seamlessly switches engine to SQLite Async (reuse_local.db) so server starts cleanly.
    """
    global engine, AsyncSessionLocal
    try:
        async with postgres_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Connected to PostgreSQL database successfully.")
    except Exception as e:
        logger.warning(
            f"Local PostgreSQL service unavailable on port 5432 ({type(e).__name__}). "
            f"Seamlessly switching to local SQLite Async DB (reuse_local.db)."
        )
        engine = sqlite_engine
        AsyncSessionLocal.configure(bind=engine)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQLite Async DB initialized cleanly.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency that provides a transactional async database session.
    Automatically closes session upon request completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
