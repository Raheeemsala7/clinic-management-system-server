'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

export async function updateSettingsAction(data: Record<string, string>): Promise<SettingsActionResult> {
  await requireRole(['ADMIN']);
  const { t, locale } = await getServerI18n();
  try {
    await api.put('/settings', data);
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

