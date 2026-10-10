"""
RE:USE × Tiger Cloud (TimescaleDB) Dedicated Analytics Database Connector
Engine: PostgreSQL + TimescaleDB (reuse-demandpulse)
Purpose: High-throughput Time-Series Event Ingestion & Hypertable Analytics
Resilience: Fail-safe isolation from primary Supabase database. If Tiger Cloud is
            offline or awaiting password, seamlessly operates in local fallback mode.
"""
import logging
from typing import AsyncGenerator, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger("tiger_timescale_db")

# Global State for Tiger Cloud Connection
tiger_engine = None
TigerAsyncSessionLocal = None
tiger_connection_status = "uninitialized"  # "connected" | "fallback_local" | "disabled"
hypertable_enabled = False

# Fallback local sqlite engine for zero-crash resilience
fallback_engine = create_async_engine(
    settings.SQLITE_FALLBACK_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)

active_analytics_engine = fallback_engine
ActiveAnalyticsSession = async_sessionmaker(
    bind=active_analytics_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_tiger_connection() -> Dict[str, Any]:
    """
    Initializes connection to Tiger Cloud TimescaleDB.
    Creates time-series marketplace_events table and enables Timescale Hypertable.
    If credentials are missing or network is unavailable, falls back smoothly without crashing.
    """
    global tiger_engine, TigerAsyncSessionLocal, active_analytics_engine, ActiveAnalyticsSession
    global tiger_connection_status, hypertable_enabled

    raw_url = settings.TIGER_DATABASE_URL.strip()

    # Check if URL is placeholder or empty
    if not raw_url or "PASSWORD_HERE" in raw_url or "REPLACE_WITH" in raw_url:
        logger.info(
            "Tiger Cloud URL contains placeholder or is empty. "
            "DemandPulse starting in local resilient fallback mode (Zero Crash)."
        )
        tiger_connection_status = "fallback_local"
        await _init_fallback_schema()
        return get_tiger_status_info()

    # Format URL for asyncpg if needed
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+asyncpg://"):
        raw_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Normalize sslmode parameter for asyncpg compatibility
    if "sslmode=" in raw_url:
        raw_url = raw_url.replace("sslmode=require", "ssl=require").replace("sslmode=prefer", "ssl=prefer")

    try:
        tiger_engine = create_async_engine(
            raw_url,
            echo=False,
            future=True,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=5,
            pool_timeout=5,
        )

        TigerAsyncSessionLocal = async_sessionmaker(
            bind=tiger_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )

        # Test live connection & create hypertable schema
        async with tiger_engine.begin() as conn:
            # 1. Create time-series table with composite primary key (time, event_id)
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS marketplace_events (
                    time TIMESTAMPTZ NOT NULL,
                    event_id VARCHAR(64) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    locality VARCHAR(100) DEFAULT 'Indiranagar',
                    resource_id VARCHAR(64),
                    rental_duration_days INT DEFAULT 1,
                    estimated_amount FLOAT DEFAULT 0.0,
                    user_id VARCHAR(64),
                    PRIMARY KEY (time, event_id)
                );
            """))

            # 2. Create specialized time-series indexes
            await conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_mkt_events_cat_time ON marketplace_events (category, time DESC);
                CREATE INDEX IF NOT EXISTS idx_mkt_events_type_time ON marketplace_events (event_type, time DESC);
                CREATE INDEX IF NOT EXISTS idx_mkt_events_loc_time ON marketplace_events (locality, time DESC);
            """))

            # 3. Attempt TimescaleDB hypertable conversion (safe if already hypertable or if Timescale enabled)
            try:
                await conn.execute(text("""
                    SELECT create_hypertable('marketplace_events', 'time', if_not_exists => TRUE);
                """))
                hypertable_enabled = True
                logger.info("TimescaleDB hypertable 'marketplace_events' created/verified successfully.")
            except Exception as he:
                logger.info(f"Timescale extension note: {he}. Standard partitioned table active.")
                hypertable_enabled = False

        active_analytics_engine = tiger_engine
        ActiveAnalyticsSession = TigerAsyncSessionLocal
        tiger_connection_status = "connected"
        logger.info("Successfully connected to Tiger Cloud TimescaleDB (reuse-demandpulse).")

    except Exception as e:
        logger.warning(
            f"Unable to connect to Tiger Cloud ({type(e).__name__}: {str(e)}). "
            f"Seamlessly activating local fallback database. Primary marketplace is unaffected."
        )
        tiger_connection_status = "fallback_local"
        await _init_fallback_schema()

    return get_tiger_status_info()


async def _init_fallback_schema():
    """
    Initializes local SQLite fallback table so DemandPulse runs even without cloud internet.
    """
    global active_analytics_engine, ActiveAnalyticsSession
    active_analytics_engine = fallback_engine
    ActiveAnalyticsSession = async_sessionmaker(
        bind=fallback_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    async with fallback_engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS marketplace_events (
                time TIMESTAMP NOT NULL,
                event_id VARCHAR(64) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                category VARCHAR(100) NOT NULL,
                locality VARCHAR(100) DEFAULT 'Indiranagar',
                resource_id VARCHAR(64),
                rental_duration_days INT DEFAULT 1,
                estimated_amount FLOAT DEFAULT 0.0,
                user_id VARCHAR(64),
                PRIMARY KEY (time, event_id)
            );
        """))


def get_tiger_status_info() -> Dict[str, Any]:
    """
    Returns connection diagnostics for admin monitoring and frontend badge.
    """
    return {
        "status": tiger_connection_status,
        "is_cloud_active": tiger_connection_status == "connected",
        "service_name": "reuse-demandpulse",
        "database": "tsdb",
        "host": "bufgz7llp5.aljxpy1ltq.tsdb.cloud.timescale.com",
        "port": 30869,
        "timescale_hypertable": hypertable_enabled,
        "table_name": "marketplace_events"
    }


async def get_analytics_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding active analytics session.
    """
    async with ActiveAnalyticsSession() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
