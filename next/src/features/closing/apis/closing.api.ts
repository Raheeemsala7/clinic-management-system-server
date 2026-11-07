import { HEADERS } from "@/shared/constant/api.constant";
import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";
import { ClosingPreview, DailyClosingItem, CloseDayPayload } from "../types/closing";

export async function getClosingPreviewApi(date?: string): Promise<ApiResponse<ClosingPreview>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  const queryParams = date ? `?date=${encodeURIComponent(date)}` : '';
  try {
    const res = await fetch(`${process.env.API_URL}/closing/preview${queryParams}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['closing-preview', 'closing'],
      },
    });

    const data: ApiResponse<ClosingPreview> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل جلب ملخص ومعاينة الإغلاق اليومي',
    };
  }
}

export async function getClosingStatusApi(date?: string): Promise<ApiResponse<DailyClosingItem | null>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  const queryParams = date ? `?date=${encodeURIComponent(date)}` : '';
  try {
    const res = await fetch(`${process.env.API_URL}/closing/status${queryParams}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['closing-status', 'closing'],
      },
    });

    const data: ApiResponse<DailyClosingItem | null> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل جلب حالة الإغلاق اليومي',
    };
  }
}

export async function closeDayApi(payload: CloseDayPayload): Promise<ApiResponse<DailyClosingItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/closing`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<DailyClosingItem> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل تنفيذ الإغلاق اليومي للصندوق',
    };
  }
}

