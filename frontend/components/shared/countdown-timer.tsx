/**
 * Countdown Timer Component
 * Displays time remaining until a scheduled datetime with color-coded urgency
 */

"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string; // ISO 8601 datetime string
  className?: string;
}

function getTimeRemaining(targetDate: string) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { isPast: true, text: "Past due", urgency: "critical" as const };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  // Determine urgency level
  let urgency: "normal" | "warning" | "critical" = "normal";
  if (difference < 5 * 60 * 1000) {
    // Less than 5 minutes
    urgency = "critical";
  } else if (difference < 60 * 60 * 1000) {
    // Less than 1 hour
    urgency = "warning";
  }

  // Format text
  let text = "";
  if (days > 0) {
    text = `in ${days}d ${hours}h`;
  } else if (hours > 0) {
    text = `in ${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    text = `in ${minutes}m ${seconds}s`;
  } else {
    text = `in ${seconds}s`;
  }

  return { isPast: false, text, urgency };
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeInfo, setTimeInfo] = useState(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInfo(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const urgencyColors = {
    normal: "text-muted-foreground",
    warning: "text-yellow-600 dark:text-yellow-500",
    critical: "text-red-600 dark:text-red-500",
  };

  return (
    <span
      className={cn(
        "text-sm font-medium tabular-nums",
        urgencyColors[timeInfo.urgency],
        className,
      )}
    >
      {timeInfo.text}
    </span>
  );
}
