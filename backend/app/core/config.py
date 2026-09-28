"""
RE:USE Platform Core Configuration Module
"""
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RE:USE Hyperlocal Circular Marketplace API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "reuse_super_secret_production_jwt_key_2026_change_in_env"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database - PostgreSQL + PostGIS (AsyncPG driver)
    # Default fallback to SQLite async or PostgreSQL URI
    DATABASE_URL: str = "postgresql+asyncpg://reuse:reuse_password@localhost:5432/reuse_db"
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./reuse_local.db"
    
    # Redis Cache & WebSockets PubSub
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS Allowed Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://reuse.campus.edu"
    ]
    
    # AWS S3 Storage Uploads (KYC & Photos)
    S3_BUCKET_NAME: str = "reuse-app-storage"
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # Resend API & Gmail Real OTP Email Settings
    RESEND_API_KEY: str = ""
    MAIL_USERNAME: str = "reuse.marketplace.help@gmail.com"
    MAIL_PASSWORD: str = ""

    # Twilio & SendGrid & Brevo Official Communications Engine
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    SENDGRID_API_KEY: str = ""
    BREVO_API_KEY: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Groq AI Cloud API Settings (Llama 3.3 Ultra-Fast LPU Engine)
    GROQ_API_KEY: str = ""

    # Razorpay Payment Gateway & UPI Escrow Settings
    RAZORPAY_KEY_ID: str = "rzp_test_REUSE_DEMO_KEY_2026"
    RAZORPAY_KEY_SECRET: str = "reuse_secret_key_demo"
    
    class Config:
        case_sensitive = True
        env_file = [".env", "backend/.env"]
        extra = "ignore"

settings = Settings()
