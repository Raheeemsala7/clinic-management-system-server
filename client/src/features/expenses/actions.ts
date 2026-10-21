'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

export interface ExpenseActionResult {
  success: boolean;
  error?: string;
}

export async function createExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);
  const { t, locale, isAr } = await getServerI18n();

  const createExpenseSchema = z.object({
    categoryId: z.string().uuid(isAr ? 'الفئة مطلوبة' : 'Category is required'),
    amount: z.coerce.number().min(0, isAr ? 'المبلغ يجب أن يكون موجباً' : 'Amount must be positive'),
    description: z.string().min(1, isAr ? 'الوصف مطلوب' : 'Description is required'),
    spentAt: z.string().min(1, isAr ? 'التاريخ مطلوب' : 'Date is required'),
  });

  const parsed = createExpenseSchema.safeParse({
    categoryId: formData.get('categoryId'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    spentAt: formData.get('spentAt'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message;
    return { success: false, error: firstError ?? t.errors.VALIDATION_FAILED };
  }

  try {
    await api.post('/expenses', parsed.data);
    revalidatePath('/reception/expenses');
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function approveExpenseAction(expenseId: string): Promise<ExpenseActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale } = await getServerI18n();
  try {
    await api.post(`/expenses/${expenseId}/approve`);
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function rejectExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  const reviewExpenseSchema = z.object({
    expenseId: z.string().uuid(),
    reason: z.string().optional(),
  });

  const parsed = reviewExpenseSchema.safeParse({
    expenseId: formData.get('expenseId'),
    reason: formData.get('reason'),
  });

  if (!parsed.success) return { success: false, error: t.errors.VALIDATION_FAILED };

  try {
    await api.post(`/expenses/${parsed.data.expenseId}/reject`, {
      reason: parsed.data.reason ?? (isAr ? 'لم يُحدد' : 'Unspecified'),
    });
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function rejectExpenseDirectAction(
  expenseId: string,
  reason?: string,
): Promise<ExpenseActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();
  try {
    await api.post(`/expenses/${expenseId}/reject`, {
      reason: reason || (isAr ? 'تم الرفض بواسطة الإدارة' : 'Rejected by administration'),
    });
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}
