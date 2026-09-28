"""
Real-Time WebSockets Router for P2P Chat & Stepper Updates
"""
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["WebSockets"])

class ConnectionManager:
    def __init__(self):
        # Maps booking_id to active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, booking_id: str, websocket: WebSocket):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)

    def disconnect(self, booking_id: str, websocket: WebSocket):
        if booking_id in self.active_connections:
            if websocket in self.active_connections[booking_id]:
                self.active_connections[booking_id].remove(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]

    async def broadcast(self, booking_id: str, message: dict):
        if booking_id in self.active_connections:
            for connection in self.active_connections[booking_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/chat/{booking_id}")
async def websocket_chat_endpoint(websocket: WebSocket, booking_id: str):
    """
    WebSocket endpoint for real-time P2P Borrower-Owner Chat.
    """
    await manager.connect(booking_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event", "NEW_MESSAGE")

            if event_type == "TYPING":
                await manager.broadcast(booking_id, {
                    "event": "TYPING",
                    "bookingId": booking_id,
                    "senderId": data.get("senderId", ""),
                    "senderName": data.get("senderName", "User"),
                    "isTyping": data.get("isTyping", True)
                })
            else:
                msg_id = data.get("id") or f"msg_{data.get('senderId', 'user')}_{data.get('timestamp', '')}"
                msg_payload = {
                    "event": "NEW_MESSAGE",
                    "bookingId": booking_id,
                    "message": {
                        "id": msg_id,
                        "booking_id": booking_id,
                        "sender_id": data.get("senderId", "u_user"),
                        "sender_name": data.get("senderName", "User"),
                        "content": data.get("content", ""),
                        "message_type": data.get("message_type", "text"),
                        "timestamp": data.get("timestamp", "Just now")
                    }
                }
                await manager.broadcast(booking_id, msg_payload)

    except WebSocketDisconnect:
        manager.disconnect(booking_id, websocket)
