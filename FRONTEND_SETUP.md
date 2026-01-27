# Frontend Setup with Next.js + shadcn/ui Template

## Quick Start

After deleting the old frontend folder, create a new Next.js project using the shadcn template:

### Option 1: Using shadcn/ui CLI (Recommended)

```bash
cd /Users/alejandroperezduran/Developer/Personal/call-me-reminder

# Delete old frontend (if not already done)
rm -rf frontend

# Create new Next.js project with shadcn template
pnpm dlx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd frontend

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
```

When prompted during `shadcn init`:

- **Style**: Default
- **Base color**: Slate (or your preference)
- **CSS variables**: Yes
- **Tailwind config**: Yes (tailwind.config.ts)
- **CSS file**: app/globals.css
- **React Server Components**: Yes
- **Write configuration**: Yes

### Option 2: Manual Setup from Scratch

```bash
cd /Users/alejandroperezduran/Developer/Personal/call-me-reminder

# Delete old frontend
rm -rf frontend

# Create Next.js app
pnpm create next-app@latest frontend --typescript --tailwind --app

cd frontend

# Install additional dependencies
pnpm add @tanstack/react-query axios date-fns zod
pnpm add react-hook-form @hookform/resolvers
pnpm add clsx tailwind-merge class-variance-authority
pnpm add lucide-react sonner
pnpm add libphonenumber-js react-datepicker
pnpm add -D @types/react-datepicker

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
```

## Post-Setup Configuration

### 1. Create Environment File

```bash
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
```

### 2. Update package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. Install Essential shadcn Components

```bash
# Install the core components you'll need
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
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add tabs
```

### 4. Create Project Structure

```bash
# Create necessary directories
mkdir -p components/features
mkdir -p lib/api
mkdir -p hooks
mkdir -p types
```

### 5. Copy Type Definitions

Create `types/reminder.ts` with the Reminder type definitions from the original setup.

### 6. Set Up React Query Provider

Create `app/providers.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Update `app/layout.tsx` to include the provider:

```typescript
import { Providers } from './providers'
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
```

## Verify Setup

```bash
# Run the dev server
pnpm dev

# In another terminal, check TypeScript
pnpm type-check
```

Visit `http://localhost:3000` to see your app running!

## Docker Compatibility Note

The updated `Dockerfile` and `docker-compose.yml` are already configured to use pnpm. To build with Docker:

```bash
# Build and run frontend with Docker
docker-compose up frontend --build

# Or build the entire stack
docker-compose up --build
```

## Troubleshooting

### If pnpm is not installed:

```bash
npm install -g pnpm
```

### If you get peer dependency warnings:

```bash
pnpm install --shamefully-hoist
```

### If components don't import correctly:

Check that your `tsconfig.json` has the correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Next Steps

1. ✅ Delete old frontend folder
2. ✅ Create new Next.js project with shadcn template
3. ✅ Install dependencies
4. ✅ Set up environment variables
5. ✅ Install shadcn components
6. ✅ Create folder structure
7. ⏭️ Start implementing features (follow IMPLEMENTATION.md)
