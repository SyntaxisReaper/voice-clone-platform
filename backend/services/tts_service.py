#!/usr/bin/env python3
"""
TTS Service - Text-to-Speech Implementation
Handles text-to-speech conversion with various TTS engines
"""

import asyncio
import io
import os
import tempfile
from typing import Optional, Dict, Any, List
from loguru import logger
import wave
import struct
import math

class TTSService:
    """Text-to-Speech service with multiple engine support"""
    
    def __init__(self):
        self.engines = {}
        self.default_voice = "english_fast"
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Initialize available TTS engines"""
        logger.info("Initializing TTS engines...")
        
        # Try to initialize different TTS engines
        self._init_system_tts()
        self._init_synthetic_tts()
        
        logger.info(f"TTS Service initialized with {len(self.engines)} engines")
    
    def _init_system_tts(self):
        """Initialize system TTS if available"""
        try:
            import platform
            system = platform.system()
            
            if system == "Windows":
                try:
                    import pyttsx3
                    engine = pyttsx3.init()
                    self.engines["system_windows"] = {
                        "engine": engine,
                        "type": "system",
                        "voices": self._get_windows_voices(engine)
                    }
                    logger.info("Windows TTS engine initialized")
                except Exception as e:
                    logger.warning(f"Failed to initialize Windows TTS: {e}")
            
            elif system == "Darwin":  # macOS
                self.engines["system_macos"] = {
                    "type": "system_mac",
                    "voices": ["Alex", "Victoria", "Samantha", "Daniel"]
                }
                logger.info("macOS TTS engine initialized")
                
            elif system == "Linux":
                # Check for espeak or festival
                if os.system("which espeak > /dev/null 2>&1") == 0:
                    self.engines["espeak"] = {
                        "type": "espeak",
                        "voices": ["en", "en-us", "en-gb"]
                    }
                    logger.info("eSpeak TTS engine initialized")
                    
        except Exception as e:
            logger.error(f"Failed to initialize system TTS: {e}")
    
    def _init_synthetic_tts(self):
        """Initialize synthetic/fallback TTS"""
        # Always have a synthetic fallback
        self.engines["synthetic"] = {
            "type": "synthetic",
            "voices": ["robotic", "synthetic_male", "synthetic_female"]
        }
        logger.info("Synthetic TTS engine initialized")
    
    def _get_windows_voices(self, engine):
        """Get available Windows TTS voices"""
        try:
            voices = engine.getProperty('voices')
            return [voice.id for voice in voices] if voices else ["default"]
        except:
            return ["default"]
    
    async def generate_audio(self, text: str, voice_id: str = None, output_format: str = "wav") -> bytes:
        """Generate audio from text using specified voice"""
        try:
            voice_id = voice_id or self.default_voice
            logger.info(f"Generating TTS audio for text: '{text[:50]}...' with voice: {voice_id}")
            
            # Try different engines in order of preference
            audio_data = None
            
            # Try system TTS first
            for engine_name, engine_config in self.engines.items():
                if engine_config["type"] == "system":
                    audio_data = await self._generate_system_tts(text, voice_id, engine_config)
                    if audio_data:
                        break
            
            # Fallback to synthetic TTS
            if not audio_data:
                audio_data = await self._generate_synthetic_tts(text, voice_id)
            
            if not audio_data:
                raise Exception("Failed to generate audio with any engine")
            
            logger.info(f"Successfully generated {len(audio_data)} bytes of audio")
            return audio_data
            
        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            # Return a simple beep as fallback
            return self._generate_fallback_audio(text)
    
    async def _generate_system_tts(self, text: str, voice_id: str, engine_config: Dict) -> Optional[bytes]:
        """Generate audio using system TTS"""
        try:
            import platform
            system = platform.system()
            
            if system == "Windows" and "engine" in engine_config:
                return await self._generate_windows_tts(text, voice_id, engine_config["engine"])
            elif system == "Darwin":
                return await self._generate_macos_tts(text, voice_id)
            elif system == "Linux" and engine_config.get("type") == "espeak":
                return await self._generate_espeak_tts(text, voice_id)
                
        except Exception as e:
            logger.warning(f"System TTS failed: {e}")
        
        return None
    
    async def _generate_windows_tts(self, text: str, voice_id: str, engine) -> Optional[bytes]:
        """Generate audio using Windows SAPI"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Set voice if specified
            voices = engine.getProperty('voices')
            if voices and voice_id != self.default_voice:
                for voice in voices:
                    if voice_id in voice.id or voice_id in voice.name:
                        engine.setProperty('voice', voice.id)
                        break
            
            # Set properties
            engine.setProperty('rate', 200)
            engine.setProperty('volume', 0.9)
            
            # Save to file
            engine.save_to_file(text, temp_path)
            engine.runAndWait()
            
            # Read the generated file
            if os.path.exists(temp_path):
                with open(temp_path, 'rb') as f:
                    audio_data = f.read()
                os.unlink(temp_path)
                return audio_data
                
        except Exception as e:
            logger.error(f"Windows TTS error: {e}")
        
        return None
    
    async def _generate_macos_tts(self, text: str, voice_id: str) -> Optional[bytes]:
        """Generate audio using macOS say command"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Use say command
            voice_option = f"-v {voice_id}" if voice_id in ["Alex", "Victoria", "Samantha", "Daniel"] else ""
            cmd = f'say {voice_option} "{text}" -o "{temp_path}"'
            
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await process.communicate()
            
            if os.path.exists(temp_path):
                with open(temp_path, 'rb') as f:
                    audio_data = f.read()
                os.unlink(temp_path)
                return audio_data
                
        except Exception as e:
            logger.error(f"macOS TTS error: {e}")
        
        return None
    
    async def _generate_espeak_tts(self, text: str, voice_id: str) -> Optional[bytes]:
        """Generate audio using eSpeak"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
            
            voice_option = f"-v {voice_id}" if voice_id in ["en", "en-us", "en-gb"] else "-v en"
            cmd = f'espeak "{text}" {voice_option} -w "{temp_path}"'
            
            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            await process.communicate()
            
            if os.path.exists(temp_path):
                with open(temp_path, 'rb') as f:
                    audio_data = f.read()
                os.unlink(temp_path)
                return audio_data
                
        except Exception as e:
            logger.error(f"eSpeak TTS error: {e}")
        
        return None
    
    async def _generate_synthetic_tts(self, text: str, voice_id: str) -> bytes:
        """Generate synthetic/robotic speech as fallback"""
        logger.info("Using synthetic TTS fallback")
        
        # Generate a simple synthetic voice using sine waves
        sample_rate = 22050
        duration_per_char = 0.1  # seconds per character
        duration = len(text) * duration_per_char
        
        # Create sine wave pattern
        frames = int(duration * sample_rate)
        audio_data = []
        
        for i in range(frames):
            t = i / sample_rate
            # Create a simple speech-like pattern
            frequency = 200 + (hash(text) % 200)  # Base frequency based on text
            amplitude = 0.3 * math.sin(2 * math.pi * 5 * t)  # Modulate amplitude
            sample = amplitude * math.sin(2 * math.pi * frequency * t)
            
            # Add some formant-like characteristics
            sample += 0.1 * math.sin(2 * math.pi * frequency * 2.5 * t)
            sample += 0.05 * math.sin(2 * math.pi * frequency * 4 * t)
            
            # Convert to 16-bit integer
            sample_int = int(sample * 32767)
            audio_data.extend(struct.pack('<h', sample_int))
        
        # Create WAV file in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 2 bytes per sample
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b''.join(audio_data))
        
        return wav_buffer.getvalue()
    
    def _generate_fallback_audio(self, text: str) -> bytes:
        """Generate a simple beep as ultimate fallback"""
        logger.warning("Using fallback beep audio")
        
        sample_rate = 22050
        duration = 1.0  # 1 second beep
        frequency = 440  # A note
        
        frames = int(duration * sample_rate)
        audio_data = []
        
        for i in range(frames):
            t = i / sample_rate
            sample = 0.3 * math.sin(2 * math.pi * frequency * t)
            sample_int = int(sample * 32767)
            audio_data.extend(struct.pack('<h', sample_int))
        
        # Create WAV file
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b''.join(audio_data))
        
        return wav_buffer.getvalue()
    
    def get_available_voices(self) -> Dict[str, List[str]]:
        """Get list of available voices from all engines"""
        voices = {}
        for engine_name, engine_config in self.engines.items():
            voices[engine_name] = engine_config.get("voices", [])
        return voices
    
    async def clone_voice(self, voice_samples: List[str], voice_name: str) -> Dict[str, Any]:
        """Clone a voice from provided samples (placeholder for future implementation)"""
        logger.info(f"Voice cloning requested for: {voice_name}")
        
        # For now, return a mock response
        # In a real implementation, this would train a voice model
        return {
            "status": "training",
            "progress": 0,
            "estimated_completion": "2-4 hours",
            "voice_id": f"cloned_{voice_name.lower().replace(' ', '_')}",
            "message": "Voice training started - this is a placeholder implementation"
        }
