# AARAMBH - Start all three services locally in separate windows
#   Backend (Express)   : http://localhost:5000
#   AI Service (FastAPI): http://localhost:8000
#   Frontend (Next.js)  : http://localhost:3000

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting AARAMBH dev stack..." -ForegroundColor Cyan
Write-Host "  Backend (Express)   : http://localhost:5000"
Write-Host "  AI Service (FastAPI): http://localhost:8000"
Write-Host "  Frontend (Next.js)  : http://localhost:3000"

if (-not (Test-Path "$root\backend\node_modules")) {
  Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
  Push-Location "$root\backend"
  npm install
  Pop-Location
}

if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
  Push-Location "$root\frontend"
  npm install
  Pop-Location
}

Start-Process powershell -WorkingDirectory "$root\backend" -ArgumentList '-NoExit', '-Command', 'npm run dev' -WindowStyle Normal
Start-Process powershell -WorkingDirectory "$root\ai-service" -ArgumentList '-NoExit', '-Command', 'python -m uvicorn main:app --reload' -WindowStyle Normal
Start-Process powershell -WorkingDirectory "$root\frontend" -ArgumentList '-NoExit', '-Command', 'npm run dev' -WindowStyle Normal

Write-Host "All three services launched. Open http://localhost:3000" -ForegroundColor Green