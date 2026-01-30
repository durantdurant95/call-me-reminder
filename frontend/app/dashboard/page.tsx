"use client";

import { ReminderActivityChart } from "@/components/features/dashboard/reminder-activity-chart";
import { ReminderStatusChart } from "@/components/features/dashboard/reminder-status-chart";
import { StatsCard } from "@/components/features/dashboard/stats-card";
import { useReminders } from "@/hooks/use-reminders";
import type { ReminderListResponse } from "@/types/reminder";
import { CalendarCheckIcon, CalendarClockIcon, PhoneIcon } from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
  // Fetch all reminders
  const { data: allReminders } = useReminders({}) as {
    data: ReminderListResponse | undefined;
  };

  // Fetch scheduled reminders
  const { data: scheduledReminders } = useReminders({
    status: "scheduled",
  }) as {
    data: ReminderListResponse | undefined;
  };

  // Fetch completed reminders
  const { data: completedReminders } = useReminders({
    status: "completed",
  }) as {
    data: ReminderListResponse | undefined;
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = allReminders?.total ?? 0;
    const scheduled = scheduledReminders?.total ?? 0;
    const completed = completedReminders?.total ?? 0;

    // Calculate completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday =
      completedReminders?.reminders.filter((reminder) => {
        const completedAt = reminder.completed_at
          ? new Date(reminder.completed_at)
          : null;
        return completedAt && completedAt >= today;
      }).length ?? 0;

    return {
      total,
      scheduled,
      completed,
      completedToday,
    };
  }, [allReminders, scheduledReminders, completedReminders]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Reminders"
          value={stats.total}
          icon={PhoneIcon}
          description="All reminders in your account"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={CalendarClockIcon}
          description="Upcoming reminders"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CalendarCheckIcon}
          description={`${stats.completed} total completed`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReminderActivityChart
          reminders={scheduledReminders?.reminders ?? []}
        />
        <ReminderStatusChart reminders={allReminders?.reminders ?? []} />
      </div>
    </div>
  );
}
