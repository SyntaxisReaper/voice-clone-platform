# Voice Training and TTS Implementation

This document outlines the comprehensive voice training and text-to-speech (TTS) implementation for the Voice Clone Platform.

## Overview

The implementation provides a complete pipeline from voice sample processing to trained model deployment and speech generation, including:

1. **Voice Training Service** - Manages the training of custom voice models
2. **TTS Service** - Handles speech generation using trained models  
3. **Model Registry** - Centralized registry for different voice model types
4. **Audio Processor** - Advanced audio processing and quality analysis
5. **API Endpoints** - REST API for training and TTS operations

## Architecture

### Core Services

#### 1. Voice Training Service (`voice_training_service.py`)

**Purpose**: Manages the entire voice training pipeline

**Key Features**:
- Asynchronous job queue processing
- Sample validation and preparation  
- Support for multiple model types (XTTS, ElevenLabs, etc.)
- Real-time progress tracking
- Model deployment and registration
- User quota and permission management

**Training Flow**:
1. Validate user permissions and sample quality
2. Prepare training data (enhancement, format conversion)
3. Initialize appropriate model type
4. Execute training with progress updates
5. Validate and deploy trained model
6. Update user statistics and model registry

#### 2. TTS Service (`tts_service.py`)

**Purpose**: Handles text-to-speech generation using trained models

**Key Features**:
- Asynchronous generation queue
- Model caching for performance
- Multiple output formats (MP3, WAV, OGG)
- Quality assessment and post-processing
- Cost estimation and tracking
- File management and cleanup

**Generation Flow**:
1. Validate user permissions and model access
2. Estimate cost and duration
3. Load and cache appropriate model
4. Generate speech audio
5. Post-process audio (normalization, format conversion)
6. Save output and update statistics

#### 3. Model Registry (`model_registry.py`)

**Purpose**: Centralized management of voice model types

**Supported Models**:
- **XTTS v2**: Advanced open-source TTS model
- **ElevenLabs**: Commercial voice cloning API
- **Bark**: Generative audio model
- **Azure Cognitive Services**: Microsoft's TTS service
- **OpenAI TTS**: OpenAI's text-to-speech API
- **Coqui**: Open-source TTS toolkit

**Features**:
- Model availability checking
- Capability flags and specifications
- Cost estimation per model type
- Dynamic model loading/unloading

#### 4. Audio Processor (`audio_processor.py`)

**Purpose**: Comprehensive audio processing and analysis

**Capabilities**:
- **Quality Analysis**: SNR, spectral analysis, voice activity detection
- **Enhancement**: Noise reduction, speech enhancement, normalization
- **Format Support**: WAV, MP3, FLAC, OGG with automatic conversion
- **Batch Processing**: Efficient processing of multiple files
- **Metadata Extraction**: Duration, sample rate, channel info

### API Endpoints

#### Training API (`/api/training`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/start` | POST | Start a new training job |
| `/job/{job_id}` | GET | Get training job status |
| `/job/{job_id}/cancel` | POST | Cancel a training job |
| `/jobs` | GET | List user's training jobs |
| `/samples/suitable` | GET | Get samples suitable for training |
| `/validate-samples` | POST | Validate samples for training |
| `/stats` | GET | Get training statistics |

#### TTS API (`/api/tts`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate` | POST | Generate speech from text |
| `/job/{job_id}` | GET | Get TTS job status |
| `/job/{job_id}/cancel` | POST | Cancel TTS job |
| `/job/{job_id}/result` | GET | Get job result info |
| `/job/{job_id}/download` | GET | Download audio file |
| `/jobs` | GET | List user's TTS jobs |
| `/models/available` | GET | Get available voice models |
| `/models/{model_id}/info` | GET | Get model details |

## Data Models

### Training Job Structure
```python
{
    "job_id": "uuid",
    "user_id": "uuid", 
    "voice_name": "string",
    "sample_ids": ["uuid", ...],
    "status": "pending|processing|completed|failed|cancelled",
    "progress": 0.0-1.0,
    "config": {
        "epochs": 100,
        "batch_size": 32,
        "learning_rate": 0.0002,
        "model_type": "xtts_v2"
    },
    "created_at": "timestamp",
    "started_at": "timestamp",
    "completed_at": "timestamp",
    "result_model_id": "uuid",
    "error_message": "string"
}
```

### TTS Job Structure  
```python
{
    "job_id": "uuid",
    "user_id": "uuid",
    "voice_model_id": "uuid", 
    "text": "string",
    "status": "pending|processing|completed|failed|cancelled",
    "output_format": "mp3|wav|ogg",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.8,
        "style": 0.0
    },
    "estimated_duration": 0.0,
    "actual_duration": 0.0,
    "estimated_cost": 0.0,
    "actual_cost": 0.0,
    "quality_score": 0.0-1.0,
    "output_file_path": "string",
    "created_at": "timestamp",
    "completed_at": "timestamp"
}
```

## MongoDB Integration

### Document Models
- **User**: Enhanced with training/TTS usage tracking
- **VoiceSample**: Quality assessment and training suitability  
- **VoiceModel**: Complete model metadata and deployment status
- **TTSJob**: TTS generation job tracking

### Key Features
- **Beanie ODM**: Async MongoDB operations
- **Automatic Indexing**: Optimized queries for user operations
- **Usage Tracking**: Credits, limits, and statistics
- **Security**: User isolation and permission checks

## Configuration and Deployment

### Environment Variables
```bash
# MongoDB
MONGODB_URL=mongodb://localhost:27017/voice_platform

# Model Storage  
MODEL_STORAGE_PATH=./storage/models
TTS_OUTPUT_PATH=./storage/tts_outputs

# API Keys (for commercial models)
ELEVENLABS_API_KEY=your_key_here
AZURE_SPEECH_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Dependencies
```bash
# Audio processing
librosa==0.10.1
soundfile==0.12.1  
pydub==0.25.1
ffmpeg-python==0.2.0

# Machine learning (for future XTTS integration)
torch>=2.0.0
torchaudio>=2.0.0
transformers>=4.30.0

# MongoDB
beanie>=1.20.0
motor>=3.2.0
```

## Performance Considerations

### Scalability
- **Async Processing**: Non-blocking job queues
- **Model Caching**: Reduce loading times for frequent models
- **Cleanup Tasks**: Automatic removal of old files and jobs
- **Queue Management**: Graceful handling of high load

### Optimization
- **Audio Processing**: Efficient batch operations
- **Memory Management**: Model cache size limits
- **File Storage**: Organized directory structure
- **Database Queries**: Indexed operations for user data

## Security Features

### Authentication & Authorization
- JWT-based authentication for all endpoints
- User-specific model and job access control
- Permission checking for public vs private models

### Data Protection  
- User data isolation in MongoDB
- Secure file storage with access controls
- API rate limiting and usage quotas
- Input validation and sanitization

## Future Enhancements

### Planned Features
1. **Real-time TTS Streaming**: WebSocket-based audio streaming
2. **Voice Cloning Quality Metrics**: Advanced similarity scoring
3. **Batch TTS Operations**: Process multiple texts efficiently
4. **Voice Style Transfer**: Modify existing voices with different emotions
5. **Multi-language Support**: Enhanced language detection and processing

### Technical Improvements
1. **GPU Acceleration**: CUDA support for faster training
2. **Distributed Training**: Multi-node training capabilities  
3. **Model Optimization**: Quantization and pruning for efficiency
4. **Advanced Audio Features**: Emotion recognition, speaking style analysis
5. **WebRTC Integration**: Real-time voice processing

## Usage Examples

### Start Training Job
```python
# POST /api/training/start
{
    "voice_name": "My Professional Voice",
    "sample_ids": ["sample1", "sample2", "sample3"],
    "training_config": {
        "model_type": "xtts_v2",
        "epochs": 150,
        "quality_target": "high"
    }
}
```

### Generate Speech
```python  
# POST /api/tts/generate
{
    "text": "Hello, this is my cloned voice speaking.",
    "voice_model_id": "model_uuid",
    "output_format": "mp3",
    "voice_settings": {
        "stability": 0.7,
        "similarity_boost": 0.9
    }
}
```

This implementation provides a robust, scalable foundation for voice training and TTS operations with room for future enhancements and optimizations.