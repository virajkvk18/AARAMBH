#!/usr/bin/env bash
# AARAMBH - Start all three services concurrently.
#   Backend (Express)   : http://localhost:5000
#   AI Service (FastAPI): http://localhost:8000
#   Frontend (Next.js)  : http://localhost:3000

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Starting AARAMBH dev stack..."
echo "Open http://localhost:3000 when the frontend is ready."

(cd "$ROOT/backend" && npm install && npm run dev) &
(cd "$ROOT/ai-service" && pip install -r requirements.txt && python -m uvicorn main:app --reload) &
(cd "$ROOT/frontend" && npm install && npm run dev) &

trap 'kill 0' EXIT
wait