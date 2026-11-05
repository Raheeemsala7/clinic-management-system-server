import { ExpenseItem, ExpenseBudgetStatus, ExpenseCategory, ExpenseFilters } from '../types/expenses';

export interface ExpensesListResponse {
  data: ExpenseItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchExpensesService(filters?: ExpenseFilters): Promise<ExpensesListResponse> {
  const searchParams = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') searchParams.set('status', filters.status);
  if (filters?.from) searchParams.set('from', filters.from);
  if (filters?.to) searchParams.set('to', filters.to);
  if (filters?.categoryId) searchParams.set('categoryId', filters.categoryId);
  if (filters?.month) searchParams.set('month', filters.month);

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const res = await fetch(`/api/expenses${queryStr}`, { method: 'GET' });

  if (!res.ok) {
    if (res.status === 401) throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول');
    throw new Error('فشل جلب المصروفات');
  }

  const json = await res.json();
  const rawData = json?.payload?.data || json?.payload || json?.data || [];
  const meta = json?.payload?.pagination || json?.metadata || json?.meta;

  return {
    data: Array.isArray(rawData) ? rawData : [],
    meta,
  };
}

export async function fetchExpenseBudgetService(month?: string): Promise<ExpenseBudgetStatus> {
  const queryStr = month ? `?month=${encodeURIComponent(month)}` : '';
  const res = await fetch(`/api/expenses/budget${queryStr}`, { method: 'GET' });

  if (!res.ok) {
    if (res.status === 401) throw new Error('انتهت صلاحية الجلسة');
    throw new Error('فشل جلب بيانات الميزانية وسقف المصروفات');
  }

  const json = await res.json();
  return json?.payload || json?.data;
}

export async function fetchExpenseCategoriesService(): Promise<ExpenseCategory[]> {
  const res = await fetch('/api/expenses/categories', { method: 'GET' });

  if (!res.ok) {
    throw new Error('فشل جلب تصنيفات المصروفات');
  }

  const json = await res.json();
  const list = json?.payload || json?.data || [];
  return Array.isArray(list) ? list : [];
}

