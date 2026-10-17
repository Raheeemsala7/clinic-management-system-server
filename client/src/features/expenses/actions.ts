'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

const createExpenseSchema = z.object({
  categoryId: z.string().uuid('الفئة مطلوبة'),
  amount: z.coerce.number().min(0, 'المبلغ يجب أن يكون موجباً'),
  description: z.string().min(1, 'الوصف مطلوب'),
  spentAt: z.string().min(1, 'التاريخ مطلوب'),
});

const reviewExpenseSchema = z.object({
  expenseId: z.string().uuid(),
  reason: z.string().optional(),
});

export interface ExpenseActionResult {
  success: boolean;
  error?: string;
}

export async function createExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  requireRole(['ADMIN', 'RECEPTION']);

  const parsed = createExpenseSchema.safeParse({
    categoryId: formData.get('categoryId'),
    amount: formData.get('amount'),
    description: formData.get('description'),
    spentAt: formData.get('spentAt'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message;
    return { success: false, error: firstError ?? ar.errors.VALIDATION_FAILED };
  }

  try {
    await api.post('/expenses', parsed.data);
    revalidatePath('/reception/expenses');
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function approveExpenseAction(expenseId: string): Promise<ExpenseActionResult> {
  requireRole(['ADMIN']);
  try {
    await api.post(`/expenses/${expenseId}/approve`);
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function rejectExpenseAction(
  _prev: ExpenseActionResult,
  formData: FormData,
): Promise<ExpenseActionResult> {
  requireRole(['ADMIN']);

  const parsed = reviewExpenseSchema.safeParse({
    expenseId: formData.get('expenseId'),
    reason: formData.get('reason'),
  });

  if (!parsed.success) return { success: false, error: ar.errors.VALIDATION_FAILED };

  try {
    await api.post(`/expenses/${parsed.data.expenseId}/reject`, {
      reason: parsed.data.reason ?? 'لم يُحدد',
    });
    revalidatePath('/admin/expenses');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
