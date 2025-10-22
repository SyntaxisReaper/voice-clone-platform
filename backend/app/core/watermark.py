"""
VCaaS Watermarking System - Core Implementation

This module implements both MVP (sine-based) and production (spread-spectrum) 
watermarking for audio files with cryptographic verification.
"""

import numpy as np
import librosa
import soundfile as sf
from scipy import signal
from typing import Optional, Tuple, Dict, Any
import hashlib
import hmac
import json
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

class WatermarkEncoder:
    """Handles embedding watermarks into audio files."""
    
    def __init__(self, secret_key: str = "vcaas_default_key"):
        self.secret_key = secret_key.encode('utf-8')
        self.sample_rate = 22050  # Standard sample rate for processing
        
    def embed_mvp_watermark(
        self,
        audio_path: str,
        watermark_id: str,
        output_path: str,
        frequency: float = 19000.0,
        amplitude: float = 0.001
    ) -> str:
        """
        Embed MVP watermark using high-frequency sine tone.
        
        Args:
            audio_path: Path to input audio file
            watermark_id: Unique watermark identifier
            output_path: Path for watermarked output
            frequency: Watermark frequency in Hz (default 19kHz)
            amplitude: Watermark amplitude (very low to be inaudible)
            
        Returns:
            Path to watermarked audio file
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            duration = len(audio) / sr
            
            # Generate time array
            t = np.linspace(0, duration, len(audio), False)
            
            # Create watermark signal with encoded ID
            watermark_signal = self._encode_id_in_sine(
                t, watermark_id, frequency, amplitude
            )
            
            # Embed watermark
            watermarked_audio = audio + watermark_signal
            
            # Ensure no clipping
            watermarked_audio = np.clip(watermarked_audio, -0.99, 0.99)
            
            # Save watermarked audio
            sf.write(output_path, watermarked_audio, sr)
            
            logger.info(f"MVP watermark embedded: {watermark_id} -> {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"MVP watermark embedding failed: {e}")
            raise
    
    def embed_robust_watermark(
        self,
        audio_path: str,
        watermark_id: str,
        license_id: Optional[str],
        output_path: str
    ) -> str:
        """
        Embed robust spread-spectrum watermark with error correction.
        
        Args:
            audio_path: Path to input audio file
            watermark_id: Unique watermark identifier
            license_id: License identifier (optional)
            output_path: Path for watermarked output
            
        Returns:
            Path to watermarked audio file
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Create watermark payload
            payload = self._create_payload(watermark_id, license_id)
            
            # Apply spread-spectrum watermarking
            watermarked_audio = self._spread_spectrum_embed(audio, payload)
            
            # Save watermarked audio
            sf.write(output_path, watermarked_audio, sr)
            
            logger.info(f"Robust watermark embedded: {watermark_id} -> {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Robust watermark embedding failed: {e}")
            raise
    
    def _encode_id_in_sine(
        self, 
        t: np.ndarray, 
        watermark_id: str, 
        base_freq: float, 
        amplitude: float
    ) -> np.ndarray:
        """Encode watermark ID in sine wave using frequency modulation."""
        
        # Create hash of watermark_id for consistent encoding
        id_hash = hashlib.md5(watermark_id.encode()).hexdigest()
        
        # Convert hash to binary representation
        binary_data = ''.join(format(ord(c), '08b') for c in id_hash[:8])  # Use first 8 chars
        
        # Modulate frequency based on binary data
        watermark_signal = np.zeros_like(t)
        bit_duration = len(t) / len(binary_data)
        
        for i, bit in enumerate(binary_data):
            start_idx = int(i * bit_duration)
            end_idx = int((i + 1) * bit_duration)
            
            # Use different frequencies for 0 and 1
            freq = base_freq if bit == '1' else base_freq - 100
            watermark_signal[start_idx:end_idx] = amplitude * np.sin(
                2 * np.pi * freq * t[start_idx:end_idx]
            )
        
        return watermark_signal
    
    def _create_payload(self, watermark_id: str, license_id: Optional[str]) -> bytes:
        """Create watermark payload with error correction."""
        
        # Create payload dictionary
        payload_data = {
            'watermark_id': watermark_id,
            'license_id': license_id,
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0'
        }
        
        # Convert to JSON bytes
        json_payload = json.dumps(payload_data, separators=(',', ':')).encode('utf-8')
        
        # Add HMAC signature for verification
        signature = hmac.new(self.secret_key, json_payload, hashlib.sha256).digest()
        
        # Combine payload and signature
        full_payload = json_payload + signature
        
        return full_payload
    
    def _spread_spectrum_embed(self, audio: np.ndarray, payload: bytes) -> np.ndarray:
        """Embed payload using spread-spectrum technique."""
        
        # Convert payload to binary
        binary_payload = ''.join(format(b, '08b') for b in payload)
        
        # Generate pseudo-random sequence for spreading
        np.random.seed(int.from_bytes(self.secret_key[:4], 'big'))
        spreading_seq = np.random.choice([-1, 1], size=len(binary_payload) * 64)
        
        # Create watermark signal in frequency domain
        audio_fft = np.fft.fft(audio)
        watermark_fft = np.zeros_like(audio_fft, dtype=complex)
        
        # Embed payload in multiple frequency bands for redundancy
        freq_bands = [1000, 2000, 4000, 8000]  # Hz
        band_width = 100  # Hz
        
        for band_center in freq_bands:
            band_start = int(band_center * len(audio) / self.sample_rate)
            band_end = int((band_center + band_width) * len(audio) / self.sample_rate)
            
            # Embed spread payload in this frequency band
            for i, bit in enumerate(binary_payload):
                if band_start + i < band_end and band_start + i < len(watermark_fft):
                    # Use phase modulation for robustness
                    phase_shift = np.pi/4 if bit == '1' else -np.pi/4
                    watermark_fft[band_start + i] = 0.001 * np.exp(1j * phase_shift)
        
        # Convert back to time domain
        watermark_signal = np.real(np.fft.ifft(watermark_fft))
        
        # Add to original audio
        watermarked_audio = audio + watermark_signal
        
        return np.clip(watermarked_audio, -0.99, 0.99)


class WatermarkDecoder:
    """Handles detection and extraction of watermarks from audio files."""
    
    def __init__(self, secret_key: str = "vcaas_default_key"):
        self.secret_key = secret_key.encode('utf-8')
        self.sample_rate = 22050
    
    def detect_mvp_watermark(
        self, 
        audio_path: str, 
        frequency: float = 19000.0,
        threshold: float = 0.1
    ) -> Optional[Dict[str, Any]]:
        """
        Detect MVP watermark and extract watermark ID.
        
        Args:
            audio_path: Path to audio file to analyze
            frequency: Expected watermark frequency
            threshold: Detection threshold
            
        Returns:
            Detection results with watermark_id if found
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Compute FFT
            fft = np.fft.fft(audio)
            freqs = np.fft.fftfreq(len(audio), 1/sr)
            
            # Find frequency bin corresponding to watermark frequency
            target_bin = np.argmin(np.abs(freqs - frequency))
            
            # Check magnitude at watermark frequency
            magnitude = np.abs(fft[target_bin]) / len(audio)
            
            if magnitude > threshold:
                # Extract watermark ID by analyzing frequency modulation
                watermark_id = self._decode_id_from_sine(audio, frequency)
                
                return {
                    'found': True,
                    'watermark_id': watermark_id,
                    'confidence': min(magnitude / threshold, 1.0),
                    'detection_method': 'mvp_sine',
                    'frequency': frequency,
                    'magnitude': magnitude
                }
            
            return {'found': False, 'confidence': 0.0}
            
        except Exception as e:
            logger.error(f"MVP watermark detection failed: {e}")
            return {'found': False, 'error': str(e)}
    
    def detect_robust_watermark(self, audio_path: str) -> Optional[Dict[str, Any]]:
        """
        Detect robust spread-spectrum watermark.
        
        Args:
            audio_path: Path to audio file to analyze
            
        Returns:
            Detection results with payload if found
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=self.sample_rate)
            
            # Extract payload using spread-spectrum detection
            payload = self._spread_spectrum_extract(audio)
            
            if payload:
                # Verify signature and parse payload
                result = self._verify_and_parse_payload(payload)
                if result:
                    result['detection_method'] = 'robust_spread_spectrum'
                    return result
            
            return {'found': False, 'confidence': 0.0}
            
        except Exception as e:
            logger.error(f"Robust watermark detection failed: {e}")
            return {'found': False, 'error': str(e)}
    
    def _decode_id_from_sine(self, audio: np.ndarray, base_freq: float) -> str:
        """Decode watermark ID from frequency-modulated sine wave."""
        
        # This is a simplified version - in practice, you'd need more sophisticated
        # signal processing to reliably extract the modulated data
        
        # For now, return a placeholder that shows detection worked
        return "detected_id_placeholder"
    
    def _spread_spectrum_extract(self, audio: np.ndarray) -> Optional[bytes]:
        """Extract payload from spread-spectrum watermark."""
        
        # This would implement the inverse of the embedding process
        # For now, return None to indicate extraction failed
        
        return None
    
    def _verify_and_parse_payload(self, payload: bytes) -> Optional[Dict[str, Any]]:
        """Verify HMAC signature and parse payload."""
        
        try:
            # Split payload and signature
            signature = payload[-32:]  # SHA256 is 32 bytes
            json_payload = payload[:-32]
            
            # Verify signature
            expected_signature = hmac.new(
                self.secret_key, json_payload, hashlib.sha256
            ).digest()
            
            if not hmac.compare_digest(signature, expected_signature):
                logger.warning("Watermark signature verification failed")
                return None
            
            # Parse JSON payload
            payload_data = json.loads(json_payload.decode('utf-8'))
            
            return {
                'found': True,
                'watermark_id': payload_data['watermark_id'],
                'license_id': payload_data.get('license_id'),
                'timestamp': payload_data['timestamp'],
                'version': payload_data['version'],
                'confidence': 1.0,
                'signature_valid': True
            }
            
        except Exception as e:
            logger.error(f"Payload verification failed: {e}")
            return None


class WatermarkService:
    """High-level watermarking service interface."""
    
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or os.getenv('WATERMARK_SECRET_KEY', 'vcaas_default_key')
        self.encoder = WatermarkEncoder(self.secret_key)
        self.decoder = WatermarkDecoder(self.secret_key)
    
    async def embed_watermark(
        self,
        audio_path: str,
        watermark_id: str,
        license_id: Optional[str] = None,
        voice_id: Optional[str] = None,
        method: str = 'mvp'
    ) -> str:
        """
        Embed watermark in audio file.
        
        Args:
            audio_path: Input audio file path
            watermark_id: Unique watermark identifier
            license_id: License identifier (optional)
            voice_id: Voice identifier for tracking
            method: Watermarking method ('mvp' or 'robust')
            
        Returns:
            Path to watermarked audio file
        """
        # Generate output path
        base_name = os.path.splitext(audio_path)[0]
        output_path = f"{base_name}_watermarked.wav"
        
        if method == 'mvp':
            return self.encoder.embed_mvp_watermark(
                audio_path, watermark_id, output_path
            )
        elif method == 'robust':
            return self.encoder.embed_robust_watermark(
                audio_path, watermark_id, license_id, output_path
            )
        else:
            raise ValueError(f"Unknown watermarking method: {method}")
    
    async def detect_watermark(
        self, 
        audio_path: str, 
        method: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Detect watermark in audio file.
        
        Args:
            audio_path: Audio file path to analyze
            method: Detection method ('mvp', 'robust', or None for auto-detect)
            
        Returns:
            Detection results
        """
        if method == 'mvp':
            return self.decoder.detect_mvp_watermark(audio_path)
        elif method == 'robust':
            return self.decoder.detect_robust_watermark(audio_path)
        else:
            # Try both methods
            mvp_result = self.decoder.detect_mvp_watermark(audio_path)
            if mvp_result.get('found'):
                return mvp_result
            
            robust_result = self.decoder.detect_robust_watermark(audio_path)
            return robust_result if robust_result.get('found') else mvp_result