"""
Escrow Dispute SQLAlchemy Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.core.database import Base

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(50), primary_key=True, index=True)
    booking_id = Column(String(50), ForeignKey("bookings.id"), nullable=False)
    initiator_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="OPEN")  # OPEN, RESOLVED_REFUND, RESOLVED_RELEASE
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
