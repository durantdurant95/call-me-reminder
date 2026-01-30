"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReminderFilters, ReminderStatus } from "@/types/reminder";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ReminderFiltersProps {
  filters: ReminderFilters;
  onFiltersChange: (filters: ReminderFilters) => void;
}

export function ReminderFiltersComponent({
  filters,
  onFiltersChange,
}: ReminderFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as ReminderStatus);
    onFiltersChange({ ...filters, status });
  };

  const handleSortChange = (value: string) => {
    const sort = value as "newest" | "oldest" | "title";
    onFiltersChange({ ...filters, sort });
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <Tabs
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Sort Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reminders..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort Dropdown */}
        <Select
          value={filters.sort || "newest"}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
