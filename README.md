# 🌐 RE:USE — Hyperlocal Peer-to-Peer Equipment Sharing Marketplace

> **Don't buy more. Share what already exists.**  
> RE:USE is a full-stack, hyper-local peer-to-peer equipment sharing ecosystem powered by AI intent matching, 5-factor spatial scoring, single-use Redis OTP custody handoffs, and smart escrow vault payments.

---

## 🌟 Key Highlights & Architectural Modules

- 🎯 **4 Isolated User Roles**: Role-based access control (RBAC) enforcing distinct interfaces for **Borrowers**, **Resource Owners**, **Delivery Partners**, and **Platform Administrators**.
- 🤖 **AI Smart Intent Engine (Groq LLM Integration)**: Natural language equipment search with automated budget, specs, and date extraction.
- 📐 **5-Factor Mathematical Match Engine**: Spatial PostGIS distance, time overlap percentage, budget fit, compatibility, and peer trust score.
- 🔐 **Verified Escrow Vault**: Refundable security deposit holds and automated release upon verified return.
- 🚲 **Hyperlocal Courier & Physical Custody**: 6-digit single-use OTP handoff verification for fraud-free physical exchanges.
- 🛡️ **PeerTrust Credibility Scoring**: Weighted mathematical trust algorithm factoring volume, rater credibility, and zero-dispute records.

---

## 🏗️ Role-Based System Architecture

| Role | Target User | Core Capabilities | Restricted Actions |
|------|-------------|-------------------|-------------------|
| **Borrower** | Campus Students / Seekers | Search catalog, AI intent matches, rent gear, Escrow payment, OTP receive, leave reviews | Cannot list items, cannot access admin console |
| **Resource Owner** | Gear Owners / Lenders | 5-step item listing, set daily rates & deposit holds, approve/reject requests, verify returns | Cannot borrow own items, cannot access courier console |
| **Delivery Partner** | Cargo Bike Couriers | Dispatch radar (within 4km), accept pickup jobs, 6-digit OTP custody verification, earn delivery fees | Cannot access admin console or edit listings |
| **Platform Administrator** | Superusers / Admins | Platform KPIs, dispute arbitration, escrow hold overrides, 5-factor algorithm weight tuning | Cannot personally list or borrow gear |

---

## 📊 Complete System Flow & Custody Lifecycle

```
[Borrower Requests Gear] ──► [Escrow Funds Locked] ──► [Owner Approves Request]
                                                               │
[Deposit Auto-Refunded] ◄── [Return OTP Verified] ◄── [Courier Handoff OTP]
```

1. **STAGE 01 — REQUESTED**: Borrower selects rental duration & pays Escrow vault (Daily Rate × Days + Refundable Deposit).
2. **STAGE 02 — ACCEPTED**: Equipment owner approves request and locks availability dates.
3. **STAGE 03 — ACTIVE IN TRANSIT**: Courier/Owner verifies physical pickup via 6-digit single-use Redis OTP code.
4. **STAGE 04 — RETURNED**: Borrower hands back equipment; owner verifies condition.
5. **STAGE 05 — COMPLETED**: Security deposit released back to Borrower; rental fee disbursed to Owner.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Webpack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, Lucide React Icons
- **State Management**: React Context (`RoleContext`) with client-side persistence

### Backend & Infrastructure
- **API Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn ASGI Server (`http://localhost:8000`)
- **Database**: SQLite / PostgreSQL with PostGIS Spatial Extensions
- **AI Models**: Groq API (`openai/gpt-oss-120b`, fallback to `qwen/qwen3.8-27b`)
- **Object Storage**: AWS S3 Bucket (`reuse-app-storage`) with Base64 Data URL fallback

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & `pip` / `venv`

---

### 1️⃣ Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variable template & set your keys
cp .env.example .env

# Run FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

> The backend will start at `http://localhost:8000` with interactive API docs at `http://localhost:8000/docs`.

---

### 2️⃣ Frontend Setup (Next.js)

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Copy environment variable template
cp .env.example .env.local

# Run Next.js development server
npm run dev
```

> Open `http://localhost:3000` in your browser. Look for the **`🟢 FastAPI Live`** badge in the navigation bar to confirm backend integration!

---

## 🔐 Environment Variables Configuration

Copy `.env.example` to `.env` (backend) or `.env.local` (frontend) and configure your credentials:

```ini
# API & WebSockets
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000

# Groq AI Key
GROQ_API_KEY=your_groq_api_key_here

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=ap-south-1
S3_BUCKET_NAME=reuse-app-storage
```

> ⚠️ **Security Notice**: Never commit real secret keys or `.env` files to git repository. All environment files are excluded via `.gitignore`.

---

## 🧪 Production Build Verification

To verify that all TypeScript types, routes, and components compile cleanly:

```bash
npm run build
```

---

## 📄 License & Attribution

Crafted for sustainable campus communities and circular economy initiatives. Built with ❤️ for zero single-use waste.
