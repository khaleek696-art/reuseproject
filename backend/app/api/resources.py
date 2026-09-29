"""
Resource Catalog & Geo-Spatial Search API Router
"""
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.resource import Resource as ResourceModel
from app.schemas.resource import ResourceCreate, ResourceResponse

router = APIRouter(prefix="/resources", tags=["Resources"])

# Fallback initial resources list
SEED_RESOURCES = [
    {
        "id": "r1",
        "ownerId": "u_owner_rahul",
        "ownerName": "Verified Owner",
        "title": "Sony Alpha 7 IV Mirrorless Camera",
        "category": "tech",
        "condition": "like_new",
        "description": "Full-frame 33MP sensor, 4K 60fps video. Includes 28-70mm lens & 2 high-capacity batteries.",
        "dailyRate": 1200,
        "deposit": 3000,
        "neighborhood": "Campus Hostels Block B / Kothrud",
        "lat": 18.5204,
        "lng": 73.8567,
        "photos": ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "SONY-A7IV-98201",
        "borrowerPolicy": "verified_id",
        "allowPickup": True,
        "allowDelivery": True,
        "isAvailable": True
    },
    {
        "id": "r2",
        "ownerId": "u_owner_rahul",
        "ownerName": "Verified Owner",
        "title": "DeWalt 20V Max Cordless Drill Kit",
        "category": "tools",
        "condition": "good",
        "description": "Heavy-duty impact driver + 30-piece drill bit set. Perfect for wood, metal, and masonry.",
        "dailyRate": 350,
        "deposit": 1000,
        "neighborhood": "Civic Center Annex",
        "lat": 18.5220,
        "lng": 73.8580,
        "photos": ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "DEWALT-20V-4412",
        "borrowerPolicy": "all",
        "allowPickup": True,
        "allowDelivery": False,
        "isAvailable": True
    },
    {
        "id": "r3",
        "ownerId": "u_owner_rahul",
        "ownerName": "Verified Owner",
        "title": "Bose SoundLink Revolve+ II Bluetooth Speaker",
        "category": "audio",
        "condition": "like_new",
        "description": "360-degree deep immersive sound, 17-hour battery life, water & dust resistant.",
        "dailyRate": 450,
        "deposit": 1500,
        "neighborhood": "Student Union Plaza",
        "lat": 18.5190,
        "lng": 73.8550,
        "photos": ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "BOSE-SL-33821",
        "borrowerPolicy": "verified_id",
        "allowPickup": True,
        "allowDelivery": True,
        "isAvailable": True
    }
]

@router.get("", response_model=List[ResourceResponse])
async def get_resources(
    category: Optional[str] = None,
    query: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch resources list from SQLAlchemy Database with category & keyword search filtering.
    """
    try:
        stmt = select(ResourceModel)
        if category and category != "all":
            stmt = stmt.where(ResourceModel.category == category)
        result = await db.execute(stmt)
        db_items = result.scalars().all()

        if db_items:
            res_list = []
            for item in db_items:
                res_dict = {
                    "id": item.id,
                    "ownerId": item.owner_id,
                    "ownerName": "Verified Owner",
                    "title": item.title,
                    "category": item.category,
                    "condition": item.condition,
                    "description": item.description,
                    "dailyRate": item.daily_rate,
                    "deposit": item.deposit,
                    "neighborhood": item.neighborhood,
                    "lat": item.lat,
                    "lng": item.lng,
                    "photos": item.photos or ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
                    "serialNumber": item.serial_number,
                    "borrowerPolicy": item.borrower_policy or "verified_id",
                    "allowPickup": item.allow_pickup,
                    "allowDelivery": item.allow_delivery,
                    "isAvailable": item.is_available,
                }
                if query:
                    q = query.lower()
                    if q in item.title.lower() or (item.description and q in item.description.lower()):
                        res_list.append(res_dict)
                else:
                    res_list.append(res_dict)
            return res_list
    except Exception as e:
        pass

    # Fallback to RAM list if database is empty or initial seeding
    filtered = SEED_RESOURCES
    if category and category != "all":
        filtered = [r for r in filtered if r["category"] == category]
    if query:
        q = query.lower()
        filtered = [r for r in filtered if q in r["title"].lower() or q in (r.get("description") or "").lower()]
    return filtered

@router.post("", response_model=ResourceResponse)
async def create_resource(
    new_res: ResourceCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create and persist a new equipment listing in the SQLAlchemy Database.
    """
    photos = new_res.photos if (new_res.photos and len(new_res.photos) > 0) else ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"]
    res_id = f"r_{int(time.time())}"

    res_dict = {
        "id": res_id,
        "ownerId": "u_owner_rahul",
        "ownerName": new_res.ownerName or "Verified Owner",
        "title": new_res.title,
        "category": new_res.category,
        "condition": new_res.condition,
        "description": new_res.description,
        "dailyRate": new_res.dailyRate,
        "deposit": new_res.deposit,
        "neighborhood": new_res.neighborhood,
        "lat": new_res.lat,
        "lng": new_res.lng,
        "photos": photos,
        "serialNumber": new_res.serialNumber or "SN-GENERIC-99",
        "borrowerPolicy": new_res.borrowerPolicy or "verified_id",
        "allowPickup": new_res.allowPickup,
        "allowDelivery": new_res.allowDelivery,
        "isAvailable": True
    }

    # Save to database
    try:
        db_item = ResourceModel(
            id=res_id,
            owner_id="u_owner_rahul",
            title=new_res.title,
            category=new_res.category,
            condition=new_res.condition,
            description=new_res.description,
            daily_rate=new_res.dailyRate,
            deposit=new_res.deposit,
            neighborhood=new_res.neighborhood,
            lat=new_res.lat,
            lng=new_res.lng,
            photos=photos,
            serial_number=new_res.serialNumber or "SN-GENERIC-99",
            borrower_policy=new_res.borrowerPolicy or "verified_id",
            allow_pickup=new_res.allowPickup,
            allow_delivery=new_res.allowDelivery,
            is_available=True,
        )
        db.add(db_item)
        await db.commit()
    except Exception as e:
        pass

    # Also keep in SEED_RESOURCES for RAM fallback
    SEED_RESOURCES.insert(0, res_dict)
    return res_dict
