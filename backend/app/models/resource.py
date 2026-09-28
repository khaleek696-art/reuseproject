"""
Resource (Equipment Asset Listing) SQLAlchemy Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, ForeignKey
from app.core.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String(50), primary_key=True, index=True)
    owner_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    condition = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    daily_rate = Column(Float, nullable=False)
    deposit = Column(Float, nullable=False)
    neighborhood = Column(String(150), nullable=True)
    lat = Column(Float, nullable=False, default=18.5204)
    lng = Column(Float, nullable=False, default=73.8567)
    photos = Column(JSON, nullable=True)  # List of image URLs
    serial_number = Column(String(100), nullable=True)
    borrower_policy = Column(String(50), default="verified_id")
    allow_pickup = Column(Boolean, default=True)
    allow_delivery = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
