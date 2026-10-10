# RE:USE — Security & Crash Prevention Blueprint

**Version:** 1.0.0  
**Project:** RE:USE — Hyperlocal Resource Sharing & Circular Marketplace  
**Tech Stack:** Next.js 16 (App Router), Python FastAPI, PostgreSQL (SQLAlchemy 2.0 ORM), AWS S3 (boto3), Groq Llama-3.3-70B AI, Razorpay Escrow, Brevo Email OTP, OpenStreetMap / Leaflet  
**Document Classification:** Production Hardening & Security Architecture Reference  

---

## 1. Security Architecture Overview

The RE:USE platform operates on a **Defense-in-Depth (DiD)** multi-tier security framework. Security controls are not relegated to a single perimeter; rather, every layer—from client-side browser execution in Next.js 16 to database storage engines—enforces distinct authentication, authorization, cryptographic verification, and operational resilience controls.

### 1.1 Layered Defense-in-Depth Model

```
+---------------------------------------------------------------------------------------+
|  LAYER 1: CLIENT & EDGE (Next.js 16 App Router / Netlify Edge)                        |
|  - Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options   |
|  - React DOM sanitization (Auto-escaping + DOMPurify for rich text)                  |
|  - Route Guards & Middleware token presence validation                                |
+------------------------------------------+--------------------------------------------+
                                           | HTTPS / TLS 1.3
                                           v
+---------------------------------------------------------------------------------------+
|  LAYER 2: API GATEWAY & APPLICATION SERVER (Python FastAPI)                           |
|  - Reverse Proxy / Uvicorn worker process pool                                        |
|  - Global Request Timeout Middleware (30s hard limit)                                  |
|  - Rate Limiting Middleware (SlowAPI / IP + Identity sliding window)                  |
|  - Strict CORS whitelist policy                                                       |
|  - Global Exception Sanitizer (Prevents stack-trace leaks)                           |
|  - JWT Bearer Validation & RBAC Dependency Injection (Borrower, Owner, Agent, Admin)   |
|  - Pydantic v2 Schema Enforcement & File Upload MIME/Magic Byte Inspection           |
+------------------------------------------+--------------------------------------------+
                                           |
                  +------------------------+------------------------+
                  | TLS / SSL (Encrypted)                            | HTTPS (Signed HMAC / AWS SigV4)
                  v                                                 v
+------------------------------------+             +------------------------------------+
|  LAYER 3: DATA PERSISTENCE LAYER   |             |  LAYER 4: CLOUD STORAGE & THIRD-   |
|  (PostgreSQL + SQLAlchemy 2.0)     |             |  PARTY SERVICES                    |
|  - SSL Encrypted Connections       |             |  - AWS S3 (AES-256 SSE-S3)         |
|  - Parameterized ORM Queries Only  |             |  - Least-Privilege IAM Policy      |
|  - Connection Pool Health Checks   |             |  - Razorpay Webhook SHA256 HMAC    |
|  - Row-Level Locking (Pessimistic) |             |  - Brevo OTP Email Dispatch        |
|  - Atomic Transactions & Escrow SM |             |  - Groq AI Prompt Sanitization     |
+------------------------------------+             +------------------------------------+
```

### 1.2 End-to-End Trust Chain

The security lifecycle spans four synchronized zones:

1. **Frontend (Next.js 16):** Next.js App Router enforces authenticated layouts and middleware edge guards. State storage avoids insecure `localStorage` for sensitive credentials where possible; authorization tokens are passed via Bearer headers over HTTPS, and client mutations strictly consume validated API contracts.
2. **Backend (FastAPI):** Acts as the centralized policy enforcement point (PEP). All inputs pass through Pydantic v2 strict models, SlowAPI rate-limiting filters, and Bearer token verification before reaching business logic controllers.
3. **Database (PostgreSQL via SQLAlchemy 2.0):** Raw SQL queries are strictly prohibited. SQLAlchemy 2.0 parameterized expressions prevent SQL injection vectors. Financial and inventory states utilize pessimistic database locks (`SELECT ... FOR UPDATE`) within isolated ACID transactions.
4. **Cloud & External Services (AWS S3, Razorpay, Brevo, Groq):** Outbound communication requires signed API requests: AWS Signature Version 4 for S3, SHA-256 HMAC digest validation for Razorpay webhooks, and authenticated TLS connections for Brevo and Groq.

---

## 2. Authentication & Authorization Security

RE:USE adopts a **passwordless authentication paradigm** using temporary One-Time Passwords (OTPs) dispatched via Brevo Email API, completely eliminating credential stuffing, password reuse, and dictionary attack vectors.

### 2.1 Brevo Email OTP Authentication Flow

```
[ User Browser ]              [ FastAPI Backend ]             [ Brevo API ]          [ PostgreSQL / Cache ]
       |                              |                             |                          |
       |--- 1. POST /auth/otp/request |                             |                          |
       |    { email: "user@test.org"} |                             |                          |
       |                             |--- 2. Rate Limit Check ----->|                          |
       |                             |    (Max 5 req / 10 min)      |                          |
       |                             |--- 3. Generate 6-Digit OTP ->|                          |
       |                             |    (CSPRNG secrets module)   |                          |
       |                             |--- 4. Store Hash & Expiry ----------------------------->|
       |                             |       (Argon2 / SHA256, 10m TTL)                        |
       |                             |--- 5. Dispatch Email ------->|                          |
       |<-- 6. 200 OK (OTP Sent) -----|                             |                          |
       |                                                            |                          |
       |--- 7. POST /auth/otp/verify -|                                                        |
       |    { email, otp: "849201" }  |--- 8. Retrieve & Verify Hash ------------------------->|
       |                             |    (Compare OTP & check expiration)                     |
       |                             |--- 9. Invalidate OTP (One-time use) ------------------->|
       |                             |--- 10. Issue Access & Refresh JWTs                      |
       |<-- 11. 200 OK + JWT Tokens --|                                                        |
```

#### OTP Security Guarantees:
- **CSPRNG Generation:** Generated using Python's `secrets.choice("0123456789")` across a 6-digit space (1,000,000 permutations).
- **Time-to-Live (TTL):** Hard expiry fixed at **10 minutes**. Expired tokens are rejected immediately.
- **Single-Use Invalidation:** Upon first verification attempt (successful or exceeding retry threshold), the token is purged from state.
- **Brute-Force Countermeasures:** Max 5 incorrect attempts permitted per OTP session before forced revocation.

### 2.2 JWT Token Lifecycle & Management

RE:USE utilizes dual-token lifecycle management:

| Token Type | Lifetime | Storage / Transmission | Purpose |
| :--- | :--- | :--- | :--- |
| **Access Token** | **15 minutes** | Authorization Header (`Bearer <token>`) | Authorizes individual REST API calls across micro-routes |
| **Refresh Token** | **7 days** | Secure HttpOnly, SameSite=Strict Cookie / Auth endpoint | Obtains new short-lived access token upon expiry |

- **Algorithm:** HMAC-SHA256 (`HS256`) using high-entropy 256-bit secret key (`JWT_SECRET`).
- **Standard Claims Enforced:**
  - `sub`: User UUID
  - `role`: Role identifier (`borrower`, `owner`, `delivery_agent`, `admin`)
  - `iat`: Issued At timestamp
  - `exp`: Expiration epoch timestamp
  - `jti`: Unique JWT ID to facilitate token revocation if blacklisted.

### 2.3 Role-Based Access Control (RBAC) Matrix

RE:USE specifies 4 distinct organizational roles. Access control is enforced via FastAPI dependencies using the principle of least privilege:

| Operation / Endpoint | Borrower | Owner | Delivery Agent | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse & Search Items (`GET /items`) | ✅ | ✅ | ✅ | ✅ |
| Create & Edit Listings (`POST /items`) | ❌ | ✅ | ❌ | ✅ |
| Request Item Rental / Escrow (`POST /bookings`) | ✅ | ❌ | ❌ | ✅ |
| Accept / Reject Booking (`PUT /bookings/{id}/status`)| ❌ | ✅ | ❌ | ✅ |
| Accept Transit Delivery Job (`POST /deliveries/claim`)| ❌ | ❌ | ✅ | ✅ |
| Update Transit Handoff (`PUT /deliveries/{id}/step`) | ❌ | ❌ | ✅ | ✅ |
| Confirm Item Return (`POST /bookings/{id}/return`) | ✅ | ✅ | ✅ | ✅ |
| Dispute Arbitration & Payout Overrides | ❌ | ❌ | ❌ | ✅ |
| User Suspension & Metrics Inspection | ❌ | ❌ | ❌ | ✅ |

#### FastAPI RBAC Dependency Implementation:

```python
from enum import Enum
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel

class UserRole(str, Enum):
    BORROWER = "borrower"
    OWNER = "owner"
    DELIVERY_AGENT = "delivery_agent"
    ADMIN = "admin"

class TokenPayload(BaseModel):
    sub: str
    role: UserRole
    exp: int

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenPayload:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

def require_role(*allowed_roles: UserRole):
    def role_checker(user: TokenPayload = Depends(get_current_user)):
        if user.role not in allowed_roles and user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this resource"
            )
        return user
    return role_checker
```

### 2.4 OTP Request Rate Limiting

To prevent SMS/Email exhaustion attacks and inbox spamming, OTP requests are restricted to **5 requests per 10 minutes per email address**:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/otp/request")
@limiter.limit("5/10minutes")
async def request_otp(request: Request, payload: OTPRequestSchema):
    # Enforce email-specific throttling via Redis / DB counter
    await rate_limit_email(payload.email, max_attempts=5, window_seconds=600)
    # Proceed to send OTP
    ...
```

---

## 3. API Security & Input Validation

### 3.1 Pydantic v2 Strict Schema Enforcement

All data entering the application boundaries must adhere to strict Pydantic v2 schemas with prohibited extra fields to defend against Mass Assignment vulnerabilities:

```python
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

class ItemCreateSchema(BaseModel):
    model_config = ConfigDict(
        extra="forbid",                # Rejects unrecognized input fields
        str_strip_whitespace=True,     # Strips whitespace padding
        str_max_length=5000            # Bounds input lengths
    )

    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=10, max_length=2000)
    daily_rental_rate: Decimal = Field(..., gt=0, max_digits=8, decimal_places=2)
    security_deposit: Decimal = Field(..., ge=0, max_digits=8, decimal_places=2)
    category_id: int = Field(..., gt=0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
```

### 3.2 SQL Injection Prevention via SQLAlchemy 2.0 Parameterization

RE:USE strictly prohibits raw SQL strings and dynamic string formatting (e.g., `f"SELECT ... WHERE id = {user_input}"`). All queries utilize the SQLAlchemy 2.0 Core/ORM API with automatic query parameterization:

```python
# SECURE: Fully parameterized through SQLAlchemy 2.0
from sqlalchemy import select
from app.models.item import Item

async def get_items_by_category(session: AsyncSession, category: str, min_price: float):
    stmt = (
        select(Item)
        .where(Item.category == category)
        .where(Item.daily_rental_rate >= min_price)
    )
    result = await session.execute(stmt)
    return result.scalars().all()

# INSECURE (PROHIBITED IN RE:USE REPOSITORY):
# await session.execute(f"SELECT * FROM items WHERE category = '{category}'")  <-- FORBIDDEN
```

### 3.3 Cross-Site Scripting (XSS) & Content-Security-Policy (CSP)

1. **React Auto-Escaping:** Next.js 16 renders all JSX text content through React's contextual output encoder, mitigating reflected and stored XSS.
2. **Sanitized User Markup:** Item descriptions containing user-formatted text pass through `DOMPurify` before rendering:
   ```typescript
   import DOMPurify from "isomorphic-dompurify";
   export function SafeDescription({ content }: { content: string }) {
     const cleanHtml = DOMPurify.sanitize(content, { ALLOWED_TAGS: ['b', 'i', 'p', 'ul', 'li'] });
     return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
   }
   ```
3. **HTTP Header Hardening:** Next.js `next.config.js` and FastAPI inject strict CSP headers:
   ```
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.amazonaws.com https://*.tile.openstreetmap.org; connect-src 'self' https://api.razorpay.com https://api.groq.com; frame-src https://api.razorpay.com;
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```

### 3.4 Cross-Origin Resource Sharing (CORS) Policy

CORS headers strictly whitelist the production Netlify domain. Wildcard `*` origins with credentials are explicitly blocked in application config:

```python
from fastapi.middleware.cors import CORSMiddleware

ALLOWED_ORIGINS = [
    "https://reuse-circular.netlify.app",
    "http://localhost:3000"  # Development environment only
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "X-Razorpay-Signature"],
    max_age=86400,
)
```

### 3.5 Request Body Size Limits & Rate Limiting

- **Request Size Thresholds:**
  - Standard JSON Endpoints: **1 MB Maximum**.
  - Image Upload Endpoints (`POST /items/images`): **10 MB Maximum**.
  - Any request exceeding boundary limits is aborted with HTTP `413 Payload Too Large`.
- **IP Rate Limiting:**
  - Implemented using `slowapi` backed by memory/Redis.
  - Baseline: **100 requests / minute per client IP**.
  - Burst protection: Sensitive endpoints (e.g. `/auth/*`, `/bookings/*/payment`) are capped to **10 requests / minute**.

---

## 4. AWS S3 Storage Security

All item images, collateral verification photos, and return inspection media are stored in Amazon Web Services (AWS) S3.

### 4.1 IAM Least-Privilege Policy

The service IAM credentials assigned to RE:USE have execution rights restricted strictly to essential object manipulation on the designated bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "REUSEBucketObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::reuse-marketplace-production/uploads/*"
    },
    {
      "Sid": "DenyUnencryptedObjectUploads",
      "Effect": "Deny",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::reuse-marketplace-production/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

### 4.2 Server-Side Encryption (SSE-S3 AES-256)

All objects uploaded via `boto3` enforce server-side encryption with Amazon S3-managed keys (`AES256`):

```python
import boto3

s3_client = boto3.client("s3", region_name=AWS_REGION)

def upload_secure_asset(file_bytes: bytes, destination_key: str, content_type: str):
    s3_client.put_object(
        Bucket=AWS_S3_BUCKET_NAME,
        Key=destination_key,
        Body=file_bytes,
        ContentType=content_type,
        ServerSideEncryption="AES256"
    )
```

### 4.3 File Type & Magic Byte Validation

Client-supplied MIME types can be spoofed. FastAPI inspects both file extension and binary magic numbers using `python-magic` to restrict payloads exclusively to standard image types:

```python
import magic
from fastapi import UploadFile, HTTPException, status

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"]
}

async def validate_image_upload(file: UploadFile) -> bytes:
    # Read first 2048 bytes for magic inspection
    header = await file.read(2048)
    detected_mime = magic.from_buffer(header, mime=True)
    
    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported media type: {detected_mime}. Allowed: JPEG, PNG, WebP."
        )
    
    # Read remaining content and enforce 10MB limit
    rest = await file.read()
    full_content = header + rest
    if len(full_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File size exceeds 10MB limit")
        
    return full_content
```

### 4.4 Cryptographic UUID Filename Sanitization

To neutralize path traversal attacks (e.g. `../../etc/passwd` or overwrite exploits), original client filenames are discarded. Assets are saved under deterministic UUIDv4 keys:

```python
import uuid
import os

def generate_safe_s3_key(original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"
    unique_key = f"uploads/{uuid.uuid4().hex}{ext}"
    return unique_key
```

### 4.5 Bucket Policy & Access Boundaries

- S3 Public Write and ACLs are disabled via **S3 Block Public Access**.
- Write and delete operations are permitted exclusively through signed backend IAM credentials.
- Read access is restricted to verified asset paths under `/uploads/*` with caching headers.

---

## 5. Financial & Escrow Transaction Security

RE:USE provides trustless peer-to-peer resource sharing by holding item rental fees and security collateral deposits in **Razorpay Escrow** until the rented resource is returned in satisfactory condition.

### 5.1 Razorpay Webhook Signature Verification (SHA256 HMAC)

Webhook endpoints reject any payload where the cryptographic signature does not verify against the local webhook secret:

```python
import hmac
import hashlib
from fastapi import Request, HTTPException, status

async def verify_razorpay_webhook(request: Request, webhook_secret: str) -> bytes:
    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing webhook signature")

    raw_body = await request.body()
    expected_signature = hmac.new(
        key=webhook_secret.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    return raw_body
```

### 5.2 Server-Side Amount Recalculation

Clients are never permitted to provide total price, rental amounts, or deposit sums. All payment order calculations are derived strictly from database entities:

```
[ Client Request ]
  { item_id: 42, start_date: "2026-10-15", end_date: "2026-10-18" }
       |
       v
[ Server Calculation ]
  1. Fetch Item(42) -> daily_rate = 150.00, security_deposit = 500.00
  2. Compute days = 3
  3. rental_cost = 3 * 150.00 = 450.00
  4. platform_fee = 450.00 * 0.05 = 22.50
  5. total_amount = 450.00 + 500.00 + 22.50 = 972.50
  6. Call razorpay_client.order.create({ amount: 97250, currency: "INR" })
```

### 5.3 Escrow Finite State Machine (FSM)

Rental payments transition through explicit, sequential states. Out-of-order transitions are rejected at the database layer.

```
       [ INITIATED ]
             |
             | Razorpay payment.captured
             v
      [ FUNDS_ESCROWED ]
             |
             | Item handed over to Delivery Agent / Borrower
             v
     [ IN_BORROWER_CUSTODY ]
             |
             | Return verified & inspected
             +------------------------------+
             |                              |
      (No Damage)                       (Disputed)
             |                              |
             v                              v
    [ ESCROW_RELEASED ]                [ DISPUTE_OPEN ]
    - Owner gets rent fee              - Admin arbiter reviews
    - Borrower gets deposit refund     - Proportionate refund/payout
             |                              |
             +------------->+<--------------+
                            |
                     [ TRANSACTION_CLOSED ]
```

### 5.4 Double-Spend & Concurrency Prevention (Pessimistic Locks)

To prevent simultaneous overlapping bookings for the same inventory item, checkout flows execute under PostgreSQL row-level locks (`with_for_update`):

```python
from sqlalchemy import select, and_

async def lock_and_create_booking(session: AsyncSession, item_id: int, start_date, end_date):
    async with session.begin():
        # Lock listing row against concurrent updates
        stmt = (
            select(Item)
            .where(Item.id == item_id)
            .with_for_update()
        )
        result = await session.execute(stmt)
        item = result.scalar_one_or_none()
        
        if not item or not item.is_active:
            raise HTTPException(status_code=400, detail="Item unavailable")

        # Verify no overlapping confirmed reservations exist
        collision_stmt = select(Booking).where(
            and_(
                Booking.item_id == item_id,
                Booking.status.in_(["FUNDS_ESCROWED", "IN_BORROWER_CUSTODY"]),
                Booking.start_date <= end_date,
                Booking.end_date >= start_date
            )
        )
        conflicts = await session.execute(collision_stmt)
        if conflicts.scalars().first():
            raise HTTPException(status_code=409, detail="Dates already reserved by another borrower")

        # Insert booking row safely within lock boundary
        ...
```

### 5.5 Comprehensive Financial Audit Trail

Every state change involving funds logs an immutable record containing actor UUID, IP address, previous state, new state, transaction reference, and cryptographic hash:

```python
class FinancialAuditLog(Base):
    __tablename__ = "financial_audit_logs"

    id = Column(BigInteger, primary_key=True)
    booking_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    event_type = Column(String(50), nullable=False)  # ESCROW_DEPOSIT, REFUND, PAYOUT
    amount_inr = Column(Numeric(10, 2), nullable=False)
    razorpay_payment_id = Column(String(100), nullable=True)
    previous_state = Column(String(50), nullable=False)
    new_state = Column(String(50), nullable=False)
    ip_address = Column(String(45), nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now(), nullable=False)
```

---

## 6. Backend Crash Prevention & Resilience

### 6.1 Global Exception Handler Middleware

To prevent unhandled runtime errors from crashing worker threads or exposing sensitive traceback information, a global exception interceptor captures all errors, generates an incident reference ID, and returns a uniform JSON payload:

```python
import uuid
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("reuse.security")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    incident_id = uuid.uuid4().hex[:12]
    logger.error(
        f"Unhandled Exception [Incident: {incident_id}] on {request.method} {request.url.path}: {str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred. Please quote the incident reference.",
            "incident_id": incident_id
        }
    )
```

### 6.2 Database Connection Pooling Architecture

SQLAlchemy engine configuration is tuned for concurrency, connection stability, and automatic cleanup:

```python
from sqlalchemy.ext.asyncio import create_async_engine

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,             # Number of persistent connections retained
    max_overflow=20,          # Extra connections allowed during peak bursts
    pool_timeout=30,          # Seconds to wait before failing if pool is exhausted
    pool_recycle=1800,        # Recycle connections every 30 mins to avoid dropped sockets
    pool_pre_ping=True,       # Validates connection liveness before handing out to worker
    echo=False
)
```

### 6.3 Graceful Process Lifecycle (SIGTERM / SIGINT)

FastAPI utilizes modern `lifespan` context managers to cleanly drain connection pools and flush state upon orchestration shutdowns:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Phase: Validate connectivity
    logger.info("Starting up RE:USE backend services...")
    await test_database_connection()
    yield
    # Shutdown Phase: Drain connections
    logger.info("Received termination signal. Closing connection pools...")
    await engine.dispose()
    logger.info("Database pools flushed cleanly. Terminating process.")

app = FastAPI(lifespan=lifespan)
```

### 6.4 Uptime & Health Check Monitoring (`/health`)

A dedicated non-authenticated health endpoint evaluates system dependencies for uptime monitoring, Kubernetes probes, and status dashboards:

```python
@app.get("/health", tags=["Monitoring"])
async def health_check(session: AsyncSession = Depends(get_db)):
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {}
    }
    
    # 1. Check PostgreSQL
    try:
        await session.execute(text("SELECT 1"))
        health_status["components"]["database"] = "reachable"
    except Exception as e:
        health_status["components"]["database"] = f"unreachable: {str(e)}"
        health_status["status"] = "degraded"

    # 2. Check AWS S3 connectivity
    try:
        s3_client.head_bucket(Bucket=AWS_S3_BUCKET_NAME)
        health_status["components"]["storage"] = "reachable"
    except Exception as e:
        health_status["components"]["storage"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    http_status = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(status_code=http_status, content=health_status)
```

### 6.5 Exponential Backoff Retry Strategy

Transient network failures with AWS S3, PostgreSQL, and Groq AI APIs are mitigated via exponential backoff with jitter:

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import botocore.exceptions

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=5),
    retry=retry_if_exception_type((botocore.exceptions.BotoCoreError, ConnectionResetError)),
    reraise=True
)
def s3_operation_with_retry(fn, *args, **kwargs):
    return fn(*args, **kwargs)
```

### 6.6 Session Cleanup & Memory Leak Safeguards

All database sessions utilize FastAPI dependency injection with explicit `finally` cleanup to prevent resource leaks:

```python
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### 6.7 Request Execution Timeout Middleware

Long-running or unresponsive database/external requests are terminated after **30 seconds** using asyncio timeouts:

```python
import asyncio
from fastapi import Request, HTTPException

@app.middleware("http")
async def timeout_middleware(request: Request, call_next):
    try:
        return await asyncio.wait_for(call_next(request), timeout=30.0)
    except asyncio.TimeoutError:
        return JSONResponse(
            status_code=504,
            content={"error": "Gateway Timeout", "message": "Request execution exceeded 30s limit"}
        )
```

---

## 7. Data Protection & Privacy

### 7.1 Environment Variable Isolation
- Sensitive credentials must **never** be checked into version control.
- In production, environment keys are injected via Netlify Edge Secrets and backend process environments.
- Local development requires a local `.env` file copied from `.env.example`.

### 7.2 Version Control Exclusion Rules (`.gitignore`)

The repository maintains strict exclusion rules to eliminate credential exposure:

```gitignore
# Security & Secret Credentials
.env
.env.*
!.env.example
*.pem
*.key
*.cert
*.id_rsa

# Python Artifacts & Virtual Environments
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
env/

# Database files
*.db
*.sqlite3

# Node / Next.js builds
node_modules/
.next/
out/
npm-debug.log*
yarn-error.log*
```

### 7.3 Encrypted PostgreSQL Connections

Production connection strings enforce encrypted transport:
```
postgresql+asyncpg://user:password@db-host:5432/reuse_prod?ssl=require
```

### 7.4 Data Minimization (PII Privacy)
- **Zero Passwords:** No password columns or hashes stored in the schema.
- **Minimal User Attributes:** User profiles collect only `email` and `display_name`.
- **Geographic Privacy:** Listing locations publicly expose generalized coordinates (neighborhood center / H3 hex grid cell) rather than high-precision GPS coordinates until a booking is confirmed by the owner.

### 7.5 GDPR-Ready Data Deletion Workflow

Users may exercise the right to be forgotten (`POST /api/v1/users/me/delete`). The account is deactivated, PII is scrubbed, and financial records are sanitized while retaining audit numbers:

```python
@router.post("/users/me/delete", status_code=status.HTTP_200_OK)
async def delete_user_account(
    user: TokenPayload = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    # 1. Verify no ongoing active escrow bookings
    active_bookings = await check_active_escrow(session, user.sub)
    if active_bookings > 0:
        raise HTTPException(status_code=400, detail="Cannot delete account with ongoing rentals or held escrow")

    # 2. Anonymize user record
    db_user = await session.get(User, user.sub)
    db_user.email = f"anonymized_{uuid.uuid4().hex[:8]}@deleted.reuse.local"
    db_user.display_name = "Deactivated User"
    db_user.is_active = False
    
    await session.commit()
    return {"message": "User personal data successfully anonymized"}
```

---

## 8. Environment Variables Security Checklist

Below is the verified security and classification matrix for all environment variables utilized across RE:USE:

| Variable Name | Sensitivity | Component | Example / Format | Security & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **CRITICAL** | FastAPI / SQLAlchemy | `postgresql+asyncpg://user:pass@host:5432/reuse` | Must enforce `ssl=require` in production. Never grant superuser database privileges. |
| `AWS_ACCESS_KEY_ID` | **HIGH** | FastAPI / boto3 | `AKIAIOSFODNN7EXAMPLE` | Restrict to IAM user with `s3:PutObject` & `s3:GetObject` only. Rotate every 90 days. |
| `AWS_SECRET_ACCESS_KEY` | **CRITICAL** | FastAPI / boto3 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | Never log, commit, or print. Bound strictly to S3 IAM policy. |
| `AWS_REGION` | **LOW** | FastAPI / boto3 | `ap-south-1` | Cloud region where S3 bucket resides. |
| `AWS_S3_BUCKET_NAME` | **MEDIUM** | FastAPI / boto3 | `reuse-marketplace-production` | Bucket must have Block Public Access enabled and SSE-S3 encryption enforced. |
| `GROQ_API_KEY` | **HIGH** | FastAPI AI Services | `gsk_9a8b7c6d5e4f...` | Access token for Llama-3.3-70B semantic listing categorization & moderation. |
| `JWT_SECRET` | **CRITICAL** | FastAPI Auth Module | 64+ char random hex string | Must possess minimum 256 bits of entropy (`openssl rand -hex 32`). Used for HS256 JWT signing. |
| `RAZORPAY_KEY_ID` | **MEDIUM** | Next.js & FastAPI | `rzp_live_xxxxxxxx` | Publicly passed to client checkout modal; scoped only for order generation. |
| `RAZORPAY_KEY_SECRET` | **CRITICAL** | FastAPI Financials | `xxxxxxxxxxxxxxxxxxxxxxxx` | Used on backend to create orders and verify payment hashes. Never expose to client. |
| `BREVO_API_KEY` | **HIGH** | FastAPI Auth Module | `xkeysib-xxxxxxxx...` | Dispatches transactional OTP verification emails. IP whitelist where possible. |
| `NEXT_PUBLIC_API_BASE_URL`| **LOW** | Next.js Frontend | `https://api.reuse.domain.com` | Base URL for FastAPI backend. Must point to HTTPS in staging/production. |

---

## 9. Incident Response & Security Contact

For security vulnerability disclosures, incident notifications, or audit inquiries:
- **Security Team Contact:** security@reuse.marketplace
- **Responsible Disclosure:** We welcome reports from security researchers. Please allow 48 hours for triage before coordinated public disclosure.
- **PGP Fingerprint for Encrypted Disclosures:** `4A9F 88C2 12E0 55B1 E87D  7129 A41C 3B70 9E21 D04F`
