"""
Text-to-Speech Service

Handles speech generation using trained voice models.
Manages TTS job queue, model loading, and audio output.
"""

import os
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
from pathlib import Path
from loguru import logger
import json

from app.models.mongo.user import User
from app.models.mongo.voice_model import VoiceModel
from app.models.mongo.tts_job import TTSJob
from app.services.voice_models.model_registry import model_registry
from app.services.audio_processor import audio_processor


class TTSService:
    """Text-to-Speech generation service"""
    
    def __init__(self):
        self.active_jobs: Dict[str, TTSJob] = {}
        self.output_path = Path("./storage/tts_outputs")
        self.output_path.mkdir(parents=True, exist_ok=True)
        
        # TTS processing queue
        self.tts_queue = asyncio.Queue()
        self.is_processing = False
        
        # Model cache for faster generation
        self.loaded_models = {}
        self.model_load_times = {}
        
        # Generation statistics
        self.stats = {
            "total_generations": 0,
            "total_characters": 0,
            "total_duration_seconds": 0,
            "average_quality": 0.0
        }
    
    async def generate_speech(
        self,
        user_id: str,
        voice_model_id: str,
        text: str,
        output_format: str = "mp3",
        voice_settings: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate speech and return job ID"""
        try:
            # Validate user
            user = await User.get(user_id)
            if not user:
                raise ValueError("User not found")
            
            if not user.can_generate_voice():
                raise ValueError("User has insufficient credits or inactive subscription")
            
            # Validate voice model
            voice_model = await VoiceModel.get(voice_model_id)
            if not voice_model:
                raise ValueError("Voice model not found")
            
            # Check model ownership/permissions
            if not voice_model.is_public and voice_model.user_id != user_id:
                raise ValueError("Access denied to voice model")
            
            if voice_model.status != "completed" or voice_model.deployment_status != "deployed":
                raise ValueError("Voice model is not ready for generation")
            
            # Validate text
            if not text or not text.strip():
                raise ValueError("Text cannot be empty")
            
            if len(text) > 10000:  # 10k character limit
                raise ValueError("Text exceeds maximum length of 10,000 characters")
            
            # Check user limits
            char_count = len(text)
            limits = user.get_monthly_limits()
            if limits["tts_characters"] != -1:  # Not unlimited
                if user.total_tts_characters + char_count > limits["tts_characters"]:
                    raise ValueError("Monthly character limit exceeded")
            
            # Estimate cost and duration
            cost_info = await self._estimate_generation_cost(voice_model, text, voice_settings)
            
            # Create TTS job
            job_id = str(uuid.uuid4())
            job = TTSJob(
                user_id=user_id,
                voice_model_id=voice_model_id,
                text=text,
                voice_settings=voice_settings or {},
                output_format=output_format,
                estimated_duration=cost_info["estimated_duration"],
                estimated_cost=cost_info["estimated_cost"]
            )
            
            # Set job ID and save to database
            job.id = job_id
            await job.save()
            
            # Store in active jobs
            self.active_jobs[job_id] = job
            
            # Add to processing queue
            await self.tts_queue.put(job)
            
            # Start processing if not already running
            if not self.is_processing:
                asyncio.create_task(self._process_tts_queue())
            
            logger.info(f"Created TTS job {job_id} for user {user_id}")
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to create TTS job: {e}")
            raise
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get TTS job status"""
        try:
            # Try active jobs first
            job = self.active_jobs.get(job_id)
            if job:
                return job.to_dict()
            
            # Fall back to database - handle invalid ObjectId format
            try:
                job = await TTSJob.get(job_id)
                return job.to_dict() if job else None
            except Exception as e:
                # Handle invalid ObjectId format or other database errors
                logger.debug(f"Failed to get job from database: {e}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting job status for {job_id}: {e}")
            return None
    
    async def cancel_job(self, job_id: str, user_id: str) -> bool:
        """Cancel a TTS job"""
        job = self.active_jobs.get(job_id)
        if not job:
            # Try database
            job = await TTSJob.get(job_id)
            if not job:
                return False
        
        if job.user_id != user_id:
            raise ValueError("Cannot cancel job belonging to another user")
        
        if job.status in ["completed", "failed"]:
            return False
        
        job.status = "cancelled"
        job.error_message = "Generation cancelled by user"
        job.completed_at = datetime.utcnow()
        await job.save()
        
        logger.info(f"Cancelled TTS job {job_id}")
        return True
    
    async def get_job_result(self, job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get job result including audio file path"""
        job = self.active_jobs.get(job_id)
        if not job:
            job = await TTSJob.get(job_id)
        
        if not job:
            return None
        
        if job.user_id != user_id:
            raise ValueError("Cannot access job belonging to another user")
        
        if job.status != "completed" or not job.output_file_path:
            return None
        
        # Check if file exists
        if not os.path.exists(job.output_file_path):
            logger.error(f"Output file missing for job {job_id}: {job.output_file_path}")
            return None
        
        return {
            "job_id": job_id,
            "status": job.status,
            "output_file": job.output_file_path,
            "duration": job.actual_duration,
            "file_size_mb": job.output_file_size_mb,
            "quality_score": job.quality_score,
            "created_at": job.created_at.isoformat(),
            "completed_at": job.completed_at.isoformat() if job.completed_at else None
        }
    
    async def _process_tts_queue(self):
        """Process TTS jobs from queue"""
        self.is_processing = True
        
        try:
            while True:
                try:
                    # Get next job (wait up to 30 seconds)
                    job = await asyncio.wait_for(self.tts_queue.get(), timeout=30.0)
                    
                    if job.status == "cancelled":
                        continue
                    
                    # Process the job
                    await self._execute_tts_job(job)
                    
                except asyncio.TimeoutError:
                    # No jobs in queue, stop processing
                    break
                except Exception as e:
                    logger.error(f"Error in TTS queue processing: {e}")
                    
        finally:
            self.is_processing = False
    
    async def _execute_tts_job(self, job: TTSJob):
        """Execute a single TTS job"""
        try:
            job.status = "processing"
            job.started_at = datetime.utcnow()
            await job.save()
            
            logger.info(f"Starting TTS job {job.id}")
            
            # Load voice model
            voice_model = await VoiceModel.get(job.voice_model_id)
            if not voice_model:
                raise ValueError("Voice model not found")
            
            # Load the appropriate model for generation
            model = await self._load_model_for_generation(voice_model)
            if not model:
                raise ValueError(f"Failed to load voice model {voice_model.model_type}")
            
            # Generate speech
            audio_data = await self._generate_audio(model, voice_model, job)
            
            # Post-process audio
            processed_audio = await self._post_process_audio(audio_data, job)
            
            # Save output file
            output_path = await self._save_audio_output(processed_audio, job)
            
            # Update job with results
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            job.output_file_path = str(output_path)
            job.output_file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            job.actual_cost = await self._calculate_actual_cost(job, voice_model)
            
            # Calculate quality score (simplified)
            job.quality_score = await self._assess_audio_quality(processed_audio)
            
            await job.save()
            
            # Update user usage
            user = await User.get(job.user_id)
            if user:
                await user.update_usage(
                    tts_characters=len(job.text),
                    tts_seconds=job.actual_duration or 0
                )
            
            # Update statistics
            await self._update_generation_stats(job)
            
            logger.info(f"Completed TTS job {job.id}")
            
        except Exception as e:
            logger.error(f"TTS job {job.id} failed: {e}")
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            await job.save()
    
    async def _load_model_for_generation(self, voice_model: VoiceModel):
        """Load and cache model for generation"""
        model_key = f"{voice_model.model_type}_{voice_model.id}"
        
        # Check if model is already loaded
        if model_key in self.loaded_models:
            # Update access time
            self.model_load_times[model_key] = datetime.utcnow()
            return self.loaded_models[model_key]
        
        # Load model based on type
        if voice_model.model_type == "elevenlabs":
            # For ElevenLabs, we use the API directly
            model = await model_registry.load_model("elevenlabs_multilingual")
            if model and hasattr(voice_model, 'external_voice_id'):
                # Set the voice ID for this specific model
                model.current_voice_id = voice_model.external_voice_id
        
        elif voice_model.model_type == "xtts_v2":
            # For XTTS, load the trained model files
            model = await self._load_xtts_model(voice_model)
        
        else:
            # Generic model loading
            model = await model_registry.load_model(voice_model.model_type)
        
        if model:
            # Cache the model
            self.loaded_models[model_key] = model
            self.model_load_times[model_key] = datetime.utcnow()
            
            # Clean up old cached models if we have too many
            await self._cleanup_model_cache()
        
        return model
    
    async def _load_xtts_model(self, voice_model: VoiceModel):
        """Load XTTS model from files"""
        try:
            # For now, simulate XTTS model loading
            # In a real implementation, this would load the actual model files
            class XTTSModel:
                def __init__(self, voice_model):
                    self.voice_model = voice_model
                    self.model_files = voice_model.model_files
                
                async def generate_speech(self, text: str, **kwargs):
                    # Simulate XTTS speech generation
                    # Return dummy audio data for now
                    duration = len(text) * 0.05  # ~20 chars per second
                    return {
                        "audio_data": b"dummy_audio_data",  # Placeholder
                        "duration": duration,
                        "sample_rate": 22050
                    }
            
            return XTTSModel(voice_model)
            
        except Exception as e:
            logger.error(f"Failed to load XTTS model: {e}")
            return None
    
    async def _generate_audio(self, model, voice_model: VoiceModel, job: TTSJob) -> bytes:
        """Generate audio using the loaded model"""
        try:
            if voice_model.model_type == "elevenlabs":
                return await self._generate_with_elevenlabs(model, job)
            elif voice_model.model_type == "xtts_v2":
                return await self._generate_with_xtts(model, job)
            else:
                return await self._generate_generic(model, job)
                
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            raise
    
    async def _generate_with_elevenlabs(self, model, job: TTSJob) -> bytes:
        """Generate speech with ElevenLabs"""
        try:
            # Use ElevenLabs model to generate speech
            voice_settings = job.voice_settings or {}
            
            audio_data = await model.generate_speech(
                job.text,
                voice_id=getattr(model, 'current_voice_id', 'default'),
                stability=voice_settings.get("stability", 0.5),
                similarity_boost=voice_settings.get("similarity_boost", 0.8),
                style=voice_settings.get("style", 0.0),
                use_speaker_boost=voice_settings.get("speaker_boost", True)
            )
            
            # Extract duration from audio data (simplified)
            job.actual_duration = len(job.text) * 0.05  # Estimate
            
            return audio_data
            
        except Exception as e:
            logger.error(f"ElevenLabs generation failed: {e}")
            raise
    
    async def _generate_with_xtts(self, model, job: TTSJob) -> bytes:
        """Generate speech with XTTS"""
        try:
            # Use XTTS model to generate speech
            result = await model.generate_speech(
                job.text,
                temperature=job.voice_settings.get("temperature", 0.7),
                length_penalty=job.voice_settings.get("length_penalty", 1.0),
                repetition_penalty=job.voice_settings.get("repetition_penalty", 1.1)
            )
            
            job.actual_duration = result["duration"]
            return result["audio_data"]
            
        except Exception as e:
            logger.error(f"XTTS generation failed: {e}")
            raise
    
    async def _generate_generic(self, model, job: TTSJob) -> bytes:
        """Generic speech generation"""
        try:
            # Fallback generation method
            if hasattr(model, 'generate_speech'):
                return await model.generate_speech(job.text, **job.voice_settings)
            else:
                # Simulate audio generation
                duration = len(job.text) * 0.05
                job.actual_duration = duration
                return b"dummy_audio_data_" + job.text.encode()[:100]
                
        except Exception as e:
            logger.error(f"Generic generation failed: {e}")
            raise
    
    async def _post_process_audio(self, audio_data: bytes, job: TTSJob) -> bytes:
        """Post-process generated audio"""
        try:
            # Apply audio processing based on job settings
            processed_audio = audio_data
            
            # Normalize audio
            if job.voice_settings.get("normalize", True):
                processed_audio = await audio_processor.normalize_audio(processed_audio)
            
            # Apply noise reduction
            if job.voice_settings.get("denoise", False):
                processed_audio = await audio_processor.reduce_noise(processed_audio)
            
            # Convert format if needed
            if job.output_format != "wav":
                processed_audio = await audio_processor.convert_format(
                    processed_audio, 
                    target_format=job.output_format
                )
            
            return processed_audio
            
        except Exception as e:
            logger.error(f"Audio post-processing failed: {e}")
            return audio_data  # Return original if processing fails
    
    async def _save_audio_output(self, audio_data: bytes, job: TTSJob) -> Path:
        """Save generated audio to file"""
        try:
            # Create output filename
            filename = f"tts_{job.id}.{job.output_format}"
            output_path = self.output_path / filename
            
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write audio data
            with open(output_path, 'wb') as f:
                f.write(audio_data)
            
            logger.info(f"Saved TTS output to {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to save audio output: {e}")
            raise
    
    async def _calculate_actual_cost(self, job: TTSJob, voice_model: VoiceModel) -> float:
        """Calculate actual generation cost"""
        try:
            # Cost calculation based on model type and usage
            if voice_model.model_type == "elevenlabs":
                # ElevenLabs charges per character
                return len(job.text) * 0.0001  # $0.0001 per character
            else:
                # Local models have minimal cost
                return job.actual_duration * 0.001  # $0.001 per second
                
        except Exception as e:
            logger.error(f"Cost calculation failed: {e}")
            return 0.0
    
    async def _assess_audio_quality(self, audio_data: bytes) -> float:
        """Assess generated audio quality"""
        try:
            # Use audio processor to analyze quality
            quality_metrics = await audio_processor.analyze_audio_quality(audio_data)
            
            # Calculate composite quality score
            quality_score = (
                quality_metrics.get("snr_score", 0.8) * 0.3 +
                quality_metrics.get("spectral_score", 0.8) * 0.3 +
                quality_metrics.get("clarity_score", 0.8) * 0.4
            )
            
            return min(max(quality_score, 0.0), 1.0)  # Clamp to [0, 1]
            
        except Exception as e:
            logger.error(f"Quality assessment failed: {e}")
            return 0.8  # Default quality score
    
    async def _estimate_generation_cost(
        self, 
        voice_model: VoiceModel, 
        text: str, 
        voice_settings: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Estimate generation cost and duration"""
        try:
            char_count = len(text)
            
            # Estimate duration (rough approximation)
            # Average speaking rate is ~150 words per minute
            # Average word length is ~5 characters
            words = char_count / 5
            estimated_duration = (words / 150) * 60  # Convert to seconds
            
            # Estimate cost based on model type
            if voice_model.model_type == "elevenlabs":
                estimated_cost = char_count * 0.0001
            else:
                estimated_cost = estimated_duration * 0.001
            
            return {
                "estimated_duration": estimated_duration,
                "estimated_cost": estimated_cost,
                "character_count": char_count
            }
            
        except Exception as e:
            logger.error(f"Cost estimation failed: {e}")
            return {
                "estimated_duration": 30.0,
                "estimated_cost": 0.01,
                "character_count": len(text)
            }
    
    async def _cleanup_model_cache(self, max_models: int = 5):
        """Clean up old models from cache"""
        if len(self.loaded_models) <= max_models:
            return
        
        # Sort by access time (oldest first)
        sorted_models = sorted(
            self.model_load_times.items(),
            key=lambda x: x[1]
        )
        
        # Remove oldest models
        models_to_remove = len(self.loaded_models) - max_models
        for model_key, _ in sorted_models[:models_to_remove]:
            if model_key in self.loaded_models:
                del self.loaded_models[model_key]
            if model_key in self.model_load_times:
                del self.model_load_times[model_key]
            logger.info(f"Removed cached model: {model_key}")
    
    async def _update_generation_stats(self, job: TTSJob):
        """Update generation statistics"""
        self.stats["total_generations"] += 1
        self.stats["total_characters"] += len(job.text)
        self.stats["total_duration_seconds"] += job.actual_duration or 0
        
        # Update average quality (rolling average)
        current_quality = self.stats["average_quality"]
        new_quality = job.quality_score or 0.8
        total_generations = self.stats["total_generations"]
        
        self.stats["average_quality"] = (
            (current_quality * (total_generations - 1) + new_quality) / 
            total_generations
        )
    
    async def list_user_jobs(
        self, 
        user_id: str, 
        status_filter: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """List TTS jobs for a user"""
        try:
            # Query database for user jobs
            filter_query = {"user_id": user_id}
            if status_filter:
                filter_query["status"] = status_filter
            
            jobs = await TTSJob.find(filter_query).sort("-created_at").limit(limit).to_list()
            
            return [job.to_dict() for job in jobs]
            
        except Exception as e:
            logger.error(f"Failed to list user jobs: {e}")
            return []
    
    def get_service_stats(self) -> Dict[str, Any]:
        """Get TTS service statistics"""
        return {
            **self.stats,
            "active_jobs": len(self.active_jobs),
            "queue_size": self.tts_queue.qsize(),
            "cached_models": len(self.loaded_models),
            "is_processing": self.is_processing
        }
    
    async def cleanup_old_outputs(self, max_age_days: int = 30):
        """Clean up old TTS output files"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
            
            # Find old TTS jobs
            old_jobs = await TTSJob.find({
                "completed_at": {"$lt": cutoff_date},
                "status": "completed"
            }).to_list()
            
            cleaned_count = 0
            for job in old_jobs:
                if job.output_file_path and os.path.exists(job.output_file_path):
                    try:
                        os.remove(job.output_file_path)
                        cleaned_count += 1
                        logger.info(f"Cleaned up old TTS output: {job.output_file_path}")
                    except Exception as e:
                        logger.error(f"Failed to remove file {job.output_file_path}: {e}")
            
            logger.info(f"Cleaned up {cleaned_count} old TTS output files")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return 0


# Global TTS service instance
tts_service = TTSService()