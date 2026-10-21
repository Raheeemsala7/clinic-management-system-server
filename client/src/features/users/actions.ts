'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

export interface UserActionResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function createUserAction(
  _prev: UserActionResult,
  formData: FormData,
): Promise<UserActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  const createUserSchema = z.object({
    name: z
      .string()
      .min(2, isAr ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters')
      .max(128),
    username: z
      .string()
      .min(3, isAr ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters')
      .max(64),
    password: z
      .string()
      .min(8, isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters')
      .max(128),
    role: z.enum(['ADMIN', 'DOCTOR', 'RECEPTION']),
  });

  const parsed = createUserSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    const firstErr = parsed.error.issues[0]?.message ?? t.errors.VALIDATION_FAILED;
    return { success: false, error: firstErr };
  }

  try {
    const user = await api.post<{ id: string }>('/users', parsed.data);
    revalidatePath('/admin/users');
    return { success: true, userId: user.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function deactivateUserAction(userId: string): Promise<UserActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale } = await getServerI18n();

  try {
    await api.post(`/users/${userId}/deactivate`);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function resetPasswordAction(userId: string, newPassword: string): Promise<UserActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();

  if (!newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: isAr
        ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
        : 'Password must be at least 8 characters',
    };
  }

  try {
    await api.post(`/users/${userId}/reset-password`, { newPassword });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}
