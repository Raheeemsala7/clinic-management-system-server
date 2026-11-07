'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { HEADERS } from '@/shared/constant/api.constant';
import { RESPONSES } from '@/shared/constant/api.responses';
import { revalidateAppointmentsCache } from '@/features/appointments/apis/appointment.action';
import { EntExaminationData } from '../types/ent-examination.types';

export interface AppointmentExaminationPayload {
  appointment: any;
  patient: any;
  doctor: any;
  visit: any;
}

/**
 * جلب بيانات الموعد والمريض والزيارة السابقة إن وجدت لبدء الكشف
 */
export async function getAppointmentExaminationAction(
  appointmentId: string
): Promise<ApiResponse<AppointmentExaminationPayload>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${appointmentId}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getAppointmentExaminationAction error:', error);
    return { status: false, code: 500, message: 'فشل تحميل بيانات الكشف' };
  }
}

/**
 * حفظ بيانات كشف الأنف والأذن والحنجرة بالكامل مع الروشتة
 */
export async function saveAppointmentExaminationAction(
  appointmentId: string,
  visitId: string,
  version: number,
  examData: EntExaminationData
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    // 1. تحديث الزيارة ببيانات الكشف الكاملة (Auto-save)
    const patchRes = await fetch(`${process.env.API_URL}/visits/${visitId}`, {
      method: 'PATCH',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({
        version,
        complaint: examData.complaint,
        diagnosis: examData.diagnosis,
        notes: examData.treatmentNotes,
        instructions: examData.operationNeeded,
        followUpDate: examData.followUpDate,
        entExamination: examData,
      }),
    });

    const patchData = await patchRes.json();
    if (!patchData.status) {
      return patchData;
    }

    // 2. إذا كانت هناك أصناف روشتة، نحفظها أيضاً في نموذج Prescriptions
    if (examData.prescriptionItems && examData.prescriptionItems.length > 0) {
      await fetch(`${process.env.API_URL}/visits/${visitId}/prescriptions`, {
        method: 'POST',
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.accessToken),
        },
        body: JSON.stringify({
          notes: examData.treatmentNotes,
          items: examData.prescriptionItems.map((item, idx) => ({
            drugName: item.drugName,
            dose: item.dose,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
            sortOrder: idx,
          })),
        }),
      });
    }

    await revalidateAppointmentsCache();
    return {
      status: true,
      code: 200,
      message: 'تم حفظ بيانات الكشف والروشتة بنجاح',
      payload: patchData.payload || null,
    };
  } catch (error) {
    console.error('saveAppointmentExaminationAction error:', error);
    return { status: false, code: 500, message: 'فشل حفظ بيانات الكشف' };
  }
}

/**
 * إنهاء الكشف واعتماد الروشتة وتسليم المريض للاستقبال
 */
export async function finishAndSubmitExamAction(
  appointmentId: string,
  visitId: string,
  version: number,
  examData: EntExaminationData
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    // 1. حفظ البيانات أولاً
    const saveRes = await saveAppointmentExaminationAction(
      appointmentId,
      visitId,
      version,
      examData
    );
    if (!saveRes.status) return saveRes;

    // 2. إغلاق الزيارة
    await fetch(`${process.env.API_URL}/visits/${visitId}/close`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    // 3. تحويل حالة الموعد إلى finish-exam (ينتقل للاستقبال لتسوية الحساب)
    const finishRes = await fetch(
      `${process.env.API_URL}/appointments/${appointmentId}/finish-exam`,
      {
        method: 'POST',
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.accessToken),
        },
      }
    );

    const finishData = await finishRes.json();
    await revalidateAppointmentsCache();
    return finishData;
  } catch (error) {
    console.error('finishAndSubmitExamAction error:', error);
    return { status: false, code: 500, message: 'فشل اعتماد وإنهاء الكشف' };
  }
}
