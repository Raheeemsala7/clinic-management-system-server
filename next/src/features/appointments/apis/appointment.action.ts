'use server';

import { updateTag, revalidateTag, revalidatePath } from 'next/cache';
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";
import { AppointmentPayload, CreateAppointmentPayload } from "../types/booking";
import { RESPONSES } from "@/shared/constant/api.responses";
import { HEADERS } from "@/shared/constant/api.constant";

/**
 * دالة مساعدة لتحديث الكاش وإعادة التحقق منه بعد أي تعديل على المواعيد
 */
export async function revalidateAppointmentsCache() {
  try {
    updateTag('today-queue');
    updateTag('appointments');
    updateTag('appointments-calendar');
    updateTag('slots');
  } catch {}
  try {
    revalidateTag('today-queue', { expire: 0 });
    revalidateTag('appointments', { expire: 0 });
    revalidateTag('appointments-calendar', { expire: 0 });
    revalidateTag('slots', { expire: 0 });
  } catch {}
  try {
    revalidatePath('/dashboard', 'page');
    revalidatePath('/dashboard/appointments', 'page');
    revalidatePath('/dashboard/calendar', 'page');
  } catch {}
}

export async function createQuickPatientAction(payload: CreateAppointmentPayload): Promise<ApiResponse<AppointmentPayload>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/appointments`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<AppointmentPayload> = await res.json();

    if (!data.status) {
      return {
        status: false,
        code: data.code || res.status,
        message: data.message || 'فشل تسجيل الموعد',
      };
    }

    await revalidateAppointmentsCache();
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل تسجيل الموعد' };
  }
}

/**
 * إدخال المريض لغرفة الكشف (تحويل الحالة إلى IN_PROGRESS)
 * المسار: POST /api/v1/appointments/:id/start
 */
export async function admitAppointmentAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${id}/start`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });
    const data = await res.json();
    if (data.status) {
      await revalidateAppointmentsCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل إدخال المريض للطبيب' };
  }
}

/**
 * إنهاء الكشف من جانب الطبيب (تحويل الحالة إلى PENDING_CHECKOUT)
 * المسار: POST /api/v1/appointments/:id/finish-exam
 */
export async function finishExamAppointmentAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${id}/finish-exam`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });
    const data = await res.json();
    if (data.status) {
      await revalidateAppointmentsCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل إنهاء الكشف الطبي' };
  }
}

/**
 * إنهاء الزيارة وتسوية الحساب من جانب الاستقبال (تحويل الحالة إلى COMPLETED)
 * المسار: POST /api/v1/appointments/:id/checkout
 */
export async function checkoutAppointmentAction(
  id: string,
  payload: { method?: 'CASH' | 'CARD' | 'WALLET'; amount?: number; notes?: string } = {},
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${id}/checkout`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.status) {
      await revalidateAppointmentsCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل إنهاء الزيارة وتسوية الحساب' };
  }
}

/**
 * تأجيل دور المريض في صالة الانتظار
 * المسار: POST /api/v1/appointments/:id/postpone
 */
export async function postponeAppointmentAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${id}/postpone`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });
    const data = await res.json();
    if (data.status) {
      await revalidateAppointmentsCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل تأجيل الموعد' };
  }
}

/**
 * إلغاء الموعد
 * المسار: POST /api/v1/appointments/:id/cancel
 */
export async function cancelAppointmentAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });
    const data = await res.json();
    if (data.status) {
      await revalidateAppointmentsCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل إلغاء الموعد' };
  }
}
