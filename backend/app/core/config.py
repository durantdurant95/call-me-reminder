"""
Application configuration using Pydantic Settings.

Manages all environment variables and application settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/call_me_reminder"
    
    # Vapi Configuration
    VAPI_API_KEY: str = ""
    VAPI_PHONE_NUMBER_ID: str = ""
    VAPI_BASE_URL: str = "https://api.vapi.ai"
    
    # Twilio Configuration (optional)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Scheduler
    SCHEDULER_CHECK_INTERVAL: int = 30  # seconds
    SCHEDULER_MAX_RETRIES: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
