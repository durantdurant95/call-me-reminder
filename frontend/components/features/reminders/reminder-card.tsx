import { CountdownTimer } from "@/components/shared/countdown-timer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Reminder } from "@/types/reminder";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  MoreVerticalIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
} from "lucide-react";

interface ReminderCardProps {
  reminder: Reminder;
  onEdit?: (reminder: Reminder) => void;
  onDelete?: (reminderId: string) => void;
  onTestCall?: (reminder: Reminder) => void;
}

export function ReminderCard({
  reminder,
  onEdit,
  onDelete,
  onTestCall,
}: ReminderCardProps) {
  // Mask phone number for privacy (show last 4 digits)
  const maskedPhone = reminder.phone_number.replace(
    /(\+1)(\d{6})(\d{4})/,
    "$1******$3",
  );

  // Format date and time
  const scheduledDate = new Date(reminder.scheduled_datetime);
  const formattedDate = format(scheduledDate, "PPP");
  const formattedTime = format(scheduledDate, "p");

  // Truncate message if too long
  const truncatedMessage =
    reminder.message.length > 100
      ? `${reminder.message.substring(0, 100)}...`
      : reminder.message;

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">
                {reminder.title}
              </h3>
              <StatusBadge status={reminder.status} />
            </div>
            {reminder.status === "scheduled" && (
              <CountdownTimer targetDate={reminder.scheduled_datetime} />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(reminder)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onTestCall && reminder.status === "scheduled" && (
                <DropdownMenuItem onClick={() => onTestCall(reminder)}>
                  <PhoneIcon className="mr-2 h-4 w-4" />
                  Test Call
                </DropdownMenuItem>
              )}
              {(onEdit || onTestCall) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(reminder.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {truncatedMessage}
        </p>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            <span>{formattedTime}</span>
            <span className="text-xs">({reminder.timezone})</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <PhoneIcon className="h-4 w-4" />
            <span>{maskedPhone}</span>
          </div>
        </div>

        {reminder.call_attempts > 0 && (
          <div className="pt-2 border-t">
            <Badge variant="secondary" className="text-xs">
              {reminder.call_attempts} attempt
              {reminder.call_attempts > 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {reminder.last_error && (
          <div className="pt-2 border-t">
            <p className="text-xs text-destructive line-clamp-1">
              Error: {reminder.last_error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
