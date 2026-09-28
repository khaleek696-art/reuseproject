"""
Authentication API Router (OTP, Demo Login, KYC Upload)
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.storage import upload_file_to_s3_or_local
from app.models.user import User, UserRole, KYCStatus
from app.schemas.user import SendOTPRequest, VerifyOTPRequest, QuickLoginRequest, PasswordLoginRequest, TokenResponse, UserResponse


router = APIRouter(prefix="/auth", tags=["Auth"])

# Seed Demo Users dictionary for 1-click logins
DEMO_USERS = {
    "borrower": {
        "id": "u_borrower_aman",
        "name": "Aman Kumar (Student)",
        "email": "aman.k@campus.edu",
        "phone": "+919876543210",
        "role": UserRole.BORROWER.value,
        "trust_score": 4.92,
        "kyc_status": KYCStatus.VERIFIED.value
    },
    "owner": {
        "id": "u_owner_rahul",
        "name": "Rahul Sharma (Equipment Owner)",
        "email": "rahul.s@gearspace.in",
        "phone": "+919876543211",
        "role": UserRole.OWNER.value,
        "trust_score": 4.98,
        "kyc_status": KYCStatus.VERIFIED.value
    },
    "courier": {
        "id": "u_courier_vikram",
        "name": "Vikram Singh (Campus Express)",
        "email": "vikram@campusexpress.in",
        "phone": "+919876543212",
        "role": UserRole.COURIER.value,
        "trust_score": 4.85,
        "kyc_status": KYCStatus.VERIFIED.value
    },
    "admin": {
        "id": "u_admin_system",
        "name": "RE:USE Trust & Escrow Admin",
        "email": "admin@reuse.campus.edu",
        "phone": "+919876543213",
        "role": UserRole.ADMIN.value,
        "trust_score": 5.00,
        "kyc_status": KYCStatus.VERIFIED.value
    }
}

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
import random
from typing import Dict
from app.core.email import send_smtp_email

# Dynamic Active OTP Store (Maps target email/phone -> 6-digit OTP)
ACTIVE_OTPS: Dict[str, str] = {}

@router.post("/send-otp")
async def send_otp(request: SendOTPRequest, background_tasks: BackgroundTasks):
    """
    Send dynamic random 6-digit OTP to any user-entered email inbox (or mobile phone).
    """
    target = (request.email or request.phone or "").lower().strip()
    if not target:
        raise HTTPException(status_code=400, detail="Please enter a valid email address or phone number")

    # Generate dynamic random 6-digit OTP code
    otp_code = f"{random.randint(100000, 999999)}"
    ACTIVE_OTPS[target] = otp_code

    # Trigger real email sending via BackgroundTasks (Non-blocking)
    if "@" in target:
        background_tasks.add_task(send_smtp_email, target, otp_code)

    return {
        "success": True,
        "message": f"Dynamic OTP successfully sent to {target}",
        "otp_debug": otp_code,
    }

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """
    Verify 6-digit OTP strictly against generated OTP and return JWT session token.
    No mock OTP fallbacks permitted.
    """
    import logging
    auth_logger = logging.getLogger("reuse_auth")

    target = (request.email or request.phone or "").lower().strip()
    expected_otp = ACTIVE_OTPS.get(target)

    auth_logger.info(f"🔑 [OTP VERIFY CHECK] Target: {target} | Received OTP: '{request.otp}' | Expected OTP in Memory: '{expected_otp}'")

    # Strict OTP Validation: Require exact match with generated OTP for this email/phone
    if not expected_otp or request.otp.strip() != expected_otp:
        auth_logger.warning(f"❌ [OTP VERIFY FAILED] Mismatch for {target}: Got '{request.otp}', Needed '{expected_otp}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP! Please enter the latest 6-digit code sent to your Gmail inbox."
        )


    
    # Consume single-use OTP
    ACTIVE_OTPS.pop(target, None)
    
    # Return borrower profile
    user_data = DEMO_USERS["borrower"]
    token = create_access_token(subject=user_data["id"])
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/login-password", response_model=TokenResponse)
async def login_password(request: PasswordLoginRequest):
    """
    Direct Password-based Login endpoint.
    """
    target = (request.email or request.phone or "").lower().strip()
    if not target or not request.password:
        raise HTTPException(status_code=400, detail="Please enter valid email/phone and password")

    role_key = (request.role or "borrower").lower()
    if role_key not in DEMO_USERS:
        role_key = "borrower"

    user_data = dict(DEMO_USERS[role_key])
    if "@" in target:
        user_data["email"] = target
        user_data["name"] = target.split("@")[0].capitalize() + " (User)"

    token = create_access_token(subject=user_data["id"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/quick-login", response_model=TokenResponse)
async def quick_login(request: QuickLoginRequest):
    """
    1-Click Demo Login switcher for Borrower, Owner, Courier, and Admin.
    """
    role_key = request.role.lower()
    if role_key not in DEMO_USERS:
        role_key = "borrower"
    
    user_data = DEMO_USERS[role_key]
    token = create_access_token(subject=user_data["id"])
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(**user_data)
    )

@router.post("/kyc-upload")
async def kyc_upload(file: UploadFile = File(...)):
    """
    Upload KYC Document Proof (Student ID / Aadhaar Card / Driving License).
    Uploads to AWS S3 if credentials exist, fallback to local storage.
    """
    content = await file.read()
    success, doc_url, storage_type = await upload_file_to_s3_or_local(
        file_bytes=content,
        original_filename=file.filename or "kyc_document.png",
        folder_prefix="kyc"
    )
    return {
        "success": success,
        "kyc_status": "verified",
        "filename": file.filename,
        "doc_url": doc_url,
        "storage": storage_type
    }
