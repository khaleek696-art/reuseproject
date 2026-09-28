"""
RE:USE Hyperlocal Circular Marketplace — FastAPI Backend Application Entrypoint
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db_connection
from app.core.redis import redis_manager
from app.api.router import api_router

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reuse_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Events (Startup & Shutdown)
    Automatically initializes DB connection (with seamless SQLite fallback if Postgres is down)
    and Redis connection pool upon startup.
    """
    logger.info("Initializing RE:USE FastAPI application...")
    
    # Auto-initialize DB connection with seamless fallback
    await init_db_connection()
    
    # Initialize Redis Pool
    await redis_manager.connect()
    
    yield
    
    logger.info("Shutting down RE:USE application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Production CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Master API Router v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    """
    Root Welcome Endpoint
    """
    return {
        "message": "Welcome to RE:USE Hyperlocal Marketplace API Gateway",
        "docs": "/api/v1/docs",
        "health": "/health",
        "api_v1": "/api/v1"
    }

@app.get("/health")
async def health_check():
    """
    Healthcheck Endpoint for Load Balancers & Monitoring Services
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global Unhandled Exception Handler (Prevents backend crash under high concurrency)
    """
    logger.error(f"Unhandled system error on path {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected server error occurred. Handled safely by RE:USE resilient engine.",
            "path": request.url.path
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
