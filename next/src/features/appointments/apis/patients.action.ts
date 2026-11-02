'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { PatientBasic } from '../types/booking';






/**
 * تسجيل مريض جديد سريع عبر السيرفر مع دعم الأمراض المزمنة chronicConditions
 */
// export async function createQuickPatientAction(data: {
//   fullName: string;
//   phone: string;
//   gender: 'MALE' | 'FEMALE';
//   age?: number;
//   chronicConditions?: string[];
// }): Promise<{ success: boolean; patient?: PatientBasic; error?: string }> {
//   try {
//     const session = await getServerSession(authOptions);
//     const token = (session as { accessToken?: string } | null)?.accessToken;

//     const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';
//     const payloadBody: Record<string, unknown> = {
//       fullName: data.fullName.trim(),
//       phone: data.phone.trim(),
//       gender: data.gender || 'MALE',
//       chronicConditions: Array.isArray(data.chronicConditions) ? data.chronicConditions : [],
//     };
//     if (data.age !== undefined && data.age !== null) {
//       payloadBody.age = Number(data.age);
//     }

//     const res = await fetch(`${apiUrl}/patients`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: JSON.stringify(payloadBody),
//     });

//     const json = (await res.json()) as {
//       status?: boolean;
//       errors?: Array<{ message?: string }>;
//       message?: string;
//       // payload?: ApiPatientItem;
//     };

//     if (!res.ok || !json.status) {
//       const errMsg =
//         json.errors?.[0]?.message ||
//         json.message ||
//         'فشل تسجيل المريض، يرجى التأكد من كتابة الاسم رباعياً وتدقيق البيانات';
//       return {
//         success: false,
//         error: errMsg,
//       };
//     }

//     const p = json.payload || {};
//     return {
//       success: true,
//       patient: {
//         id: String(p._id || p.id || ''),
//         fullName: p.fullName || data.fullName,
//         name: p.fullName || data.fullName,
//         phone: p.phone || data.phone,
//         age: p.age !== undefined ? p.age : data.age,
//         gender: p.gender || data.gender,
//         chronicConditions: Array.isArray(p.chronicConditions)
//           ? p.chronicConditions
//           : (data.chronicConditions || []),
//         totalVisits: 0,
//       },
//     };
//   } catch (err: unknown) {
//     console.error('Error in createQuickPatientAction:', err);
//     return {
//       success: false,
//       error: err instanceof Error ? err.message : 'حدث خطأ في الاتصال بالخادم',
//     };
//   }
// }
