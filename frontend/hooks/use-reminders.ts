/**
 * React Query hooks for Reminders API
 * Uses TanStack Query for data fetching and mutations
 */

import { remindersApi } from "@/lib/api/reminders";
import type {
  Reminder,
  ReminderCreate,
  ReminderFilters,
  ReminderUpdate,
} from "@/types/reminder";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Query keys for reminders
 */
export const reminderKeys = {
  all: ["reminders"] as const,
  lists: () => [...reminderKeys.all, "list"] as const,
  list: (filters: ReminderFilters) =>
    [...reminderKeys.lists(), filters] as const,
  details: () => [...reminderKeys.all, "detail"] as const,
  detail: (id: string) => [...reminderKeys.details(), id] as const,
};

/**
 * Hook to fetch list of reminders with filters
 */
export function useReminders(
  filters: ReminderFilters = {},
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: reminderKeys.list(filters),
    queryFn: () => remindersApi.list(filters),
    refetchInterval: 10000, // Auto-refetch every 10 seconds
    ...options,
  });
}

/**
 * Hook to fetch a single reminder by ID
 */
export function useReminder(
  id: string,
  options?: Omit<UseQueryOptions, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: reminderKeys.detail(id),
    queryFn: () => remindersApi.getById(id),
    enabled: !!id, // Only fetch if ID is provided
    ...options,
  });
}

/**
 * Hook to create a new reminder
 */
export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReminderCreate) => remindersApi.create(data),
    onSuccess: (data) => {
      // Invalidate and refetch reminders list
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });

      // Show success toast
      toast.success("Reminder created successfully", {
        description: `Scheduled for ${new Date(data.scheduled_datetime).toLocaleString()}`,
      });
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to create reminder", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing reminder
 */
export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReminderUpdate }) =>
      remindersApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: reminderKeys.detail(id) });

      // Snapshot previous value
      const previousReminder = queryClient.getQueryData<Reminder>(
        reminderKeys.detail(id),
      );

      // Optimistically update to the new value
      if (previousReminder) {
        queryClient.setQueryData<Reminder>(reminderKeys.detail(id), {
          ...previousReminder,
          ...data,
        });
      }

      // Return context with snapshot
      return { previousReminder };
    },
    onSuccess: (data, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(reminderKeys.detail(id), data);

      // Invalidate lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });

      // Show success toast
      toast.success("Reminder updated successfully");
    },
    onError: (error: Error, { id }, context) => {
      // Rollback on error
      if (context?.previousReminder) {
        queryClient.setQueryData(
          reminderKeys.detail(id),
          context.previousReminder,
        );
      }

      // Show error toast
      toast.error("Failed to update reminder", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a reminder
 */
export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remindersApi.delete(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: reminderKeys.lists() });

      // Snapshot previous lists
      const previousLists = queryClient.getQueriesData({
        queryKey: reminderKeys.lists(),
      });

      // Optimistically remove from all list queries
      queryClient.setQueriesData(
        { queryKey: reminderKeys.lists() },
        (old: { reminders: Reminder[]; total: number } | undefined) => {
          if (!old?.reminders) return old;
          return {
            ...old,
            reminders: old.reminders.filter(
              (reminder: Reminder) => reminder.id !== id,
            ),
            total: old.total - 1,
          };
        },
      );

      // Return context with snapshot
      return { previousLists };
    },
    onSuccess: (_, id) => {
      // Remove detail query
      queryClient.removeQueries({ queryKey: reminderKeys.detail(id) });

      // Invalidate lists to refetch accurate data
      queryClient.invalidateQueries({ queryKey: reminderKeys.lists() });

      // Show success toast
      toast.success("Reminder deleted successfully");
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      // Show error toast
      toast.error("Failed to delete reminder", {
        description: error.message,
      });
    },
  });
}
