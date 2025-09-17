"""
Security Report Model

Handles storage of user-submitted security reports and issues.
"""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.models.base import Base


class ReportType(str, enum.Enum):
    """Enumeration for report types"""
    SECURITY = "security"
    FRAUD = "fraud"
    UNAUTHORIZED = "unauthorized"
    DATA = "data"
    OTHER = "other"


class ReportSeverity(str, enum.Enum):
    """Enumeration for report severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SecurityReport(Base):
    """Security report model for storing user submissions"""
    
    __tablename__ = "security_reports"
    
    id = Column(String, primary_key=True, index=True)
    report_type = Column(Enum(ReportType), nullable=False, default=ReportType.SECURITY)
    severity = Column(Enum(ReportSeverity), nullable=False, default=ReportSeverity.MEDIUM)
    description = Column(Text, nullable=False)
    contact_email = Column(String, nullable=True)  # Optional if not anonymous
    is_anonymous = Column(Boolean, default=False, nullable=False)
    user_id = Column(String, nullable=True)  # For authenticated users
    ip_address = Column(String, nullable=True)  # For logging purposes
    user_agent = Column(String, nullable=True)  # Browser info for context
    
    # Status tracking
    status = Column(String, default="submitted", nullable=False)  # submitted, reviewing, resolved, dismissed
    assigned_to = Column(String, nullable=True)  # Admin/security team member
    resolution_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<SecurityReport(id={self.id}, type={self.report_type}, severity={self.severity}, status={self.status})>"
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "report_type": self.report_type.value if self.report_type else None,
            "severity": self.severity.value if self.severity else None,
            "description": self.description,
            "contact_email": self.contact_email if not self.is_anonymous else None,
            "is_anonymous": self.is_anonymous,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }