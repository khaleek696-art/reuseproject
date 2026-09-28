"""
Pydantic Schemas for Users & Auth
"""
from typing import Optional
from pydantic import BaseModel, EmailStr

class SendOTPRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    otp: str

class QuickLoginRequest(BaseModel):
    role: str  # borrower, owner, courier, admin

class PasswordLoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    role: Optional[str] = "borrower"


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    role: str
    kyc_status: str
    trust_score: float
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
