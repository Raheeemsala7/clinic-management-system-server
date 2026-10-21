'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { getServerI18n } from '@/i18n/server';

const appointmentTypeEnum = z.enum([
  'EXAMINATION',
  'FOLLOW_UP',
  'POST_OPERATIVE',
  'LAB_TESTS_IMAGING',
  'TEST_RESULTS_REVIEW',
  'CONSULTATION',
]);

const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string(),
  uploadedAt: z.union([z.string(), z.date()]).optional(),
});

const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  source: z.enum(['SCHEDULED', 'WALK_IN']),
  type: appointmentTypeEnum,
  clinicDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  scheduledAt: z.string().optional(),
  totalAmount: z.coerce.number().min(0).default(0),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'WALLET']).default('CASH'),
  isExempt: z.boolean().default(false),
  exemptionReason: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export interface AppointmentActionResult {
  success: boolean;
  appointmentId?: string;
  error?: string;
}

export async function uploadBookingAttachmentsAction(
  files: Array<{ name: string; data: string }>,
): Promise<{ success: boolean; attachments?: any[]; error?: string }> {
  await requireRole(['ADMIN', 'RECEPTION', 'DOCTOR']);
  const { locale, isAr } = await getServerI18n();
  try {
    const res = await api.post<{ attachments: any[] }>('/attachments/upload', { files });
    return { success: true, attachments: res.attachments };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return {
      success: false,
      error: isAr ? 'فشل رفع المرفقات' : 'Failed to upload attachments',
    };
  }
}

export async function createAppointmentAction(
  _prev: AppointmentActionResult,
  formData: FormData,
): Promise<AppointmentActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);
  const { t, locale } = await getServerI18n();

  const isExempt = formData.get('isExempt') === 'true' || formData.get('isExempt') === 'on';

  let parsedAttachments: any[] | undefined = undefined;
  const rawAttachments = formData.get('attachments');
  if (typeof rawAttachments === 'string' && rawAttachments.trim()) {
    try {
      parsedAttachments = JSON.parse(rawAttachments);
    } catch {
      // ignore JSON parse error
    }
  }

  const parsed = createAppointmentSchema.safeParse({
    patientId: formData.get('patientId'),
    doctorId: formData.get('doctorId'),
    source: formData.get('source'),
    type: formData.get('type'),
    clinicDate: formData.get('clinicDate') || undefined,
    startTime: formData.get('startTime') || undefined,
    endTime: formData.get('endTime') || undefined,
    scheduledAt: formData.get('scheduledAt') || undefined,
    totalAmount: formData.get('totalAmount') || 0,
    paidAmount: formData.get('paidAmount') || 0,
    paymentMethod: formData.get('paymentMethod') || 'CASH',
    isExempt,
    exemptionReason: formData.get('exemptionReason') || undefined,
    notes: formData.get('notes') || undefined,
    attachments: parsedAttachments,
  });

  if (!parsed.success) {
    return { success: false, error: t.errors.VALIDATION_FAILED };
  }

  try {
    const appointment = await api.post<{ id: string }>('/appointments', parsed.data);
    revalidatePath('/reception');
    revalidatePath('/reception/appointments');
    revalidatePath('/reception/payments');
    revalidatePath('/doctor/appointments');
    revalidatePath('/admin');
    revalidatePath('/admin/appointments');
    revalidatePath('/admin/payments');
    return { success: true, appointmentId: appointment.id };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return { success: false, error: t.errors.INTERNAL_SERVER_ERROR };
  }
}

export async function updateAppointmentAction(
  appointmentId: string,
  data: {
    type?: string;
    clinicDate?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    attachments?: any[];
    totalAmount?: number;
    paidAmount?: number;
    isExempt?: boolean;
    exemptionReason?: string;
  },
): Promise<AppointmentActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);
  const { locale, isAr } = await getServerI18n();

  try {
    await api.put(`/appointments/${appointmentId}`, data);
    revalidatePath('/reception');
    revalidatePath('/reception/appointments');
    revalidatePath('/reception/payments');
    revalidatePath('/doctor/appointments');
    revalidatePath('/admin');
    revalidatePath('/admin/appointments');
    return { success: true, appointmentId };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return {
      success: false,
      error: isAr ? 'فشل تحديث بيانات الحجز' : 'Failed to update appointment data',
    };
  }
}

export async function payRemainingAction(
  appointmentId: string,
  amount: number,
  method: 'CASH' | 'CARD' | 'WALLET' = 'CASH',
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'RECEPTION']);
  const { locale, isAr } = await getServerI18n();

  try {
    await api.post(`/appointments/${appointmentId}/pay-remaining`, {
      amount,
      method,
      notes,
    });
    revalidatePath('/reception');
    revalidatePath('/reception/payments');
    revalidatePath('/reception/appointments');
    revalidatePath('/admin/appointments');
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.getLocalizedMessage(locale) };
    return {
      success: false,
      error: isAr ? 'فشل تسجيل سداد المبلغ المتبقي' : 'Failed to record remaining payment',
    };
  }
}
