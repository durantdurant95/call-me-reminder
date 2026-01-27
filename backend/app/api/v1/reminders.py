"""
Reminder API endpoints.

Handles all CRUD operations for reminders.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.reminder import Reminder, ReminderStatus
from app.schemas.reminder import (
    ReminderCreate,
    ReminderUpdate,
    ReminderResponse,
    ReminderListResponse
)

router = APIRouter()


@router.post("/", response_model=ReminderResponse, status_code=201)
def create_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new reminder.
    
    - **title**: Short title for the reminder
    - **message**: Message to be spoken during call
    - **phone_number**: E.164 formatted phone number
    - **scheduled_datetime**: When to trigger the reminder (must be future)
    - **timezone**: User's timezone
    """
    try:
        # Create reminder instance
        reminder = Reminder(
            title=reminder_data.title,
            message=reminder_data.message,
            phone_number=reminder_data.phone_number,
            scheduled_datetime=reminder_data.scheduled_datetime,
            timezone=reminder_data.timezone,
            status=ReminderStatus.SCHEDULED
        )
        
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        
        return reminder
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create reminder: {str(e)}"
        )


@router.get("/", response_model=ReminderListResponse)
def list_reminders(
    status: Optional[ReminderStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in title and message"),
    sort: Optional[str] = Query("date_desc", description="Sort by: date_asc, date_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List reminders with optional filtering, searching, and pagination.
    
    Query parameters:
    - **status**: Filter by status (scheduled, completed, failed)
    - **search**: Search in title and message fields
    - **sort**: Sort order (date_asc or date_desc)
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 50, max: 100)
    """
    try:
        # Base query
        query = db.query(Reminder)
        
        # Apply status filter
        if status:
            query = query.filter(Reminder.status == status)
        
        # Apply search filter
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Reminder.title.ilike(search_pattern),
                    Reminder.message.ilike(search_pattern)
                )
            )
        
        # Apply sorting
        if sort == "date_asc":
            query = query.order_by(asc(Reminder.scheduled_datetime))
        else:  # date_desc is default
            query = query.order_by(desc(Reminder.scheduled_datetime))
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        reminders = query.offset(offset).limit(page_size).all()
        
        return ReminderListResponse(
            reminders=reminders,
            total=total,
            page=page,
            page_size=page_size
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list reminders: {str(e)}"
        )


@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(
    reminder_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific reminder by ID.
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not reminder:
        raise HTTPException(
            status_code=404,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    return reminder


@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: UUID,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a reminder.
    
    Only scheduled reminders can be fully updated.
    Completed or failed reminders cannot be modified.
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not reminder:
        raise HTTPException(
            status_code=404,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    # Prevent editing completed or failed reminders
    if reminder.status != ReminderStatus.SCHEDULED:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot update reminder with status '{reminder.status}'. Only scheduled reminders can be updated."
        )
    
    try:
        # Update only provided fields
        update_data = reminder_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(reminder, field, value)
        
        # Update the updated_at timestamp
        reminder.updated_at = datetime.now(timezone.utc)
        
        db.commit()
        db.refresh(reminder)
        
        return reminder
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update reminder: {str(e)}"
        )


@router.delete("/{reminder_id}", status_code=204)
def delete_reminder(
    reminder_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a reminder.
    
    Any reminder can be deleted regardless of status.
    """
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    if not reminder:
        raise HTTPException(
            status_code=404,
            detail=f"Reminder with id {reminder_id} not found"
        )
    
    try:
        db.delete(reminder)
        db.commit()
        return None  # 204 No Content
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete reminder: {str(e)}"
        )
