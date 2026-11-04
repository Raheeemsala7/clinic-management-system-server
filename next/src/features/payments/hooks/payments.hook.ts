'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchPayments } from '../services/payments.service';
import { payRemainingPaymentAction } from '../apis/payments.action';
import { queueKeys, appointmentKeys } from '@/features/appointments/hooks/appointments.hook';
import { toast } from 'sonner';

export const paymentKeys = {
  all: ['payments'] as const,
  list: (date: string) => [...paymentKeys.all, 'list', date] as const,
};

/**
 * هوك استعلام المدفوعات مع دعم الكاش حسب اليوم المحدد
 */
export function usePaymentsQuery(date: string) {
  return useQuery({
    queryKey: paymentKeys.list(date),
    queryFn: ({ signal }) => fetchPayments(date, signal),
    staleTime: 1000 * 60, // دقيقة واحدة لتجنب الطلبات المتكررة
    gcTime: 1000 * 60 * 10, // 10 دقائق في ذاكرة التخزين المؤقت
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('صلاحية') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/**
 * هوك سداد المبلغ المتبقي وتحديث الكاش تلقائياً فور نجاح العملية
 */
export function usePayRemainingPaymentMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      amount,
      method,
      notes,
    }: {
      appointmentId: string;
      amount: number;
      method: 'CASH' | 'CARD' | 'WALLET';
      notes?: string;
    }) => {
      const res = await payRemainingPaymentAction(appointmentId, amount, method, notes);

      if (res.code === 401) {
        throw new Error('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول');
      }

      if (!res.status) {
        throw new Error(res.message || 'فشل سداد المبلغ المتبقي');
      }

      return res;
    },
    onSuccess: (data) => {
      // تحديث فوري لكاش المدفوعات وقائمة الانتظار والمواعيد
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });

      toast.success(data.message || 'تم تسجيل سداد المبلغ المتبقي بنجاح');
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء سداد المبلغ المتبقي');
    },
  });
}

