"""
AI Equipment Natural Language Matching Engine API Router
"""
from typing import List
from fastapi import APIRouter, Query
from app.schemas.resource import AIMatchResult

router = APIRouter(prefix="/matches", tags=["AI Match Search"])

@router.get("", response_model=List[AIMatchResult])
async def get_ai_matches(prompt: str = Query(..., description="Natural language search prompt")):
    """
    Parse natural language user intent and return ranked matches with score breakdowns.
    """
    # Sample deterministic match score calculation based on query parameters
    p_lower = prompt.lower()
    
    matches = [
        AIMatchResult(
            id="r1",
            title="Sony Alpha 7 IV Mirrorless Camera",
            category="tech",
            dailyRate=1200.0,
            deposit=3000.0,
            matchScore=96 if "camera" in p_lower or "sony" in p_lower else 88,
            priceScore=95,
            distanceScore=98,
            trustScore=96,
            aiRationale="Optimal price-to-performance ratio with 4K video support within 0.8km radius."
        ),
        AIMatchResult(
            id="r3",
            title="Bose SoundLink Revolve+ II Speaker",
            category="audio",
            dailyRate=450.0,
            deposit=1500.0,
            matchScore=92 if "sound" in p_lower or "speaker" in p_lower or "party" in p_lower else 82,
            priceScore=98,
            distanceScore=92,
            trustScore=94,
            aiRationale="Portable 360-degree sound with 17h battery life. Verified 4.98 owner rating."
        ),
        AIMatchResult(
            id="r2",
            title="DeWalt 20V Max Cordless Drill Kit",
            category="tools",
            dailyRate=350.0,
            deposit=1000.0,
            matchScore=89 if "drill" in p_lower or "tool" in p_lower else 78,
            priceScore=99,
            distanceScore=90,
            trustScore=92,
            aiRationale="High-torque drill kit with masonry bits included. Ultra-low daily rental rate."
        )
    ]
    
    # Sort matches by overall match score descending
    matches.sort(key=lambda x: x.matchScore, reverse=True)
    return matches
