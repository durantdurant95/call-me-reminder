# Reminder Components

This folder contains all reminder-related components for CRUD operations.

## Implemented Components ✅

### ReminderForm (`reminder-form.tsx`)

Form for creating reminders with validation.

**Features:**

- Title input (2-100 characters)
- Message textarea (10-500 characters)
- Phone number input (+1XXXXXXXXXX format)
- Date picker (shadcn Calendar)
- Time picker with clock icon
- Auto-detected timezone
- Real-time validation
- Character counters
- Loading states

### ReminderDialog (`reminder-dialog.tsx`)

Dialog wrapper containing the ReminderForm.

**Features:**

- Opens in modal dialog
- Custom trigger button support
- Auto-closes on success
- Resets form on close

**Usage:**

```tsx
import { ReminderDialog } from "@/components/features/reminders";

// With default trigger
<ReminderDialog />

// With custom trigger
<ReminderDialog trigger={<Button variant="outline">Schedule Call</Button>} />
```

## Planned Components

- `reminder-card.tsx` - Individual reminder display card
- `reminder-list.tsx` - List/grid of reminder cards
- `reminder-filters.tsx` - Filter bar with search, status tabs, and sort

## Integration

Uses:

- `@tanstack/react-form-nextjs` for form management
- `useCreateReminder` hook for API mutations
- shadcn/ui components (Calendar, Input, Textarea, etc.)
- React Query for data fetching and caching
- `reminder-dialog.tsx` - Dialog wrapper for creating new reminders
- `reminder-edit-dialog.tsx` - Dialog for editing existing reminders

These components will be created in Phase 5 of the implementation.
