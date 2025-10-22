#!/usr/bin/env python3
"""
Zero-shot voice cloning with Coqui XTTS v2.

Loads the multilingual XTTS v2 model once and provides an interface to
synthesize speech given a reference audio sample (speaker_wav) and text.
"""
from __future__ import annotations

import io
import threading
from typing import Optional

import numpy as np
import soundfile as sf

try:
    import torch
    from TTS.api import TTS  # Coqui TTS
except Exception as e:  # pragma: no cover
    TTS = None  # type: ignore
    torch = None  # type: ignore


class ZeroShotXTTS:
    """Singleton-style loader for XTTS v2 with thread-safe init.

    Usage:
        audio_wav_bytes = ZeroShotXTTS.instance().synthesize(
            text="Hello",
            speaker_wav_path="/path/to/ref.wav",
            language="en"
        )
    """

    _instance: Optional["ZeroShotXTTS"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        if TTS is None:
            raise RuntimeError(
                "Coqui TTS not available. Ensure 'TTS' package is installed."
            )
        if torch is None:
            raise RuntimeError(
                "PyTorch not available. Ensure 'torch' is installed."
            )

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # Model name from Coqui hub for XTTS v2
        self.model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        # Lazy-loaded model
        self._tts: Optional[TTS] = None

    @classmethod
    def instance(cls) -> "ZeroShotXTTS":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = ZeroShotXTTS()
        return cls._instance

    def _ensure_loaded(self) -> None:
        if self._tts is None:
            # Download and load the model once
            self._tts = TTS(self.model_name).to(self.device)

    def load(self) -> None:
        """Public method to ensure the model is loaded (for warmup endpoints)."""
        self._ensure_loaded()

    def synthesize(
        self,
        text: str,
        speaker_wav_path: str,
        language: str = "en",
        sample_rate: int = 22050,
    ) -> bytes:
        """Generate WAV bytes using XTTS v2 zero-shot cloning.

        Returns raw WAV bytes ready to stream.
        """
        if not text or not speaker_wav_path:
            raise ValueError("Both text and speaker_wav_path are required")

        self._ensure_loaded()

        # Generate audio (numpy float32 array in range [-1, 1])
        audio: np.ndarray = self._tts.tts(
            text=text,
            speaker_wav=speaker_wav_path,
            language=language,
        )

        # Convert to WAV bytes in-memory
        buf = io.BytesIO()
        sf.write(buf, audio, samplerate=sample_rate, format="WAV")
        return buf.getvalue()
