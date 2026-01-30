"use client";

import { ReminderDialog } from "@/components/features/reminders/reminder-dialog";
import { ReminderFiltersComponent } from "@/components/features/reminders/reminder-filters";
import { ReminderList } from "@/components/features/reminders/reminder-list";
import { PageHeader } from "@/components/layout/page-header";
import type { ReminderFilters } from "@/types/reminder";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RemindersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<ReminderFilters>(() => {
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");

    return {
      status: status as ReminderFilters["status"],
      search: search || undefined,
      sort: (sort as ReminderFilters["sort"]) || "newest",
    };
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);

    const queryString = params.toString();
    const newUrl = queryString
      ? `/dashboard/reminders?${queryString}`
      : "/dashboard/reminders";

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const handleFiltersChange = (newFilters: ReminderFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        title="Reminders"
        description="Manage your scheduled phone call reminders"
        actions={<ReminderDialog />}
      />
      <ReminderFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
      <ReminderList filters={filters} />
    </div>
  );
}
