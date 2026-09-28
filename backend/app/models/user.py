"""
User SQLAlchemy Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Enum as SQLEnum
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    BORROWER = "borrower"
    OWNER = "owner"
    COURIER = "courier"
    ADMIN = "admin"

class KYCStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    role = Column(String(20), default=UserRole.BORROWER.value)
    kyc_status = Column(String(20), default=KYCStatus.PENDING.value)
    kyc_doc_type = Column(String(50), nullable=True)
    kyc_doc_url = Column(String(255), nullable=True)
    trust_score = Column(Float, default=4.90)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
