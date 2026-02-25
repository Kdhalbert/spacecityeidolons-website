import { format, parseISO, isPast as isFutureDate } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format a date string or Date object to a short format
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd');
}

/**
 * Format time string (HH:MM) to a readable format
 */
export function formatTime(time: string | Date): string {
  if (time instanceof Date) {
    return format(time, 'HH:mm');
  }
  return time; // Already formatted as HH:MM
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date, time?: string): string {
  const dateStr = formatDate(date);
  if (time) {
    return `${dateStr} at ${time}`;
  }
  return dateStr;
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isFutureDate(dateObj);
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get date range display (e.g., "Jan 15 - Jan 20")
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}

/**
 * Parse a date string in YYYY-MM-DD format
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

/**
 * Format date to YYYY-MM-DD for input fields
 */
export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
