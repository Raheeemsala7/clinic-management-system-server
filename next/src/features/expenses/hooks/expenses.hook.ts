'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchExpensesService,
  fetchExpenseBudgetService,
  fetchExpenseCategoriesService,
} from '../services/expenses.service';
import {
  createExpenseAction,
  approveExpenseAction,
  rejectExpenseAction,
  updateExpenseBudgetLimitAction,
  createExpenseCategoryAction,
} from '../apis/expenses.action';
import { CreateExpensePayload } from '../types/expenses';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: (filters?: any) => [...expenseKeys.all, 'list', filters] as const,
  budget: (date?: string) => [...expenseKeys.all, 'budget', date || 'current'] as const,
  categories: () => [...expenseKeys.all, 'categories'] as const,
};

/**
 * هوك جلب سجل المصروفات مع الفلاتر
 */
export function useExpensesQuery(filters?: {
  status?: string;
  from?: string;
  to?: string;
  categoryId?: string;
}) {
  return useQuery({
    queryKey: expenseKeys.lists(filters),
    queryFn: () => fetchExpensesService(filters),
    staleTime: 1000 * 30, // 30 ثانية
  });
}

/**
 * هوك جلب ملخص وسقف المصروفات الشهري
 */
export function useExpenseBudgetQuery(date?: string) {
  return useQuery({
    queryKey: expenseKeys.budget(date),
    queryFn: () => fetchExpenseBudgetService(date),
    staleTime: 1000 * 30,
  });
}

/**
 * هوك جلب فئات وتصنيفات المصروفات
 */
export function useExpenseCategoriesQuery() {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: fetchExpenseCategoriesService,
    staleTime: 1000 * 60 * 60, // ساعة
  });
}

/**
 * هوك تسجيل مصروف جديد
 * يدعو Server Action -> createExpenseAction
 */
export function useCreateExpenseMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const res = await createExpenseAction(payload);
      if (!res.status) {
        throw new Error(res.message || 'فشل تسجيل المصروف');
      }
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      const isAutoApproved = data.payload?.isAutoApproved || data.payload?.status === 'APPROVED';
      if (isAutoApproved) {
        toast.success('تم تسجيل المصروف واعتماده تلقائياً ضمن الميزانية الشهرية');
      } else {
        toast.info('تم تسجيل المصروف وهو الآن بانتظار موافقة الإدارة (تجاوز السقف الشهري المتبقي)');
      }
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء حفظ المصروف');
    },
  });
}

/**
 * هوك اعتماد المصروف من الإدارة
 * يدعو Server Action -> approveExpenseAction
 */
export function useApproveExpenseMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await approveExpenseAction(id);
      if (!res.status) {
        throw new Error(res.message || 'فشل اعتماد المصروف');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('تم اعتماد المصروف بنجاح');
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء اعتماد المصروف');
    },
  });
}

/**
 * هوك رفض المصروف من الإدارة
 * يدعو Server Action -> rejectExpenseAction
 */
export function useRejectExpenseMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await rejectExpenseAction(id, reason);
      if (!res.status) {
        throw new Error(res.message || 'فشل رفض المصروف');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.error('تم رفض المصروف');
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء رفض المصروف');
    },
  });
}

/**
 * هوك تعديل سقف وحد المصروفات الشهري للاستقبال
 * يدعو Server Action -> updateExpenseBudgetLimitAction
 */
export function useUpdateExpenseBudgetMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (limit: number) => {
      const res = await updateExpenseBudgetLimitAction(limit);
      if (!res.status) {
        throw new Error(res.message || 'فشل تعديل السقف المالي للمصروفات');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('تم تحديث سقف المصروفات الشهرية التلقائية بنجاح');
      router.refresh();
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء تحديث الميزانية');
    },
  });
}

/**
 * هوك إضافة تصنيف مصروف جديد
 */
export function useCreateExpenseCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await createExpenseCategoryAction(name);
      if (!res.status) {
        throw new Error(res.message || 'فشل إضافة تصنيف المصروف');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.categories() });
      toast.success('تمت إضافة التصنيف بنجاح');
    },
    onError: (err: any) => {
      toast.error(err.message || 'حدث خطأ أثناء إضافة التصنيف');
    },
  });
}

