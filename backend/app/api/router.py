"""
Master API Router v1 Aggregator
"""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.resources import router as resources_router
from app.api.matches import router as matches_router
from app.api.bookings import router as bookings_router
from app.api.websockets import router as ws_router
from app.api.admin import router as admin_router
from app.api.chat import router as chat_router
from app.api.payments import router as payments_router
from app.api.ai_assistant import router as ai_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(resources_router)
api_router.include_router(matches_router)
api_router.include_router(bookings_router)
api_router.include_router(ws_router)
api_router.include_router(chat_router)
api_router.include_router(payments_router)
api_router.include_router(ai_router)
api_router.include_router(admin_router)
