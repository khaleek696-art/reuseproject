"""
RE:USE DemandPulse Analytics API Endpoints
TimescaleDB Time-Series Engine
"""
from fastapi import APIRouter, BackgroundTasks, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from app.services.demandpulse import DemandPulseEngine
from app.core.tiger_db import get_tiger_status_info

router = APIRouter(prefix="/analytics", tags=["DemandPulse Analytics (TimescaleDB)"])


class EventIngestRequest(BaseModel):
    event_type: str = Field(..., description="search_performed | rental_requested | rental_completed | rental_cancelled")
    category: str = Field(..., description="Equipment category")
    locality: Optional[str] = "Indiranagar"
    resource_id: Optional[str] = None
    rental_duration_days: Optional[int] = 1
    estimated_amount: Optional[float] = 0.0
    user_id: Optional[str] = None


@router.get("/status")
async def get_tiger_cloud_status():
    """
    Returns connection and hypertable status of Tiger Cloud (TimescaleDB).
    """
    return get_tiger_status_info()


@router.get("/demand-summary")
async def get_demand_summary(hours: int = Query(24, ge=1, le=168)):
    """
    Returns high-level marketplace demand velocity, unmet demand index,
    and circular economy circulation value.
    """
    return await DemandPulseEngine.get_demand_summary(hours=hours)


@router.get("/category-trends")
async def get_category_demand_trends():
    """
    Returns 7-day category breakdown of searches, booking requests, and growth trends.
    """
    return await DemandPulseEngine.get_category_demand_trends()


@router.get("/demand-vs-supply")
async def get_demand_vs_supply():
    """
    Returns Demand-to-Supply Ratio per equipment category.
    Identifies high-earning opportunities for resource owners.
    """
    return await DemandPulseEngine.get_demand_vs_supply()


@router.get("/hourly-series")
async def get_hourly_demand_series():
    """
    Returns 24-hour time-bucketed hourly demand curve from TimescaleDB hypertable.
    """
    return await DemandPulseEngine.get_hourly_demand_series()


@router.get("/hotspots")
async def get_hotspot_localities():
    """
    Returns geospatial demand concentration by locality.
    """
    return await DemandPulseEngine.get_hotspot_localities()


@router.post("/events")
async def ingest_marketplace_event(
    event: EventIngestRequest,
    background_tasks: BackgroundTasks
):
    """
    Ingests a marketplace event asynchronously into Tiger Cloud (TimescaleDB).
    Fast, non-blocking ingestion ensures 0 latency impact on client transactions.
    """
    background_tasks.add_task(
        DemandPulseEngine.record_event,
        event_type=event.event_type,
        category=event.category,
        locality=event.locality or "Indiranagar",
        resource_id=event.resource_id,
        rental_duration_days=event.rental_duration_days or 1,
        estimated_amount=event.estimated_amount or 0.0,
        user_id=event.user_id
    )
    return {
        "status": "queued",
        "message": f"Event '{event.event_type}' scheduled for time-series ingestion."
    }
