"""
Text-to-Speech API Endpoints

Provides REST API for TTS generation operations.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import os

from app.core.auth import get_current_user
from app.models.mongo.user import User
from app.models.mongo.voice_model import VoiceModel
from app.services.tts_service import tts_service

router = APIRouter()


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    voice_model_id: str = Field(...)
    output_format: str = Field(default="mp3", pattern="^(mp3|wav|ogg)$")
    voice_settings: Optional[Dict[str, Any]] = None


class TTSResponse(BaseModel):
    job_id: str
    message: str = "TTS generation started successfully"
    estimated_duration: float
    estimated_cost: float


class TTSJobResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    text: str
    voice_model_id: str
    output_format: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    estimated_duration: Optional[float] = None
    actual_duration: Optional[float] = None
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    quality_score: Optional[float] = None
    error_message: Optional[str] = None


class TTSResultResponse(BaseModel):
    job_id: str
    status: str
    output_file: str
    duration: Optional[float] = None
    file_size_mb: Optional[float] = None
    quality_score: Optional[float] = None
    created_at: str
    completed_at: Optional[str] = None


@router.post("/generate", response_model=TTSResponse)
async def generate_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate speech from text using a voice model"""
    try:
        # Validate text content
        if not request.text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text cannot be empty"
            )
        
        # Start TTS generation
        job_id = await tts_service.generate_speech(
            user_id=str(current_user.id),
            voice_model_id=request.voice_model_id,
            text=request.text,
            output_format=request.output_format,
            voice_settings=request.voice_settings
        )
        
        # Get job status for estimated values
        job_data = await tts_service.get_job_status(job_id)
        
        return TTSResponse(
            job_id=job_id,
            estimated_duration=job_data.get("estimated_duration", 0),
            estimated_cost=job_data.get("estimated_cost", 0)
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start TTS generation"
        )


@router.get("/job/{job_id}", response_model=TTSJobResponse)
async def get_tts_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get TTS job status"""
    try:
        job_data = await tts_service.get_job_status(job_id)
        
        if not job_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="TTS job not found"
            )
        
        # Check ownership
        if job_data["user_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this TTS job"
            )
        
        return TTSJobResponse(**job_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get TTS job status"
        )


@router.post("/job/{job_id}/cancel")
async def cancel_tts_job(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel a TTS generation job"""
    try:
        success = await tts_service.cancel_job(
            job_id=job_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="TTS job not found or cannot be cancelled"
            )
        
        return {"message": "TTS job cancelled successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel TTS job"
        )


@router.get("/job/{job_id}/result", response_model=TTSResultResponse)
async def get_tts_result(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get TTS job result information"""
    try:
        result = await tts_service.get_job_result(
            job_id=job_id,
            user_id=str(current_user.id)
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="TTS job result not found or not ready"
            )
        
        return TTSResultResponse(**result)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get TTS result"
        )


@router.get("/job/{job_id}/download")
async def download_tts_audio(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Download generated audio file"""
    try:
        result = await tts_service.get_job_result(
            job_id=job_id,
            user_id=str(current_user.id)
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="TTS job result not found or not ready"
            )
        
        file_path = result["output_file"]
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio file not found"
            )
        
        # Get file extension for content type
        file_extension = os.path.splitext(file_path)[1].lower()
        content_type_map = {
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg"
        }
        
        media_type = content_type_map.get(file_extension, "application/octet-stream")
        
        # Return file for download
        filename = f"tts_{job_id}{file_extension}"
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type=media_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download audio file"
        )


@router.get("/jobs")
async def list_tts_jobs(
    status_filter: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """List user's TTS jobs"""
    try:
        jobs = await tts_service.list_user_jobs(
            user_id=str(current_user.id),
            status_filter=status_filter,
            limit=min(limit, 100)  # Cap at 100
        )
        
        return {
            "jobs": jobs,
            "total": len(jobs)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list TTS jobs"
        )


@router.get("/models/available")
async def get_available_voice_models(
    current_user: User = Depends(get_current_user)
):
    """Get voice models available for TTS generation"""
    try:
        # Get user's private models
        user_models = await VoiceModel.find({
            "user_id": str(current_user.id),
            "status": "completed",
            "deployment_status": "deployed"
        }).sort("-created_at").to_list()
        
        # Get public models
        public_models = await VoiceModel.find({
            "is_public": True,
            "status": "completed",
            "deployment_status": "deployed"
        }).sort("-created_at").limit(50).to_list()
        
        # Format models for response
        available_models = []
        
        # Add user's private models
        for model in user_models:
            available_models.append({
                "id": str(model.id),
                "name": model.name,
                "description": model.description,
                "model_type": model.model_type,
                "quality_score": model.quality_score,
                "similarity_score": model.similarity_score,
                "naturalness_score": model.naturalness_score,
                "supported_languages": model.supported_languages,
                "is_public": model.is_public,
                "is_owned": True,
                "created_at": model.created_at.isoformat()
            })
        
        # Add public models
        for model in public_models:
            available_models.append({
                "id": str(model.id),
                "name": model.name,
                "description": model.description,
                "model_type": model.model_type,
                "quality_score": model.quality_score,
                "similarity_score": model.similarity_score,
                "naturalness_score": model.naturalness_score,
                "supported_languages": model.supported_languages,
                "is_public": model.is_public,
                "is_owned": False,
                "created_at": model.created_at.isoformat()
            })
        
        return {
            "models": available_models,
            "total": len(available_models)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get available voice models"
        )


@router.get("/models/{model_id}/info")
async def get_voice_model_info(
    model_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed information about a voice model"""
    try:
        model = await VoiceModel.get(model_id)
        
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Voice model not found"
            )
        
        # Check access permissions
        if not model.is_public and model.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this voice model"
            )
        
        # Return detailed model information
        return {
            "id": str(model.id),
            "name": model.name,
            "description": model.description,
            "model_type": model.model_type,
            "model_version": model.model_version,
            "architecture": model.architecture,
            "quality_score": model.quality_score,
            "similarity_score": model.similarity_score,
            "naturalness_score": model.naturalness_score,
            "supported_languages": model.supported_languages,
            "sample_count": model.sample_count,
            "training_duration_minutes": model.training_duration_minutes,
            "model_size_mb": model.model_size_mb,
            "is_public": model.is_public,
            "is_owned": model.user_id == str(current_user.id),
            "status": model.status,
            "deployment_status": model.deployment_status,
            "created_at": model.created_at.isoformat(),
            "training_completed_at": model.training_completed_at.isoformat() if model.training_completed_at else None,
            "deployed_at": model.deployed_at.isoformat() if model.deployed_at else None,
            "usage_count": model.usage_count,
            "total_generation_time": model.total_generation_time,
            "tags": model.tags
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get voice model information"
        )
