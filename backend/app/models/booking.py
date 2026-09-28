"""
Booking & 5-Stage Custody Stepper SQLAlchemy Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SQLEnum
import enum
from app.core.database import Base

class BookingStage(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    ACTIVE = "ACTIVE"
    RETURNED = "RETURNED"
    COMPLETED = "COMPLETED"

class EscrowStatus(str, enum.Enum):
    HELD = "HELD"
    RELEASED_TO_OWNER = "RELEASED_TO_OWNER"
    REFUNDED_TO_BORROWER = "REFUNDED_TO_BORROWER"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(50), primary_key=True, index=True)
    resource_id = Column(String(50), ForeignKey("resources.id"), nullable=False)
    borrower_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    owner_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    total_amount = Column(Float, nullable=False)
    deposit_amount = Column(Float, nullable=False)
    stage = Column(String(30), default=BookingStage.REQUESTED.value)
    handover_otp = Column(String(6), default="849201")
    return_otp = Column(String(6), default="918234")
    escrow_status = Column(String(30), default=EscrowStatus.HELD.value)
    created_at = Column(DateTime, default=datetime.utcnow)
