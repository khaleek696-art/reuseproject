# RE:USE — Master Product Requirement Document (PRD) & Codebase Architecture Blueprint

* **Document Version:** 2.0.0 (Master Rebuild & Architecture Edition)
* **Project Name:** RE:USE — Hyperlocal Resource Sharing & Circular Marketplace
* **Author / Lead:** Khaleek Ahmad (ORVIX Team)
* **Status:** Complete Master Specification for Project Migration & Rebuild

---

## 🎯 1. Executive Summary & Product Vision

### 1.1 Product Vision
**RE:USE** is a peer-to-peer (P2P) hyperlocal circular marketplace designed to empower local communities to share, rent, and borrow underutilized household assets (laptops, cameras, power tools, camping gear, event equipment). 

By combining **AI-driven natural language matching (Groq Llama-3.3)**, **geodesic spatial geofencing (Haversine Algorithm)**, **enterprise cloud asset storage (AWS S3)**, and **financial escrow protection (Razorpay Escrow)**, RE:USE eliminates trust barriers, reduces e-waste, and lowers carbon footprints.

### 1.2 Core Value Propositions
* **For Borrowers:** On-demand access to high-value equipment at a fraction of retail price without ownership burden.
* **For Owners (Lenders):** Monetization of idle household assets with 100% security deposit protection.
* **For Delivery Partners:** Hyperlocal gig earning opportunities for local item pickups and returns.
* **For the Environment:** Reduction in manufacturing demand, waste diversion, and measurable CO₂ emissions offset (EPA WARM metrics).

---

## 📂 2. Complete File & Folder Architecture Map

This map defines every single file required when shifting or rebuilding the project in a new folder.

```
reuseai/
├── AGENTS.md                            # Master AI Agent System Rules & Guidelines
├── PRD.md                               # Product Requirement Document (This File)
├── package.json                         # Next.js 16 Frontend Dependencies
├── tsconfig.json                        # TypeScript Configuration
├── tailwind.config.ts                   # Tailwind CSS Theme & Mint Color Palette
│
├── src/                                 # FRONTEND (Next.js 16 App Router)
│   ├── app/                             # Pages & Layouts
│   │   ├── layout.tsx                   # Master Root Layout (Navbar + RoleProvider + Footer)
│   │   ├── page.tsx                     # Landing / Home Page (Hero, Popular Equipment, AI Bar)
│   │   ├── globals.css                  # Global Tailwind Styles & Theme Variables
│   │   ├── explore/page.tsx             # Explore Gear Page (Filters, Grid, Leaflet Map)
│   │   ├── resources/page.tsx           # Full Resource Marketplace Directory
│   │   ├── resources/[id]/page.tsx      # Dynamic Resource Detail Page (Booking Widget, Sticky Bar)
│   │   ├── needs/page.tsx               # Borrower Natural Language Needs Feed
│   │   ├── matches/page.tsx             # AI Need-to-Gear Match Feed (Groq Llama-3.3)
│   │   ├── bookings/page.tsx            # User Bookings Dashboard (Active, Pending, Completed)
│   │   ├── deliveries/page.tsx          # Delivery Agent OTP Handover Dashboard
│   │   ├── impact/page.tsx              # Environmental & Financial Impact Analytics
│   │   ├── profile/page.tsx             # User Profile, PeerTrust Ratings & KYC Status
│   │   ├── reviews/page.tsx             # User Rating & Review Management
│   │   └── admin/page.tsx               # Admin Governance, Escrow Holds & Dispute Resolution
│   │
│   ├── components/                      # Reusable UI Components
│   │   ├── Navbar.tsx                   # Navigation Header with 4-Role Switcher & Mobile Drawer
│   │   ├── Footer.tsx                   # Platform Footer & Links
│   │   ├── ResourceCard.tsx             # Equipment Card (Photo, Daily Rate, Deposit, Distance)
│   │   ├── AddResourceModal.tsx         # List Equipment Modal (Form + AWS S3 Upload)
│   │   ├── BookingModal.tsx             # Rental Booking & Deposit Calculation Modal
│   │   ├── FilterSidebar.tsx            # Price, Distance (2km-10km), Category Filters
│   │   ├── InteractiveMap.tsx           # OpenStreetMap / Leaflet Map View
│   │   ├── AIChatDrawer.tsx             # Groq AI Assistant Chat Interface
│   │   ├── ChatDrawer.tsx               # Borrower-Lender P2P Messaging Drawer
│   │   ├── AuthModal.tsx                # Brevo Email OTP Authentication Modal
│   │   ├── LifecycleStepper.tsx         # Booking Progress (Pending -> Approved -> Active -> Completed)
│   │   ├── ReturnOtpRefundModal.tsx     # 4-Digit Return OTP & Deposit Refund Verification
│   │   ├── RedisOtpModal.tsx            # Handover OTP Verification Interface
│   │   ├── RentalAgreementModal.tsx     # Digital Terms & Rental Contract Modal
│   │   ├── ImpactBar.tsx                # Quick Impact Telemetry Strip
│   │   ├── TelemetryStrip.tsx           # Platform Live Activity Telemetry
│   │   ├── CategoryGrid.tsx             # Visual Category Cards
│   │   ├── HowItWorks.tsx               # 4-Step Process Walkthrough
│   │   ├── MatchCard.tsx                # AI Match Result Card
│   │   └── SystemFallbackBanner.tsx     # System Status & Health Banner
│   │
│   └── lib/                             # Core Logic & Context Providers
│       ├── roleContext.tsx              # Global State Provider (Resources, Bookings, User, Sync)
│       ├── api.ts                       # Centralized API Fetcher (Backend Base URL Handler)
│       ├── types.ts                     # TypeScript Interfaces (Resource, Booking, User, Need)
│       ├── matchEngine.ts               # Haversine Distance & AI Match Helper
│       ├── trustEngine.ts               # PeerTrust Score Calculation Logic
│       └── utils.ts                     # Tailwind Class Merger (clsx + tailwind-merge)
│
└── backend/                             # BACKEND (Python FastAPI Microservices)
    ├── main.py                          # FastAPI App Entrypoint & Lifespan Handler
    ├── requirements.txt                 # Python Dependencies (FastAPI, boto3, SQLAlchemy, etc.)
    │
    └── app/
        ├── core/
        │   ├── config.py                # Environment Variables (AWS S3, Postgres DB, Groq Key)
        │   ├── database.py              # SQLAlchemy 2.0 Engine & Async Session Handler
        │   ├── storage.py               # AWS S3 Boto3 Upload & Public URL Generator
        │   ├── security.py              # JWT Token Generation & Verification
        │   ├── email.py                 # Brevo Transactional Email OTP Sender
        │   └── redis.py                 # Cache Manager / OTP Temporary Storage
        │
        ├── models/                      # SQLAlchemy Database Models (PostgreSQL)
        │   ├── user.py                  # User Database Table
        │   ├── resource.py              # Equipment Listing Database Table
        │   ├── booking.py               # Rental & Escrow Booking Database Table
        │   ├── dispute.py               # Dispute Resolution Database Table
        │   └── chat.py                  # P2P Messages Database Table
        │
        ├── schemas/                     # Pydantic v2 Request/Response Validation Schemas
        │   ├── user.py                  # User Schemas (UserCreate, UserResponse)
        │   ├── resource.py              # Resource Schemas (ResourceCreate, ResourceResponse)
        │   └── booking.py               # Booking Schemas (BookingCreate, BookingResponse)
        │
        └── api/                         # REST API Route Handlers
            ├── router.py                # Central Router Hub (/api/v1)
            ├── resources.py             # Resource CRUD & AWS S3 Upload Endpoints
            ├── bookings.py              # Escrow Booking & OTP Verification Endpoints
            ├── auth.py                  # Email OTP & JWT Auth Endpoints
            ├── ai_assistant.py          # Groq Llama-3.3 AI Matchmaking Endpoints
            ├── matches.py               # Spatial Haversine Matching Endpoints
            ├── payments.py              # Razorpay Escrow Integration Endpoints
            ├── chat.py                  # P2P Chat Endpoints
            ├── admin.py                 # Dispute Resolution & Governance Endpoints
            └── websockets.py            # Real-Time Event Dispatcher
```

---

## ⚙️ 3. Core Functional Modules & Business Logic

### 3.1 Module A: User Authentication & 4-Role Persona System
* **Brevo Email OTP:** User enters email $\rightarrow$ Brevo API generates 6-digit OTP $\rightarrow$ Verification issues JWT token.
* **4 Persona Roles:**
  1. `Borrower`: Searches equipment, posts needs, requests rentals.
  2. `Owner (Lender)`: Lists idle equipment, sets rates/deposits, approves requests.
  3. `Delivery Agent`: Handles local pickups, verifies physical OTP handovers.
  4. `Admin`: Monitors platform health, manages escrow holds, resolves disputes.

### 3.2 Module B: Resource Listing & AWS S3 Cloud Asset Management
* **Upload Flow:** Owner selects gear photo $\rightarrow$ FastAPI `/api/v1/resources/upload` uploads photo via `boto3` SDK to AWS S3 (`reuse-gear-images-2026.s3.ap-south-1.amazonaws.com`) $\rightarrow$ S3 returns permanent public HTTPS URL $\rightarrow$ Resource metadata inserted into PostgreSQL `resources` table.
* **Global Persistence Rule:** Listings MUST NEVER reside solely in `localStorage` or temporary server RAM. Every listing MUST persist to PostgreSQL Database so it is instantly visible to all users across any laptop/browser globally.

### 3.3 Module C: AI-Powered Matchmaking & Haversine Geofencing
* **Groq Llama-3.3 LLM:** Converts unstructured user queries (*"Need DSLR camera for Manali trip"*) into structured tags (`category: Cameras`, `features: [High-Res, Travel-friendly]`).
* **Haversine Distance Formula:**
  $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  Computes exact spatial distance in kilometers between Borrower location $(\phi_1, \lambda_1)$ and Owner location $(\phi_2, \lambda_2)$ to filter within 2km, 5km, or 10km radius.

### 3.4 Module D: Escrow Deposit & 4-Digit OTP Verification
* **Escrow Hold:** Borrower pays $\text{Total} = (\text{Daily Rate} \times \text{Days}) + \text{Security Deposit}$. Security deposit is locked in Razorpay Escrow.
* **4-Digit Handover OTP:** Upon physical pickup, owner provides 4-digit OTP. Delivery/Borrower verifies via API $\rightarrow$ Status changes to `Active`.
* **4-Digit Return OTP:** Upon item return, owner inspects condition and submits Return OTP $\rightarrow$ Status changes to `Completed` $\rightarrow$ Security Deposit is 100% refunded to Borrower, and Rental Fee is released to Owner.

---

## 🗄️ 4. PostgreSQL Database Schema Specifications

### 4.1 `resources` Table
* `id` (VARCHAR / UUID, Primary Key)
* `owner_id` (VARCHAR, Foreign Key to users)
* `title` (VARCHAR(255), Not Null)
* `category` (VARCHAR(100), Not Null)
* `condition` (VARCHAR(50))
* `description` (TEXT)
* `daily_rate` (FLOAT, Not Null)
* `deposit` (FLOAT, Not Null)
* `neighborhood` (VARCHAR(255))
* `lat` (FLOAT, Not Null)
* `lng` (FLOAT, Not Null)
* `photos` (JSON, Array of AWS S3 Public HTTPS URLs)
* `is_available` (BOOLEAN, Default True)
* `created_at` (TIMESTAMP)

### 4.2 `bookings` Table
* `id` (VARCHAR / UUID, Primary Key)
* `resource_id` (VARCHAR, Foreign Key to resources)
* `borrower_id` (VARCHAR, Foreign Key to users)
* `owner_id` (VARCHAR, Foreign Key to users)
* `start_date` (VARCHAR)
* `end_date` (VARCHAR)
* `rental_fee` (FLOAT)
* `security_deposit` (FLOAT)
* `status` (VARCHAR - `pending`, `approved`, `active`, `completed`, `disputed`)
* `handover_otp` (VARCHAR(4))
* `return_otp` (VARCHAR(4))
* `created_at` (TIMESTAMP)

---

## 🛠️ 5. Migration & Rebuild Instructions (For Shifting to a New Folder)

When moving or rebuilding this repository in a new directory:

1. **Copy Project Directory:** Copy `src/`, `backend/`, `package.json`, `tailwind.config.ts`, `AGENTS.md`, and `PRD.md`.
2. **Environment Setup (.env):**
   * **Frontend (`.env.local`):**
     `NEXT_PUBLIC_API_BASE_URL=https://reuse-backend-cbc3.onrender.com/api/v1`
   * **Backend (`backend/.env`):**
     `DATABASE_URL=postgresql://user:pass@host:5432/reusedb`
     `AWS_ACCESS_KEY_ID=AKIA...`
     `AWS_SECRET_ACCESS_KEY=wJalr...`
     `AWS_REGION=ap-south-1`
     `AWS_S3_BUCKET_NAME=reuse-gear-images-2026`
     `GROQ_API_KEY=gsk_...`
3. **Frontend Install & Run:** `npm install` $\rightarrow$ `npm run dev`
4. **Backend Install & Run:** `cd backend` $\rightarrow$ `pip install -r requirements.txt` $\rightarrow$ `uvicorn app.main:app --reload`
5. **AI Agent Instruction:** Point your AI Assistant (Gemini / Antigravity) to `AGENTS.md` and `PRD.md`. The AI will automatically maintain full architecture integrity without introducing mock data bugs or broken imports.
<!-- RE:USE — Modular Circular Economy Architecture -->
