"""
Pydantic schemas for reminder validation and serialization.
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from uuid import UUID
import re


class ReminderBase(BaseModel):
    """Base schema with common fields."""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=5000)
    phone_number: str = Field(..., pattern=r'^\+[1-9]\d{1,14}$')
    scheduled_datetime: datetime
    timezone: str = Field(..., min_length=1, max_length=50)


class ReminderCreate(ReminderBase):
    """Schema for creating a reminder."""
    
    @field_validator('scheduled_datetime')
    @classmethod
    def validate_future_datetime(cls, v):
        """Ensure scheduled time is in the future."""
        if v <= datetime.now(v.tzinfo):
            raise ValueError('Scheduled time must be in the future')
        return v
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate E.164 phone number format."""
        if not re.match(r'^\+[1-9]\d{1,14}$', v):
            raise ValueError('Phone number must be in E.164 format (e.g., +14155552671)')
        return v


class ReminderUpdate(BaseModel):
    """Schema for updating a reminder."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = Field(None, min_length=1, max_length=5000)
    phone_number: Optional[str] = Field(None, pattern=r'^\+[1-9]\d{1,14}$')
    scheduled_datetime: Optional[datetime] = None
    timezone: Optional[str] = Field(None, min_length=1, max_length=50)


class ReminderResponse(ReminderBase):
    """Schema for reminder responses."""
    id: UUID
    status: str
    call_attempts: int
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ReminderListResponse(BaseModel):
    """Schema for list of reminders."""
    reminders: list[ReminderResponse]
    total: int
    page: int
    page_size: int
