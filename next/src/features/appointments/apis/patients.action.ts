'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { PatientBasic } from '../types/booking';
import { HEADERS } from '@/shared/constant/api.constant';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { RESPONSES } from '@/shared/constant/api.responses';

/**
 * البحث الفعلي عن المرضى عبر خادم Express ومونجو دي بي
 */
export async function searchPatientsAction(query: string) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const token = await getNextAuthToken();

    if (!token?.accessToken) {
      return RESPONSES.unauthorized;
    }

    const res = await fetch(
      `${process.env.API_URL}/patients?q=${encodeURIComponent(query.trim())}&pageSize=10`,
      {
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token?.accessToken),
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.warn('Patient search HTTP status:', res.status);
      return [];
    }

    const data: ApiResponse<PatientBasic[]> = await res.json();

    if (!data.status) {
      return [];
    }

    const rawList = Array.isArray(data.payload)
      ? data.payload
      : Array.isArray((data as any).data)
      ? (data as any).data
      : [];

    return rawList.map((item: any) => ({
      id: String(item._id || item.id),
      fullName: item.fullName || item.name || '',
      name: item.fullName || item.name || '',
      phone: item.phone || '',
      age: item.age,
      gender: item.gender,
      chronicConditions: Array.isArray(item.chronicConditions) ? item.chronicConditions : [],
      lastVisit: item.lastVisit
        ? new Date(item.lastVisit).toLocaleDateString('ar-EG')
        : item.updatedAt
        ? new Date(item.updatedAt).toLocaleDateString('ar-EG')
        : undefined,
      totalVisits: item.totalVisits ?? 0,
    }));
  } catch (err) {
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
    const token = (session as any)?.accessToken;

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const payloadBody: Record<string, any> = {
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

    const json = await res.json();
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

    const p = json.payload;
    return {
      success: true,
      patient: {
        id: String(p._id || p.id),
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
  } catch (err: any) {
    console.error('Error in createQuickPatientAction:', err);
    return {
      success: false,
      error: err.message || 'حدث خطأ في الاتصال بالخادم',
    };
  }
}
