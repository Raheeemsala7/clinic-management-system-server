'use server';

import { revalidateTag } from 'next/cache';
import { HEADERS } from '@/shared/constant/api.constant';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { RESPONSES } from '@/shared/constant/api.responses';
import { CloseDayPayload, DailyClosingItem } from '../types/closing';

export async function revalidateClosingCache() {
  revalidateTag('closing', 'max');
  revalidateTag('closing-preview', 'max');
  revalidateTag('closing-status', 'max');
}

export async function closeDayAction(payload: CloseDayPayload): Promise<ApiResponse<DailyClosingItem>> {
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
    if (data.status) {
      await revalidateClosingCache();
    }
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل إغلاق الصندوق، يرجى المحاولة مرة أخرى',
    };
  }
}

export async function reopenDayAction(id: string): Promise<ApiResponse<DailyClosingItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/closing/${id}/reopen`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data: ApiResponse<DailyClosingItem> = await res.json();
    if (data.status) {
      await revalidateClosingCache();
    }
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل إعادة فتح الصندوق',
    };
  }
}

