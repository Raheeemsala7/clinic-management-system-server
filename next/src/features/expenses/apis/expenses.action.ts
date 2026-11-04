'use server';

import { updateTag, revalidateTag, revalidatePath } from 'next/cache';
import { getNextAuthToken } from '@/shared/lib/utils/auth.util';
import { HEADERS } from '@/shared/constant/api.constant';
import { RESPONSES } from '@/shared/constant/api.responses';
import { CreateExpensePayload, ExpenseItem, ExpenseBudgetStatus } from '../types/expenses';

/**
 * تحديث كاش المصروفات بعد أي عملية إضافة أو تعديل أو اعتماد
 */
export async function revalidateExpensesCache() {
  try {
    updateTag('expenses');
    updateTag('expenses-budget');
    updateTag('expense-categories');
  } catch {}
  try {
    revalidateTag('expenses', { expire: 0 });
    revalidateTag('expenses-budget', { expire: 0 });
    revalidateTag('expense-categories', { expire: 0 });
  } catch {}
  try {
    revalidatePath('/dashboard', 'layout');
  } catch {}
}

/**
 * تسجيل مصروف جديد
 * المسار: POST /api/v1/expenses
 */
export async function createExpenseAction(
  payload: CreateExpensePayload
): Promise<ApiResponse<ExpenseItem>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/expenses`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<ExpenseItem> = await res.json();
    if (data.status) {
      await revalidateExpensesCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل تسجيل المصروف' };
  }
}

/**
 * اعتماد وموافقة المدير على المصروف
 * المسار: POST /api/v1/expenses/:id/approve
 */
export async function approveExpenseAction(id: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/expenses/${id}/approve`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
    });

    const data = await res.json();
    if (data.status) {
      await revalidateExpensesCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل اعتماد المصروف' };
  }
}

/**
 * رفض المصروف من المدير مع كتابة سبب الرفض
 * المسار: POST /api/v1/expenses/:id/reject
 */
export async function rejectExpenseAction(id: string, reason?: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/expenses/${id}/reject`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (data.status) {
      await revalidateExpensesCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل رفض المصروف' };
  }
}

/**
 * تعديل سقف وحد المصروفات الشهري المسموح به للاستقبال تلقائياً
 * المسار: PUT /api/v1/expenses/budget
 */
export async function updateExpenseBudgetLimitAction(
  limit: number
): Promise<ApiResponse<ExpenseBudgetStatus>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/expenses/budget`, {
      method: 'PUT',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ limit }),
    });

    const data: ApiResponse<ExpenseBudgetStatus> = await res.json();
    if (data.status) {
      await revalidateExpensesCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل تعديل السقف المالي للمصروفات' };
  }
}

/**
 * إنشاء تصنيف مصروفات جديد
 * المسار: POST /api/v1/expense-categories
 */
export async function createExpenseCategoryAction(name: string): Promise<ApiResponse<any>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) return RESPONSES.unauthorized;

  try {
    const res = await fetch(`${process.env.API_URL}/expense-categories`, {
      method: 'POST',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    if (data.status) {
      await revalidateExpensesCache();
    }
    return data;
  } catch (error) {
    return { status: false, code: 500, message: 'فشل إضافة تصنيف المصروف' };
  }
}
