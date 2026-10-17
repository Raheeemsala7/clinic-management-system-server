'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(128),
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل').max(64),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل').max(128),
  role: z.enum(['ADMIN', 'DOCTOR', 'RECEPTION']),
});

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

  const parsed = createUserSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    password: formData.get('password'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    const firstErr = parsed.error.issues[0]?.message ?? ar.errors.VALIDATION_FAILED;
    return { success: false, error: firstErr };
  }

  try {
    const user = await api.post<{ id: string }>('/users', parsed.data);
    revalidatePath('/admin/users');
    return { success: true, userId: user.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function deactivateUserAction(userId: string): Promise<UserActionResult> {
  await requireRole(['ADMIN']);

  try {
    await api.post(`/users/${userId}/deactivate`);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function resetPasswordAction(userId: string, newPassword: string): Promise<UserActionResult> {
  await requireRole(['ADMIN']);

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
  }

  try {
    await api.post(`/users/${userId}/reset-password`, { newPassword });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
