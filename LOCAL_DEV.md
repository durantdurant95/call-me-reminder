# Local Development Setup (Without Docker)

This guide shows how to run the app locally without Docker containers (except PostgreSQL).

## Prerequisites

1. **Python 3.11+** - Check: `python --version`
2. **Node.js 20+** - Check: `node --version`
3. **pnpm** - Check: `pnpm --version` or install: `npm install -g pnpm`
4. **PostgreSQL** - We'll use Docker just for this

## Quick Start

```bash
# Make the script executable
chmod +x dev-local.sh

# Run everything
./dev-local.sh
```

That's it! The script will:

- Start PostgreSQL in Docker
- Run database migrations
- Start backend on http://localhost:8000
- Start frontend on http://localhost:3000

Press `Ctrl+C` to stop everything.

## Manual Setup (Step by Step)

If you prefer to run services individually:

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment (first time only)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/call_me_reminder"
export ENVIRONMENT="development"
export DEBUG="True"
export CORS_ORIGINS='["http://localhost:3000"]'

# Run migrations (first time only or when schema changes)
alembic upgrade head

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be at: http://localhost:8000
API Docs at: http://localhost:8000/docs

### 3. Setup Frontend (in a new terminal)

```bash
cd frontend

# Install dependencies (already done)
pnpm install

# Set environment variable
export NEXT_PUBLIC_API_URL="http://localhost:8000/api/v1"

# Start frontend dev server
pnpm dev
```

Frontend will be at: http://localhost:3000

## Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

For the backend, you can create a `.env` file in the `backend` directory:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/call_me_reminder
VAPI_API_KEY=your_key_here
VAPI_PHONE_NUMBER_ID=your_phone_id_here
ENVIRONMENT=development
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
```

## Stopping Services

- **Frontend/Backend**: Press `Ctrl+C` in their terminals
- **PostgreSQL**: `docker-compose down`

## Benefits of Local Development

✅ No Docker build issues
✅ Faster hot-reload
✅ Direct access to all tools
✅ Easier debugging
✅ Install packages instantly with `pnpm add`

## Going Back to Docker

When you want to use Docker again:

```bash
docker-compose up
```

All your local changes will be synced via volumes!
