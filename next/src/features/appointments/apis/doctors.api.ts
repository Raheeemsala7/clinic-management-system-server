import { HEADERS } from '@/shared/constant/api.constant';
import { DoctorOption, AvailableSlotsResponse } from '../types/booking';

/**
 * جلب قائمة الأطباء من الخادم الخلفي
 */
export async function fetchDoctorsFromBackend(token?: string): Promise<ApiResponse<DoctorOption[]>> {
  if (!token) {
    return {
      status: false,
      code: 401,
      message: 'Unauthorized',
    };
  }

  try {
    const res = await fetch(`${process.env.API_URL}/users/doctors`, {
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return {
        status: false,
        code: res.status,
        message: err?.message || 'فشل جلب قائمة الأطباء',
      };
    }

    const data: ApiResponse<DoctorOption[]> = await res.json();
    return data;
  } catch (error: any) {
    return {
      status: false,
      code: 500,
      message: error?.message || 'حدث خطأ في الاتصال بالخادم',
    };
  }
}

/**
 * جلب المواعيد المتاحة لدكتور وتاريخ محدد من الخادم الخلفي
 */
export async function fetchDoctorSlotsFromBackend(
  doctorId: string,
  date: string,
  token?: string
): Promise<ApiResponse<AvailableSlotsResponse>> {
  if (!token) {
    return {
      status: false,
      code: 401,
      message: 'Unauthorized',
    };
  }

  if (!doctorId || !date) {
    return {
      status: false,
      code: 400,
      message: 'doctorId and date are required',
    };
  }

  try {
    const res = await fetch(
      `${process.env.API_URL}/doctor-schedule/${encodeURIComponent(doctorId)}/available-slots?date=${encodeURIComponent(date)}`,
      {
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token),
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return {
        status: false,
        code: res.status,
        message: err?.message || 'فشل جلب المواعيد المتاحة',
      };
    }

    const data: ApiResponse<AvailableSlotsResponse> = await res.json();
    return data;
  } catch (error: any) {
    return {
      status: false,
      code: 500,
      message: error?.message || 'حدث خطأ في الاتصال بالخادم',
    };
  }
}
