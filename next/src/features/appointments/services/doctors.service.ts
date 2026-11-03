import { signOut } from 'next-auth/react';
import { DoctorOption, AvailableSlotsResponse } from '../types/booking';

/**
 * تحويل صيغة الوقت بنظام 24 ساعة (مثال: 16:30) إلى الصيغة العربية بنظام 12 ساعة (04:30 م)
 */
export function formatSlotTimeToArabic(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || '00';
  if (isNaN(hours)) return timeStr;
  const isPm = hours >= 12;
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${displayHours}:${minutes} ${isPm ? 'م' : 'ص'}`;
}

/**
 * تحويل صيغة الوقت بنظام 12 ساعة العربي أو الإنجليزي (مثل: 04:30 م) إلى نظام 24 ساعة الموحد (16:30)
 * لضمان توافقه الكامل مع متطلبات الخادم وقاعدة البيانات
 */
export function to24HourTime(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmed)) {
    return trimmed;
  }
  const isPm = trimmed.includes('م') || trimmed.toLowerCase().includes('pm');
  const isAm = trimmed.includes('ص') || trimmed.toLowerCase().includes('am');
  const digitsOnly = trimmed.replace(/[^\d:]/g, '');
  const [hStr, mStr] = digitsOnly.split(':');
  let h = parseInt(hStr, 10);
  const m = (mStr || '00').padStart(2, '0');
  if (isNaN(h)) return trimmed;
  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${m}`;
}

/**
 * الحصول على الوقت الحالي الفعلي بنظام 24 ساعة (مثال: 14:35)
 */
export function getCurrentTime24(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * الحصول على الوقت الحالي الفعلي بالصيغة العربية (مثال: 02:35 م)
 */
export function getCurrentTimeArabic(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const isPm = hours >= 12;
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  return `${displayHours}:${minutes} ${isPm ? 'م' : 'ص'}`;
}

/**
 * جلب قائمة الأطباء النشطين مع التحقق من صلاحية التوكين
 */
export async function getDoctorsList(signal?: AbortSignal): Promise<DoctorOption[]> {
  const response = await fetch('/api/doctors', {
    method: 'GET',
    signal,
  });

  // فحص انتهاء الجلسة عبر كود 401
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }

  const data: ApiResponse<DoctorOption[]> = await response.json();

  if (
    data.code === 401 ||
    data.message === 'Invalid or expired access token' ||
    data.message === 'No token provided.' ||
    data.message === 'Unauthorized'
  ) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch doctors');
  }

  return Array.isArray(data.payload) ? data.payload : [];
}

/**
 * جلب المواعيد المتاحة لدكتور وتاريخ معين
 */
export async function getDoctorAvailableSlots(
  doctorId: string,
  date: string,
  signal?: AbortSignal
): Promise<AvailableSlotsResponse | null> {
  if (!doctorId || !date) return null;

  const response = await fetch(
    `/api/doctors/${encodeURIComponent(doctorId)}/slots?date=${encodeURIComponent(date)}`,
    {
      method: 'GET',
      signal,
    }
  );

  // فحص انتهاء الجلسة عبر كود 401
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch doctor slots');
  }

  const data: ApiResponse<AvailableSlotsResponse> = await response.json();

  if (
    data.code === 401 ||
    data.message === 'Invalid or expired access token' ||
    data.message === 'No token provided.' ||
    data.message === 'Unauthorized'
  ) {
    if (typeof window !== 'undefined') {
      await signOut({ callbackUrl: '/auth/login?expired=true' });
    }
    throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
  }

  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch doctor slots');
  }

  const payload = data.payload;
  if (!payload) return null;

  // إرفاق التسمية العربية formatted label لكل slot
  const formattedSlots = (payload.slots || []).map((slot) => ({
    ...slot,
    label: formatSlotTimeToArabic(slot.startTime),
  }));

  return {
    ...payload,
    slots: formattedSlots,
  };
}
