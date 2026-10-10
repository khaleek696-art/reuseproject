# RE:USE — System Architecture & Backend Management Blueprint

* **Document Version:** 1.0.0
* **Project Name:** RE:USE — Hyperlocal Resource Sharing & Circular Marketplace
* **Focus:** Backend Clean Architecture, Data Flow, AWS S3 Storage, and Folder Organization

---

## 🏛️ 1. High-Level Architecture Overview

RE:USE adopts a **Decoupled Monolith Micro-Architecture** powered by **Next.js 16 (App Router)** on the frontend and **Python FastAPI (ASGI)** on the backend, integrated with cloud persistence and AI matching services.

```mermaid
flowchart TD
    subgraph Frontend["💻 Frontend Layer (Next.js 16 App Router)"]
        UI["React Client Components"]
        State["RoleContext State Provider"]
        API_Client["Centralized API Client (src/lib/api.ts)"]
    end

    subgraph Backend["⚙️ Backend API Layer (FastAPI Microservices)"]
        Router["Central API Hub (app/api/router.py)"]
        
        subgraph Controllers["API Controllers (app/api/)"]
            AuthCtrl["auth.py (Brevo OTP & JWT)"]
            ResCtrl["resources.py (CRUD & S3 Upload)"]
            BookCtrl["bookings.py (Escrow & OTP)"]
            AICtrl["ai_assistant.py (Groq Llama-3.3)"]
            GeoCtrl["matches.py (Haversine Geo)"]
        end

        subgraph CoreServices["Core & Drivers (app/core/)"]
            Config["config.py (Env Settings)"]
            DBEngine["database.py (SQLAlchemy 2.0)"]
            S3Storage["storage.py (AWS S3 Boto3)"]
            Security["security.py (JWT Encoder)"]
        end

        subgraph DataModels["Data Layer (app/models/ & app/schemas/)"]
            Schemas["Pydantic v2 Schemas"]
            Models["SQLAlchemy ORM Models"]
        end
    end

    subgraph Infrastructure["☁️ External Cloud Services"]
        Postgres[(PostgreSQL Cloud Database)]
        AWSS3["AWS S3 Bucket (s3.ap-south-1.amazonaws.com)"]
        Groq["Groq Llama-3.3 AI Engine"]
        Razorpay["Razorpay Escrow Gateway"]
        Brevo["Brevo Email OTP Service"]
    end

    UI --> State
    State --> API_Client
    API_Client <==>|HTTPS / JSON| Router

    Router --> AuthCtrl
    Router --> ResCtrl
    Router --> BookCtrl
    Router --> AICtrl
    Router --> GeoCtrl

    ResCtrl --> S3Storage
    S3Storage ==>|Boto3 API| AWSS3

    ResCtrl --> DBEngine
    BookCtrl --> DBEngine
    DBEngine ==>|Async Pool| Postgres

    AICtrl ==>|REST API| Groq
    AuthCtrl ==>|REST API| Brevo
    BookCtrl ==>|REST API| Razorpay
```

---

## 📂 2. Backend Clean Folder Organization Guide

The backend follows the **Clean Layered Architecture Pattern** (Separation of Concerns). Here is how files are organized:

```
backend/
├── main.py                             # Application Entrypoint & Middleware Setup
├── requirements.txt                    # Python Library Dependencies
├── Dockerfile                          # Docker Container Build File
├── docker-compose.yml                  # Local Development Service Orchestration
├── .env.example                        # Environment Template for Backend
│
└── app/                                # Main Application Package
    ├── __init__.py
    │
    ├── core/                           # INFRASTRUCTURE & SHARED DRIVERS
    │   ├── config.py                   # Pydantic Settings & Environment Variables
    │   ├── database.py                 # SQLAlchemy DB Engine & Async Sessions
    │   ├── storage.py                  # AWS S3 Boto3 Client & Image Uploader
    │   ├── security.py                 # JWT Token Generation & Verification
    │   ├── email.py                    # Brevo Transactional OTP Emailer
    │   └── redis.py                    # Cache & Temporary OTP Storage
    │
    ├── models/                         # DATABASE ENTITIES (SQLAlchemy ORM)
    │   ├── __init__.py                 # Exports all models for Alembic/SQLAlchemy
    │   ├── user.py                     # User table (roles, ratings, trust scores)
    │   ├── resource.py                 # Resource table (photos JSON, rate, deposit, lat/lng)
    │   ├── booking.py                  # Booking table (escrow status, handover/return OTPs)
    │   ├── dispute.py                  # Dispute resolution table
    │   └── chat.py                     # P2P Messages table
    │
    ├── schemas/                        # INPUT/OUTPUT VALIDATION (Pydantic v2)
    │   ├── user.py                     # UserCreate, UserResponse
    │   ├── resource.py                 # ResourceCreate, ResourceResponse
    │   └── booking.py                  # BookingCreate, BookingResponse
    │
    └── api/                            # API ROUTE CONTROLLERS (Endpoints)
        ├── router.py                   # Master Router Hub (/api/v1)
        ├── resources.py                # GET/POST /resources, POST /resources/upload
        ├── bookings.py                 # Escrow Bookings & OTP Handover Verification
        ├── auth.py                     # Email OTP Request & JWT Verification
        ├── ai_assistant.py             # Groq Llama-3.3 Semantic Matchmaking
        ├── matches.py                  # Haversine Distance Radius Filtering
        ├── payments.py                 # Razorpay Escrow Integration
        ├── chat.py                     # P2P Messaging Endpoints
        ├── admin.py                    # Dispute Resolution & Governance
        └── websockets.py               # Real-Time Event Dispatcher
```

---

## 🔄 3. Detailed Data Flow & Execution Order

### 3.1 Resource Creation & AWS S3 Photo Upload Flow
When an Owner lists a new item with a photo:

1. **Client Request:** Next.js sends `multipart/form-data` image to `POST /api/v1/resources/upload`.
2. **FastAPI Route (`api/resources.py`):** Passes the binary stream to `storage.upload_image_to_s3()`.
3. **AWS S3 Driver (`core/storage.py`):** Uses `boto3` SDK to upload bytes to AWS S3 Bucket (`reuse-gear-images-2026`) in region `ap-south-1`.
4. **Public S3 URL:** S3 returns a permanent HTTPS URL: `https://reuse-gear-images-2026.s3.ap-south-1.amazonaws.com/equipment/unique-photo.jpg`.
5. **Database Persistence (`api/resources.py`):** FastAPI inserts item metadata + S3 URL array into PostgreSQL `resources` table via SQLAlchemy ORM.
6. **Global Broadcast:** Response `201 Created` returned. All borrowers worldwide fetching `GET /api/v1/resources` immediately see the new item.

### 3.2 Escrow Payment & OTP Handover Cycle
1. **Booking Request:** Borrower requests item $\rightarrow$ Rental fee + Security Deposit calculated.
2. **Escrow Hold (`api/payments.py`):** Razorpay holds deposit $\rightarrow$ Booking status set to `pending`.
3. **Owner Approval:** Owner accepts request $\rightarrow$ Handover OTP generated (`1234`).
4. **Physical Pickup (`api/bookings.py`):** Upon pickup, Borrower provides Handover OTP $\rightarrow$ API validates OTP $\rightarrow$ Status changes to `active`.
5. **Return & Deposit Refund (`api/bookings.py`):** Owner inspects item $\rightarrow$ Enters Return OTP $\rightarrow$ Status set to `completed` $\rightarrow$ Security Deposit refunded 100% to Borrower, Rental Fee transferred to Owner.

---

## 🛠️ 4. How to Manage & Upload Backend Cleanly to GitHub / Render

To keep your backend clean and production-ready:

### Step 1: Manage Environment Variables (`.env.example`)
Never commit real secrets to GitHub. Keep `.env.example` in repo:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=reuse-gear-images-2026
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
BREVO_API_KEY=your_brevo_api_key
```

### Step 2: Clean `requirements.txt`
Ensure `requirements.txt` contains clean production packages:
```text
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.25
psycopg2-binary>=2.9.9
boto3>=1.34.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
httpx>=0.26.0
python-multipart>=0.0.6
```

### Step 3: Render Deployment Configuration
* **Environment:** Python 3.10+
* **Build Command:** `pip install -r backend/requirements.txt`
* **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
