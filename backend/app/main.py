"""
Main FastAPI application entry point.

This module sets up the FastAPI app with:
- CORS middleware
- API routes
- Background scheduler for reminder processing
- Lifespan events
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import reminders, webhooks
from app.core.config import settings
from app.services.scheduler import reminder_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events:
    - Startup: Initialize database, start scheduler
    - Shutdown: Stop scheduler, cleanup resources
    """
    # Startup
    print("Starting application...")
    print("Starting reminder scheduler...")
    reminder_scheduler.start()
    print(f"Scheduler will check for due reminders every {settings.SCHEDULER_CHECK_INTERVAL} seconds")
    
    yield
    
    # Shutdown
    print("Shutting down application...")
    print("Stopping reminder scheduler...")
    reminder_scheduler.shutdown()
    print("Application shutdown complete")


app = FastAPI(
    title="Call Me Reminder API",
    description="API for managing voice call reminders",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Call Me Reminder API is running"}

# Include API routers
app.include_router(
    reminders.router,
    prefix="/api/v1/reminders",
    tags=["reminders"]
)

app.include_router(
    webhooks.router,
    prefix="/api/v1/webhooks",
    tags=["webhooks"]
)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
