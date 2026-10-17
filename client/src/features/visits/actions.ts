'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

const autosaveSchema = z.object({
  visitId: z.string().uuid(),
  version: z.coerce.number().int().min(1),
  complaint: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  instructions: z.string().optional(),
  followUpDate: z.string().optional(),
});

export interface VisitActionResult {
  success: boolean;
  newVersion?: number;
  error?: string;
  code?: string;
}

export async function autosaveVisitAction(
  _prev: VisitActionResult,
  formData: FormData,
): Promise<VisitActionResult> {
  requireRole(['ADMIN', 'DOCTOR']);

  const parsed = autosaveSchema.safeParse({
    visitId: formData.get('visitId'),
    version: formData.get('version'),
    complaint: formData.get('complaint') || undefined,
    diagnosis: formData.get('diagnosis') || undefined,
    notes: formData.get('notes') || undefined,
    instructions: formData.get('instructions') || undefined,
    followUpDate: formData.get('followUpDate') || undefined,
  });

  if (!parsed.success) return { success: false, error: ar.errors.VALIDATION_FAILED };

  try {
    const { visitId, ...data } = parsed.data;
    const result = await api.patch<{ version: number }>(`/visits/${visitId}`, data);
    revalidatePath('/doctor');
    return { success: true, newVersion: result.version };
  } catch (err) {
    if (err instanceof ApiError) {
      return { success: false, error: err.arabicMessage, code: err.code };
    }
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function completeVisitAction(visitId: string): Promise<VisitActionResult> {
  requireRole(['ADMIN', 'DOCTOR', 'RECEPTION']);
  try {
    await api.post(`/appointments/${visitId}/complete`); // uses appointmentId
    revalidatePath('/doctor');
    revalidatePath('/reception');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage, code: err.code };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
