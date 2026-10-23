import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Explicitly locate backend/.env file regardless of current working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = str(BACKEND_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "RE:USE API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Secrets
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "reuse_super_secret_production_jwt_key_2026")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "reuse_super_secret_production_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Cloud Database (Primary Marketplace: Supabase PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://reuse:reuse_password@localhost:5432/reuse_db"
    )
    SQLITE_FALLBACK_URL: str = os.getenv("SQLITE_FALLBACK_URL", "sqlite+aiosqlite:///./reuse_local.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Tiger Cloud / TimescaleDB Analytics Database (DemandPulse Time-Series)
    TIGER_DATABASE_URL: str = os.getenv("TIGER_DATABASE_URL", "")
    
    # AWS S3 Cloud Storage Credentials
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET_NAME: str = "reuse-gear-images-2026"
    S3_BUCKET_NAME: str = "reuse-gear-images-2026"
    
    # AI Engine & External APIs
    GROQ_API_KEY: str = ""
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    BREVO_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""

    class Config:
        env_file = ENV_FILE_PATH
        extra = "allow"

settings = Settings()

# Ensure S3 bucket name consistency
if not settings.S3_BUCKET_NAME and settings.AWS_S3_BUCKET_NAME:
    settings.S3_BUCKET_NAME = settings.AWS_S3_BUCKET_NAME
if not settings.AWS_S3_BUCKET_NAME and settings.S3_BUCKET_NAME:
    settings.AWS_S3_BUCKET_NAME = settings.S3_BUCKET_NAME
# RE:USE — Modular Circular Economy Architecture
