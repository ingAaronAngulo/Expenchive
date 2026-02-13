import { addDays, addWeeks, addMonths, addYears, isWithinInterval, isWeekend, subDays, setDate } from 'date-fns';
import type { FrequencyType } from '@/types';

/**
 * Calculate next due date based on frequency
 */
export function calculateNextDueDate(currentDate: Date, frequency: FrequencyType): Date {
  switch (frequency) {
    case 'daily':
      return addDays(currentDate, 1);
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'yearly':
      return addYears(currentDate, 1);
    default:
      return currentDate;
  }
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return isWithinInterval(date, { start: startDate, end: endDate });
}

/**
 * Get start and end of current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

/**
 * Get start and end of current year
 */
export function getCurrentYearRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  return { start, end };
}

/**
 * Bank holidays in the US (major federal holidays)
 * Format: MM-DD
 */
const US_BANK_HOLIDAYS = [
  '01-01', // New Year's Day
  '07-04', // Independence Day
  '12-25', // Christmas Day
  // Add more as needed
];

/**
 * Check if a date is a bank holiday
 * Note: This is a simplified implementation. For production, consider using a proper holiday library
 */
export function isBankHoliday(date: Date): boolean {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}-${day}`;

  return US_BANK_HOLIDAYS.includes(dateStr);
}

/**
 * Check if a date is a business day (not weekend or bank holiday)
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isBankHoliday(date);
}

/**
 * Adjust a date to the previous business day if it falls on a weekend or holiday
 * This is commonly used for payment due dates
 */
export function adjustToPreviousBusinessDay(date: Date): Date {
  let adjustedDate = new Date(date);

  // Keep moving back until we find a business day
  while (!isBusinessDay(adjustedDate)) {
    adjustedDate = subDays(adjustedDate, 1);
  }

  return adjustedDate;
}

/**
 * Get the actual payment due date for a credit card billing cycle
 * @param year - The year
 * @param month - The month (0-11, JavaScript convention)
 * @param dayOfMonth - The configured payment due day (1-31)
 * @returns The adjusted payment due date (moved to previous business day if needed)
 */
export function getActualPaymentDueDate(
  year: number,
  month: number,
  dayOfMonth: number
): Date {
  // Create the target date
  let dueDate = new Date(year, month, 1);
  dueDate = setDate(dueDate, Math.min(dayOfMonth, new Date(year, month + 1, 0).getDate()));

  // Adjust to previous business day if needed
  return adjustToPreviousBusinessDay(dueDate);
}

/**
 * Get the next payment due date for a credit card
 * @param billingCycleDay - Day of month when billing cycle closes
 * @param paymentDueDay - Day of month when payment is due
 * @returns The next payment due date, adjusted for weekends/holidays
 */
export function getNextPaymentDueDate(
  billingCycleDay: number,
  paymentDueDay: number
): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Determine which month's payment we're looking at
  let targetMonth = currentMonth;
  let targetYear = currentYear;

  // If we're past the payment due day, look at next month
  if (currentDay > paymentDueDay) {
    targetMonth++;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear++;
    }
  }

  return getActualPaymentDueDate(targetYear, targetMonth, paymentDueDay);
}
