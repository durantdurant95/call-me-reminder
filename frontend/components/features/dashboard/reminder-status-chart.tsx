"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Reminder } from "@/types/reminder";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReminderStatusChartProps {
  reminders: Reminder[];
}

export function ReminderStatusChart({ reminders }: ReminderStatusChartProps) {
  // Group reminders by status for the past 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // Count completed and failed reminders for this day
    const completed = reminders.filter((r) => {
      if (r.status !== "completed" || !r.completed_at) return false;
      const completedDate = new Date(r.completed_at);
      return completedDate >= date && completedDate < nextDay;
    }).length;

    const failed = reminders.filter((r) => {
      if (r.status !== "failed") return false;
      const updatedDate = r.updated_at ? new Date(r.updated_at) : null;
      return updatedDate && updatedDate >= date && updatedDate < nextDay;
    }).length;

    return {
      day: dateStr,
      completed,
      failed,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reminder completion status over the past week
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
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
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="completed"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              name="Completed"
            />
            <Bar
              dataKey="failed"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              name="Failed"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
