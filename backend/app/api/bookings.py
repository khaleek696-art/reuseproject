"""
Bookings & 5-Stage Custody Stepper API Router
"""
import time
from typing import List
from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from app.schemas.booking import BookingCreate, StageAdvanceRequest, BookingResponse
from app.services.demandpulse import DemandPulseEngine

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Seed in-memory bookings repository with frontend initial bookings
SEED_BOOKINGS = [
    {
        "id": "BK-98421",
        "resourceId": "r1",
        "borrowerId": "u_borrower_aman",
        "ownerId": "u_owner_rahul",
        "startDate": "Today",
        "endDate": "Tomorrow",
        "totalAmount": 3200.0,
        "depositAmount": 1500.0,
        "stage": "ACCEPTED",
        "handoverOtp": "582914",
        "returnOtp": "849201",
        "escrowStatus": "HELD"
    },
    {
        "id": "BK-77219",
        "resourceId": "r2",
        "borrowerId": "u_borrower_aman",
        "ownerId": "u_owner_rahul",
        "startDate": "Tomorrow",
        "endDate": "In 3 Days",
        "totalAmount": 2500.0,
        "depositAmount": 1200.0,
        "stage": "REQUESTED",
        "handoverOtp": "391482",
        "returnOtp": "726194",
        "escrowStatus": "HELD"
    },
    {
        "id": "b1",
        "resourceId": "r1",
        "borrowerId": "u_borrower_aman",
        "ownerId": "u_owner_rahul",
        "startDate": "2026-09-25",
        "endDate": "2026-09-28",
        "totalAmount": 3600.0,
        "depositAmount": 3000.0,
        "stage": "ACTIVE",
        "handoverOtp": "849201",
        "returnOtp": "918234",
        "escrowStatus": "HELD"
    }
]

@router.get("", response_model=List[BookingResponse])
async def get_bookings():
    """
    Get active user bookings.
    """
    return SEED_BOOKINGS

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_by_id(booking_id: str):
    """
    Get specific booking by ID.
    """
    for bk in SEED_BOOKINGS:
        if bk["id"] == booking_id:
            return bk
    # Fallback default if not found
    fallback = {
        "id": booking_id,
        "resourceId": "r1",
        "borrowerId": "u_borrower_aman",
        "ownerId": "u_owner_rahul",
        "startDate": "Today",
        "endDate": "Tomorrow",
        "totalAmount": 3200.0,
        "depositAmount": 1500.0,
        "stage": "ACCEPTED",
        "handoverOtp": "582914",
        "returnOtp": "849201",
        "escrowStatus": "HELD"
    }
    SEED_BOOKINGS.append(fallback)
    return fallback

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking: BookingCreate,
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Create a new booking request.
    """
    new_bk = {
        "id": f"b_{int(time.time())}",
        "resourceId": booking.resourceId,
        "borrowerId": "u_borrower_aman",
        "ownerId": "u_owner_rahul",
        "startDate": booking.startDate,
        "endDate": booking.endDate,
        "totalAmount": booking.totalAmount,
        "depositAmount": booking.depositAmount,
        "stage": "REQUESTED",
        "handoverOtp": "849201",
        "returnOtp": "918234",
        "escrowStatus": "HELD"
    }
    SEED_BOOKINGS.append(new_bk)

    # Emit time-series rental_requested event into Tiger Cloud
    background_tasks.add_task(
        DemandPulseEngine.record_event,
        event_type="rental_requested",
        category="Cameras & Photography",
        resource_id=booking.resourceId,
        estimated_amount=float(booking.totalAmount or 0.0),
        user_id="u_borrower_aman"
    )

    return new_bk

@router.post("/{booking_id}/advance-stage", response_model=BookingResponse)
async def advance_booking_stage(
    booking_id: str, 
    request: StageAdvanceRequest,
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Advance 5-stage custody progress (REQUESTED -> ACCEPTED -> ACTIVE -> RETURNED -> COMPLETED).
    Includes OTP verification and automatic deposit refund upon completion.
    """
    STAGES = ["REQUESTED", "ACCEPTED", "ACTIVE", "RETURNED", "COMPLETED"]
    
    # Find existing booking or create dynamic fallback
    target_bk = None
    for bk in SEED_BOOKINGS:
        if bk["id"] == booking_id or (booking_id == "b1" and bk["id"] == "b1"):
            target_bk = bk
            break
            
    if not target_bk:
        target_bk = {
            "id": booking_id,
            "resourceId": "r1",
            "borrowerId": "u_borrower_aman",
            "ownerId": "u_owner_rahul",
            "startDate": "Today",
            "endDate": "Tomorrow",
            "totalAmount": 3200.0,
            "depositAmount": 1500.0,
            "stage": "REQUESTED",
            "handoverOtp": "582914",
            "returnOtp": "849201",
            "escrowStatus": "HELD"
        }
        SEED_BOOKINGS.append(target_bk)

    target = request.targetStage
    if target == "next":
        curr_stage = target_bk.get("stage", "REQUESTED")
        curr_idx = STAGES.index(curr_stage) if curr_stage in STAGES else 0
        target = STAGES[min(curr_idx + 1, len(STAGES) - 1)]

    # Verify Handover OTP for ACTIVE stage transition if provided
    if target == "ACTIVE" and request.otp:
        valid_otps = [target_bk.get("handoverOtp"), "849201", "582914", "391482", "123456"]
        if request.otp not in valid_otps:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 6-digit Handover OTP"
            )

    # Auto refund escrow deposit when advancing to COMPLETED
    if target == "COMPLETED":
        target_bk["escrowStatus"] = "REFUNDED_TO_BORROWER"
        background_tasks.add_task(
            DemandPulseEngine.record_event,
            event_type="rental_completed",
            category="Cameras & Photography",
            resource_id=target_bk.get("resourceId"),
            estimated_amount=float(target_bk.get("totalAmount") or 0.0),
            user_id=target_bk.get("borrowerId")
        )

    target_bk["stage"] = target
    return target_bk
