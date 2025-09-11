# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Local Development Setup
```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && pip install -r requirements.txt

# Start frontend development server
cd frontend && npm run dev

# Start backend development server
cd backend && uvicorn main:app --reload

# Start all services with Docker
docker-compose up --build
```

### Frontend Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Backend Commands
```bash
# Development server with auto-reload
uvicorn main:app --reload

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000

# Format code
black .

# Sort imports
isort .

# Type checking
mypy .

# Run tests
pytest

# Run specific test file
pytest tests/test_filename.py
```

### Database Operations
```bash
# Start PostgreSQL with Docker
docker-compose up postgres

# Database connection string (from .env.example)
DATABASE_URL=postgresql+asyncpg://voice_user:voice_password@localhost:5432/voice_clone_db
```

### Background Tasks (Celery)
```bash
# Start Celery worker
celery -A app.core.celery worker --loglevel=info

# Start Flower monitoring
flower -A app.core.celery --port=5555
```

## Architecture Overview

This is a **full-stack voice cloning platform** with AI/ML capabilities for training custom voice models and generating text-to-speech audio.

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React 18
- **Backend**: FastAPI, Python 3.9+, SQLAlchemy (async)
- **Database**: PostgreSQL with asyncpg
- **Caching**: Redis
- **Authentication**: Firebase Auth
- **Storage**: AWS S3 for audio files
- **Audio Processing**: librosa, soundfile, pydub
- **AI/ML**: Coqui TTS, FastSpeech2, HiFi-GAN, PyTorch

### Project Structure
```
voice-clone-platform/
├── frontend/           # Next.js React application
│   ├── src/app/       # App Router pages
│   │   ├── dashboard/ # User dashboard
│   │   ├── training/  # Voice training interface
│   │   ├── playground/# TTS playground
│   │   └── licensing/ # Voice licensing system
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI Python application
│   ├── app/
│   │   ├── api/routes/    # API endpoints
│   │   │   ├── auth.py    # Authentication
│   │   │   ├── voice.py   # Voice management
│   │   │   ├── tts.py     # Text-to-speech
│   │   │   └── licensing.py # Voice licensing
│   │   ├── core/          # Core configuration
│   │   │   ├── config.py  # Settings and environment
│   │   │   └── database.py # Database connection
│   │   ├── models/        # SQLAlchemy models
│   │   │   ├── user.py    # User model
│   │   │   ├── voice_sample.py # Voice samples
│   │   │   └── license.py # Licensing system
│   │   └── services/      # Business logic
│   │       ├── voice_processing.py # Audio processing
│   │       ├── auth.py    # Authentication service
│   │       └── watermark.py # Audio watermarking
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml # Local development services
└── README.md         # Project documentation
```

### Key Architecture Concepts

#### Voice Processing Pipeline
1. **Audio Upload**: Users upload voice samples (WAV, MP3, FLAC, OGG)
2. **Audio Cleaning**: Noise reduction, normalization, silence removal using librosa
3. **Feature Extraction**: MFCC, spectral features, pitch analysis
4. **Model Training**: Custom voice models using TTS frameworks
5. **Quality Assessment**: Automated quality scoring based on audio features

#### Text-to-Speech Flow
1. **Voice Selection**: Choose from owned or licensed voice models
2. **Text Processing**: Parse input text with emotional tags and prosody controls
3. **Audio Generation**: Generate speech using trained voice models
4. **Watermarking**: Apply inaudible watermarks for tracking and protection
5. **Storage**: Save generated audio to AWS S3 with metadata

#### Permission System
- **Voice Ownership**: Users own voice models they train
- **Licensing**: Voice owners can license their voices to others
- **Usage Tracking**: Monitor voice usage and enforce limits
- **Commercial vs Personal**: Different license types with varying permissions

#### Database Models
- **User**: Authentication, profile, usage limits (Firebase UID integration)
- **VoiceSample**: Voice recordings and trained models with quality metrics
- **License**: Voice licensing agreements between users
- **UsageLog**: Track voice generation usage for billing and limits

### Environment Configuration

The backend uses Pydantic Settings for configuration management. Key configuration areas:

- **Authentication**: Firebase integration for JWT tokens
- **Storage**: AWS S3 for audio file storage
- **Audio Processing**: Sample rates, FFT parameters, quality settings
- **TTS Models**: Model paths, training parameters
- **Rate Limiting**: API usage limits per user
- **Watermarking**: Audio watermark configuration

### Development Notes

#### Audio Processing
- Default sample rate: 22,050 Hz
- Supported formats: WAV, MP3, FLAC, OGG
- Max file size: 100MB
- Max audio duration: 5 minutes (300 seconds)
- Noise reduction uses spectral subtraction
- Quality scoring based on SNR and feature analysis

#### API Authentication
- Uses Firebase JWT tokens via HTTPBearer
- Token validation against Firebase Admin SDK
- User context extracted from JWT claims
- Rate limiting applied per user

#### Background Tasks
- Celery with Redis for async processing
- Voice training runs as background tasks
- Audio generation queued for processing
- Flower available for task monitoring

#### Frontend Architecture
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Component libraries: Headless UI, Hero Icons
- Audio visualization: WaveSurfer.js
- Charts and analytics: Recharts

### Important File Locations

#### Configuration Files
- `backend/.env.example` - Environment variables template
- `backend/app/core/config.py` - Application settings
- `frontend/next.config.js` - Next.js configuration
- `docker-compose.yml` - Local development services

#### Key Service Files
- `backend/app/services/voice_processing.py` - Audio processing logic
- `backend/app/services/watermark.py` - Audio watermarking
- `backend/app/api/routes/tts.py` - Text-to-speech API
- `backend/app/models/user.py` - User data model

#### Frontend Pages
- `frontend/src/app/dashboard/page.tsx` - User dashboard
- `frontend/src/app/training/page.tsx` - Voice training interface  
- `frontend/src/app/playground/page.tsx` - TTS testing interface
