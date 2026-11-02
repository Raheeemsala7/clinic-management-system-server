'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { PatientBasic } from '../types/booking';

/**
 * البحث الفعلي عن المرضى عبر خادم Express ومونجو دي بي
 */
export async function searchPatientsAction(query: string): Promise<PatientBasic[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const session = await getServerSession(authOptions);
    const token = (session as any)?.accessToken;

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(
      `${apiUrl}/patients?q=${encodeURIComponent(query.trim())}&pageSize=10`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.warn('Patient search HTTP status:', res.status);
      return [];
    }

    const json = await res.json();
    const rawList = Array.isArray(json.payload)
      ? json.payload
      : Array.isArray(json.data)
      ? json.data
      : [];

    return rawList.map((item: any) => ({
      id: String(item._id || item.id),
      name: item.fullName || item.name || '',
      phone: item.phone || '',
      age: item.age,
      gender: item.gender,
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
 * تسجيل مريض جديد سريع عبر السيرفر
 */
export async function createQuickPatientAction(data: {
  fullName: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE';
  age?: number;
}): Promise<{ success: boolean; patient?: PatientBasic; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const token = (session as any)?.accessToken;

    const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${apiUrl}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fullName: data.fullName,
        phone: data.phone || '01000000000',
        gender: data.gender || 'MALE',
        age: data.age || 30,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      return {
        success: false,
        error: json.message || 'فشل تسجيل المريض',
      };
    }

    const p = json.payload;
    return {
      success: true,
      patient: {
        id: String(p._id || p.id),
        name: p.fullName || data.fullName,
        phone: p.phone || data.phone,
        age: p.age,
        gender: p.gender,
        totalVisits: 0,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'حدث خطأ في الاتصال بالخادم',
    };
  }
}

