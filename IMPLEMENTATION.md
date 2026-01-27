# Implementation Guide: Call Me Reminder

## 🎯 Development Roadmap

This guide breaks down the implementation into logical phases with clear deliverables.

---

## Phase 1: Backend Foundation (2-3 hours)

### 1.1 Database Schema & Models

**File**: `backend/app/models/reminder.py`

```python
from sqlalchemy import Column, String, DateTime, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

class ReminderStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    FAILED = "failed"

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    phone_number = Column(String(20), nullable=False)  # E.164 format
    scheduled_datetime = Column(DateTime(timezone=True), nullable=False)
    timezone = Column(String(50), nullable=False)
    status = Column(Enum(ReminderStatus), default=ReminderStatus.SCHEDULED)
    call_attempts = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
```

### 1.2 Pydantic Schemas

**File**: `backend/app/schemas/reminder.py`

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
import re

class ReminderCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=5000)
    phone_number: str = Field(..., pattern=r'^\+[1-9]\d{1,14}$')
    scheduled_datetime: datetime
    timezone: str = Field(..., min_length=1)

    @field_validator('scheduled_datetime')
    def validate_future_datetime(cls, v):
        if v <= datetime.now(v.tzinfo):
            raise ValueError('Scheduled time must be in the future')
        return v

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    phone_number: Optional[str] = None
    scheduled_datetime: Optional[datetime] = None
    timezone: Optional[str] = None

class ReminderResponse(BaseModel):
    id: UUID
    title: str
    message: str
    phone_number: str
    scheduled_datetime: datetime
    timezone: str
    status: str
    call_attempts: int
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
```

### 1.3 CRUD Operations

**File**: `backend/app/api/v1/reminders.py`

Implement REST endpoints:

- `POST /api/v1/reminders` - Create
- `GET /api/v1/reminders` - List (with filters)
- `GET /api/v1/reminders/{id}` - Get one
- `PUT /api/v1/reminders/{id}` - Update
- `DELETE /api/v1/reminders/{id}` - Delete

**Key features**:

- Query parameter filtering (`?status=scheduled&sort=date_asc`)
- Search by title/message (`?search=query`)
- Pagination support

### 1.4 Database Setup

**Files to create**:

- `backend/app/core/database.py` - SQLAlchemy engine and session
- `backend/app/core/config.py` - Settings management with Pydantic
- `backend/alembic.ini` - Alembic configuration
- `backend/alembic/env.py` - Alembic environment

**Commands**:

```bash
alembic init alembic
alembic revision --autogenerate -m "Create reminders table"
alembic upgrade head
```

---

## Phase 2: Vapi Integration (1-2 hours)

### 2.1 Vapi Service

**File**: `backend/app/services/vapi_service.py`

```python
import httpx
from app.core.config import settings

class VapiService:
    def __init__(self):
        self.api_key = settings.VAPI_API_KEY
        self.base_url = "https://api.vapi.ai"

    async def create_call(
        self,
        phone_number: str,
        message: str,
        reminder_id: str
    ) -> dict:
        """
        Initiate a call using Vapi

        Args:
            phone_number: E.164 formatted phone
            message: Text to be spoken
            reminder_id: For tracking purposes

        Returns:
            Call response with call_id and status
        """
        # Implementation details:
        # 1. Create assistant with TTS configuration
        # 2. Start call to phone number
        # 3. Pass reminder message as first message
        # 4. Return call details
        pass

    async def get_call_status(self, call_id: str) -> dict:
        """Check call status"""
        pass
```

**Key Implementation Points**:

- Use Vapi's phone call API
- Configure assistant with clear voice settings
- Handle webhook callbacks for call status
- Implement proper error handling and timeouts

### 2.2 Webhook Handler

**File**: `backend/app/api/v1/webhooks.py`

```python
@router.post("/webhooks/vapi")
async def vapi_webhook(payload: dict):
    """
    Handle Vapi webhook for call status updates

    Events to handle:
    - call-started
    - call-ended
    - call-failed
    """
    # Update reminder status based on call outcome
    pass
```

---

## Phase 3: Scheduler Implementation (1-2 hours)

### 3.1 Reminder Scheduler

**File**: `backend/app/services/scheduler.py`

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

class ReminderScheduler:
    def __init__(self, db_session, vapi_service):
        self.scheduler = AsyncIOScheduler()
        self.db = db_session
        self.vapi = vapi_service

    async def check_due_reminders(self):
        """
        Check for reminders that are due and trigger calls
        Runs every 30 seconds
        """
        now = datetime.now(timezone.utc)

        # Find reminders due in next minute
        due_reminders = await self.db.query(Reminder).filter(
            Reminder.status == ReminderStatus.SCHEDULED,
            Reminder.scheduled_datetime <= now + timedelta(minutes=1),
            Reminder.scheduled_datetime > now - timedelta(minutes=5)
        ).all()

        for reminder in due_reminders:
            await self.process_reminder(reminder)

    async def process_reminder(self, reminder):
        """
        Process a single reminder
        - Call Vapi service
        - Update reminder status
        - Handle errors with retry logic
        """
        pass

    def start(self):
        self.scheduler.add_job(
            self.check_due_reminders,
            trigger=IntervalTrigger(seconds=30),
            id='check_reminders',
            replace_existing=True
        )
        self.scheduler.start()
```

### 3.2 FastAPI Lifespan

**File**: `backend/app/main.py`

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = ReminderScheduler(db, vapi_service)
    scheduler.start()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)
```

---

## Phase 4: Frontend - Design System (2 hours)

### 4.1 Setup shadcn/ui

```bash
cd frontend
pnpm dlx shadcn@latest init

# Install core components
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add toast
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add skeleton
```

### 4.2 Core UI Components

**Component Checklist**:

1. **Layout Components**
   - `components/ui/Container.tsx` - Max-width container
   - `components/ui/PageHeader.tsx` - Page title + actions
   - `components/ui/EmptyState.tsx` - Beautiful empty states

2. **Status Components**
   - `components/ui/StatusBadge.tsx` - Colored status indicators
   - `components/ui/Countdown.tsx` - Time remaining display
   - `components/ui/LoadingSkeleton.tsx` - Content loading states

3. **Form Components**
   - `components/ui/DateTimePicker.tsx` - Date + time input
   - `components/ui/PhoneInput.tsx` - Phone number with validation
   - `components/ui/TimezonePicker.tsx` - Timezone selector

### 4.3 Design Tokens

**File**: `frontend/lib/design-tokens.ts`

```typescript
export const designTokens = {
  colors: {
    primary: "indigo",
    success: "green",
    warning: "yellow",
    error: "red",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
};
```

---

## Phase 5: Frontend - Reminder Creation (2 hours)

### 5.1 Form Component

**File**: `frontend/components/features/ReminderForm.tsx`

**Requirements**:

- React Hook Form + Zod validation
- Inline validation with error messages
- Loading states during submission
- Success feedback with toast
- Clean layout with proper spacing
- Timezone auto-detection or manual selection
- Date/time picker that prevents past dates
- Phone number formatting as user types

**UX Details**:

- Disable submit button when invalid
- Show loading spinner in button
- Clear success toast with undo option
- Autofocus on first field
- Tab navigation works perfectly

### 5.2 API Client

**File**: `frontend/lib/api/reminders.ts`

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const remindersApi = {
  create: (data: ReminderCreate) => api.post("/reminders", data),

  list: (filters?: ReminderFilters) =>
    api.get("/reminders", { params: filters }),

  get: (id: string) => api.get(`/reminders/${id}`),

  update: (id: string, data: ReminderUpdate) =>
    api.put(`/reminders/${id}`, data),

  delete: (id: string) => api.delete(`/reminders/${id}`),
};
```

### 5.3 React Query Hooks

**File**: `frontend/hooks/useReminders.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useReminders(filters?: ReminderFilters) {
  return useQuery({
    queryKey: ["reminders", filters],
    queryFn: () => remindersApi.list(filters),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: remindersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["reminders"]);
      toast.success("Reminder created!");
    },
    onError: (error) => {
      toast.error("Failed to create reminder");
    },
  });
}
```

---

## Phase 6: Frontend - Dashboard (2-3 hours)

### 6.1 Dashboard Layout

**File**: `frontend/app/dashboard/page.tsx`

**Structure**:

```tsx
<PageHeader title="Reminders" action={<NewReminderButton />} />
<FilterBar onFilterChange={setFilters} />
<ReminderList reminders={reminders} loading={isLoading} />
```

### 6.2 Reminder Card Component

**File**: `frontend/components/features/ReminderCard.tsx`

**Features**:

- Title + truncated message preview
- Status badge (colored)
- Countdown timer (updates every second)
- Formatted date/time display
- Phone number (masked: +1 (555) **\*-**67)
- Action menu (edit, delete, test call)
- Hover state with subtle shadow
- Responsive layout

### 6.3 Filter & Search

**File**: `frontend/components/features/FilterBar.tsx`

**Filters**:

- Status tabs (All, Scheduled, Completed, Failed)
- Search input (debounced)
- Sort dropdown (Date: Newest, Date: Oldest)
- Active filter count badge

### 6.4 Empty States

**File**: `frontend/components/features/EmptyState.tsx`

Different empty states for:

- No reminders created yet (CTA to create first)
- No search results (suggest clearing search)
- No scheduled reminders (show completed/failed)

---

## Phase 7: Real-time Updates & Polish (1-2 hours)

### 7.1 Auto-refresh

Implement polling or WebSocket for status updates:

```typescript
// Option 1: Polling with React Query
useQuery({
  queryKey: ["reminders"],
  queryFn: remindersApi.list,
  refetchInterval: 5000, // Poll every 5 seconds
});

// Option 2: WebSocket (if implemented)
useWebSocket("/ws/reminders", {
  onMessage: (event) => {
    const reminder = JSON.parse(event.data);
    queryClient.setQueryData(["reminders"], (old) => {
      // Update specific reminder
    });
  },
});
```

### 7.2 Countdown Component

**File**: `frontend/components/ui/Countdown.tsx`

```typescript
// Shows: "in 2 hours 34 minutes" or "in 45 seconds"
// Updates every second
// Changes color as time approaches (gray -> yellow -> red)
```

### 7.3 Toast Notifications

- Success: "Reminder created successfully"
- Error: "Failed to create reminder. Please try again."
- Info: "Reminder call initiated"
- Success: "Reminder completed"

### 7.4 Loading States

- Skeleton cards while loading list
- Spinner in buttons during actions
- Optimistic updates for better UX
- Disable actions during loading

---

## Phase 8: Testing & Validation (1 hour)

### 8.1 Manual Testing Checklist

- [ ] Create reminder for 2 minutes from now
- [ ] Verify countdown updates correctly
- [ ] Confirm call is received at scheduled time
- [ ] Verify status changes to "completed"
- [ ] Test edit functionality
- [ ] Test delete functionality
- [ ] Test search and filters
- [ ] Test empty states
- [ ] Test error states (invalid phone, past date)
- [ ] Test loading states
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Verify accessibility (keyboard navigation, screen reader)

### 8.2 Edge Cases

- [ ] Creating reminder for exactly current time
- [ ] Invalid phone number formats
- [ ] Very long reminder messages
- [ ] Special characters in message
- [ ] Multiple reminders at same time
- [ ] Failed call handling
- [ ] Network errors during creation
- [ ] Database connection failures

---

## Implementation Priorities

### Must Have (Core Functionality)

1. ✅ Create reminder form with validation
2. ✅ Dashboard with reminder list
3. ✅ Status badges and countdown
4. ✅ Scheduler that triggers calls
5. ✅ Vapi integration
6. ✅ Status updates (scheduled → completed/failed)

### Should Have (Expected Quality)

7. ✅ Edit reminder functionality
8. ✅ Search and filter
9. ✅ Beautiful empty states
10. ✅ Loading skeletons
11. ✅ Toast notifications
12. ✅ Responsive design
13. ✅ Timezone handling

### Nice to Have (Extra Polish)

14. ⭐ Real-time updates (WebSocket)
15. ⭐ Delete confirmation modal
16. ⭐ Activity log for calls
17. ⭐ Dark mode
18. ⭐ E2E tests
19. ⭐ "Test call now" button
20. ⭐ Recurring reminders

---

## File Checklist

### Backend Files

- [ ] `backend/requirements.txt`
- [ ] `backend/app/main.py`
- [ ] `backend/app/core/config.py`
- [ ] `backend/app/core/database.py`
- [ ] `backend/app/models/reminder.py`
- [ ] `backend/app/schemas/reminder.py`
- [ ] `backend/app/api/v1/reminders.py`
- [ ] `backend/app/api/v1/webhooks.py`
- [ ] `backend/app/services/vapi_service.py`
- [ ] `backend/app/services/scheduler.py`
- [ ] `backend/app/utils/validation.py`
- [ ] `backend/alembic/env.py`
- [ ] `backend/.env.example`

### Frontend Files

- [ ] `frontend/package.json`
- [ ] `frontend/tsconfig.json`
- [ ] `frontend/tailwind.config.ts`
- [ ] `frontend/next.config.js`
- [ ] `frontend/app/layout.tsx`
- [ ] `frontend/app/page.tsx`
- [ ] `frontend/app/dashboard/page.tsx`
- [ ] `frontend/components/ui/*` (shadcn components)
- [ ] `frontend/components/features/ReminderForm.tsx`
- [ ] `frontend/components/features/ReminderCard.tsx`
- [ ] `frontend/components/features/ReminderList.tsx`
- [ ] `frontend/components/features/FilterBar.tsx`
- [ ] `frontend/components/features/EmptyState.tsx`
- [ ] `frontend/lib/api/reminders.ts`
- [ ] `frontend/lib/utils.ts`
- [ ] `frontend/hooks/useReminders.ts`
- [ ] `frontend/types/reminder.ts`
- [ ] `frontend/.env.local.example`

### Root Files

- [ ] `README.md`
- [ ] `IMPLEMENTATION.md`
- [ ] `docker-compose.yml`
- [ ] `.gitignore`

---

## Time Estimates

| Phase     | Task               | Estimated Time  |
| --------- | ------------------ | --------------- |
| 1         | Backend Foundation | 2-3 hours       |
| 2         | Vapi Integration   | 1-2 hours       |
| 3         | Scheduler          | 1-2 hours       |
| 4         | Design System      | 2 hours         |
| 5         | Reminder Form      | 2 hours         |
| 6         | Dashboard          | 2-3 hours       |
| 7         | Polish & Real-time | 1-2 hours       |
| 8         | Testing            | 1 hour          |
| **Total** |                    | **12-17 hours** |

Recommended: Aim for 8-10 hours of core features, then add polish if time permits.

---

## Key Success Metrics

### UI/UX Quality (40%)

- ✅ Looks professional and production-ready
- ✅ Consistent spacing and typography
- ✅ Great empty/loading/error states
- ✅ Smooth interactions and transitions
- ✅ Responsive across devices

### Frontend Architecture (25%)

- ✅ Clean component structure
- ✅ Reusable UI primitives
- ✅ Proper state management
- ✅ Type-safe code
- ✅ Logical folder organization

### Backend Quality (20%)

- ✅ Scheduler works reliably
- ✅ Database schema is logical
- ✅ API endpoints are RESTful
- ✅ Error handling is robust

### Integration (15%)

- ✅ Vapi calls work correctly
- ✅ Status updates are accurate
- ✅ Clear documentation
- ✅ Easy to set up and test

---

## Next Steps

1. **Start with Backend**: Get the database and API working first
2. **Test Backend**: Use Postman/Insomnia to verify endpoints
3. **Build UI Components**: Create design system before features
4. **Implement Features**: Form → Dashboard → Integration
5. **Polish**: Add loading states, empty states, error handling
6. **Test End-to-End**: Create reminder and verify call works
7. **Record Demo**: Show the complete flow in a Loom video

Good luck! 🚀
