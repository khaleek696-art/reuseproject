<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# RE:USE — Agent Blueprint & System Architecture

## 🎯 Project Goal & Vision

* **Project Name:** RE:USE
* **Tagline:** Hyperlocal Resource Sharing & Circular Marketplace.
* **Core Objective:** A peer-to-peer (P2P) platform where users can rent or borrow idle household items (laptops, cameras, power tools, camping gear, etc.). The platform leverages AI for smart need-matching, AWS S3 for enterprise cloud asset storage, and an Escrow deposit system for 100% safe, trustless transactions.

---

## 🚀 Core Features & Business Logic (For AI Context)

### 1. User Authentication & Trust System
* Secure login via Brevo Transactional Email OTP & JWT Authentication.
* Role-based access control with 4 distinct user personas: **Borrower**, **Owner (Lender)**, **Delivery Agent**, and **Admin**.
* PeerTrust dual-rating system (Lender & Borrower) tied to transaction history.

### 2. Smart Listing & AWS S3 Cloud Asset Management
* Owners can list items with title, category, daily rental rate, security deposit, pickup/delivery preferences, and photos.
* **AWS S3 Cloud Storage Integration:** Images are uploaded via FastAPI `boto3` SDK to AWS S3 (`s3.ap-south-1.amazonaws.com`), generating permanent, globally accessible public HTTPS URLs.
* Real-time availability management and booking status tracking (`pending` → `approved` → `active` → `completed`).

### 3. AI-Powered Matching Engine & Spatial Geofencing
* **Groq Llama-3.3-70B LLM:** Parses natural language borrower queries (e.g., *"I need a DSLR camera for a weekend trip to Manali"*) and matches them with available owner gear.
* **Haversine Geofencing Algorithm:** Computes exact spatial distance (2km–10km radius) between borrower location and owner equipment using geodesic formulas.

### 4. Secure Escrow Transactions & OTP Handover
* **Escrow Flow:** Borrower pays `Rental Fee + Security Deposit`.
* Security Deposit is securely held in Razorpay Escrow.
* **4-Digit OTP Verification:** Physical handover and return require 4-digit OTP validation between owner/borrower to prevent fraud.
* Upon clean return verification, escrow deposit is automatically refunded to the borrower, and rental payout is released to the owner.

### 5. Impact Metrics & Eco-Gamification
* Tracks environmental impact per transaction using EPA WARM metrics (CO₂ emissions saved, money saved, waste diverted).

---

## 🛠️ Tech Stack Guidelines

* **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide React Icons, Leaflet / OpenStreetMap.
* **Backend:** Python FastAPI, Uvicorn ASGI Server, Pydantic v2 schemas.
* **Database:** PostgreSQL (Production hosted on Render/Supabase) via SQLAlchemy 2.0 ORM.
* **Cloud Storage:** AWS S3 Bucket (`reuse-gear-images-2026`) via Python `boto3` & AWS IAM Access Keys.
* **AI Engine:** Groq Llama-3.3-70B API + Python Haversine Spatial Matching.
* **External APIs:** Razorpay Escrow Payments, Brevo Transactional Email OTP, OpenStreetMap Nominatim Geocoding.
* **Hosting:** Netlify (Frontend) + Render (Backend API & PostgreSQL DB).

---

## 🤖 AI Agent Coding Rules & Commandments (STRICT)

When generating, refactoring, or modifying code for this project, AI Agents MUST adhere strictly to the following rules:

### 1. Global Data & AWS Cloud Persistence Rules (CRITICAL)
* **NEVER** store global marketplace listings solely in browser `localStorage` or temporary server memory (`SEED_RESOURCES`).
* **ALWAYS** upload equipment images to AWS S3 Bucket via `boto3` SDK and obtain permanent `https://<bucket>.s3.<region>.amazonaws.com/...` image URLs.
* **ALWAYS** persist resource listings, user accounts, and bookings directly into the central PostgreSQL Database via SQLAlchemy ORM.
* **ALWAYS** ensure `/explore` and `/resources` pages fetch live data from `GET /api/v1/resources` on every page load.

### 2. Code Quality & Architecture
* Write clean, modular, and DRY (Don't Repeat Yourself) code.
* Follow Next.js 16 App Router folder structure (`src/app/`).
* Prefer functional components and React Hooks over class components.
* Use TypeScript strictly. Define clear Interfaces/Types for all API contracts (`Resource`, `Booking`, `User`, `Need`).

### 3. Security First & AWS Environment Variables
* Never expose API keys or secrets in frontend code.
* Use environment variables (`NEXT_PUBLIC_API_BASE_URL`, `DATABASE_URL`, `GROQ_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET_NAME`).
* Validate all user inputs on both frontend (Zod/Pydantic) and backend.
* Implement proper error handling and fallback states for all payment, escrow, and AWS upload state changes.

### 4. UI/UX & Styling
* Use Tailwind CSS for responsive, mobile-first design.
* Maintain the green/mint circular economy visual theme (`#065F46`, `#ECFDF5`).
* Keep UI elements clean, modern, and accessible.

### 5. Performance & Asset Optimization
* Optimize images using `<Image />` or AWS S3 public HTTPS URLs.
* Minimize unnecessary API calls (use React state caching and deduplication).

### 6. Step-by-Step Thinking & Runtime Verification
* Before implementing complex flows (like Escrow payment, AWS S3 upload, or AI matching), outline steps in code comments.
* Always verify backend endpoints with runtime test commands (`curl`, pytest) before completing tasks.
