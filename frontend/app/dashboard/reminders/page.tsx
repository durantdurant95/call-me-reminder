"use client";

import { ReminderDialog } from "@/components/features/reminders/reminder-dialog";
import { ReminderList } from "@/components/features/reminders/reminder-list";
import { PageHeader } from "@/components/layout/page-header";

export default function RemindersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        title="Reminders"
        description="Manage your scheduled phone call reminders"
        actions={<ReminderDialog />}
      />
      <ReminderList />
    </div>
  );
}
