"use client";

import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: 10 seconds
        staleTime: 10 * 1000,
        // Retry failed requests
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && "status" in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        // Global mutation error handler
        onError: (error) => {
          // Check if error was already handled by specific mutation
          const errorMessage =
            error instanceof Error ? error.message : "Something went wrong";

          // Only show generic toast if not already handled
          if (
            !errorMessage.includes("create") &&
            !errorMessage.includes("update") &&
            !errorMessage.includes("delete")
          ) {
            toast.error("Operation failed", {
              description: errorMessage,
            });
          }
        },
      },
    },
  });
}
