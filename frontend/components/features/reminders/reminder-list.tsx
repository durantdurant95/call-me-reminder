"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ReminderListSkeleton } from "@/components/shared/loading-state";
import { useReminders } from "@/hooks/use-reminders";
import type {
  Reminder,
  ReminderFilters,
  ReminderListResponse,
} from "@/types/reminder";
import { CalendarIcon } from "lucide-react";
import { ReminderCard } from "./reminder-card";

interface ReminderListProps {
  filters?: ReminderFilters;
  onTestCall?: (reminder: Reminder) => void;
}

export function ReminderList({ filters, onTestCall }: ReminderListProps) {
  const { data, isLoading, isError } = useReminders(filters) as {
    data: ReminderListResponse | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  // Loading state
  if (isLoading) {
    return <ReminderListSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Failed to load reminders"
        description="There was an error loading your reminders. Please try again."
      />
    );
  }

  // Empty state
  if (!data || data.reminders.length === 0) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="No reminders yet"
        description="Create your first reminder to get started with scheduled phone calls."
      />
    );
  }

  // Render reminders in a responsive grid
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.reminders.map((reminder: Reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onTestCall={onTestCall}
        />
      ))}
    </div>
  );
}
