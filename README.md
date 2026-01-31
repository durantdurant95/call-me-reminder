# Call Me Reminder

An intelligent reminder application that delivers automated phone calls at scheduled times using AI-powered voice technology. Built with modern full-stack technologies including Next.js 16, FastAPI, and Vapi AI voice platform.

## 🎯 Overview

Call Me Reminder enables users to create voice-based reminders that automatically call them at specified times. The system features a comprehensive dashboard for managing reminders, real-time status tracking, calendar views, and analytics.

### Key Features

- **Voice Reminders**: Automated AI-powered phone calls delivered via Vapi
- **Smart Dashboard**: Real-time reminder tracking with status updates and countdown timers
- **Calendar View**: Interactive calendar display with FullCalendar integration
- **Analytics**: Visual charts showing reminder activity and completion rates
- **Advanced Filtering**: Search, sort, and filter reminders by status
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Complete theme support with smooth transitions
- **Toast Notifications**: Real-time feedback for all user actions
- **Network Resilience**: Offline detection and automatic retry mechanisms

## 🏗️ Architecture

### Project Structure

```
call-me-reminder/
├── frontend/              # Next.js 16 with App Router
│   ├── app/              # Application routes and layouts
│   │   ├── dashboard/    # Dashboard pages (home, reminders, calendar)
│   │   ├── login/        # Authentication pages
│   │   └── signup/
│   ├── components/       # React components
│   │   ├── features/     # Feature-specific components
│   │   │   ├── reminders/    # Reminder CRUD components
│   │   │   ├── dashboard/    # Stats cards and charts
│   │   │   └── calendar/     # Calendar view components
│   │   ├── layout/       # Layout components (sidebar, header)
│   │   ├── shared/       # Shared utilities (theme toggle, page header)
│   │   └── ui/           # shadcn/ui primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API clients
│   ├── contexts/         # React contexts
│   └── types/            # TypeScript definitions
│
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/      # REST API endpoints
│   │   │   ├── reminders.py
│   │   │   └── webhooks.py
│   │   ├── core/        # Configuration and database
│   │   ├── models/      # SQLAlchemy ORM models
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── services/    # Business logic layer
│   │   │   ├── vapi_service.py    # Vapi API integration
│   │   │   └── scheduler.py      # APScheduler for reminders
│   │   └── utils/       # Helper utilities
│   ├── alembic/         # Database migrations
│   └── tests/           # Test suite
│
└── docker-compose.yml   # Container orchestration
```

````

## 🚀 Technology Stack

### Frontend

- **Framework**: Next.js 16.1.5 with App Router
- **Language**: TypeScript 5
- **UI Framework**: React 19.2.3
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui with Radix UI primitives
- **State Management**: TanStack Query v5.90.20
- **Form Handling**: TanStack Form with Zod validation
- **Calendar**: FullCalendar v6.1.20
- **Charts**: Recharts v3.7.0
- **Date Utilities**: date-fns v4.1.0
- **Notifications**: Sonner v2.0.7
- **Icons**: Lucide React
- **Theme**: next-themes with dark mode support

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Scheduler**: APScheduler (background job processing)
- **Voice API**: Vapi (AI-powered voice calls)
- **Validation**: Pydantic v2
- **API Documentation**: OpenAPI/Swagger (auto-generated)

### DevOps

- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm (frontend), pip (backend)
- **Development**: Local development setup with hot reload

## 📋 Prerequisites

- **Node.js**: 20.9.0 or higher
- **pnpm**: 8.x or higher
- **Python**: 3.11 or higher
- **PostgreSQL**: 15.x or higher
- **Vapi Account**: API key and phone number ID

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/durantdurant95/call-me-reminder.git
cd call-me-reminder
````

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL
# - VAPI_API_KEY
# - VAPI_PHONE_NUMBER_ID
```

### 3. Database Setup

#### Using Docker (Recommended)

```bash
docker-compose up -d postgres
```

#### Using Local PostgreSQL

```bash
createdb call_me_reminder
```

### 4. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 6. Start Development Servers

#### Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
pnpm dev
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔄 Application Workflow

### Reminder Scheduling System

The backend implements an intelligent scheduling system using APScheduler:

1. **Creation**: User creates a reminder through the dashboard
2. **Storage**: Reminder is stored in PostgreSQL with status "scheduled"
3. **Monitoring**: Background scheduler checks every 30 seconds for due reminders
4. **Execution**: When a reminder is due:
   - Vapi API is called to initiate the phone call
   - User receives AI-powered voice call with their custom message
   - Reminder status updates to "completed" or "failed"
5. **Retry Logic**: Failed calls are retried up to 3 times with exponential backoff

### State Management Flow

```
User Action → React Query Mutation → API Call → Database Update
                     ↓
              Cache Invalidation
                     ↓
              UI Auto-refresh (10s polling)
```

## 📱 API Documentation

### Reminder Endpoints

| Method | Endpoint                 | Description                     |
| ------ | ------------------------ | ------------------------------- |
| POST   | `/api/v1/reminders`      | Create new reminder             |
| GET    | `/api/v1/reminders`      | List all reminders with filters |
| GET    | `/api/v1/reminders/{id}` | Get reminder by ID              |
| PUT    | `/api/v1/reminders/{id}` | Update reminder                 |
| DELETE | `/api/v1/reminders/{id}` | Delete reminder                 |

### Query Parameters

- `status`: Filter by status (scheduled, completed, failed, pending)
- `search`: Search in title and message
- `sort`: Sort order (newest, oldest, title)
- `page`: Page number for pagination
- `page_size`: Items per page

### Webhook Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/api/v1/webhooks/vapi` | Vapi call status webhook |

## 🎨 User Interface Features

### Dashboard Pages

1. **Main Dashboard** (`/dashboard`)
   - Total reminders count
   - Scheduled reminders count
   - Completed today count
   - Reminder activity chart (next 7 days)
   - Reminder status chart (past 7 days)

2. **Reminders Page** (`/dashboard/reminders`)
   - Filterable reminder list
   - Status tabs (All, Scheduled, Completed, Failed)
   - Search functionality
   - Sort options
   - Create/Edit/Delete operations
   - Real-time countdown timers

3. **Calendar View** (`/dashboard/calendar`)
   - Month/Week/Day views
   - Color-coded events by status
   - Click to view reminder details
   - Responsive mobile layout

### Component Architecture

- **Forms**: TanStack Form with Zod validation, onChange validation after minimum characters
- **Dialogs**: Controlled and uncontrolled state support
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Global error boundary with toast notifications
- **Network Status**: Offline detection with persistent notifications
- **Theme**: Seamless dark/light mode with system preference detection

## � Docker Deployment

### Full Stack with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - PostgreSQL: localhost:5432
```

### Production Considerations

For production deployment, configure:

- Environment-specific variables
- Secure database credentials
- HTTPS/SSL certificates
- CORS origins for production domain
- Proper logging and monitoring
- Database backups
- Rate limiting

## 🔒 Security Features

- Environment-based configuration (no hardcoded secrets)
- Input validation on both client and server
- SQL injection protection via SQLAlchemy ORM
- XSS prevention through React's built-in escaping
- CORS configuration for allowed origins
- Phone number format validation (E.164)
- API key management through environment variables

## 🚀 Performance Optimizations

### Frontend

- React Server Components for improved initial load
- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Memoization of expensive calculations
- Efficient re-rendering with React Query cache
- 10-second auto-refetch for real-time updates

### Backend

- Database query optimization with SQLAlchemy
- Connection pooling
- Indexed database columns for faster queries
- Background job processing with APScheduler
- Efficient pagination

## 📊 Database Schema

### Reminders Table

```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    call_attempts INTEGER DEFAULT 0,
    vapi_call_id VARCHAR(255),
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);
```

## 📝 Development Notes

### Code Organization

- **No Barrel Files**: Direct imports for better tree-shaking
- **Type Safety**: Strict TypeScript configuration
- **Error Boundaries**: Global error handling with fallback UI
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Keyboard navigation and screen reader support

### State Management Strategy

- **Server State**: TanStack Query for API data
- **UI State**: React useState/useReducer for local state
- **Form State**: TanStack Form with validation
- **Theme State**: next-themes context

## 🔧 Troubleshooting

### Common Issues

**Frontend won't start**

```bash
rm -rf node_modules .next
pnpm install
pnpm dev
```

**Database connection error**

```bash
# Verify PostgreSQL is running
docker-compose ps
# Check DATABASE_URL in backend/.env
```

**Vapi calls not working**

- Verify VAPI_API_KEY is correct
- Check VAPI_PHONE_NUMBER_ID is valid
- Ensure phone numbers are in E.164 format (+1234567890)
- Check backend logs for detailed error messages

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

Alejandro Pérez Durán

- GitHub: [@durantdurant95](https://github.com/durantdurant95)

---

**Call Me Reminder** - Never miss an important moment with AI-powered voice reminders.
