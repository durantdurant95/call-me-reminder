import { ReminderDialog } from "@/components/features/reminders/reminder-dialog";

export default function DashboardPage() {
  return (
    <div className="felx gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <ReminderDialog />
    </div>
  );
}
