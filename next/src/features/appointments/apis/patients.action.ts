'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { PatientBasic } from '../types/booking';
import { HEADERS } from '@/shared/constant/api.constant';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { RESPONSES } from '@/shared/constant/api.responses';

interface ApiPatientItem {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  age?: number;
  gender?: 'MALE' | 'FEMALE';
  chronicConditions?: string[];
  lastVisit?: string;
  updatedAt?: string;
  totalVisits?: number;
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
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return {
        status: false,
        code: res.status,
        message: errData?.message || 'حدث خطأ في الخادم',
      };
    }

    const data: ApiResponse<ApiPatientItem[]> = await res.json();

    // 2. لو الـ status بـ false قادمة من الـ API
    if (!data.status) {
      return {
        status: false,
        code: data.code || 400,
        message: data.message || 'فشلت عملية البحث',
      };
    }

    if (data.code === 401 || data.message === "Invalid or expired access token") {
      return {
        status: false,
        code: data.code,
        message: data.message || 'فشلت عملية البحث',
      };
    }

    return data
  } catch (err: unknown) {
    console.error('Error in searchPatientsAction:', err);
    return [];
  }
}

/**
 * تسجيل مريض جديد سريع عبر السيرفر مع دعم الأمراض المزمنة chronicConditions
 */
export async function createQuickPatientAction(data: {
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age?: number;
  chronicConditions?: string[];
}): Promise<{ success: boolean; patient?: PatientBasic; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const token = (session as { accessToken?: string } | null)?.accessToken;

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const payloadBody: Record<string, unknown> = {
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      gender: data.gender || 'MALE',
      chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : [],
    };
    if (data.age !== undefined && data.age !== null) {
      payloadBody.age = Number(data.age);
    }

    const res = await fetch(`${apiUrl}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payloadBody),
    });

    const json = (await res.json()) as {
      status?: boolean;
      errors?: Array<{ message?: string }>;
      message?: string;
      payload?: ApiPatientItem;
    };

    if (!res.ok || !json.status) {
      const errMsg =
        json.errors?.[0]?.message ||
        json.message ||
        'فشل تسجيل المريض، يرجى التأكد من كتابة الاسم رباعياً وتدقيق البيانات';
      return {
        success: false,
        error: errMsg,
      };
    }

    const p = json.payload || {};
    return {
      success: true,
      patient: {
        id: String(p._id || p.id || ''),
        fullName: p.fullName || data.fullName,
        name: p.fullName || data.fullName,
        phone: p.phone || data.phone,
        age: p.age !== undefined ? p.age : data.age,
        gender: p.gender || data.gender,
        chronicConditions: Array.isArray(p.chronicConditions)
          ? p.chronicConditions
          : (data.chronicConditions || []),
        totalVisits: 0,
      },
    };
  } catch (err: unknown) {
    console.error('Error in createQuickPatientAction:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'حدث خطأ في الاتصال بالخادم',
    };
  }
}
