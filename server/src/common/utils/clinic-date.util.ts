import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Returns the current clinic date as "YYYY-MM-DD" in the configured timezone.
 */
export function getTodayClinicDate(tz: string): string {
  return dayjs().tz(tz).format('YYYY-MM-DD');
}

/**
 * Returns a dayjs instance for the given clinic date (start of day in clinic timezone, as UTC).
 */
export function clinicDateToUtcStart(date: string, tz: string): Date {
  return dayjs.tz(date, tz).startOf('day').toDate();
}

/**
 * Returns the UTC end of a clinic date.
 */
export function clinicDateToUtcEnd(date: string, tz: string): Date {
  return dayjs.tz(date, tz).endOf('day').toDate();
}

/**
 * Converts a UTC Date to clinic date string.
 */
export function toClinicDate(date: Date, tz: string): string {
  return dayjs(date).tz(tz).format('YYYY-MM-DD');
}
