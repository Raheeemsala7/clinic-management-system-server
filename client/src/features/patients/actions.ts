'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/messages/ar';

const createPatientSchema = z.object({
  fullName: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  gender: z.enum(['MALE', 'FEMALE']),
  age: z.coerce.number().min(0, 'العمر يجب أن يكون 0 أو أكبر').max(130, 'العمر غير صالح'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
});

export interface PatientActionResult {
  success: boolean;
  patientId?: string;
  error?: string;
}

export async function createPatientAction(
  _prev: PatientActionResult,
  formData: FormData,
): Promise<PatientActionResult> {
  await requireRole(['ADMIN', 'DOCTOR', 'RECEPTION']);

  const parsed = createPatientSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    gender: formData.get('gender'),
    age: formData.get('age'),
    dateOfBirth: formData.get('dateOfBirth') || undefined,
    address: formData.get('address') || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: ar.errors.VALIDATION_FAILED };
  }

  try {
    const patient = await api.post<{ id: string }>('/patients', parsed.data);
    revalidatePath('/reception/patients');
    revalidatePath('/admin/patients');
    return { success: true, patientId: patient.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function getPatientSummaryAction(patientId: string) {
  await requireRole(['ADMIN', 'DOCTOR']);
  try {
    return await api.get<import('./queries').PatientSummary>(`/patients/${patientId}/summary`);
  } catch {
    return null;
  }
}

export async function searchPatientsAction(query: string) {
  await requireRole(['ADMIN', 'DOCTOR', 'RECEPTION']);
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await api.get<{ data: import('./queries').PatientBasic[] }>(
      `/patients?q=${encodeURIComponent(query.trim())}&pageSize=10`,
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

export async function createQuickPatientAction(data: {
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  dateOfBirth?: string;
  address?: string;
}) {
  await requireRole(['ADMIN', 'DOCTOR', 'RECEPTION']);
  try {
    const patient = await api.post<import('./queries').PatientBasic>('/patients', data);
    revalidatePath('/reception/patients');
    revalidatePath('/admin/patients');
    return { success: true, patient };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
  }
}
