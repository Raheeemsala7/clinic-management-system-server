import { z } from 'zod';
import { quickPatientSchema } from '../schema/patient.schema';

export interface PatientPayload {
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  dateOfBirth?: string;
  address?: string;
  chronicConditions: string[];
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  dateOfBirth?: string;
  address?: string;
  chronicConditions?: string[];
  visitCount?: number;
  lastVisitDate?: string | null;
  createdAt?: string;
  isArchived?: boolean;
}

export type PatientFilterType = 'all' | 'chronic' | 'male' | 'female' | 'month';

export interface PatientVisitItem {
  id: string;
  clinicDate: string;
  type: string;
  status: string;
  startTime?: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  doctorName?: string | null;
  createdAt?: string | null;
}

export interface PatientNoteItem {
  id: string;
  content: string;
  date: string;
  authorRole: string;
  authorName: string;
}

export interface PatientAttachmentItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface PatientFinancialSummary {
  totalCharged: number;
  totalPaid: number;
  outstandingBalance: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  recentPayments?: any[];
}

export interface PatientDetails {
  patient: {
    id: string;
    fullName: string;
    phone: string;
    gender: 'MALE' | 'FEMALE';
    age: number;
    dateOfBirth?: string | null;
    address?: string | null;
    chronicConditions?: string[];
    createdAt?: string | null;
  };
  lastVisit?: {
    date?: string | null;
    appointmentType?: string | null;
    doctorName?: string | null;
    diagnosis?: string | null;
    notes?: string | null;
    status?: string | null;
  } | null;
  financialSummary: PatientFinancialSummary;
  previousAppointments: PatientVisitItem[];
  attachments?: PatientAttachmentItem[];
  notes?: PatientNoteItem[];
  visitCount: number;
}

export interface PatientsListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PatientsListResponse {
  status: boolean;
  code: number;
  message?: string;
  payload: Patient[];
  meta?: PatientsListMeta;
}

export type QuickPatientFormValues = z.infer<ReturnType<typeof quickPatientSchema>>;
