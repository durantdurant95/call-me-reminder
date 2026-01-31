"use client";

import { ReminderCalendar } from "@/components/features/calendar/reminder-calendar";
import { PageHeader } from "@/components/layout/page-header";

export default function CalendarPage() {
  return (
    <div className="space-y-6 px-4">
      <PageHeader
        title="Calendar"
        description="View your reminders in calendar format"
      />

      <ReminderCalendar />
    </div>
  );
}
