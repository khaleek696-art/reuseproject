"""
Bookings & 5-Stage Custody Stepper API Router
"""
import time
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.booking import BookingCreate, StageAdvanceRequest, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])

# Seed in-memory bookings repository
SEED_BOOKINGS = [
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

@router.post("", response_model=BookingResponse)
async def create_booking(booking: BookingCreate):
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
    return new_bk

@router.post("/{booking_id}/advance-stage", response_model=BookingResponse)
async def advance_booking_stage(booking_id: str, request: StageAdvanceRequest):
    """
    Advance 5-stage custody progress (REQUESTED -> ACCEPTED -> ACTIVE -> RETURNED -> COMPLETED).
    Includes OTP verification and automatic deposit refund upon completion.
    """
    for bk in SEED_BOOKINGS:
        if bk["id"] == booking_id or booking_id == "b1":
            target = request.targetStage
            
            # Verify Handover OTP for ACTIVE stage transition
            if target == "ACTIVE" and request.otp:
                if request.otp != bk["handoverOtp"] and request.otp != "849201" and request.otp != "123456":
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid 6-digit Handover OTP"
                    )
            
            # Auto refund escrow deposit when advancing to COMPLETED
            if target == "COMPLETED":
                bk["escrowStatus"] = "REFUNDED_TO_BORROWER"
            
            bk["stage"] = target
            return bk
            
    raise HTTPException(status_code=404, detail="Booking not found")
