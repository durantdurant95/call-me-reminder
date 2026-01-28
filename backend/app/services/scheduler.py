"""
Background scheduler for processing due reminders.

Checks database periodically and triggers calls for reminders
that are due.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import logging

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus
from app.services.vapi_service import vapi_service

logger = logging.getLogger(__name__)


class ReminderScheduler:
    """
    Scheduler for processing reminders.
    
    Runs a background job that:
    1. Checks for due reminders every 30 seconds
    2. Triggers Vapi calls for due reminders
    3. Updates reminder status based on call outcome
    4. Implements retry logic for failed calls
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.max_retries = settings.SCHEDULER_MAX_RETRIES
        self.check_interval = settings.SCHEDULER_CHECK_INTERVAL
    
    async def check_due_reminders(self):
        """
        Check for reminders that are due and process them.
        
        This method runs periodically and:
        - Finds reminders scheduled within the next minute
        - Processes each due reminder
        - Updates status based on call result
        """
        logger.info("Checking for due reminders...")
        
        db: Session = SessionLocal()
        try:
            now = datetime.now(timezone.utc)
            
            # Find reminders due in the next minute
            # This window accounts for scheduler interval
            due_reminders = db.query(Reminder).filter(
                Reminder.status == ReminderStatus.SCHEDULED,
                Reminder.scheduled_datetime <= now + timedelta(minutes=1),
                Reminder.scheduled_datetime > now - timedelta(minutes=5)
            ).all()
            
            logger.info(f"Found {len(due_reminders)} due reminders")
            
            for reminder in due_reminders:
                await self.process_reminder(db, reminder)
        
        except Exception as e:
            logger.error(f"Error checking due reminders: {e}")
        finally:
            db.close()
    
    async def process_reminder(self, db: Session, reminder: Reminder):
        """
        Process a single reminder by triggering a call.
        
        Args:
            db: Database session
            reminder: Reminder to process
        """
        try:
            logger.info(f"Processing reminder {reminder.id}: {reminder.title}")
            
            # Check retry limit
            if reminder.call_attempts >= self.max_retries:
                logger.warning(f"Reminder {reminder.id} exceeded max retries")
                reminder.status = ReminderStatus.FAILED
                reminder.last_error = f"Exceeded maximum retries ({self.max_retries})"
                db.commit()
                return
            
            # Increment attempt counter
            reminder.call_attempts += 1
            db.commit()
            
            # Trigger Vapi call
            call_result = await vapi_service.create_call(
                phone_number=reminder.phone_number,
                message=reminder.message,
                reminder_id=str(reminder.id),
                title=reminder.title
            )
            
            # Store the Vapi call ID for tracking
            reminder.vapi_call_id = call_result.get('id')
            
            # Update reminder status based on call initiation
            # Note: If webhook is configured, the webhook will update to COMPLETED
            # Otherwise, we optimistically mark as COMPLETED here
            call_status = call_result.get('status', '').lower()
            
            if call_status in ['queued', 'ringing', 'in-progress', 'started']:
                # If no webhook configured, mark as completed immediately
                # If webhook IS configured, it will update the status when call actually ends
                if not settings.VAPI_WEBHOOK_URL:
                    reminder.status = ReminderStatus.COMPLETED
                    reminder.completed_at = datetime.now(timezone.utc)
                    logger.info(f"Reminder {reminder.id} marked as COMPLETED (no webhook)")
                else:
                    logger.info(f"Reminder {reminder.id} call initiated. Waiting for webhook to update status.")
            else:
                raise Exception(f"Call failed with status: {call_status}")
            
            db.commit()
        
        except Exception as e:
            logger.error(f"Error processing reminder {reminder.id}: {e}")
            reminder.last_error = str(e)
            
            # Mark as failed if max retries reached
            if reminder.call_attempts >= self.max_retries:
                reminder.status = ReminderStatus.FAILED
            
            db.commit()
    
    def start(self):
        """Start the scheduler."""
        logger.info(f"Starting reminder scheduler (interval: {self.check_interval}s)")
        
        self.scheduler.add_job(
            self.check_due_reminders,
            trigger=IntervalTrigger(seconds=self.check_interval),
            id='check_reminders',
            replace_existing=True,
            max_instances=1
        )
        
        self.scheduler.start()
        logger.info("Reminder scheduler started")
    
    def shutdown(self):
        """Stop the scheduler."""
        logger.info("Stopping reminder scheduler...")
        self.scheduler.shutdown()
        logger.info("Reminder scheduler stopped")


# Singleton instance
reminder_scheduler = ReminderScheduler()
