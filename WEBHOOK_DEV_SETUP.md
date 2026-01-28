# Webhook Development Setup

This guide explains how to enable webhooks during local development using the Vapi CLI.

## Architecture

```
Vapi Cloud → ngrok (public URL) → vapi listen (port 4242) → Docker backend (port 8000/api/v1/webhooks/vapi)
```

## Prerequisites

1. **Vapi CLI** - Install using official installer:

   ```bash
   curl -sSL https://vapi.ai/install.sh | bash
   ```

   After installation, restart your terminal or run:

   ```bash
   source ~/.zshrc  # or ~/.bashrc depending on your shell
   ```

2. **ngrok** - Download from https://ngrok.com or install via:

   ```bash
   brew install ngrok
   ```

3. **Vapi Account** - Login to CLI:
   ```bash
   vapi login
   ```

## Setup Steps

### Terminal 1: Start Docker Services

```bash
docker-compose up
```

Keep this running. Backend will be on http://localhost:8000

### Terminal 2: Start ngrok Tunnel

```bash
ngrok http 4242
```

**Important**: Note the public URL (e.g., `https://abc123.ngrok-free.app`)

### Terminal 3: Start Vapi Webhook Listener

```bash
vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi
```

This creates a local server on port 4242 that forwards to your Docker backend.

### Terminal 4: Configure Vapi Dashboard

1. Go to https://dashboard.vapi.ai
2. Navigate to **Settings** or **Phone Numbers**
3. Find your phone number: `4f8c6faf-0c6a-418b-8fef-e868be2c47d6`
4. Set **Server URL** to your ngrok URL from Terminal 2 (e.g., `https://abc123.ngrok-free.app`)
5. Save changes

### Terminal 5: Test

```bash
cd backend
python3 test_scheduler.py create +19362624172 2
```

## What to Expect

When a call is made:

1. **Scheduler** finds due reminder and calls Vapi API
2. **Vapi** makes the call and sends webhook to your ngrok URL
3. **ngrok** forwards to `vapi listen` on port 4242
4. **vapi listen** forwards to Docker backend at `/api/v1/webhooks/vapi`
5. **Backend** receives webhook and updates reminder status

You'll see webhook events in Terminal 3:

```
[2026-01-28 10:30:45] POST /
Event: call-started
Call ID: 019c03bf-f502-7993-a765-8bfb43a3e123
Status: 200 OK (45ms)

[2026-01-28 10:31:12] POST /
Event: call-ended
Status: 200 OK (23ms)
```

## Webhook Events

Our handler processes these events:

- **call.started** - Call initiated, log event
- **call.ended** - Call completed successfully → Mark reminder COMPLETED
- **call.failed** - Call failed → Mark reminder FAILED

## Troubleshooting

### Connection Refused

- Ensure Docker is running (`docker-compose up`)
- Verify backend is healthy: `curl http://localhost:8000/health`

### Webhooks Not Arriving

- Check ngrok is running and showing your public URL
- Verify `vapi listen` is forwarding to correct endpoint
- Confirm Vapi Dashboard has the correct ngrok URL
- Check Terminal 3 for incoming requests

### SSL/TLS Errors

If using self-signed certificates:

```bash
vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi --skip-verify
```

### ngrok URL Changes

Every time you restart ngrok (free plan), the URL changes. You must:

1. Get new ngrok URL from Terminal 2
2. Update Vapi Dashboard with new URL
3. Restart `vapi listen` if needed

**Pro Tip**: ngrok paid plans offer static URLs that don't change.

## Production Setup

For production, set the Server URL in Vapi Dashboard to your deployed backend:

```
https://your-domain.com/api/v1/webhooks/vapi
```

No `vapi listen` or ngrok needed in production.
