'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ── Appointment transitions ───────────────────────────────────────────────────

async function transitionAppointment(
  appointmentId: string,
  action: string,
  allowedRoles: ('ADMIN' | 'DOCTOR' | 'RECEPTION')[],
): Promise<ActionResult> {
  await requireRole(allowedRoles);
  const { t, locale } = await getServerI18n();
  try {
    await api.post(`/appointments/${appointmentId}/${action}`);
    revalidatePath('/reception');
    revalidatePath('/doctor');
    revalidatePath('/admin');
    revalidatePath('/admin/appointments');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.getLocalizedMessage(locale) };
    }
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function arriveAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'arrive', ['ADMIN', 'RECEPTION']);
}

export async function startAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'start', ['ADMIN', 'DOCTOR', 'RECEPTION']);
}

export async function completeAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'complete', ['ADMIN', 'DOCTOR', 'RECEPTION']);
}

export async function cancelAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'cancel', ['ADMIN', 'RECEPTION']);
}

export async function noShowAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'no-show', ['ADMIN', 'RECEPTION']);
}

export async function postponeAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'postpone', ['ADMIN', 'RECEPTION']);
}

// ── Doctor status ─────────────────────────────────────────────────────────────

export async function setDoctorStatusAction(status: 'AVAILABLE' | 'BREAK'): Promise<ActionResult> {
  await requireRole(['DOCTOR']);
  const { t, locale } = await getServerI18n();
  try {
    await api.put('/doctor-status', { status });
    revalidatePath('/doctor');
    revalidatePath('/reception');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}
