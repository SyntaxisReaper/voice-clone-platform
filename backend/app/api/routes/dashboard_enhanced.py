"""
Enhanced Dashboard API Endpoints

Provides comprehensive dashboard data, analytics, and user management features.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.core.auth import get_current_active_user
from app.models.mongo.user import User
from app.models.mongo.voice_sample import VoiceSample
from app.models.mongo.voice_model import VoiceModel
from app.models.mongo.tts_job import TTSJob
from app.services.voice_training_service import voice_training_service
from app.services.tts_service import tts_service

router = APIRouter()


class DashboardStats(BaseModel):
    # Voice samples
    total_samples: int
    samples_suitable_for_training: int
    average_sample_quality: float
    
    # Voice models
    total_voice_models: int
    deployed_models: int
    training_models: int
    
    # TTS usage
    total_tts_jobs: int
    completed_tts_jobs: int
    total_characters_generated: int
    total_audio_duration: float
    
    # Credits and limits
    credits_remaining: int
    monthly_limits: Dict[str, int]
    usage_this_month: Dict[str, int]
    
    # Recent activity
    recent_activity: List[Dict[str, Any]]


class ActivityItem(BaseModel):
    type: str  # "sample_upload", "training_start", "training_complete", "tts_generate"
    description: str
    timestamp: str
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UsageChart(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]


class ModelSummary(BaseModel):
    id: str
    name: str
    status: str
    quality_score: Optional[float]
    usage_count: int
    created_at: str


class JobSummary(BaseModel):
    id: str
    type: str  # "training" or "tts"
    status: str
    created_at: str
    completed_at: Optional[str] = None
    progress: Optional[float] = None


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    """Get comprehensive dashboard statistics"""
    try:
        # Get user's voice samples
        samples = await VoiceSample.find(VoiceSample.user_id == str(current_user.id)).to_list()
        samples_suitable = [s for s in samples if s.is_suitable_for_training]
        avg_quality = sum(s.quality_score for s in samples if s.quality_score) / max(1, len(samples))
        
        # Get user's voice models
        models = await VoiceModel.find(VoiceModel.user_id == str(current_user.id)).to_list()
        deployed_models = [m for m in models if m.deployment_status == "deployed"]
        training_models = [m for m in models if m.status == "training"]
        
        # Get user's TTS jobs
        tts_jobs = await TTSJob.find(TTSJob.user_id == str(current_user.id)).to_list()
        completed_tts = [j for j in tts_jobs if j.status == "completed"]
        total_chars = sum(len(j.text or "") for j in completed_tts)
        total_duration = sum(j.actual_duration or 0 for j in completed_tts)
        
        # Get limits and usage
        monthly_limits = current_user.get_monthly_limits()
        usage_this_month = {
            "voice_samples": len(samples),
            "training_minutes": current_user.total_training_minutes,
            "tts_characters": current_user.total_tts_characters,
            "tts_seconds": current_user.total_tts_seconds
        }
        
        # Get recent activity
        recent_activity = await _get_recent_activity(current_user.id)
        
        return DashboardStats(
            total_samples=len(samples),
            samples_suitable_for_training=len(samples_suitable),
            average_sample_quality=avg_quality,
            total_voice_models=len(models),
            deployed_models=len(deployed_models),
            training_models=len(training_models),
            total_tts_jobs=len(tts_jobs),
            completed_tts_jobs=len(completed_tts),
            total_characters_generated=total_chars,
            total_audio_duration=total_duration,
            credits_remaining=current_user.credits_remaining,
            monthly_limits=monthly_limits,
            usage_this_month=usage_this_month,
            recent_activity=recent_activity
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )


@router.get("/activity", response_model=List[ActivityItem])
async def get_recent_activity(
    limit: int = Query(20, le=100),
    activity_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get recent user activity"""
    try:
        activity = await _get_recent_activity(current_user.id, limit, activity_type)
        return [ActivityItem(**item) for item in activity]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recent activity"
        )


@router.get("/usage-chart")
async def get_usage_chart(
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
    metric: str = Query("tts_characters", regex="^(tts_characters|training_minutes|voice_samples)$"),
    current_user: User = Depends(get_current_active_user)
):
    """Get usage chart data"""
    try:
        # Calculate date range
        days = {"7d": 7, "30d": 30, "90d": 90}[period]
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Generate daily data points
        labels = []
        data = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            labels.append(date.strftime("%Y-%m-%d"))
            
            # For now, generate sample data
            # In a real implementation, you'd aggregate from activity logs
            if metric == "tts_characters":
                value = current_user.total_tts_characters * (i + 1) // days
            elif metric == "training_minutes":
                value = current_user.total_training_minutes * (i + 1) // days
            else:  # voice_samples
                value = current_user.total_voice_samples * (i + 1) // days
            
            data.append(value)
        
        return UsageChart(
            labels=labels,
            datasets=[{
                "label": metric.replace("_", " ").title(),
                "data": data,
                "borderColor": "#3b82f6",
                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                "tension": 0.4
            }]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate usage chart"
        )


@router.get("/models", response_model=List[ModelSummary])
async def get_user_models(
    status_filter: Optional[str] = None,
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's voice models summary"""
    try:
        query = {"user_id": str(current_user.id)}
        if status_filter:
            query["status"] = status_filter
        
        models = await VoiceModel.find(query).sort("-created_at").limit(limit).to_list()
        
        result = []
        for model in models:
            result.append(ModelSummary(
                id=str(model.id),
                name=model.name,
                status=model.status,
                quality_score=model.quality_score,
                usage_count=model.usage_count,
                created_at=model.created_at.isoformat()
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user models"
        )


@router.get("/jobs", response_model=List[JobSummary])
async def get_user_jobs(
    job_type: Optional[str] = Query(None, regex="^(training|tts)$"),
    status_filter: Optional[str] = None,
    limit: int = Query(20, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's jobs summary"""
    try:
        jobs = []
        
        # Get training jobs
        if not job_type or job_type == "training":
            training_jobs = await voice_training_service.list_user_jobs(str(current_user.id), status_filter)
            for job in training_jobs[:limit]:
                jobs.append(JobSummary(
                    id=job["job_id"],
                    type="training",
                    status=job["status"],
                    created_at=job["created_at"],
                    completed_at=job.get("completed_at"),
                    progress=job.get("progress")
                ))
        
        # Get TTS jobs
        if not job_type or job_type == "tts":
            tts_jobs = await tts_service.list_user_jobs(str(current_user.id), status_filter, limit)
            for job in tts_jobs:
                jobs.append(JobSummary(
                    id=job.get("job_id", ""),
                    type="tts",
                    status=job.get("status", "unknown"),
                    created_at=job.get("created_at", ""),
                    completed_at=job.get("completed_at"),
                    progress=job.get("progress")
                ))
        
        # Sort by creation time
        jobs.sort(key=lambda x: x.created_at, reverse=True)
        
        return jobs[:limit]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user jobs"
        )


@router.get("/quota-status")
async def get_quota_status(current_user: User = Depends(get_current_active_user)):
    """Get detailed quota and usage status"""
    try:
        limits = current_user.get_monthly_limits()
        
        # Calculate usage percentages
        usage_percentages = {}
        for key, limit in limits.items():
            if limit == -1:  # Unlimited
                usage_percentages[key] = 0
                continue
            
            if key == "voice_samples":
                current_usage = current_user.total_voice_samples
            elif key == "training_minutes":
                current_usage = current_user.total_training_minutes
            elif key == "tts_characters":
                current_usage = current_user.total_tts_characters
            elif key == "api_calls":
                current_usage = 0  # TODO: Track API calls
            else:
                current_usage = 0
            
            usage_percentages[key] = min(100, (current_usage / limit) * 100) if limit > 0 else 0
        
        return {
            "subscription_tier": current_user.subscription_tier.value,
            "credits_remaining": current_user.credits_remaining,
            "monthly_limits": limits,
            "current_usage": {
                "voice_samples": current_user.total_voice_samples,
                "training_minutes": current_user.total_training_minutes,
                "tts_characters": current_user.total_tts_characters,
                "tts_seconds": current_user.total_tts_seconds
            },
            "usage_percentages": usage_percentages,
            "reset_date": current_user.last_credit_reset.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get quota status"
        )


@router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_active_user)):
    """Get personalized recommendations for the user"""
    try:
        recommendations = []
        
        # Get user data
        samples = await VoiceSample.find(VoiceSample.user_id == str(current_user.id)).to_list()
        models = await VoiceModel.find(VoiceModel.user_id == str(current_user.id)).to_list()
        
        # Recommendation logic
        if len(samples) == 0:
            recommendations.append({
                "type": "action",
                "title": "Upload Your First Voice Sample",
                "description": "Get started by uploading high-quality audio samples to train your voice model.",
                "action": "upload_sample",
                "priority": "high"
            })
        
        elif len([s for s in samples if s.is_suitable_for_training]) >= 3 and len(models) == 0:
            recommendations.append({
                "type": "action",
                "title": "Train Your First Voice Model",
                "description": "You have enough suitable samples to train a voice model.",
                "action": "start_training",
                "priority": "high"
            })
        
        if len(samples) > 0:
            avg_quality = sum(s.quality_score for s in samples if s.quality_score) / len(samples)
            if avg_quality < 0.7:
                recommendations.append({
                    "type": "tip",
                    "title": "Improve Sample Quality",
                    "description": "Consider recording in a quieter environment or using better audio equipment.",
                    "action": "quality_tips",
                    "priority": "medium"
                })
        
        if current_user.subscription_tier.value == "free" and current_user.credits_remaining < 10:
            recommendations.append({
                "type": "upgrade",
                "title": "Consider Upgrading",
                "description": "You're running low on credits. Upgrade for unlimited access.",
                "action": "upgrade_subscription",
                "priority": "medium"
            })
        
        # Add general tips if no specific recommendations
        if not recommendations:
            recommendations.append({
                "type": "tip",
                "title": "Explore TTS Generation",
                "description": "Try generating speech with your trained models.",
                "action": "generate_tts",
                "priority": "low"
            })
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recommendations"
        )


async def _get_recent_activity(
    user_id: str, 
    limit: int = 20, 
    activity_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Helper function to get recent user activity"""
    activities = []
    
    # Get recent voice samples
    recent_samples = await VoiceSample.find(
        VoiceSample.user_id == user_id
    ).sort("-created_at").limit(5).to_list()
    
    for sample in recent_samples:
        activities.append({
            "type": "sample_upload",
            "description": f"Uploaded voice sample '{sample.filename}'",
            "timestamp": sample.created_at.isoformat(),
            "status": sample.status,
            "metadata": {
                "sample_id": str(sample.id),
                "duration": sample.duration_seconds,
                "quality_score": sample.quality_score
            }
        })
    
    # Get recent voice models
    recent_models = await VoiceModel.find(
        VoiceModel.user_id == user_id
    ).sort("-created_at").limit(5).to_list()
    
    for model in recent_models:
        if model.training_started_at:
            activities.append({
                "type": "training_start",
                "description": f"Started training voice model '{model.name}'",
                "timestamp": model.training_started_at.isoformat(),
                "status": "processing",
                "metadata": {
                    "model_id": str(model.id),
                    "model_type": model.model_type
                }
            })
        
        if model.training_completed_at:
            activities.append({
                "type": "training_complete",
                "description": f"Completed training for '{model.name}'",
                "timestamp": model.training_completed_at.isoformat(),
                "status": model.status,
                "metadata": {
                    "model_id": str(model.id),
                    "quality_score": model.quality_score
                }
            })
    
    # Get recent TTS jobs
    recent_tts = await TTSJob.find(
        TTSJob.user_id == user_id
    ).sort("-created_at").limit(5).to_list()
    
    for job in recent_tts:
        activities.append({
            "type": "tts_generate",
            "description": f"Generated TTS audio ({len(job.text or '')} characters)",
            "timestamp": job.created_at.isoformat(),
            "status": job.status,
            "metadata": {
                "job_id": str(job.id),
                "character_count": len(job.text or ""),
                "duration": job.actual_duration
            }
        })
    
    # Sort by timestamp and filter
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    if activity_type:
        activities = [a for a in activities if a["type"] == activity_type]
    
    return activities[:limit]