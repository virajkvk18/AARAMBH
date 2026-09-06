# AARAMBH Monorepo

> **Single Window Clearance Portal** for seamless industrial clearances, approvals, incentives, and intelligent document validation.

---

## 📁 Repository Structure

```
aarambh/
├── frontend/              # Next.js 15 App Router + TypeScript + Tailwind CSS
├── backend/               # Node.js + Express + TypeScript API Gateway
├── ai-service/            # Python FastAPI Microservice (LangGraph, Groq, ChromaDB, EasyOCR, PyMuPDF)
│   ├── pipelines/         # LangGraph pipeline definitions & state graphs
│   ├── models/            # Pydantic schemas for data extraction & KYA
│   └── requirements.txt   # Python dependencies
├── supabase/
│   └── migrations/        # PostgreSQL schema migrations
├── docs/                  # Architecture specs, PRD, and schema documentation
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore definitions
└── README.md
```

---

## 🚀 Getting Started

### 1. Environment Configuration
Copy the template `.env.example` to `.env` in the root and fill in your keys:
```bash
cp .env.example .env
```

### 2. Frontend (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
Available at: `http://localhost:3000`

### 3. Backend API (`/backend`)
```bash
cd backend
npm install
npm run dev
```
Available at: `http://localhost:5000`

### 4. AI Service (`/ai-service`)
```bash
cd ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Available at: `http://localhost:8000` (Docs at `http://localhost:8000/docs`)

---

## 🔒 Environment Variables Reference
Refer to [`.env.example`](.env.example) for all supported configuration options:
- `GROQ_API_KEY`: Fast LLM inference for extraction and categorization
- `SUPABASE_*`: Database, Auth, and Storage keys
- `FIREBASE_*`: Firebase authentication credentials
- `DIGILOCKER_*`: DigiLocker single-sign-on and document pull integration
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `AI_SERVICE_URL`: AI microservice URL
