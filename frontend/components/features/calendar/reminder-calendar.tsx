"use client";

import { useReminders } from "@/hooks/use-reminders";
import { Reminder, ReminderListResponse } from "@/types/reminder";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { parseISO } from "date-fns";
import { useState } from "react";
import { ReminderDialog } from "../reminders/reminder-dialog";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    reminder: Reminder;
  };
}

const STATUS_COLORS = {
  scheduled: {
    background: "var(--chart-1)",
    border: "var(--chart-1)",
  },
  completed: {
    background: "var(--chart-2)",
    border: "var(--chart-2)",
  },
  failed: {
    background: "var(--destructive)",
    border: "var(--destructive)",
  },
  pending: {
    background: "var(--chart-3)",
    border: "var(--chart-3)",
  },
};

function transformRemindersToEvents(reminders: Reminder[]): CalendarEvent[] {
  return reminders.map((reminder) => {
    const start = parseISO(reminder.scheduled_datetime);
    const end = new Date(start.getTime() + 15 * 60 * 1000); // 15 minutes duration
    const colors = STATUS_COLORS[reminder.status];

    return {
      id: reminder.id,
      title: reminder.title,
      start,
      end,
      backgroundColor: colors.background,
      borderColor: colors.border,
      extendedProps: {
        reminder,
      },
    };
  });
}

export function ReminderCalendar() {
  const { data, isLoading, isError, error } = useReminders({}) as {
    data: ReminderListResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-150 border rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-150 border rounded-lg">
        <div className="text-center">
          <p className="text-destructive font-semibold">
            Error loading calendar
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  const events = data?.reminders
    ? transformRemindersToEvents(data.reminders)
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (info: { event: any }) => {
    const reminder = info.event.extendedProps?.reminder as Reminder;
    if (reminder) {
      setSelectedReminder(reminder);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 bg-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText={(num) => `+${num} more`}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: "short",
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: "short",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          firstDay={0} // Sunday
          nowIndicator
          eventInteractive
          eventBackgroundColor="var(--primary)"
          eventBorderColor="var(--primary)"
          eventTextColor="var(--primary-foreground)"
        />
      </div>

      {selectedReminder && (
        <ReminderDialog
          reminder={selectedReminder}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          mode="edit"
        />
      )}
    </>
  );
}
