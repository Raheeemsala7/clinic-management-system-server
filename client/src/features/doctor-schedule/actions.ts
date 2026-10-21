'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/i18n/messages/ar';

export interface DoctorScheduleShift {
  startTime: string; // "08:00"
  endTime: string;   // "12:00"
}

export interface DoctorDaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  isAvailable: boolean;
  shifts: DoctorScheduleShift[];
}

export interface DoctorScheduleData {
  doctorId: string;
  slotDurationMinutes: number;
  weeklySchedule: DoctorDaySchedule[];
}

export interface AvailableSlotItem {
  startTime: string;
  endTime: string;
  shiftIndex: number;
  isBooked: boolean;
  isPast: boolean;
  isAvailable: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isWorkingDay: boolean;
  isPast: boolean;
  message?: string;
  slotDurationMinutes: number;
  shifts: DoctorScheduleShift[];
  slots: AvailableSlotItem[];
  availableCount: number;
  bookedCount: number;
}

export async function getDoctorScheduleAction(doctorId: string): Promise<DoctorScheduleData | null> {
  await requireRole(['DOCTOR', 'ADMIN', 'RECEPTION']);
  try {
    return await api.get<DoctorScheduleData>(`/doctor-schedule/${doctorId}`);
  } catch {
    return null;
  }
}

export async function updateDoctorScheduleAction(
  doctorId: string,
  data: { slotDurationMinutes: number; weeklySchedule: DoctorDaySchedule[] },
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['DOCTOR', 'ADMIN']);
  try {
    await api.put(`/doctor-schedule/${doctorId}`, data);
    revalidatePath('/doctor/schedule');
    revalidatePath('/doctor/appointments');
    revalidatePath('/reception/appointments');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function getDoctorAvailableSlotsAction(
  doctorId: string,
  date: string,
): Promise<AvailableSlotsResponse | null> {
  await requireRole(['RECEPTION', 'DOCTOR', 'ADMIN']);
  if (!doctorId || !date) return null;
  try {
    return await api.get<AvailableSlotsResponse>(`/doctor-schedule/${doctorId}/available-slots?date=${encodeURIComponent(date)}`);
  } catch {
    return null;
  }
}
