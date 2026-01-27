"""
Webhook endpoints for handling external service callbacks.

Handles webhook events from Vapi for call status updates.
"""

from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging

from app.core.database import get_db
from app.models.reminder import Reminder, ReminderStatus

router = APIRouter(tags=["webhooks"])
logger = logging.getLogger(__name__)


@router.post("/vapi")
async def vapi_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle Vapi webhook events.
    
    Vapi sends webhooks for various call events:
    - call.started: Call has been initiated
    - call.ended: Call has ended successfully
    - call.failed: Call failed
    
    This endpoint updates the reminder status based on the call outcome.
    """
    try:
        # Parse webhook payload
        payload = await request.json()
        
        logger.info(f"Received Vapi webhook: {payload.get('type')}")
        logger.debug(f"Full payload: {payload}")
        
        # Extract event type and call data
        event_type = payload.get("type")
        call = payload.get("call", {})
        call_id = call.get("id")
        call_status = call.get("status")
        
        # Get reminder ID from metadata
        metadata = call.get("metadata", {})
        reminder_id = metadata.get("reminder_id")
        
        if not reminder_id:
            logger.warning("Webhook received without reminder_id in metadata")
            return {"status": "ignored", "reason": "no_reminder_id"}
        
        # Find the reminder
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        
        if not reminder:
            logger.warning(f"Reminder {reminder_id} not found for webhook")
            return {"status": "ignored", "reason": "reminder_not_found"}
        
        # Handle different webhook events
        if event_type == "call.started":
            logger.info(f"Call started for reminder {reminder_id}")
            # Optional: Add a call_started_at field to track this
            
        elif event_type == "call.ended":
            # Call completed successfully
            logger.info(f"Call ended successfully for reminder {reminder_id}")
            
            if reminder.status == ReminderStatus.SCHEDULED:
                reminder.status = ReminderStatus.COMPLETED
                reminder.completed_at = datetime.now(timezone.utc)
                reminder.vapi_call_id = call_id
                db.commit()
                logger.info(f"Reminder {reminder_id} marked as COMPLETED")
        
        elif event_type == "call.failed":
            # Call failed
            logger.warning(f"Call failed for reminder {reminder_id}")
            
            error_message = call.get("error", {}).get("message", "Unknown error")
            
            # Increment call attempts
            reminder.call_attempts = (reminder.call_attempts or 0) + 1
            reminder.last_error = f"Call failed: {error_message}"
            reminder.vapi_call_id = call_id
            
            # Check if max retries exceeded
            from app.core.config import settings
            if reminder.call_attempts >= settings.SCHEDULER_MAX_RETRIES:
                reminder.status = ReminderStatus.FAILED
                logger.warning(f"Reminder {reminder_id} marked as FAILED after {reminder.call_attempts} attempts")
            
            db.commit()
        
        else:
            logger.info(f"Unhandled webhook event type: {event_type}")
        
        return {
            "status": "processed",
            "event_type": event_type,
            "reminder_id": reminder_id,
            "call_id": call_id
        }
    
    except Exception as e:
        logger.error(f"Error processing Vapi webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {str(e)}"
        )


@router.get("/vapi/health")
async def webhook_health():
    """
    Health check endpoint for webhook.
    
    Useful for verifying webhook is reachable.
    """
    return {
        "status": "healthy",
        "service": "vapi_webhook",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
