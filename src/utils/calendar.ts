import { addDays, format } from 'date-fns';
import type { CreditCard } from '@/types';
import { getActualPaymentDueDate, getNextPaymentDueDate } from '@/utils/date';

const CALENDAR_MONTHS = 12;
const DEFAULT_LEAD_DAYS = 3;

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function dateValue(date: Date): string {
  return format(date, 'yyyyMMdd');
}

function utcTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function calendarTitle(card: CreditCard): string {
  return `Pay ${card.name} credit card${card.lastFourDigits ? ` ••${card.lastFourDigits}` : ''}`;
}

export function getGoogleCalendarUrl(card: CreditCard): string | null {
  if (!card.paymentDueDay) return null;

  const dueDate = getNextPaymentDueDate(card.billingCycleDay ?? 1, card.paymentDueDay);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: calendarTitle(card),
    dates: `${dateValue(dueDate)}/${dateValue(addDays(dueDate, 1))}`,
    details: `Credit card payment due. Expenchive will remind you ${DEFAULT_LEAD_DAYS} days beforehand.`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadPaymentCalendar(card: CreditCard): void {
  if (!card.paymentDueDay) return;

  const firstDueDate = getNextPaymentDueDate(card.billingCycleDay ?? 1, card.paymentDueDay);
  const title = calendarTitle(card);
  const events = Array.from({ length: CALENDAR_MONTHS }, (_, index) => {
    const month = firstDueDate.getMonth() + index;
    const year = firstDueDate.getFullYear() + Math.floor(month / 12);
    const normalizedMonth = ((month % 12) + 12) % 12;
    const dueDate = getActualPaymentDueDate(year, normalizedMonth, card.paymentDueDay!);
    const uid = `${card.id}-${dateValue(dueDate)}@expenchive.app`;

    return [
      'BEGIN:VEVENT',
      `UID:${escapeIcs(uid)}`,
      `DTSTAMP:${utcTimestamp(new Date())}`,
      `DTSTART;VALUE=DATE:${dateValue(dueDate)}`,
      `DTEND;VALUE=DATE:${dateValue(addDays(dueDate, 1))}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(`Payment due on ${format(dueDate, 'MMMM d, yyyy')}.`)}`,
      'BEGIN:VALARM',
      `TRIGGER:-P${DEFAULT_LEAD_DAYS}D`,
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcs(`${title} is due in ${DEFAULT_LEAD_DAYS} days`)}`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:PT9H',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcs(`${title} is due today`)}`,
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  });

  const contents = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Expenchive//Credit Card Reminders//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'credit-card'}-payment-reminders.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
