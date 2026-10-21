'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api/client';
import { requireRole } from '@/lib/session';
import { ar } from '@/i18n/messages/ar';

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
  patientId: z.string().min(1, 'معرف المريض مطلوب'),
  doctorId: z.string().min(1, 'معرف الطبيب مطلوب'),
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
  try {
    const res = await api.post<{ attachments: any[] }>('/attachments/upload', { files });
    return { success: true, attachments: res.attachments };
  } catch (err) {
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: 'فشل رفع المرفقات' };
  }
}

export async function createAppointmentAction(
  _prev: AppointmentActionResult,
  formData: FormData,
): Promise<AppointmentActionResult> {
  await requireRole(['ADMIN', 'RECEPTION']);

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
    return { success: false, error: ar.errors.VALIDATION_FAILED };
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
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: ar.errors.INTERNAL_SERVER_ERROR };
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
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: 'فشل تحديث بيانات الحجز' };
  }
}

export async function payRemainingAction(
  appointmentId: string,
  amount: number,
  method: 'CASH' | 'CARD' | 'WALLET' = 'CASH',
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  await requireRole(['ADMIN', 'RECEPTION']);

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
    if (err instanceof ApiError) return { success: false, error: err.arabicMessage };
    return { success: false, error: 'فشل تسجيل سداد المبلغ المتبقي' };
  }
}
