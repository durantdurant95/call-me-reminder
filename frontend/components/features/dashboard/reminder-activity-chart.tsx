"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Reminder } from "@/types/reminder";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReminderActivityChartProps {
  reminders: Reminder[];
}

export function ReminderActivityChart({
  reminders,
}: ReminderActivityChartProps) {
  // Group reminders by date for the next 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Count scheduled reminders for this day
    const scheduled = reminders.filter((r) => {
      if (r.status !== "scheduled") return false;
      const reminderDate = new Date(r.scheduled_datetime);
      return reminderDate >= date && reminderDate < nextDay;
    }).length;

    return {
      date: dateStr,
      scheduled,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Reminders</CardTitle>
        <p className="text-sm text-muted-foreground">
          Scheduled reminders for the next 7 days
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "var(--popover-foreground)" }}
            />
            <Area
              type="monotone"
              dataKey="scheduled"
              stroke="var(--primary)"
              fillOpacity={1}
              fill="url(#colorScheduled)"
              name="Scheduled"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
