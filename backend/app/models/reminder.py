"""
Reminder model definition.

SQLAlchemy model for storing reminder data.
"""

from sqlalchemy import Column, String, DateTime, Enum, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class ReminderStatus(str, enum.Enum):
    """Reminder status enum."""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"


class Reminder(Base):
    """
    Reminder model.
    
    Attributes:
        id: Unique identifier (UUID)
        title: Short title for the reminder
        message: Message to be spoken during call
        phone_number: Phone number to call (E.164 format)
        scheduled_datetime: When to trigger the reminder
        timezone: User's timezone
        status: Current status (scheduled, completed, failed)
        call_attempts: Number of call attempts made
        last_error: Last error message if failed
        created_at: When reminder was created
        updated_at: Last update timestamp
        completed_at: When reminder was completed
    """
    __tablename__ = "reminders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String(20), nullable=False)
    scheduled_datetime = Column(DateTime(timezone=True), nullable=False, index=True)
    timezone = Column(String(50), nullable=False)
    status = Column(
        Enum(ReminderStatus), 
        default=ReminderStatus.SCHEDULED,
        nullable=False,
        index=True
    )
    call_attempts = Column(Integer, default=0)
    vapi_call_id = Column(String(255), nullable=True)  # Vapi call ID for tracking
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Reminder(id={self.id}, title={self.title}, status={self.status})>"
