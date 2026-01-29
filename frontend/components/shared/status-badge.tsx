/**
 * Status Badge Component
 * Displays reminder status with appropriate colors and icons
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReminderStatus } from "@/types/reminder";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: ReminderStatus;
  className?: string;
}

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    className:
      "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400",
  },
  pending: {
    label: "Pending",
    icon: Loader2,
    className:
      "bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400",
  },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
