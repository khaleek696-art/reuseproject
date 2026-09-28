"""
P2P Chat Message SQLAlchemy Model
"""
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from app.core.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(50), primary_key=True, index=True)
    booking_id = Column(String(50), ForeignKey("bookings.id"), nullable=False, index=True)
    sender_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
