import { HEADERS } from "@/shared/constant/api.constant";
import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";

export interface TodayQueueItem {
  id: string;
  queueNumber: number;
  queueOrder: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'BOOKED';
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

/**
 * جلب قائمة طابور وصالة الانتظار لليوم الحالي لموظف الاستقبال
 * المسار: GET /api/v1/queue/today
 */
export async function getTodayQueueAction(doctorId?: string) {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return {
      status: false,
      code: 401,
      message: 'غير مصرح به، يرجى تسجيل الدخول',
      payload: [] as TodayQueueItem[],
    };
  }

  const queryParams = doctorId ? `?doctorId=${encodeURIComponent(doctorId)}` : '';
  const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/queue/today${queryParams}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    console.error('Error in getTodayQueueAction:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل جلب قائمة الانتظار',
      payload: [] as TodayQueueItem[],
    };
  }
}

/**
 * جلب قائمة طابور الانتظار لليوم الحالي للعيادة (لجميع الأطباء أو لطبيب محدد)
 * المسار: GET /api/v1/queue/today
 */
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
      cache: 'no-store',
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


/**
 * جلب مواعيد اليوم مع إمكانية الفلترة بحالة الانتظار WAITING
 * المسار: GET /api/v1/appointments?date=YYYY-MM-DD&status=WAITING
 */
export async function getTodayWaitingAppointmentsAction(status = 'WAITING') {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return {
      status: false,
      code: 401,
      message: 'غير مصرح به، يرجى تسجيل الدخول',
      payload: [],
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const queryParams = new URLSearchParams({
    date: todayStr,
    status,
  });

  const apiUrl = process.env.API_URL || 'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/appointments?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return data;
  } catch (err: unknown) {
    console.error('Error in getTodayWaitingAppointmentsAction:', err);
    return {
      status: false,
      code: 500,
      message: 'فشل جلب مواعيد الانتظار',
      payload: [],
    };
  }
}