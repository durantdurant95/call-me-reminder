"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Reminder } from "@/types/reminder";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { ReminderForm } from "./reminder-form";

interface ReminderDialogProps {
  trigger?: React.ReactNode;
  reminder?: Reminder; // Pass reminder data for edit mode
  mode?: "create" | "edit";
  open?: boolean; // Allow controlled open state
  onOpenChange?: (open: boolean) => void; // Allow controlled open state
}

export function ReminderDialog({
  trigger,
  reminder,
  mode = "create",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ReminderDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const isEditMode = mode === "edit" && reminder;

  // Don't render trigger when using controlled open state
  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <PlusIcon className="h-4 w-4" />
              New Reminder
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your scheduled phone call reminder."
              : "Schedule a phone call reminder. We'll call you at the specified time with your custom message."}
          </DialogDescription>
        </DialogHeader>
        <ReminderForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          reminder={reminder}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
