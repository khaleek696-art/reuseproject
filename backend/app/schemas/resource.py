"""
Pydantic Schemas for Equipment Resources & AI Matches
"""
from typing import List, Optional
from pydantic import BaseModel

class ResourceCreate(BaseModel):
    title: str
    category: str
    condition: str
    description: Optional[str] = "Maintained in clean working condition."
    dailyRate: float
    deposit: float
    neighborhood: Optional[str] = "Campus District"
    lat: float = 18.5204
    lng: float = 73.8567
    photos: Optional[List[str]] = None
    serialNumber: Optional[str] = None
    borrowerPolicy: Optional[str] = "verified_id"
    allowPickup: bool = True
    allowDelivery: bool = True

class ResourceResponse(BaseModel):
    id: str
    ownerId: str
    title: str
    category: str
    condition: str
    description: Optional[str]
    dailyRate: float
    deposit: float
    neighborhood: Optional[str]
    lat: float
    lng: float
    photos: List[str]
    serialNumber: Optional[str]
    borrowerPolicy: str
    allowPickup: bool
    allowDelivery: bool
    isAvailable: bool

    class Config:
        from_attributes = True

class AIMatchResult(BaseModel):
    id: str
    title: str
    category: str
    dailyRate: float
    deposit: float
    matchScore: int
    priceScore: int
    distanceScore: int
    trustScore: int
    aiRationale: str
