"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReminder } from "@/hooks/use-reminders";
import type { ReminderCreate } from "@/types/reminder";
import { useForm } from "@tanstack/react-form-nextjs";
import { format } from "date-fns";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Zod validation schema matching backend requirements
const reminderSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
  phone_number: z
    .string()
    .regex(/^\+1\d{10}$/, "Phone number must be in format +1XXXXXXXXXX"),
  scheduled_datetime: z.string().min(1, "Date and time are required"),
  timezone: z.string().min(1, "Timezone is required"),
});

interface ReminderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReminderForm({ onSuccess, onCancel }: ReminderFormProps) {
  const createReminder = useCreateReminder();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Auto-detect timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const form = useForm({
    defaultValues: {
      title: "",
      message: "",
      phone_number: "+1",
      scheduled_datetime: "",
      timezone: userTimezone,
    },
    onSubmit: async ({ value }) => {
      const submitPromise = (async () => {
        await createReminder.mutateAsync(value as ReminderCreate);
        onSuccess?.();
      })();

      toast.promise(submitPromise, {
        loading: "Creating reminder...",
        success: "Reminder created successfully!",
        error: (error) =>
          error instanceof Error ? error.message : "Failed to create reminder",
      });

      await submitPromise;
    },
  });

  // Combine date and time into ISO datetime string
  const handleDateTimeChange = (date: Date | undefined, time?: string) => {
    if (!date) {
      form.setFieldValue("scheduled_datetime", "");
      return;
    }

    // Get time from form or use provided time
    const timeValue =
      time ||
      (document.getElementById("scheduled-time") as HTMLInputElement)?.value;

    if (timeValue) {
      const [hours, minutes] = timeValue.split(":");
      const combinedDate = new Date(date);
      combinedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      form.setFieldValue("scheduled_datetime", combinedDate.toISOString());
    }
  };

  const isSubmitting = createReminder.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Title Field */}
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) => {
            const result = reminderSchema.shape.title.safeParse(value);
            if (!result.success) {
              return result.error.issues[0]?.message;
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name}>
              Title <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Doctor's appointment"
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-start">
              <FieldError
                errors={field.state.meta.errors.map((error) => ({
                  message: String(error),
                }))}
              />
              <span className="text-xs text-muted-foreground">
                {field.state.value.length}/100
              </span>
            </div>
          </Field>
        )}
      </form.Field>

      {/* Message Field */}
      <form.Field
        name="message"
        validators={{
          onChange: ({ value }) => {
            const result = reminderSchema.shape.message.safeParse(value);
            if (!result.success) {
              return result.error.issues[0]?.message;
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name}>
              Message <span className="text-destructive">*</span>
            </FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="This is a reminder about your doctor's appointment at 3 PM. Please bring your insurance card."
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-start">
              <FieldError
                errors={field.state.meta.errors.map((error) => ({
                  message: String(error),
                }))}
              />
              <span className="text-xs text-muted-foreground">
                {field.state.value.length}/500
              </span>
            </div>
          </Field>
        )}
      </form.Field>

      {/* Phone Number Field */}
      <form.Field
        name="phone_number"
        validators={{
          onChange: ({ value }) => {
            const result = reminderSchema.shape.phone_number.safeParse(value);
            if (!result.success) {
              return result.error.issues[0]?.message;
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel htmlFor={field.name}>
              Phone Number <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="+15555551234"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Format: +1XXXXXXXXXX
            </p>
            <FieldError
              errors={field.state.meta.errors.map((error) => ({
                message: String(error),
              }))}
            />
          </Field>
        )}
      </form.Field>

      {/* Date and Time Picker */}
      <form.Field
        name="scheduled_datetime"
        validators={{
          onChange: ({ value }) => {
            const result =
              reminderSchema.shape.scheduled_datetime.safeParse(value);
            if (!result.success) {
              return result.error.issues[0]?.message;
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <Field data-invalid={field.state.meta.errors.length > 0}>
            <FieldLabel>
              Schedule Date & Time <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldGroup className="flex-row gap-4">
              <div className="flex-1">
                <FieldLabel htmlFor="date-picker">Date</FieldLabel>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="date-picker"
                      className="w-full justify-between font-normal"
                      disabled={isSubmitting}
                    >
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select date"}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      captionLayout="dropdown"
                      defaultMonth={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        handleDateTimeChange(date);
                        setPopoverOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <FieldLabel htmlFor="scheduled-time">Time</FieldLabel>
                <Input
                  type="time"
                  id="scheduled-time"
                  onChange={(e) => {
                    handleDateTimeChange(selectedDate, e.target.value);
                  }}
                  disabled={!selectedDate || isSubmitting}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            </FieldGroup>
            <p className="text-xs text-muted-foreground mt-1">
              Timezone: {userTimezone}
            </p>
            <FieldError
              errors={field.state.meta.errors.map((error) => ({
                message: String(error),
              }))}
            />
          </Field>
        )}
      </form.Field>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Creating..." : "Create Reminder"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
