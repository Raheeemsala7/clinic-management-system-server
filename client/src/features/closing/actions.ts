'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/i18n/messages/ar';

const closingSchema = z.object({
  actualCash: z.coerce.number().min(0, 'المبلغ يجب أن يكون موجباً'),
  notes: z.string().optional(),
});

export interface ClosingActionResult {
  success: boolean;
  error?: string;
  data?: { expectedCash: string; actualCash: string; difference: string };
}

export async function submitClosingAction(
  _prev: ClosingActionResult,
  formData: FormData,
): Promise<ClosingActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);

  const parsed = closingSchema.safeParse({
    actualCash: formData.get('actualCash'),
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) return { success: false, error: ar.errors.VALIDATION_FAILED };

  try {
    const result = await api.post<{ expectedCash: string; actualCash: string; difference: string }>(
      '/closing',
      parsed.data,
    );
    revalidatePath('/reception/closing');
    revalidatePath('/admin/closing');
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function reopenClosingAction(closingId: string): Promise<ClosingActionResult> {
  await requireRole(['ADMIN']);
  try {
    await api.post(`/closing/${closingId}/reopen`);
    revalidatePath('/admin/closing');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
