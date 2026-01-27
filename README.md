# Call Me Reminder

A sophisticated reminder application that automatically calls you at scheduled times using AI-powered voice technology.

## 🎯 Overview

Call Me Reminder is a full-stack application that allows users to:

- Create reminders with date/time, phone number, and custom messages
- View a dashboard of upcoming reminders with real-time status
- Receive automated phone calls with spoken reminders via Vapi integration
- Manage reminder lifecycle (create, edit, delete, complete)

## 🏗️ Architecture

```
call-me-reminder/
├── frontend/          # Next.js 14+ with App Router
│   ├── app/          # App router pages and layouts
│   ├── components/   # React components
│   │   ├── ui/      # Reusable UI primitives (shadcn/ui)
│   │   └── features/ # Feature-specific components
│   ├── lib/         # Utilities and API clients
│   ├── hooks/       # Custom React hooks
│   └── types/       # TypeScript type definitions
│
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/  # API routes
│   │   ├── core/    # Configuration and settings
│   │   ├── models/  # SQLAlchemy models
│   │   ├── schemas/ # Pydantic schemas
│   │   ├── services/ # Business logic (Vapi, Twilio, Scheduler)
│   │   └── utils/   # Helper functions
│   ├── alembic/     # Database migrations
│   └── tests/       # Backend tests
│
└── docker-compose.yml # Local development setup
```

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Date/Time**: date-fns + react-datepicker
- **HTTP Client**: Axios

### Backend

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Scheduler**: APScheduler
- **Voice API**: Vapi
- **Phone Provider**: Twilio
- **Validation**: Pydantic

## 📋 Prerequisites

- **Node.js**: 20.9.0 or higher
- **pnpm**: 8.x or higher (install with `npm install -g pnpm`)
- **Python**: 3.11 or higher
- **PostgreSQL**: 15.x or higher (or use Docker)
- **Twilio Account**: For phone number (free trial works)
- **Vapi Account**: For AI voice calls (free credits work)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd call-me-reminder
```

### 2. Environment Variables

Create environment files for both frontend and backend:

#### Frontend (.env.local)

```bash
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
```

#### Backend (.env)

```bash
cd backend
cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/call_me_reminder

# Vapi
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id

# Twilio (optional - for custom phone validation)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# App Settings
ENVIRONMENT=development
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for database to be ready
sleep 5
```

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb call_me_reminder
```

### 4. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## 🔄 How Scheduling Works

The backend uses **APScheduler** with a background scheduler that:

1. **Checks every 30 seconds** for reminders that are due
2. **Triggers Vapi calls** for due reminders
3. **Updates status** to "completed" or "failed" based on call result
4. **Retries** failed calls up to 3 times with exponential backoff

### Scheduler Architecture

```python
# app/services/scheduler.py
- ReminderScheduler class
- Periodic job checks database for due reminders
- Calls VapiService to initiate phone calls
- Updates reminder status based on call outcome
```

## 📞 Testing the Call Workflow

### Quick Test (2-minute reminder)

1. **Start both servers** (backend and frontend)

2. **Create a reminder**:
   - Go to `http://localhost:3000`
   - Click "New Reminder"
   - Fill in:
     - Title: "Quick Test"
     - Message: "This is a test reminder call"
     - Phone: Your phone number (E.164 format: +1234567890)
     - Date/Time: 2 minutes from now
   - Click "Create Reminder"

3. **Watch the dashboard**:
   - Status should show "Scheduled"
   - Countdown timer will show time remaining

4. **Wait for call**:
   - At scheduled time, you'll receive a call
   - Vapi will speak your reminder message
   - Dashboard will update to "Completed" or "Failed"

5. **Check logs**:
   ```bash
   # Backend logs will show:
   # "Processing reminder ID: X"
   # "Vapi call initiated successfully"
   # "Reminder marked as completed"
   ```

### Testing with Mock Mode (Optional)

For testing without actual calls:

```bash
# In backend/.env
VAPI_MOCK_MODE=True
```

This will simulate calls without using Vapi credits.

## 🎨 Design System

The frontend implements a consistent design system:

### Color Palette

- **Primary**: Indigo (600)
- **Success**: Green (500)
- **Warning**: Yellow (500)
- **Error**: Red (500)
- **Neutral**: Gray (50-900)

### Typography

- **Heading**: Inter font family, weights 600-800
- **Body**: Inter font family, weight 400-500
- **Scale**: text-xs, sm, base, lg, xl, 2xl, 3xl, 4xl

### Components

- Buttons (primary, secondary, ghost, outline)
- Inputs (default, error states)
- Cards (with hover states)
- Badges (status indicators)
- Modals/Dialogs
- Toast notifications
- Loading skeletons
- Empty states

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests (if implemented)
```

### Backend Tests

```bash
cd backend
pytest                # Run all tests
pytest tests/api/     # Run API tests only
pytest --cov          # Run with coverage
```

## 🐳 Docker Deployment (Optional)

```bash
# Build and start all services
docker-compose up --build

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - PostgreSQL: localhost:5432
```

## 📱 API Endpoints

### Reminders

- `POST /api/v1/reminders` - Create reminder
- `GET /api/v1/reminders` - List reminders (with filters)
- `GET /api/v1/reminders/{id}` - Get reminder
- `PUT /api/v1/reminders/{id}` - Update reminder
- `DELETE /api/v1/reminders/{id}` - Delete reminder
- `POST /api/v1/reminders/{id}/test-call` - Test call immediately

### Filters

- `?status=scheduled|completed|failed`
- `?sort=date_asc|date_desc`
- `?search=query`

## 🔒 Security Considerations

- No hardcoded secrets (use environment variables)
- Phone numbers are validated before saving
- API keys are never exposed to frontend
- CORS configured for local development only
- Input validation on both frontend and backend

## 🚧 Known Limitations

- Local development only (not production-ready)
- No authentication implemented
- Single-user system
- Timezone handling is basic (no complex DST logic)
- Limited error recovery for failed calls

## 📝 Implementation Notes

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detailed implementation plan, component breakdown, and development checklist.

## 🎥 Demo Video

[Optional: Link to Loom video here after recording]

## 📄 License

MIT

## 🤝 Contact

[Your name and email]

---

Built with ❤️ for Senior Frontend Role Assessment
