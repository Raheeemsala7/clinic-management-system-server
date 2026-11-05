'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchClosingPreviewService } from '../services/closing.service';
import { closeDayAction, reopenDayAction } from '../apis/closing.action';
import { CloseDayPayload } from '../types/closing';

export const closingKeys = {
  all: ['closing'] as const,
  preview: (date?: string) => [...closingKeys.all, 'preview', date || 'today'] as const,
};

export function useClosingPreviewQuery(date?: string) {
  return useQuery({
    queryKey: closingKeys.preview(date),
    queryFn: () => fetchClosingPreviewService(date),
    staleTime: 1000 * 20, // 20 ثانية
  });
}

export function useCloseDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CloseDayPayload) => {
      const res = await closeDayAction(payload);
      if (!res.status) {
        throw new Error(res.message || 'فشل إغلاق الصندوق');
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'تم إغلاق الصندوق بنجاح');
      queryClient.invalidateQueries({ queryKey: closingKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء إغلاق الصندوق');
    },
  });
}

export function useReopenDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await reopenDayAction(id);
      if (!res.status) {
        throw new Error(res.message || 'فشل إعادة فتح الصندوق');
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'تم إعادة فتح الصندوق بنجاح');
      queryClient.invalidateQueries({ queryKey: closingKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء إعادة فتح الصندوق');
    },
  });
}
