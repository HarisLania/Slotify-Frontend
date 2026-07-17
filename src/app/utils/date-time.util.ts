import { DayOfWeek } from '../core/models/working-hours.model';

/** Converts JS Date#getDay() (0=Sun..6=Sat) to the backend's day_of_week (0=Mon..6=Sun). */
export function toBackendDayOfWeek(date: Date): DayOfWeek {
  const jsDay = date.getDay();
  return ((jsDay + 6) % 7) as DayOfWeek;
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Pinned to en-US regardless of the browser's locale so times/dates always render the way
// the design does (12-hour clock with AM/PM) instead of drifting to 24-hour on other locales.
export function formatTime(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateLong(isoOrDate: string | Date): string {
  const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatMoney(value: string | number): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return `$${amount.toFixed(2).replace(/\.00$/, '')}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const diff = toBackendDayOfWeek(result);
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/** Builds a Sun-first 6-row calendar grid for the given month, padded with adjacent-month days as null. */
export function monthMatrix(year: number, month: number): Array<Date | null> {
  const firstOfMonth = new Date(year, month, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}
