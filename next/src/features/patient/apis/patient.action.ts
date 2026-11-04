'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { Patient, PatientPayload } from '../types/patient';
import { RESPONSES } from '@/shared/constant/api.responses';
import { HEADERS } from '@/shared/constant/api.constant';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * تسجيل مريض جديد في النظام
 */
export async function createNewPatientAction({
  fullName,
  age,
  chronicConditions,
  gender,
  phone,
  dateOfBirth,
  address,
}: PatientPayload): Promise<ApiResponse<Patient>> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/patients`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ fullName, age, chronicConditions, gender, phone, dateOfBirth, address }),
    });

    const data: ApiResponse<Patient> = await res.json();

    if (!data.status) {
      return {
        status: false,
        code: data.code || res.status,
        message: data.message || 'فشل تسجيل المريض',
      };
    }

    revalidateTag('patients', 'max');
    revalidatePath('/dashboard/patients');

    return data;
  } catch (err) {
    console.error('Error creating patient:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل الاتصال بالخادم أثناء تسجيل المريض',
    };
  }
}

/**
 * تحديث بيانات مريض حالي
 */
export async function updatePatientAction(
  id: string,
  payload: Partial<PatientPayload>,
): Promise<ApiResponse<Patient>> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<Patient> = await res.json();

    if (!data.status) {
      return {
        status: false,
        code: data.code || res.status,
        message: data.message || 'فشل تحديث بيانات المريض',
      };
    }

    revalidateTag('patients', 'max');
    revalidateTag(`patient-${id}`, 'max');
    revalidatePath('/dashboard/patients');

    return data;
  } catch (err) {
    console.error('Error updating patient:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل الاتصال بالخادم أثناء تعديل بيانات المريض',
    };
  }
}

/**
 * حذف مريض نهائياً مع زياراته (Soft Delete)
 */
export async function deletePatientAction(id: string): Promise<ApiResponse<null>> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data = await res.json();

    if (!data.status) {
      return {
        status: false,
        code: data.code || res.status,
        message: data.message || 'فشل حذف المريض',
      };
    }

    revalidateTag('patients', 'max');
    revalidateTag(`patient-${id}`, 'max');
    revalidatePath('/dashboard/patients');

    return {
      status: true,
      code: 200,
      message: 'تم حذف المريض بنجاح',
      payload: null as any,
    };
  } catch (err) {
    console.error('Error deleting patient:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل الاتصال بالخادم أثناء حذف المريض',
    };
  }
}

/**
 * أرشفة ملف المريض بدلاً من الحذف
 */
export async function archivePatientAction(id: string): Promise<ApiResponse<null>> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/patients/${id}/archive`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data = await res.json();

    if (!data.status) {
      return {
        status: false,
        code: data.code || res.status,
        message: data.message || 'فشل أرشفة ملف المريض',
      };
    }

    revalidateTag('patients', 'max');
    revalidateTag(`patient-${id}`, 'max');
    revalidatePath('/dashboard/patients');

    return {
      status: true,
      code: 200,
      message: 'تمت أرشفة ملف المريض بنجاح',
      payload: null as any,
    };
  } catch (err) {
    console.error('Error archiving patient:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل الاتصال بالخادم أثناء أرشفة ملف المريض',
    };
  }
}
