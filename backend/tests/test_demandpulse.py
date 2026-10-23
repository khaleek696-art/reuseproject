"""
DemandPulse Time-Series Analytics & Tiger Cloud Engine Test Suite
Validates time-series event ingestion, time-bucketed rollups, and zero-crash fallback.
"""
import pytest
import asyncio
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import init_db_connection
from app.core.tiger_db import init_tiger_connection
from app.services.demandpulse import DemandPulseEngine


def test_demandpulse_status_endpoint():
    """Validates /api/v1/analytics/status returns healthy metadata."""
    async def run():
        await init_db_connection()
        await init_tiger_connection()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/analytics/status")
            assert res.status_code == 200
            data = res.json()
            assert "status" in data
            assert data["service_name"] == "reuse-demandpulse"
            assert data["database"] == "tsdb"

    asyncio.run(run())


def test_demandpulse_event_ingestion_and_summary():
    """Validates event recording and demand summary calculation."""
    async def run():
        await init_db_connection()
        await init_tiger_connection()
        
        # 1. Record sample test events
        success = await DemandPulseEngine.record_event(
            event_type="search_performed",
            category="Cameras & Photography",
            locality="Indiranagar",
            estimated_amount=1500.0
        )
        assert success is True

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.get("/api/v1/analytics/demand-summary?hours=24")
            assert res.status_code == 200
            data = res.json()
            assert data["total_searches"] >= 1
            assert "unmet_demand_index" in data
            assert "circular_efficiency_score" in data

    asyncio.run(run())


def test_demandpulse_category_trends_and_supply():
    """Validates category breakdown and demand-vs-supply ratios."""
    async def run():
        await init_db_connection()
        await init_tiger_connection()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Category Trends
            res_trends = await client.get("/api/v1/analytics/category-trends")
            assert res_trends.status_code == 200
            trends = res_trends.json()
            assert len(trends) > 0
            assert "category" in trends[0]
            assert "searches" in trends[0]

            # 2. Demand vs Supply
            res_dvs = await client.get("/api/v1/analytics/demand-vs-supply")
            assert res_dvs.status_code == 200
            dvs = res_dvs.json()
            assert len(dvs) > 0
            assert "demand_supply_ratio" in dvs[0]

    asyncio.run(run())


def test_demandpulse_hourly_series_and_hotspots():
    """Validates 24-hour time-bucketed hourly points and geospatial hotspots."""
    async def run():
        await init_db_connection()
        await init_tiger_connection()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Hourly Series
            res_hourly = await client.get("/api/v1/analytics/hourly-series")
            assert res_hourly.status_code == 200
            series = res_hourly.json()
            assert len(series) == 24
            assert "hour" in series[0]

            # Hotspots
            res_spots = await client.get("/api/v1/analytics/hotspots")
            assert res_spots.status_code == 200
            spots = res_spots.json()
            assert len(spots) > 0
            assert "locality" in spots[0]

    asyncio.run(run())
# RE:USE — Modular Circular Economy Architecture
