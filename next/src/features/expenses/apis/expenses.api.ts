import { HEADERS } from "@/shared/constant/api.constant";
import { RESPONSES } from "@/shared/constant/api.responses";
import { getNextAuthToken } from "@/shared/lib/utils/auth.util";
import { ExpenseItem, ExpenseBudgetStatus, ExpenseCategory } from "../types/expenses";

export async function getExpenseBudgetApi(): Promise<ApiResponse<ExpenseBudgetStatus>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/expenses/budget`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['expenses-budget', 'expenses'],
      },
    });

    const data: ApiResponse<ExpenseBudgetStatus> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل جلب بيانات ميزانية وسقف المصروفات',
    };
  }
}

export async function getExpensesApi(query?: {
  status?: string;
  from?: string;
  to?: string;
  categoryId?: string;
}): Promise<ApiResponse<ExpenseItem[]>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  const searchParams = new URLSearchParams();
  if (query?.status && query.status !== 'all') searchParams.set('status', query.status);
  if (query?.from) searchParams.set('from', query.from);
  if (query?.to) searchParams.set('to', query.to);
  if (query?.categoryId) searchParams.set('categoryId', query.categoryId);

  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

  try {
    const res = await fetch(`${process.env.API_URL}/expenses${queryString}`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['expenses'],
      },
    });

    const data: ApiResponse<ExpenseItem[]> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل جلب سجل المصروفات',
    };
  }
}

export async function getExpenseCategoriesApi(): Promise<ApiResponse<ExpenseCategory[]>> {
  const token = await getNextAuthToken();
  if (!token?.accessToken) {
    return RESPONSES.unauthorized;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/expense-categories`, {
      method: 'GET',
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.accessToken),
      },
      next: {
        tags: ['expense-categories'],
      },
    });

    const data: ApiResponse<ExpenseCategory[]> = await res.json();
    return data;
  } catch (error) {
    return {
      status: false,
      code: 500,
      message: 'فشل جلب بنود وتصنيفات المصروفات',
    };
  }
}

