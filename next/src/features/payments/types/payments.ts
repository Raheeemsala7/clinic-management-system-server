export type PaymentMethod = 'CASH' | 'CARD' | 'WALLET';
export type PaymentKind =
  | 'EXAMINATION'
  | 'FOLLOW_UP'
  | 'POST_OPERATIVE'
  | 'LAB_TESTS_IMAGING'
  | 'TEST_RESULTS_REVIEW'
  | 'CONSULTATION'
  | 'OTHER';

export type PaymentType = 'FULL' | 'DEPOSIT' | 'REMAINING' | 'OTHER';
export type PaymentStatus = 'RECORDED' | 'VOIDED';

export interface PaymentItem {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  kind: PaymentKind | string;
  paymentType?: PaymentType;
  notes?: string | null;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  doctor?: {
    id: string;
    name: string;
  } | null;
  receivedBy?: {
    id: string;
    name: string;
    username: string;
  } | null;
  appointment?: {
    id: string;
    clinicDate: string;
    type: string;
    startTime?: string | null;
    endTime?: string | null;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
    isExempt: boolean;
    exemptionReason?: string | null;
  } | null;
}

export interface PaymentsSummaryCounts {
  all: number;
  paid: number;
  deposit: number;
  remaining: number;
}

export interface PaymentsSummary {
  totalCollected: number;
  totalDeposits: number;
  totalRemaining: number;
  counts: PaymentsSummaryCounts;
}

export interface PaymentsListResponse {
  data: PaymentItem[];
  meta: {
    page: number | string;
    limit: number | string;
    total: number | string;
    totalPages: number | string;
    summary?: PaymentsSummary;
  };
}

export type PaymentFilterTab = 'all' | 'paid' | 'deposit' | 'remaining';

