"""
Rental Review SQLAlchemy Model for TrustLens Reputation System
Tracks bidirectional reviews tied to completed rentals.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Boolean, ForeignKey
from app.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(50), primary_key=True, index=True)
    booking_id = Column(String(50), ForeignKey("bookings.id"), nullable=False, index=True)
    reviewer_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    reviewee_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Float, nullable=False)  # 1.0 to 5.0
    condition_rating = Column(Float, default=5.0)
    communication_rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=True)
    is_eligible = Column(Boolean, default=True)  # True if linked to clean completed rental without active dispute
    created_at = Column(DateTime, default=datetime.utcnow)
