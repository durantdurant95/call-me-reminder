# 🎧 Webhook Quick Start

## Problem We Solved

**Before**: Tried to set `serverUrl` in API call payload → Vapi free tier rejected it ❌

**Now**: Configure Server URL at **account level** in Vapi Dashboard → Works! ✅

## The Setup (4 Terminals)

```
Terminal 1: docker-compose up
Terminal 2: ngrok http 4242
Terminal 3: vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi
Terminal 4: Testing
```

## Step-by-Step

### 1️⃣ Install Prerequisites

```bash
# Install ngrok
brew install ngrok

# Install Vapi CLI (or use npx - see below)
npm install -g @vapi-ai/cli

# Login to Vapi
vapi login

# If 'vapi' command not found, use npx instead:
npx @vapi-ai/cli login
```

**Note**: If `vapi` command not found after install, either:

- Add npm global bin to PATH: `export PATH="$(npm config get prefix)/bin:$PATH"`
- Or use `npx @vapi-ai/cli` instead of `vapi` in all commands

### 2️⃣ Start Services

```bash
# Terminal 1: Start Docker
docker-compose up

# Terminal 2: Start ngrok (note the public URL!)
ngrok http 4242
# Example output: https://abc123.ngrok-free.app

# Terminal 3: Start Vapi listener
vapi listen --forward-to localhost:8000/api/v1/webhooks/vapi
```

### 3️⃣ Configure Vapi Dashboard

1. Go to https://dashboard.vapi.ai
2. Click **Phone Numbers** or **Settings**
3. Find your number: `4f8c6faf-4c91-417e-a516-9e29d98068f3`
4. Set **Server URL** to your ngrok URL (from Terminal 2)
5. **Save**

### 4️⃣ Test It!

```bash
# Terminal 4
cd backend
python3 test_scheduler.py create +19362624172 2
```

Watch Terminal 3 for webhook events! 🎉

## What You'll See

**Terminal 3 (vapi listen):**

```
[2026-01-28 10:30:45] POST /
Event: call-started
Call ID: 019c...
Status: 200 OK (45ms)

[2026-01-28 10:31:12] POST /
Event: call-ended
Status: 200 OK (23ms)
```

**Terminal 1 (Docker logs):**

```
backend | Webhook received: call.started
backend | Webhook received: call.ended
backend | Reminder marked as COMPLETED
```

## Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  Vapi    │────▶│  ngrok   │────▶│  vapi   │────▶│  Docker  │
│  Cloud   │     │  Tunnel  │     │  listen │     │  Backend │
└──────────┘     └──────────┘     └─────────┘     └──────────┘
                     :4242           :4242            :8000
```

## Troubleshooting

### "Connection refused"

→ Check Docker is running: `docker-compose ps`

### "No webhook events"

→ Verify ngrok URL in Vapi Dashboard
→ Check Terminal 3 for incoming requests

### "ngrok URL changed"

→ Free ngrok URLs change on restart
→ Update Vapi Dashboard with new URL
→ Consider ngrok paid plan for static URLs

## Production

In production, set Server URL directly to your deployed domain:

```
https://your-domain.com/api/v1/webhooks/vapi
```

No ngrok or `vapi listen` needed! 🚀

## Need Help?

See detailed guide: [WEBHOOK_DEV_SETUP.md](./WEBHOOK_DEV_SETUP.md)
