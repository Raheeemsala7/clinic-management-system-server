export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ExpenseCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  spentAt: string;
  recordedById: string;
  status: ExpenseStatus;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
  recordedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  isAutoApproved?: boolean;
}

export interface ExpenseBudgetStatus {
  monthlyLimit: number;
  totalApprovedSpent: number;
  approvedCount: number;
  totalPendingSpent: number;
  pendingCount: number;
  remainingBudget: number;
  usagePercentage: number;
  isExceeded: boolean;
  month: string;
  startOfMonth: string;
  endOfMonth: string;
}

export type ExpenseFilterTab = 'all' | 'approved' | 'pending' | 'rejected';

export interface ExpenseFilters {
  status?: string;
  from?: string;
  to?: string;
  categoryId?: string;
  month?: string;
}

export interface CreateExpensePayload {
  categoryId: string;
  amount: number;
  description: string;
  spentAt: string;
}

