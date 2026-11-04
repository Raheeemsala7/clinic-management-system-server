import { HEADERS } from "@/shared/constant/api.constant";
import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";

export interface TodayQueueItem {
  id: string;
  queueNumber: number;
  queueOrder: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'BOOKED' | 'PENDING_CHECKOUT';
  source: 'SCHEDULED' | 'WALK_IN';
  type: string;
  startTime?: string;
  scheduledAt?: string;
  arrivedAt?: string;
  postponedCount: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientGender?: 'MALE' | 'FEMALE';
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  visitId?: string | null;
  waitingMinutes: number | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  isFullyPaid: boolean;
  hasRemaining: boolean;
  isExempt: boolean;
}

export async function getTodayWaitingAppointmentsApi(doctorId?: string): Promise<ApiResponse<TodayQueueItem[]>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized
  }

  const queryParams = doctorId ? `?doctorId=${encodeURIComponent(doctorId)}` : '';

  try {
    const res = await fetch(`${process.env.API_URL}/queue/today${queryParams}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['today-queue', 'appointments'],
      },
    });

    const data: ApiResponse<TodayQueueItem[]> = await res.json();
    console.log(data);
    

    if (!data.status) {
      return {
        status: false,
        code: data.code || 500,
        message: data.message || 'حدث خطأ أثناء جلب قائمة الانتظار',
      } 
    }

    return data;
  } catch (error) {
    console.error('Error fetching today queue appointments:', error);
    return {
      status: false,
      code: 500,
      message: 'فشل الاتصال بالخادم، يرجى التحقق من الشبكة',
    } 
  }
}
