import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date from Timestamp or Date
 */
export function formatDate(date: Timestamp | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return format(dateObj, formatStr);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Timestamp | Date): string {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
}

/**
 * Format relative date (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Timestamp | Date): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Format account type for display
 */
export function formatAccountType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
