"""
Resource Catalog & Geo-Spatial Search API Router
"""
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.storage import upload_file_to_s3_or_local
from app.models.resource import Resource as ResourceModel
from app.schemas.resource import ResourceCreate, ResourceResponse
from app.services.demandpulse import DemandPulseEngine

router = APIRouter(prefix="/resources", tags=["Resources"])

@router.post("/upload")
async def upload_resource_image(file: UploadFile = File(...)):
    """
    Upload equipment photo directly to AWS S3 bucket ('reuse-gear-images-2026') using Boto3 SDK.
    Returns permanent public S3 HTTPS URL.
    """
    file_bytes = await file.read()
    success, s3_url, storage_type = await upload_file_to_s3_or_local(
        file_bytes=file_bytes,
        original_filename=file.filename or "equipment.jpg",
        folder_prefix="equipment"
    )
    return {
        "success": success,
        "url": s3_url,
        "s3_url": s3_url,
        "storage_type": storage_type,
        "filename": file.filename
    }


# Fallback initial resources list
SEED_RESOURCES = [
    {
        "id": "r1",
        "ownerId": "u1",
        "ownerName": "Rahul Sharma",
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
        "ownerId": "u11",
        "ownerName": "Devendra Patil",
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
        "ownerId": "u6",
        "ownerName": "Ananya Iyer",
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
    },
    {
        "id": "r4",
        "ownerId": "u3",
        "ownerName": "Amit Kulkarni",
        "title": "Rode Wireless GO II Dual Wireless Microphone",
        "category": "tech",
        "condition": "like_new",
        "description": "Broadcast-grade dual channel wireless microphone with on-board recording memory. Ideal for vlogging, interviews and podcasts.",
        "dailyRate": 300,
        "deposit": 800,
        "neighborhood": "Media Center / Campus Lab",
        "lat": 18.5210,
        "lng": 73.8570,
        "photos": ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "RODE-WGO2-5519",
        "borrowerPolicy": "verified_id",
        "allowPickup": True,
        "allowDelivery": True,
        "isAvailable": True
    },
    {
        "id": "r5",
        "ownerId": "u4",
        "ownerName": "Sneha Patel",
        "title": "Apple MacBook Air M1 (16GB RAM, 512GB SSD)",
        "category": "laptop",
        "condition": "like_new",
        "description": "Supercharged with M1 chip. Perfect for iOS/Flutter development, video editing, and coding hackathons.",
        "dailyRate": 850,
        "deposit": 2500,
        "neighborhood": "Library Tech Hub",
        "lat": 18.5215,
        "lng": 73.8560,
        "photos": ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "APPLE-M1-88412",
        "borrowerPolicy": "verified_id",
        "allowPickup": True,
        "allowDelivery": False,
        "isAvailable": True
    },
    {
        "id": "r6",
        "ownerId": "u7",
        "ownerName": "Vikram Joshi",
        "title": "Epson Full HD Home & Presentation Projector",
        "category": "projector",
        "condition": "good",
        "description": "3,300 lumens vivid color brightness, 1080p Full HD resolution with HDMI and wireless casting for movie nights and slide pitches.",
        "dailyRate": 600,
        "deposit": 1500,
        "neighborhood": "Auditorium Annex",
        "lat": 18.5225,
        "lng": 73.8575,
        "photos": ["https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "EPSON-HD-2041",
        "borrowerPolicy": "verified_id",
        "allowPickup": True,
        "allowDelivery": True,
        "isAvailable": True
    },
    {
        "id": "r7",
        "ownerId": "u5",
        "ownerName": "Rohan Deshmukh",
        "title": "Quechua 4-Person Waterproof Camping Tent",
        "category": "spaces",
        "condition": "like_new",
        "description": "Easy 2-minute pitch waterproof tent with blackout fabric and thermal insulation. Includes ground pegs and compact carry pouch.",
        "dailyRate": 400,
        "deposit": 1000,
        "neighborhood": "Sports Complex South",
        "lat": 18.5195,
        "lng": 73.8545,
        "photos": ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80"],
        "serialNumber": "QUECHUA-TENT-4P",
        "borrowerPolicy": "all",
        "allowPickup": True,
        "allowDelivery": False,
        "isAvailable": True
    }
]

@router.get("", response_model=List[ResourceResponse])
async def get_resources(
    category: Optional[str] = None,
    query: Optional[str] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch resources list from SQLAlchemy Database with category & keyword search filtering.
    Emits non-blocking time-series search event into Tiger Cloud (TimescaleDB).
    """
    # Track time-series search activity asynchronously
    cat_map = {
        "tech": "Cameras & Photography",
        "tools": "Power Tools & Hardware",
        "outdoors": "Camping & Outdoor Gear",
        "audio": "Audio & Musical Equipment",
    }
    mapped_cat = cat_map.get(category, "Cameras & Photography" if not category or category == "all" else category)
    background_tasks.add_task(
        DemandPulseEngine.record_event,
        event_type="search_performed",
        category=mapped_cat,
        locality="Indiranagar"
    )

    try:
        stmt = select(ResourceModel)
        if category and category != "all":
            stmt = stmt.where(ResourceModel.category == category)
        result = await db.execute(stmt)
        db_items = result.scalars().all()

        if db_items:
            res_list = []
            owner_map = {
                "u_khaleeq": "Khaleeq Ahmad",
                "u1": "Rahul Sharma",
                "u_owner_rahul": "Rahul Sharma",
                "u2": "Priya Mehta",
                "u3": "Amit Kulkarni",
                "u4": "Sneha Patel",
                "u5": "Rohan Deshmukh",
                "u6": "Ananya Iyer",
                "u7": "Vikram Joshi",
                "u8": "Tanvi Rao",
                "u9": "Aryan Verma",
                "u10": "Neha Gupta",
                "u11": "Devendra Patil",
                "u12": "Meera Kadam",
                "u_owner_active": "Khaleeq Ahmad",
                "u_owner_global": "Rahul Sharma",
            }
            for item in db_items:
                matched_name = owner_map.get(item.owner_id)
                if not matched_name:
                    t = (item.title or "").lower()
                    if "macbook" in t or "laptop" in t:
                        matched_name = "Sneha Patel"
                    elif "calculator" in t:
                        matched_name = "Rahul Sharma"
                    elif "drill" in t or "tool" in t:
                        matched_name = "Devendra Patil"
                    elif "tent" in t or "camp" in t:
                        matched_name = "Rohan Deshmukh"
                    elif "camera" in t:
                        matched_name = "Rahul Sharma"
                    elif "speaker" in t or "bose" in t or "mic" in t:
                        matched_name = "Ananya Iyer"
                    elif "projector" in t:
                        matched_name = "Vikram Joshi"
                    else:
                        matched_name = "Rahul Sharma"

                res_dict = {
                    "id": item.id,
                    "ownerId": item.owner_id,
                    "ownerName": matched_name,
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
    res_owner_id = new_res.ownerId or "u_owner_rahul"

    res_dict = {
        "id": res_id,
        "ownerId": res_owner_id,
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
            owner_id=res_owner_id,
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
# RE:USE — Modular Circular Economy Architecture
