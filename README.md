# Voice Clone Platform

A comprehensive text-to-speech voice cloning platform with advanced features for voice training, synthesis, and management.

## Features

- 🎤 **Voice Recording & Upload** - Record or upload voice samples for training
- 🧠 **AI Voice Training** - Train custom voice models using Coqui TTS, FastSpeech2, and HiFi-GAN
- 🗣️ **Text-to-Speech** - Generate speech with emotional tagging and real-time playback
- 📊 **Voice Dashboard** - Monitor usage logs and voice analytics
- 🔒 **Permission Management** - Control who can use your voice with licensing system
- 🔐 **Audio Watermarking** - Inaudible watermarks for tracking and protection
- 🛡️ **Cyber Security** - Built-in security features and help resources
- 📱 **Mobile Responsive** - Clean, modern, creator-friendly UI

## Tech Stack

### Frontend
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend
- **FastAPI** - Modern, fast web framework for APIs
- **Python** - Backend programming language

### AI/ML
- **Coqui TTS** - Text-to-speech synthesis
- **FastSpeech2** - Neural TTS model
- **HiFi-GAN** - High-fidelity neural vocoder

### Database & Storage
- **PostgreSQL** - Primary database
- **AWS S3** - Audio file storage
- **Firebase Auth** - Authentication system

### Deployment
- **Vercel** - Frontend deployment
- **AWS/GCP** - Backend deployment

## Project Structure

```
voice-clone-platform/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── shared/            # Shared utilities and types
├── docs/              # Documentation
├── scripts/           # Build and deployment scripts
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd voice-clone-platform
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables (see `.env.example` files)

5. Run the development servers
```bash
# Frontend (in frontend/ directory)
npm run dev

# Backend (in backend/ directory)
uvicorn main:app --reload
```

## Documentation

- [API Documentation](docs/api.md)
- [Frontend Guide](docs/frontend.md)
- [Voice Training Guide](docs/voice-training.md)
- [Deployment Guide](docs/deployment.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.
