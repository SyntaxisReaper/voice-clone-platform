# VCaaS Development Startup Script
# PowerShell script to set up and run the VCaaS backend in development mode

Write-Host "🚀 Starting VCaaS Development Environment..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating environment configuration..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env file with your configuration" -ForegroundColor Cyan
}

# Create necessary directories
Write-Host "📁 Creating data directories..." -ForegroundColor Yellow
$directories = @(
    "data\uploads",
    "data\processed_voices", 
    "data\synthesized",
    "data\models",
    "logs"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Gray
    }
}

# Check database connection (optional)
Write-Host "🗄️  Checking database connection..." -ForegroundColor Yellow
try {
    python -c "from app.core.database import db_manager; print('Database:', 'OK' if db_manager.health_check() else 'Failed')"
} catch {
    Write-Host "⚠️  Database not available - using SQLite fallback" -ForegroundColor Yellow
}

# Start the development server
Write-Host "`n🌟 Starting VCaaS Backend Server..." -ForegroundColor Green
Write-Host "📍 Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔍 Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

# Start uvicorn with reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload