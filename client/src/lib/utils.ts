import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, de-duplicating conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Formatting helpers ──────────────────────────────────────────────────────
// All dates are shown in the clinic timezone and all numbers use Western digits,
// kept behind these single helpers so the convention changes in one place.

export const CLINIC_TIMEZONE = 'Africa/Cairo';
export const DEFAULT_CURRENCY = 'EGP';

/** Format a monetary value (backend sends decimals as strings). */
export function formatMoney(value: string | number | null | undefined, currency = DEFAULT_CURRENCY): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return '—';
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function toDate(value: string | number | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** dd/mm/yyyy in the clinic timezone. */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** HH:mm (24h) in the clinic timezone. */
export function formatTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = toDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

/** dd/mm/yyyy HH:mm in the clinic timezone. */
export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const d = toDate(value);
  if (!d) return '—';
  return `${formatDate(d)} ${formatTime(d)}`;
}

/** Age in whole years from an ISO date of birth, as of now (clinic timezone day). */
export function computeAge(dateOfBirth: string | null | undefined): number | null {
  if (!dateOfBirth) return null;
  const dob = toDate(dateOfBirth);
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

/** Today's clinic date as YYYY-MM-DD (en-CA yields the ISO date). */
export function todayClinicDate(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIMEZONE }).format(new Date());
}
