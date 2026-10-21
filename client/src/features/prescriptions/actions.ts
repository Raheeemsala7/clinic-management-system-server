'use server';

import { revalidatePath } from 'next/cache';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/i18n/messages/ar';

export interface PrescriptionItemInput {
  drugName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sortOrder?: number;
}

export interface CreatePrescriptionInput {
  notes?: string;
  items: PrescriptionItemInput[];
}

export interface PrescriptionActionResult {
  success: boolean;
  prescriptionId?: string;
  error?: string;
  data?: unknown;
}

export async function createPrescriptionAction(
  visitId: string,
  input: CreatePrescriptionInput,
): Promise<PrescriptionActionResult> {
  await requireRole(['DOCTOR', 'ADMIN']);

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'يجب إضافة دواء واحد على الأقل في الروشتة' };
  }

  try {
    const res = await api.post<{ id: string }>(`/visits/${visitId}/prescriptions`, input);
    revalidatePath(`/doctor/visits/${visitId}`);
    revalidatePath('/doctor');
    return { success: true, prescriptionId: res.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function searchDrugsAction(query: string): Promise<Array<{ id: string; name: string }>> {
  await requireRole(['DOCTOR', 'ADMIN']);
  try {
    const res = await api.get<Array<{ id: string; name: string }>>(`/drugs?q=${encodeURIComponent(query)}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function markPrescriptionPrintedAction(prescriptionId: string): Promise<PrescriptionActionResult> {
  await requireRole(['DOCTOR', 'ADMIN']);
  try {
    await api.post(`/prescriptions/${prescriptionId}/mark-printed`);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
