/**
 * API Client for Reminders
 * Uses native fetch API with TanStack Query
 */

import type {
  Reminder,
  ReminderCreate,
  ReminderFilters,
  ReminderListResponse,
  ReminderUpdate,
} from "@/types/reminder";

// API Base URL from environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper with error handling and JSON parsing
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError("Network error. Please check your connection.", 0);
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "An unknown error occurred",
      0,
    );
  }
}

/**
 * Build query string from filters object
 */
function buildQueryString(filters: ReminderFilters): string {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.page_size)
    params.append("page_size", filters.page_size.toString());

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Reminders API Client
 */
export const remindersApi = {
  /**
   * Get list of reminders with optional filters
   */
  list: async (
    filters: ReminderFilters = {},
  ): Promise<ReminderListResponse> => {
    const queryString = buildQueryString(filters);
    return fetchApi<ReminderListResponse>(`/reminders${queryString}`);
  },

  /**
   * Get a single reminder by ID
   */
  getById: async (id: string): Promise<Reminder> => {
    return fetchApi<Reminder>(`/reminders/${id}`);
  },

  /**
   * Create a new reminder
   */
  create: async (data: ReminderCreate): Promise<Reminder> => {
    return fetchApi<Reminder>("/reminders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing reminder
   */
  update: async (id: string, data: ReminderUpdate): Promise<Reminder> => {
    return fetchApi<Reminder>(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a reminder
   */
  delete: async (id: string): Promise<void> => {
    return fetchApi<void>(`/reminders/${id}`, {
      method: "DELETE",
    });
  },
};
