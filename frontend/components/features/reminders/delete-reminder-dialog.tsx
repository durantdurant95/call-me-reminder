"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteReminder } from "@/hooks/use-reminders";
import type { Reminder } from "@/types/reminder";
import { Loader2Icon } from "lucide-react";

interface DeleteReminderDialogProps {
  reminder: Reminder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteReminderDialog({
  reminder,
  open,
  onOpenChange,
}: DeleteReminderDialogProps) {
  const deleteReminder = useDeleteReminder();

  const handleDelete = async () => {
    await deleteReminder.mutateAsync(reminder.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;
            <span className="font-semibold text-foreground">
              {reminder.title}
            </span>
            &quot;? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteReminder.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteReminder.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteReminder.isPending && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            {deleteReminder.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
