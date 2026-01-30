"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ReminderListSkeleton } from "@/components/shared/loading-state";
import { useDeleteReminder, useReminders } from "@/hooks/use-reminders";
import type {
  Reminder,
  ReminderFilters,
  ReminderListResponse,
} from "@/types/reminder";
import { CalendarIcon } from "lucide-react";
import { ReminderCard } from "./reminder-card";

interface ReminderListProps {
  filters?: ReminderFilters;
  onEdit?: (reminder: Reminder) => void;
  onTestCall?: (reminder: Reminder) => void;
}

export function ReminderList({
  filters,
  onEdit,
  onTestCall,
}: ReminderListProps) {
  const { data, isLoading, isError } = useReminders(filters) as {
    data: ReminderListResponse | undefined;
    isLoading: boolean;
    isError: boolean;
  };
  const deleteReminder = useDeleteReminder();

  const handleDelete = (reminderId: string) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      deleteReminder.mutate(reminderId);
    }
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.reminders.map((reminder: Reminder) => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onEdit={onEdit}
          onDelete={handleDelete}
          onTestCall={onTestCall}
        />
      ))}
    </div>
  );
}
