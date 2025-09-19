"""
File Upload Service

Handles audio file uploads, validation, storage, and processing.
"""

import os
import uuid
import mimetypes
from pathlib import Path
from typing import Optional, Dict, Any, List
import tempfile
import shutil
from fastapi import UploadFile
from loguru import logger

from app.services.audio_processor import audio_processor
from app.models.mongo.voice_sample import VoiceSample
from app.models.mongo.user import User


class FileUploadService:
    """Service for handling file uploads"""
    
    def __init__(self):
        self.storage_path = Path("./storage/uploads")
        self.processed_path = Path("./storage/processed")
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_extensions = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".aac"}
        self.allowed_mimetypes = {
            "audio/wav", "audio/wave", "audio/x-wav",
            "audio/mpeg", "audio/mp3",
            "audio/flac", "audio/x-flac",
            "audio/mp4", "audio/m4a",
            "audio/ogg", "audio/vorbis",
            "audio/aac", "audio/x-aac"
        }
        
        # Create storage directories
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.processed_path.mkdir(parents=True, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            # Check file size
            if hasattr(file, 'size') and file.size and file.size > self.max_file_size:
                return {
                    "valid": False,
                    "error": f"File too large. Maximum size is {self.max_file_size // (1024*1024)}MB"
                }
            
            # Check file extension
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in self.allowed_extensions:
                return {
                    "valid": False,
                    "error": f"Unsupported file format. Allowed: {', '.join(self.allowed_extensions)}"
                }
            
            # Check MIME type
            mime_type, _ = mimetypes.guess_type(file.filename)
            if mime_type and mime_type not in self.allowed_mimetypes:
                return {
                    "valid": False,
                    "error": f"Unsupported MIME type: {mime_type}"
                }
            
            return {"valid": True}
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return {"valid": False, "error": "File validation failed"}
    
    async def upload_voice_sample(
        self, 
        file: UploadFile, 
        user_id: str,
        transcription: Optional[str] = None,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload and process a voice sample"""
        try:
            # Validate user
            user = await User.get(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Validate file
            validation = self.validate_file(file)
            if not validation["valid"]:
                return validation
            
            # Check user upload limits
            user_samples = await VoiceSample.find(VoiceSample.user_id == user_id).count()
            limits = user.get_monthly_limits()
            
            if user_samples >= limits["voice_samples"]:
                return {
                    "valid": False,
                    "error": f"Upload limit reached. Maximum {limits['voice_samples']} samples per month."
                }
            
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_ext = Path(file.filename).suffix.lower()
            original_filename = file.filename
            stored_filename = f"{file_id}{file_ext}"
            
            # Create user-specific directory
            user_dir = self.storage_path / user_id
            user_dir.mkdir(exist_ok=True)
            
            file_path = user_dir / stored_filename
            
            # Save uploaded file
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            logger.info(f"Saved uploaded file: {file_path}")
            
            # Process audio file
            processing_result = await self._process_uploaded_file(
                file_path=file_path,
                original_filename=original_filename,
                user_id=user_id,
                transcription=transcription,
                language=language
            )
            
            return {
                "valid": True,
                "voice_sample_id": processing_result["voice_sample_id"],
                "file_info": processing_result["file_info"],
                "quality_analysis": processing_result["quality_analysis"],
                "message": "File uploaded and processed successfully"
            }
            
        except Exception as e:
            logger.error(f"Voice sample upload failed: {e}")
            return {"valid": False, "error": str(e)}
    
    async def _process_uploaded_file(
        self,
        file_path: Path,
        original_filename: str,
        user_id: str,
        transcription: Optional[str] = None,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process uploaded audio file"""
        try:
            # Read file for processing
            with open(file_path, 'rb') as f:
                audio_data = f.read()
            
            # Get basic audio info
            audio_info = audio_processor.get_audio_info(audio_data, original_filename)
            
            # Validate audio format
            format_validation = audio_processor.validate_audio_format(original_filename, audio_data)
            
            if not format_validation.get("valid", False):
                raise ValueError(f"Audio format validation failed: {format_validation.get('reason')}")
            
            # Process audio for quality and enhancement
            processed_result = await audio_processor.process_audio_file(
                audio_data=audio_data,
                original_filename=original_filename,
                normalize=True,
                trim_silence=True
            )
            
            # Save processed version
            processed_filename = f"processed_{file_path.stem}.wav"
            processed_file_path = self.processed_path / user_id
            processed_file_path.mkdir(exist_ok=True)
            processed_full_path = processed_file_path / processed_filename
            
            with open(processed_full_path, 'wb') as f:
                f.write(processed_result['audio_data'])
            
            # Determine if suitable for training
            quality_analysis = processed_result['quality_analysis']
            overall_quality = quality_analysis.get('overall_score', 0)
            is_suitable = overall_quality >= 0.6 and processed_result['duration_seconds'] >= 3.0
            
            # Create VoiceSample document
            voice_sample = VoiceSample(
                user_id=user_id,
                filename=original_filename,
                file_path=str(file_path),
                processed_file_path=str(processed_full_path),
                transcription=transcription or "",
                language_detected=language or "en",
                duration_seconds=processed_result['duration_seconds'],
                file_size_bytes=processed_result['file_size_bytes'],
                sample_rate=processed_result['sample_rate'],
                channels=processed_result['channels'],
                format=processed_result['format'],
                quality_score=overall_quality,
                is_suitable_for_training=is_suitable,
                status="processed",
                processing_metadata=processed_result.get('preprocessing_applied', {}),
                quality_analysis=quality_analysis
            )
            
            await voice_sample.save()
            
            # Update user statistics
            await User.find_one(User.id == user_id).update({"$inc": {"total_voice_samples": 1}})
            
            logger.info(f"Processed voice sample {voice_sample.id} for user {user_id}")
            
            return {
                "voice_sample_id": str(voice_sample.id),
                "file_info": {
                    "duration": processed_result['duration_seconds'],
                    "file_size": processed_result['file_size_bytes'],
                    "sample_rate": processed_result['sample_rate'],
                    "format": processed_result['format']
                },
                "quality_analysis": {
                    "overall_score": overall_quality,
                    "is_suitable_for_training": is_suitable,
                    "recommendations": quality_analysis.get('recommendations', [])
                }
            }
            
        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            # Clean up files on error
            if file_path.exists():
                file_path.unlink(missing_ok=True)
            raise
    
    async def get_upload_stats(self, user_id: str) -> Dict[str, Any]:
        """Get upload statistics for user"""
        try:
            user = await User.get(user_id)
            if not user:
                return {"error": "User not found"}
            
            # Get user's samples
            samples = await VoiceSample.find(VoiceSample.user_id == user_id).to_list()
            
            # Calculate statistics
            total_samples = len(samples)
            suitable_for_training = len([s for s in samples if s.is_suitable_for_training])
            total_duration = sum(s.duration_seconds for s in samples if s.duration_seconds)
            avg_quality = sum(s.quality_score for s in samples if s.quality_score) / max(1, total_samples)
            total_size_mb = sum(s.file_size_bytes for s in samples if s.file_size_bytes) / (1024 * 1024)
            
            # Get limits
            limits = user.get_monthly_limits()
            
            return {
                "total_samples": total_samples,
                "suitable_for_training": suitable_for_training,
                "total_duration_minutes": total_duration / 60,
                "average_quality_score": avg_quality,
                "total_storage_mb": total_size_mb,
                "limits": {
                    "max_samples": limits["voice_samples"],
                    "remaining_samples": max(0, limits["voice_samples"] - total_samples)
                }
            }
            
        except Exception as e:
            logger.error(f"Upload stats calculation failed: {e}")
            return {"error": str(e)}
    
    async def delete_voice_sample(self, sample_id: str, user_id: str) -> bool:
        """Delete a voice sample and its files"""
        try:
            # Get the sample
            sample = await VoiceSample.get(sample_id)
            if not sample:
                return False
            
            # Check ownership
            if sample.user_id != user_id:
                raise ValueError("Cannot delete sample belonging to another user")
            
            # Delete files
            try:
                if sample.file_path and os.path.exists(sample.file_path):
                    os.remove(sample.file_path)
                    logger.info(f"Deleted original file: {sample.file_path}")
                
                if sample.processed_file_path and os.path.exists(sample.processed_file_path):
                    os.remove(sample.processed_file_path)
                    logger.info(f"Deleted processed file: {sample.processed_file_path}")
                    
            except Exception as e:
                logger.warning(f"File deletion failed: {e}")
            
            # Delete database record
            await sample.delete()
            
            # Update user statistics
            await User.find_one(User.id == user_id).update({"$inc": {"total_voice_samples": -1}})
            
            logger.info(f"Deleted voice sample {sample_id}")
            return True
            
        except Exception as e:
            logger.error(f"Voice sample deletion failed: {e}")
            return False
    
    async def cleanup_old_files(self, max_age_days: int = 30):
        """Clean up old temporary and unused files"""
        try:
            from datetime import datetime, timedelta
            
            cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
            
            # Find old samples
            old_samples = await VoiceSample.find(
                VoiceSample.created_at < cutoff_date,
                VoiceSample.status.in_(["failed", "cancelled"])
            ).to_list()
            
            cleaned_count = 0
            for sample in old_samples:
                try:
                    # Delete files
                    if sample.file_path and os.path.exists(sample.file_path):
                        os.remove(sample.file_path)
                    if sample.processed_file_path and os.path.exists(sample.processed_file_path):
                        os.remove(sample.processed_file_path)
                    
                    # Delete database record
                    await sample.delete()
                    cleaned_count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to clean up sample {sample.id}: {e}")
            
            logger.info(f"Cleaned up {cleaned_count} old voice samples")
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return 0


# Global file upload service instance
file_upload_service = FileUploadService()