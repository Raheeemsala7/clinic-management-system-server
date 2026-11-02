import { PatientBasic } from "@/features/appointments";
import { HEADERS } from "@/shared/constant/api.constant";

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

    const data: ApiResponse<PatientBasic[]> = await res.json();

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