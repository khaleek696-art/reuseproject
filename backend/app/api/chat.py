"""
P2P Chat & In-App Messaging API Router
Handles message history retrieval and REST fallback message posting.
"""
from typing import List, Dict
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.api.websockets import manager

router = APIRouter(prefix="/chat", tags=["Chat"])

class SendMessageRequest(BaseModel):
    sender_id: str
    sender_name: str
    content: str
    message_type: str = "text"  # 'text', 'location', 'image'

class MessageResponse(BaseModel):
    id: str
    booking_id: str
    sender_id: str
    sender_name: str
    content: str
    message_type: str
    timestamp: str

# In-Memory Chat Storage (booking_id -> List[MessageResponse])
CHAT_HISTORY: Dict[str, List[MessageResponse]] = {
    "BK-98421": [
        MessageResponse(
            id="m1",
            booking_id="BK-98421",
            sender_id="u_owner_priya",
            sender_name="Priya Patel (Owner)",
            content="Hi Aman! Thanks for inquiring about Canon EOS 5D Mark IV Kit. It is in excellent condition and ready for local pickup.",
            message_type="text",
            timestamp="10:15 AM"
        ),
        MessageResponse(
            id="m2",
            booking_id="BK-98421",
            sender_id="u_borrower_aman",
            sender_name="Aman Kumar (Student)",
            content="Hi Priya! Does it include 2 extra batteries and the 128GB CFexpress card?",
            message_type="text",
            timestamp="10:16 AM"
        ),
        MessageResponse(
            id="m3",
            booking_id="BK-98421",
            sender_id="u_owner_priya",
            sender_name="Priya Patel (Owner)",
            content="Yes! 2 batteries, dual charger, and 128GB card are included in the hard case.",
            message_type="text",
            timestamp="10:17 AM"
        ),
        MessageResponse(
            id="m4",
            booking_id="BK-98421",
            sender_id="u_owner_priya",
            sender_name="Priya Patel (Owner)",
            content="📍 Pickup Location: Kothrud Campus Library Gate 2, near Coffee Day.",
            message_type="location",
            timestamp="10:18 AM"
        )
    ]
}

@router.get("/{booking_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(booking_id: str):
    """
    Get chat history for a specific booking thread.
    """
    return CHAT_HISTORY.get(booking_id, [])

@router.post("/{booking_id}/messages", response_model=MessageResponse)
async def send_chat_message(booking_id: str, request: SendMessageRequest):
    """
    Send a message via HTTP REST and broadcast to active WebSockets.
    """
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    now_str = datetime.now().strftime("%I:%M %p")
    new_msg = MessageResponse(
        id=f"msg_{int(datetime.now().timestamp() * 1000)}",
        booking_id=booking_id,
        sender_id=request.sender_id,
        sender_name=request.sender_name,
        content=request.content.strip(),
        message_type=request.message_type,
        timestamp=now_str
    )

    if booking_id not in CHAT_HISTORY:
        CHAT_HISTORY[booking_id] = []
    
    CHAT_HISTORY[booking_id].append(new_msg)

    # Broadcast real-time WebSocket event
    await manager.broadcast(booking_id, {
        "event": "NEW_MESSAGE",
        "message": new_msg.dict()
    })

    return new_msg
