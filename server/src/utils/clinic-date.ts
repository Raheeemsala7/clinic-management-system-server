import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function getTodayClinicDate(tz = process.env.CLINIC_TIMEZONE || 'Africa/Cairo'): string {
  return dayjs().tz(tz).format('YYYY-MM-DD');
}

export function clinicDateToUtcStart(date: string, tz = process.env.CLINIC_TIMEZONE || 'Africa/Cairo'): Date {
  return dayjs.tz(date, tz).startOf('day').toDate();
}

export function clinicDateToUtcEnd(date: string, tz = process.env.CLINIC_TIMEZONE || 'Africa/Cairo'): Date {
  return dayjs.tz(date, tz).endOf('day').toDate();
}

export function toClinicDate(date: Date, tz = process.env.CLINIC_TIMEZONE || 'Africa/Cairo'): string {
  return dayjs(date).tz(tz).format('YYYY-MM-DD');
}
