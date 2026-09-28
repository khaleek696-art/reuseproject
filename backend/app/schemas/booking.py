"""
Pydantic Schemas for Bookings & 5-Stage Stepper
"""
from typing import Optional
from pydantic import BaseModel

class BookingCreate(BaseModel):
    resourceId: str
    startDate: str
    endDate: str
    totalAmount: float
    depositAmount: float

class StageAdvanceRequest(BaseModel):
    targetStage: str  # REQUESTED, ACCEPTED, ACTIVE, RETURNED, COMPLETED
    otp: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    resourceId: str
    borrowerId: str
    ownerId: str
    startDate: str
    endDate: str
    totalAmount: float
    depositAmount: float
    stage: str
    handoverOtp: str
    returnOtp: str
    escrowStatus: str

    class Config:
        from_attributes = True
