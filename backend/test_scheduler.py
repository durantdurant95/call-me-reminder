"""
Test script for scheduler functionality.

Creates a test reminder and verifies the scheduler processes it.
"""

import asyncio
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.reminder import Reminder, ReminderStatus


def create_test_reminder(phone_number: str, minutes_from_now: int = 2):
    """
    Create a test reminder scheduled for the near future.
    
    Args:
        phone_number: Phone number to call (E.164 format)
        minutes_from_now: How many minutes in the future to schedule
    """
    db: Session = SessionLocal()
    
    try:
        scheduled_time = datetime.now(timezone.utc) + timedelta(minutes=minutes_from_now)
        
        reminder = Reminder(
            title="Test Scheduler Reminder",
            message="This is a test reminder created by the scheduler test script. If you receive this call, the scheduler is working correctly!",
            phone_number=phone_number,
            scheduled_datetime=scheduled_time,
            timezone="UTC",
            status=ReminderStatus.SCHEDULED
        )
        
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        print("✅ Test reminder created successfully!")
        print(f"   ID: {reminder.id}")
        print(f"   Title: {reminder.title}")
        print(f"   Phone: {reminder.phone_number}")
        print(f"   Scheduled for: {scheduled_time.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"   Time until call: {minutes_from_now} minute(s)")
        print()
        print("📋 Next steps:")
        print("   1. Keep your backend server running")
        print("   2. Watch the backend logs for scheduler activity")
        print(f"   3. In {minutes_from_now} minute(s), you should receive a call")
        print("   4. Check the reminder status in the dashboard or API")
        print()
        print(f"   Monitor with: curl http://localhost:8000/api/v1/reminders/{reminder.id}")
        
        return reminder
        
    except Exception as e:
        print(f"❌ Error creating test reminder: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def list_scheduled_reminders():
    """List all scheduled reminders."""
    db: Session = SessionLocal()
    
    try:
        reminders = db.query(Reminder).filter(
            Reminder.status == ReminderStatus.SCHEDULED
        ).order_by(Reminder.scheduled_datetime).all()
        
        if not reminders:
            print("No scheduled reminders found.")
            return
        
        print(f"📅 Found {len(reminders)} scheduled reminder(s):")
        print()
        
        for reminder in reminders:
            time_until = reminder.scheduled_datetime - datetime.now(timezone.utc)
            minutes = int(time_until.total_seconds() / 60)
            
            print(f"  • {reminder.title}")
            print(f"    ID: {reminder.id}")
            print(f"    Phone: {reminder.phone_number}")
            print(f"    Scheduled: {reminder.scheduled_datetime.strftime('%Y-%m-%d %H:%M:%S UTC')}")
            print(f"    Time until call: {minutes} minute(s)")
            print(f"    Attempts: {reminder.call_attempts}/{3}")  # max_retries from settings
            print()
        
    except Exception as e:
        print(f"❌ Error listing reminders: {e}")
    finally:
        db.close()


def main():
    """Main test function."""
    print("🧪 Scheduler Test Utility")
    print("=" * 50)
    print()
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python test_scheduler.py create <phone_number> [minutes]")
        print("  python test_scheduler.py list")
        print()
        print("Examples:")
        print("  python test_scheduler.py create +1234567890 2")
        print("  python test_scheduler.py list")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "create":
        if len(sys.argv) < 3:
            print("❌ Error: Phone number required")
            print("Usage: python test_scheduler.py create <phone_number> [minutes]")
            sys.exit(1)
        
        phone_number = sys.argv[2]
        minutes = int(sys.argv[3]) if len(sys.argv) > 3 else 2
        
        if not phone_number.startswith('+'):
            print("❌ Error: Phone number must be in E.164 format (start with +)")
            sys.exit(1)
        
        create_test_reminder(phone_number, minutes)
    
    elif command == "list":
        list_scheduled_reminders()
    
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: create, list")
        sys.exit(1)


if __name__ == "__main__":
    main()
