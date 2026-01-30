import { ReminderList } from "@/components/features/reminders/reminder-list";

export default function DashboardPage() {
  return (
    <div className="gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      {/* <ReminderDialog /> */}
      {/* <ReminderCard
        reminder={{
          id: "reminder_12345",
          title: "Test Reminder",
          message: "This is a test reminder message",
          phone_number: "+1234567890",
          scheduled_datetime: "2024-01-15T10:00:00Z",
          timezone: "America/New_York",
          status: "pending" as const,
          call_attempts: 0,
          last_error: null,
          created_at: "2024-01-10T08:00:00Z",
          updated_at: null,
          completed_at: null,
        }}
      /> */}
      <ReminderList />
    </div>
  );
}
