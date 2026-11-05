export interface DailyClosingItem {
  id: string;
  clinicDate: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  notes?: string | null;
  closedById: string;
  closedAt: string;
  reopenedAt?: string | null;
  reopenedById?: string | null;
  closedBy?: {
    id: string;
    name: string;
    username?: string;
  } | null;
}

export interface ClosingPreview {
  clinicDate: string;
  paymentsCount: number;
  totalCashPayments: number;
  totalApprovedExpenses: number;
  approvedExpensesCount: number;
  totalPendingExpenses: number;
  pendingExpensesCount: number;
  expectedCash: number;
  isClosed: boolean;
  closing?: DailyClosingItem | null;
}

export interface CloseDayPayload {
  actualCash: number;
  notes?: string;
}
