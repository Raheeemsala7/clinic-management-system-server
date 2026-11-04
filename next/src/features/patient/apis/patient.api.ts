import { redirect } from 'next/navigation';
import { HEADERS } from '@/shared/constant/api.constant';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { Patient, PatientDetails, PatientsListResponse } from '../types/patient';
import { PatientBasic } from '@/features/appointments';

export interface GetPatientsParams {
  q?: string;
  page?: number | string;
  pageSize?: number | string;
  filter?: string;
}

/**
 * جلب قائمة المرضى للصفحة الرئيسية (Server Component) مع دعم الفلترة والبحث والترقيم
 */
export async function getPatientsListApi(
  params: GetPatientsParams = {},
): Promise<PatientsListResponse> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    redirect('/auth/login?expired=true');
  }

  const query = new URLSearchParams();
  if (params.q?.trim()) query.set('q', params.q.trim());
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.filter && params.filter !== 'all') query.set('filter', params.filter);

  try {
    const res = await fetch(`${process.env.API_URL}/patients?${query.toString()}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['patients'],
      },
      cache: 'no-store',
    });

    if (res.status === 401) {
      redirect('/auth/login?expired=true');
    }

    const data: PatientsListResponse = await res.json();

    if (
      data.code === 401 ||
      data.message === 'Invalid or expired access token' ||
      data.message === 'No token provided.'
    ) {
      redirect('/auth/login?expired=true');
    }

    if (!data.status) {
      throw new Error(data.message || 'فشل جلب قائمة المرضى');
    }

    return data;
  } catch (error) {
    // إذا كان الخطأ تحويلاً من Next.js (NEXT_REDIRECT) يجب إعادة رميه ليتم التحويل
    if (
      error instanceof Error &&
      (error.message.includes('NEXT_REDIRECT') || (error as any).digest?.startsWith('NEXT_REDIRECT'))
    ) {
      throw error;
    }
    console.error('Error fetching patients list:', error);
    throw new Error(
      error instanceof Error ? error.message : 'فشل الاتصال بالخادم لجلب المرضى',
    );
  }
}

/**
 * جلب تفاصيل ملف المريض الكاملة (الملف، الزيارات، الوضع المالي، المرفقات، الملاحظات)
 */
export async function getPatientDetailsApi(patientId: string): Promise<PatientDetails> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    redirect('/auth/login?expired=true');
  }

  try {
    const res = await fetch(`${process.env.API_URL}/patients/${patientId}/booking-summary`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: [`patient-${patientId}`, 'patients'],
      },
      cache: 'no-store',
    });

    if (res.status === 401) {
      redirect('/auth/login?expired=true');
    }

    const data = await res.json();

    if (
      data.code === 401 ||
      data.message === 'Invalid or expired access token' ||
      data.message === 'No token provided.'
    ) {
      redirect('/auth/login?expired=true');
    }

    if (!data.status || !data.payload) {
      throw new Error(data.message || 'تعذر العثور على ملف المريض المطلوب');
    }

    return data.payload as PatientDetails;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('NEXT_REDIRECT') || (error as any).digest?.startsWith('NEXT_REDIRECT'))
    ) {
      throw error;
    }
    console.error('Error fetching patient details:', error);
    throw new Error(
      error instanceof Error ? error.message : 'تعذر تحميل بيانات ملف المريض',
    );
  }
}

/**
 * البحث الفعلي عن المرضى عبر خادم Express ومونجو دي بي
 */
export async function searchPatientsAction(query: string, token?: string) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    if (!token) {
      return [];
    }

    const res = await fetch(
      `${process.env.API_URL}/patients?q=${encodeURIComponent(query.trim())}&pageSize=10`,
      {
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token),
        },
        cache: 'no-store',
      },
    );

    if (res.status === 401) {
      return {
        status: false,
        code: 401,
        message: 'انتهت صلاحية الجلسة',
      };
    }

    const data: ApiResponse<PatientBasic[]> = await res.json();
    return data;
  } catch (err: unknown) {
    console.error('Error in searchPatientsAction:', err);
    return [];
  }
}
