'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

export interface PaymentActionResult {
  success: boolean;
  error?: string;
}

export async function createPaymentAction(
  _prev: PaymentActionResult,
  formData: FormData,
): Promise<PaymentActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);
  const { t, locale } = await getServerI18n();

  const createPaymentSchema = z.object({
    appointmentId: z.string().uuid(),
    amount: z.coerce.number().min(0),
    method: z.enum(['CASH', 'CARD', 'WALLET']),
    kind: z.enum(['CONSULTATION', 'FOLLOW_UP', 'OTHER']),
  });

  const parsed = createPaymentSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    amount: formData.get('amount'),
    method: formData.get('method'),
    kind: formData.get('kind'),
  });

  if (!parsed.success) return { success: false, error: t.errors.VALIDATION_FAILED };

  try {
    const { appointmentId, ...rest } = parsed.data;
    await api.post(`/appointments/${appointmentId}/payments`, rest);
    revalidatePath('/reception/payments');
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function voidPaymentAction(
  _prev: PaymentActionResult,
  formData: FormData,
): Promise<PaymentActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  const voidPaymentSchema = z.object({
    paymentId: z.string().uuid(),
    reason: z
      .string()
      .min(1, isAr ? 'سبب الإلغاء مطلوب' : 'Cancellation reason is required'),
  });

  const parsed = voidPaymentSchema.safeParse({
    paymentId: formData.get('paymentId'),
    reason: formData.get('reason'),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? t.errors.VALIDATION_FAILED;
    return { success: false, error: msg };
  }

  try {
    await api.post(`/payments/${parsed.data.paymentId}/void`, { reason: parsed.data.reason });
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}
