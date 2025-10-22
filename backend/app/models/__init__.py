# Ensure SQLAlchemy models are registered with Base metadata
from .user import User  # noqa: F401
from .voice import Voice  # noqa: F401
from .license import License  # noqa: F401
from .usage_log import UsageLog, LicenseUsage  # noqa: F401
from .watermark import WatermarkVerification  # noqa: F401

"""
Database models for the Voice Clone Platform
"""

from .base import BaseModel
from .user import User
from .voice_sample import VoiceSample, VoiceStatus, VoiceQuality
from .usage_log import UsageLog, UsageType, UsageStatus
from .license import License, LicenseType, LicenseStatus
from .security_report import SecurityReport, ReportType, ReportSeverity

__all__ = [
    "BaseModel",
    "User",
    "VoiceSample",
    "VoiceStatus", 
    "VoiceQuality",
    "UsageLog",
    "UsageType",
    "UsageStatus",
    "License",
    "LicenseType",
    "LicenseStatus",
    "SecurityReport",
    "ReportType",
    "ReportSeverity",
]
