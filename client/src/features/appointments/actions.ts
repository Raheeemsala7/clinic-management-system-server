'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

const createAppointmentSchema = z.object({
  patientId: z.string().uuid('معرف المريض غير صالح'),
  doctorId: z.string().uuid('معرف الطبيب غير صالح'),
  source: z.enum(['SCHEDULED', 'WALK_IN']),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP']),
  scheduledAt: z.string().optional(),
});

export interface AppointmentActionResult {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

export async function createAppointmentAction(
  _prev: AppointmentActionResult,
  formData: FormData,
): Promise<AppointmentActionResult> {
  requireRole(['ADMIN', 'RECEPTION']);

  const parsed = createAppointmentSchema.safeParse({
    patientId: formData.get('patientId'),
    doctorId: formData.get('doctorId'),
    source: formData.get('source'),
    type: formData.get('type'),
    scheduledAt: formData.get('scheduledAt') || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: ar.errors.VALIDATION_FAILED };
  }

  try {
    const appointment = await api.post<{ id: string }>('/appointments', parsed.data);
    revalidatePath('/reception');
    revalidatePath('/admin');
    return { success: true, appointmentId: appointment.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
