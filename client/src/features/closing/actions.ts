'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

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
  const { t, locale, isAr } = await getServerI18n();

  const closingSchema = z.object({
    actualCash: z.coerce
      .number()
      .min(0, isAr ? 'المبلغ يجب أن يكون موجباً' : 'Amount must be positive'),
    notes: z.string().optional(),
  });

  const parsed = closingSchema.safeParse({
    actualCash: formData.get('actualCash'),
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? t.errors.VALIDATION_FAILED;
    return { success: false, error: msg };
  }

  try {
    const result = await api.post<{ expectedCash: string; actualCash: string; difference: string }>(
      '/closing',
      parsed.data,
    );
    revalidatePath('/reception/closing');
    revalidatePath('/admin/closing');
    return { success: true, data: result };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function reopenClosingAction(closingId: string): Promise<ClosingActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale } = await getServerI18n();
  try {
    await api.post(`/closing/${closingId}/reopen`);
    revalidatePath('/admin/closing');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}
