'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

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
  requireRole(allowedRoles);
  try {
    await api.post(`/appointments/${appointmentId}/${action}`);
    revalidatePath('/reception');
    revalidatePath('/doctor');
    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.arabicMessage };
    }
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function arriveAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'arrive', ['ADMIN', 'RECEPTION']);
}

export async function startAction(appointmentId: string) {
  return transitionAppointment(appointmentId, 'start', ['ADMIN', 'RECEPTION']);
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
  requireRole(['DOCTOR']);
  try {
    await api.put('/doctor-status', { status });
    revalidatePath('/doctor');
    revalidatePath('/reception');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
