import { redirect } from 'next/navigation';
import { HEADERS } from "@/shared/constant/api.constant";
import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";

export interface TodayQueueItem {
  id: string;
  queueNumber: number;
  queueOrder: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'BOOKED' | 'PENDING_CHECKOUT' | 'COMPLETED';
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
  waitingSince?: string | null;
  clinicDate?: string;
  isPastAppointment?: boolean;
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
    console.log("URL : " , `${process.env.API_URL}/queue/today${queryParams}`);
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
    };
  }
}

/**
 * جلب مواعيد وفترات التقويم لليوم والأسبوع (Server Component) مع تفعيل الكاش الذكي
 */
export async function getCalendarAppointmentsApi(params: {
  date?: string;
  doctorId?: string;
  view?: string;
} = {}): Promise<import('../types/calendar').AppointmentsCalendarData> {
  const token = await getNextAuthToken();

  if (!token?.accessToken) {
    redirect('/auth/login?expired=true');
  }

  const qp = new URLSearchParams();
  if (params.date?.trim()) qp.set('date', params.date.trim());
  if (params.doctorId?.trim()) qp.set('doctorId', params.doctorId.trim());
  if (params.view?.trim()) qp.set('view', params.view.trim());

  try {
    const res = await fetch(`${process.env.API_URL}/appointments/calendar?${qp.toString()}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['appointments', 'appointments-calendar', 'slots'],
      },
    });

    if (res.status === 401) {
      redirect('/auth/login?expired=true');
    }

    const data = await res.json();

    if (
      data.code === 401 ||
      data.message === 'Invalid or expired access token' ||
      data.message === 'No token provided.'
    ) {
      redirect('/auth/login?expired=true');
    }

    if (!data.status || !data.payload) {
      throw new Error(data.message || 'فشل جلب مواعيد التقويم');
    }

    return data.payload as import('../types/calendar').AppointmentsCalendarData;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('NEXT_REDIRECT') || (error as any).digest?.startsWith('NEXT_REDIRECT'))
    ) {
      throw error;
    }
    console.error('Error fetching calendar appointments:', error);
    throw new Error(
      error instanceof Error ? error.message : 'تعذر تحميل بيانات تقويم المواعيد',
    );
  }
}
