"""
Voice Training API Endpoints

Provides REST API for voice training operations.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel, Field
import json

from app.core.auth import get_current_user
from app.models.mongo.user import User
from app.models.mongo.voice_sample import VoiceSample
from app.services.voice_training_service import voice_training_service

router = APIRouter()


class TrainingJobRequest(BaseModel):
    voice_name: str = Field(..., min_length=1, max_length=100)
    sample_ids: List[str] = Field(..., min_items=3, max_items=50)
    training_config: Optional[Dict[str, Any]] = None


class TrainingJobResponse(BaseModel):
    job_id: str
    message: str = "Training job started successfully"


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    voice_name: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result_model_id: Optional[str] = None
    error_message: Optional[str] = None
    config: Dict[str, Any]


@router.post("/start", response_model=TrainingJobResponse)
async def start_training(
    request: TrainingJobRequest,
    current_user: User = Depends(get_current_user)
):
    """Start a new voice training job"""
    try:
        # Validate voice name
        if not request.voice_name or not request.voice_name.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Voice name cannot be empty"
            )
        
        # Start training job
        job_id = await voice_training_service.start_training(
            user_id=str(current_user.id),
            voice_name=request.voice_name.strip(),
            sample_ids=request.sample_ids,
            training_config=request.training_config
        )
        
        return TrainingJobResponse(job_id=job_id)
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start training job"
        )


@router.get("/job/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get training job status"""
    try:
        job_data = await voice_training_service.get_job_status(job_id)
        
        if not job_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        # Check ownership
        if job_data["user_id"] != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this training job"
            )
        
        return JobStatusResponse(**job_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get job status"
        )


@router.post("/job/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel a training job"""
    try:
        success = await voice_training_service.cancel_job(
            job_id=job_id,
            user_id=str(current_user.id)
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found or cannot be cancelled"
            )
        
        return {"message": "Training job cancelled successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel training job"
        )


@router.get("/jobs")
async def list_training_jobs(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List user's training jobs"""
    try:
        jobs = await voice_training_service.list_user_jobs(
            user_id=str(current_user.id),
            status_filter=status_filter
        )
        
        return {
            "jobs": jobs,
            "total": len(jobs)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list training jobs"
        )


@router.get("/samples/suitable")
async def get_suitable_samples(
    current_user: User = Depends(get_current_user)
):
    """Get voice samples suitable for training"""
    try:
        # Find user's samples that are suitable for training
        samples = await VoiceSample.find({
            "user_id": str(current_user.id),
            "is_suitable_for_training": True,
            "status": "processed"
        }).sort("-created_at").limit(100).to_list()
        
        suitable_samples = []
        for sample in samples:
            suitable_samples.append({
                "id": str(sample.id),
                "filename": sample.filename,
                "duration_seconds": sample.duration_seconds,
                "quality_score": sample.quality_score,
                "transcription": sample.transcription,
                "language_detected": sample.language_detected,
                "created_at": sample.created_at.isoformat()
            })
        
        return {
            "samples": suitable_samples,
            "total": len(suitable_samples)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suitable samples"
        )


@router.post("/validate-samples")
async def validate_training_samples(
    sample_ids: List[str],
    current_user: User = Depends(get_current_user)
):
    """Validate samples for training"""
    try:
        if not sample_ids or len(sample_ids) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least 3 samples are required for training"
            )
        
        # Check each sample
        validation_results = []
        total_duration = 0
        suitable_count = 0
        
        for sample_id in sample_ids:
            sample = await VoiceSample.get(sample_id)
            
            if not sample:
                validation_results.append({
                    "sample_id": sample_id,
                    "valid": False,
                    "error": "Sample not found"
                })
                continue
            
            if sample.user_id != str(current_user.id):
                validation_results.append({
                    "sample_id": sample_id,
                    "valid": False,
                    "error": "Sample does not belong to user"
                })
                continue
            
            if not sample.is_suitable_for_training:
                validation_results.append({
                    "sample_id": sample_id,
                    "valid": False,
                    "error": "Sample is not suitable for training"
                })
                continue
            
            # Sample is valid
            validation_results.append({
                "sample_id": sample_id,
                "valid": True,
                "duration": sample.duration_seconds,
                "quality_score": sample.quality_score,
                "filename": sample.filename
            })
            
            total_duration += sample.duration_seconds
            suitable_count += 1
        
        # Overall validation
        overall_valid = (suitable_count >= 3 and total_duration >= 30)
        
        warnings = []
        if total_duration < 60:
            warnings.append("Total duration is less than 60 seconds. Consider adding more samples for better results.")
        
        if suitable_count < 5:
            warnings.append("Less than 5 samples selected. More samples typically produce better voice models.")
        
        return {
            "overall_valid": overall_valid,
            "suitable_samples": suitable_count,
            "total_samples": len(sample_ids),
            "total_duration": total_duration,
            "validation_results": validation_results,
            "warnings": warnings
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to validate samples"
        )


@router.get("/stats")
async def get_training_stats(
    current_user: User = Depends(get_current_user)
):
    """Get training service statistics (admin only for now)"""
    try:
        # For now, return basic stats
        # In a real app, you might want to restrict this to admin users
        stats = voice_training_service.get_training_stats()
        
        # Add user-specific stats
        user_jobs = await voice_training_service.list_user_jobs(str(current_user.id))
        user_stats = {
            "user_total_jobs": len(user_jobs),
            "user_completed_jobs": len([j for j in user_jobs if j["status"] == "completed"]),
            "user_failed_jobs": len([j for j in user_jobs if j["status"] == "failed"]),
            "user_pending_jobs": len([j for j in user_jobs if j["status"] in ["pending", "processing"]])
        }
        
        return {
            "service_stats": stats,
            "user_stats": user_stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get training stats"
        )