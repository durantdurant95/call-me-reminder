# Implementation Checklist: Call Me Reminder

> **Track your progress** - Mark items as you complete them!

---

## 🏗️ Project Setup (Already Done ✅)

- [x] Project folder structure created
- [x] README.md with setup instructions
- [x] Docker configuration (docker-compose.yml, Dockerfiles)
- [x] .gitignore and environment templates
- [x] Basic backend files (main.py, config.py, database.py, models, schemas, services)
- [x] Basic frontend setup (Next.js project with shadcn/ui)
- [x] TypeScript types defined (types/reminder.ts)

---

## 📦 Phase 1: Backend - Database & API Setup

### 1.1 Database Configuration

- [x] Update `backend/.env` with your database credentials
- [x] Configure Alembic for migrations
  - [x] Create `backend/alembic.ini`
  - [x] Update `backend/alembic/env.py` to import Base and models

### 1.2 API Endpoints Implementation ✅

**File**: `backend/app/api/v1/reminders.py`

- [x] Create router and import dependencies
- [x] Implement `POST /api/v1/reminders` - Create reminder
  - [x] Validate input data
  - [x] Save to database
  - [x] Return created reminder
- [x] Implement `GET /api/v1/reminders` - List reminders
  - [x] Add query parameters: `?status=`, `?search=`, `?sort=`
  - [x] Add pagination support
  - [x] Return list with total count
- [x] Implement `GET /api/v1/reminders/{id}` - Get single reminder
- [x] Implement `PUT /api/v1/reminders/{id}` - Update reminder
  - [x] Validate that scheduled reminders can be edited
  - [x] Update only provided fields
- [x] Implement `DELETE /api/v1/reminders/{id}` - Delete reminder
- [x] Include router in `backend/app/main.py`

### 1.3 Test Backend API ✅

- [x] Start backend: `uvicorn app.main:app --reload`
- [x] Visit API docs: `http://localhost:8000/docs`
- [x] Test create reminder endpoint
- [x] Test list reminders endpoint
- [x] Test update and delete endpoints

---

## 🎙️ Phase 2: Vapi Integration

### 2.1 Configure Vapi Credentials ✅

- [x] Sign up for Vapi account at https://vapi.ai
- [x] Get API key from dashboard
- [x] Add to `backend/.env`:
  ```
  VAPI_API_KEY=your_api_key
  VAPI_PHONE_NUMBER_ID=your_phone_number_id
  ```

### 2.2 Complete Vapi Service ✅

**File**: `backend/app/services/vapi_service.py`

- [x] Implement `create_call()` method
  - [x] Configure assistant with voice settings
  - [x] Set up first message with reminder text
  - [x] Make API call to Vapi
  - [x] Return call details (call_id, status)
- [x] Implement `get_call_status()` method
- [x] Add error handling and timeouts
- [x] Test with a sample call (optional for now)

### 2.3 Webhook Handler ✅

**File**: `backend/app/api/v1/webhooks.py`

- [x] Create webhook endpoint `POST /api/v1/webhooks/vapi`
- [x] Handle call status events (started, ended, failed)
- [x] Update reminder status based on webhook
- [x] Include router in `backend/app/main.py`

**Setup Required:**

- Run migration: `alembic revision --autogenerate -m "Add vapi_call_id"` then `alembic upgrade head`
- For local development: Use `vapi listen` + ngrok (see `WEBHOOK_DEV_SETUP.md`)
- Configure Server URL at account level in Vapi Dashboard (NOT in API payload)
- Note: Free Vapi accounts don't support `serverUrl` in API calls - must configure in Dashboard

**Quick Start:**

```bash
# Terminal 1: Docker services
docker-compose up

# Terminal 2: ngrok tunnel
ngrok http 4242

# Terminal 3: Vapi CLI forwarder
vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi

# Terminal 4: Configure Vapi Dashboard with ngrok URL, then test
cd backend && python3 test_scheduler.py create +19362624172 2
```

---

## ⏰ Phase 3: Scheduler Setup ✅

### 3.1 Complete Scheduler Service ✅

**File**: `backend/app/services/scheduler.py`

- [x] Implement `process_reminder()` method
  - [x] Call `vapi_service.create_call()`
  - [x] Update reminder status to COMPLETED
  - [x] Handle errors and update call_attempts
  - [x] Mark as FAILED if max retries exceeded
- [x] Test `check_due_reminders()` logic
- [x] Verify scheduler runs every 30 seconds

### 3.2 Integrate Scheduler with FastAPI ✅

**File**: `backend/app/main.py`

- [x] Update lifespan to initialize scheduler
- [x] Start scheduler on app startup
- [x] Shutdown scheduler on app shutdown
- [x] Test that scheduler starts when backend runs

### 3.3 Test Scheduler

- [x] Create a reminder 2 minutes in the future using test script
- [x] Watch backend logs for scheduler activity
- [x] Verify reminder status changes to COMPLETED

**Test Commands:**

```bash
# Create test reminder (will call in 2 minutes)
python test_scheduler.py create +1234567890 2

# List scheduled reminders
python test_scheduler.py list

# Monitor logs
docker-compose logs -f backend
```

---

## 🎨 Phase 4: Frontend - Setup & Design System

### 4.1 Install Dependencies

```bash
cd frontend
pnpm install
```

- [x] Verify all packages installed correctly
- [x] Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`

### 4.2 Set Up React Query Provider

**File**: `frontend/app/providers.tsx`

- [x] Create Providers component with QueryClientProvider
- [x] Configure React Query defaults
- [x] Add Toaster from sonner

**File**: `frontend/app/layout.tsx`

- [x] Wrap children with Providers
- [x] Add Toaster component
- [x] Configure Inter font

### 4.3 Install shadcn/ui Components

```bash
cd frontend
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add tabs
```

- [x] All components installed successfully
- [x] Verify imports work in a test component

### 4.4 Create Custom UI Components

- [ ] `components/ui/PageHeader.tsx` - Page title with action buttons
- [ ] `components/ui/EmptyState.tsx` - Beautiful empty states with icons
- [ ] `components/ui/StatusBadge.tsx` - Colored status indicators
- [ ] `components/ui/Countdown.tsx` - Live countdown timer

---

## 📝 Phase 5: Frontend - Reminder Creation Form

### 5.1 API Client Setup

**File**: `frontend/lib/api/reminders.ts`

- [ ] Create axios instance with baseURL
- [ ] Implement `remindersApi.create()`
- [ ] Implement `remindersApi.list()`
- [ ] Implement `remindersApi.get()`
- [ ] Implement `remindersApi.update()`
- [ ] Implement `remindersApi.delete()`

### 5.2 React Query Hooks

**File**: `frontend/hooks/useReminders.ts`

- [ ] Create `useReminders()` hook for fetching list
- [ ] Create `useCreateReminder()` mutation
- [ ] Create `useUpdateReminder()` mutation
- [ ] Create `useDeleteReminder()` mutation
- [ ] Add proper success/error toast notifications

### 5.3 Reminder Form Component

**File**: `frontend/components/features/ReminderForm.tsx`

- [ ] Set up React Hook Form with Zod schema
- [ ] Create form fields:
  - [ ] Title input
  - [ ] Message textarea
  - [ ] Phone number input (with formatting)
  - [ ] Date/time picker
  - [ ] Timezone selector (or auto-detect)
- [ ] Add inline validation
- [ ] Add loading state during submission
- [ ] Show success toast on creation
- [ ] Clear form after successful submission
- [ ] Make form responsive and beautiful

### 5.4 Create "New Reminder" Page or Modal

**File**: `frontend/app/reminders/new/page.tsx` OR use a Dialog

- [ ] Create UI for reminder form
- [ ] Add proper layout and styling
- [ ] Test form submission
- [ ] Verify reminder appears in database

---

## 📊 Phase 6: Frontend - Dashboard

### 6.1 Dashboard Page Setup

**File**: `frontend/app/dashboard/page.tsx`

- [ ] Create dashboard layout
- [ ] Add PageHeader with "New Reminder" button
- [ ] Fetch reminders using `useReminders()` hook
- [ ] Show loading skeleton while fetching

### 6.2 Filter Bar Component

**File**: `frontend/components/features/FilterBar.tsx`

- [ ] Create status filter tabs (All, Scheduled, Completed, Failed)
- [ ] Add search input with debouncing
- [ ] Add sort dropdown (Date: Newest, Oldest)
- [ ] Update filters in state
- [ ] Pass filters to API

### 6.3 Reminder Card Component

**File**: `frontend/components/features/ReminderCard.tsx`

- [ ] Display reminder title and message
- [ ] Show status badge with correct color
- [ ] Display countdown timer (live updates)
- [ ] Format and display date/time
- [ ] Show masked phone number
- [ ] Add action menu (Edit, Delete, Test Call)
- [ ] Add hover effects
- [ ] Make card responsive

### 6.4 Reminder List Component

**File**: `frontend/components/features/ReminderList.tsx`

- [ ] Map through reminders and render ReminderCard
- [ ] Show empty state when no reminders
- [ ] Show "no results" when search returns empty
- [ ] Add loading skeletons
- [ ] Make list responsive (grid on desktop, stack on mobile)

### 6.5 Empty State Component

**File**: `frontend/components/features/EmptyState.tsx`

- [ ] Create empty state for "no reminders yet"
- [ ] Add CTA button to create first reminder
- [ ] Create empty state for "no search results"
- [ ] Make it visually appealing with icon

---

## ✨ Phase 7: Polish & Real-time Updates

### 7.1 Countdown Timer

**File**: `frontend/components/ui/Countdown.tsx`

- [ ] Calculate time remaining
- [ ] Update every second
- [ ] Format as "in 2 hours 34 minutes" or "in 45 seconds"
- [ ] Change color based on urgency (gray → yellow → red)
- [ ] Handle past times gracefully

### 7.2 Edit Reminder Functionality

**File**: `frontend/components/features/ReminderEditDialog.tsx`

- [ ] Create dialog with form
- [ ] Pre-fill form with existing data
- [ ] Submit update mutation
- [ ] Show success toast
- [ ] Refresh reminder list

### 7.3 Delete Confirmation

- [ ] Create confirmation dialog
- [ ] Show reminder details before deletion
- [ ] Handle delete mutation
- [ ] Remove from list optimistically

### 7.4 Auto-refresh Dashboard

- [ ] Enable React Query refetchInterval (5-10 seconds)
- [ ] Or implement WebSocket connection (advanced)
- [ ] Update status badges in real-time

### 7.5 Loading States

- [ ] Skeleton loaders for reminder cards
- [ ] Button loading states (spinner + disabled)
- [ ] Loading overlay for dialogs
- [ ] Optimistic updates where appropriate

### 7.6 Toast Notifications

- [ ] Success: "Reminder created successfully"
- [ ] Success: "Reminder updated"
- [ ] Success: "Reminder deleted"
- [ ] Error: "Failed to create reminder"
- [ ] Info: "Call initiated" (when scheduler processes)

---

## 🧪 Phase 8: Testing & Validation

### 8.1 Manual Testing Checklist

- [ ] Create reminder for 2 minutes from now
- [ ] Verify countdown updates every second
- [ ] Wait for scheduled time - confirm call received
- [ ] Verify status changes from "scheduled" to "completed"
- [ ] Test edit functionality - update reminder
- [ ] Test delete functionality
- [ ] Test search - find reminders by title
- [ ] Test filters - show only scheduled/completed/failed
- [ ] Test empty states - delete all reminders
- [ ] Test error states - try invalid phone number
- [ ] Test error states - try past date/time
- [ ] Test loading states - check UI during API calls

### 8.2 Responsive Design Testing

- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] Verify form works on all sizes
- [ ] Verify dashboard works on all sizes

### 8.3 Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states are visible
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Buttons have proper aria-labels

### 8.4 Edge Cases

- [ ] Create reminder for exactly current time
- [ ] Try very long reminder messages (5000 chars)
- [ ] Try special characters in message
- [ ] Create multiple reminders at same time
- [ ] Test with network offline (error handling)
- [ ] Test with backend down (error handling)

---

## 🎥 Phase 9: Documentation & Demo

### 9.1 Final Documentation

- [ ] Update README with actual setup steps
- [ ] Add screenshots of UI to README
- [ ] Document any environment variables needed
- [ ] Add troubleshooting section
- [ ] Document how to test the call workflow

### 9.2 Code Quality

- [ ] Remove console.logs
- [ ] Remove commented-out code
- [ ] Format all files consistently
- [ ] Check TypeScript for any `any` types
- [ ] Ensure no hardcoded values

### 9.3 Record Demo Video (Optional but Highly Valued)

- [ ] Show landing page
- [ ] Create a new reminder
- [ ] Show dashboard with countdown
- [ ] Wait for call to trigger
- [ ] Show status update to "completed"
- [ ] Briefly explain architecture
- [ ] Upload to Loom or similar (2-5 minutes)

---

## 🚀 Deployment Ready (Optional)

### Production Considerations

- [ ] Set up proper environment variables
- [ ] Configure CORS for production domain
- [ ] Set up proper error logging (Sentry, etc.)
- [ ] Add rate limiting to API
- [ ] Set up database backups
- [ ] Configure SSL/TLS
- [ ] Deploy backend (Railway, Render, AWS, etc.)
- [ ] Deploy frontend (Vercel, Netlify)
- [ ] Test production deployment

---

## 📈 Stretch Goals (If Time Permits)

### Nice to Have Features

- [ ] Dark mode support
- [ ] Recurring reminders (daily, weekly, monthly)
- [ ] Snooze functionality
- [ ] Calendar view of reminders
- [ ] Activity log for call attempts
- [ ] "Test call now" button
- [ ] Email notifications backup
- [ ] SMS notifications backup
- [ ] User authentication (passwordless)
- [ ] Multiple user support
- [ ] Reminder categories/tags
- [ ] Export reminders to CSV

### Advanced Features

- [ ] WebSocket for real-time updates
- [ ] Service worker for offline support
- [ ] Push notifications (web)
- [ ] Analytics dashboard
- [ ] A/B testing different voice settings
- [ ] Multi-language support
- [ ] Voice recording for custom messages

---

## 💡 Quick Reference

### Common Commands

**Backend:**

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
alembic revision --autogenerate -m "message"
alembic upgrade head
```

**Frontend:**

```bash
cd frontend
pnpm dev
pnpm build
pnpm type-check
```

**Docker:**

```bash
docker-compose up --build
docker-compose down
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Key URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

---

## ✅ Success Criteria

Your implementation is successful when:

1. **Functionality**: User can create reminder → receive call at scheduled time
2. **UI Quality**: App looks professional, not like a bootcamp project
3. **Code Quality**: Clean, organized, well-structured code
4. **Documentation**: Clear README with working setup instructions
5. **Polish**: Great loading/empty/error states throughout

Good luck! 🎉
