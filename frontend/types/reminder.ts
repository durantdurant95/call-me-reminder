/**
 * TypeScript types for Reminder API
 * Matches backend schemas from backend/app/schemas/reminder.py
 */

export type ReminderStatus = "scheduled" | "completed" | "failed" | "pending";

export interface Reminder {
  id: string;
  title: string;
  message: string;
  phone_number: string;
  scheduled_datetime: string; // ISO 8601 format
  timezone: string;
  status: ReminderStatus;
  call_attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
}

export interface ReminderCreate {
  title: string;
  message: string;
  phone_number: string;
  scheduled_datetime: string; // ISO 8601 format
  timezone: string;
}

export interface ReminderUpdate {
  title?: string;
  message?: string;
  phone_number?: string;
  scheduled_datetime?: string;
  timezone?: string;
}

export interface ReminderListResponse {
  reminders: Reminder[];
  total: number;
  page: number;
  page_size: number;
}

export interface ReminderFilters {
  status?: ReminderStatus;
  search?: string;
  sort?: "newest" | "oldest" | "title";
  page?: number;
  page_size?: number;
}
