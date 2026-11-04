'use server';

import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { HEADERS } from '@/shared/constant/api.constant';
import { RESPONSES } from '@/shared/constant/api.responses';
import { revalidateTag, revalidatePath, updateTag } from 'next/cache';

/**
 * سداد المبلغ المتبقي للموعد
 * المسار: POST /api/v1/appointments/:appointmentId/pay-remaining
 */
export async function payRemainingPaymentAction(
  appointmentId: string,
  amount: number,
  method: 'CASH' | 'CARD' | 'WALLET' = 'CASH',
  notes?: string
): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/appointments/${appointmentId}/pay-remaining`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({
        amount: Number(amount),
        method,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();

    if (data.status) {
      try {
        updateTag('today-queue');
        updateTag('appointments');
        updateTag('payments');
      } catch {}

      try {
        revalidateTag('today-queue', { expire: 0 });
        revalidateTag('appointments', { expire: 0 });
        revalidateTag('payments', { expire: 0 });
      } catch {}

      try {
        revalidatePath('/dashboard', 'layout');
      } catch {}
    }

    return data;
  } catch (error: any) {
    return {
      status: false,
      code: 500,
      message: error?.message || 'فشل سداد المبلغ المتبقي',
    };
  }
}

