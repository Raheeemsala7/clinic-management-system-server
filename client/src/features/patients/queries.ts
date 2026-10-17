import 'server-only';
import { api } from '@/lib/api/client';

export interface PatientBasic {
  id: string;
  fullName: string;
  phone: string;
  gender: string;
  dateOfBirth: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientFull extends PatientBasic {
  allergies: string[];
  chronicConditions: string[];
  generalNotes: string | null;
}

export interface PatientSummary {
  id: string;
  fullName: string;
  age: number | null;
  gender: string;
  allergies: string[];
  chronicConditions: string[];
  visitCount: number;
  lastVisitDate: string | null;
  lastDiagnosis: string | null;
  lastPrescriptionItems: Array<{
    drugName: string;
    dose: string;
    frequency: string;
    duration: string;
  }>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export async function searchPatients(q: string, page = 1): Promise<PaginatedResult<PatientBasic>> {
  const params = new URLSearchParams({ q, page: String(page), pageSize: '20' });
  return api.get<PaginatedResult<PatientBasic>>(`/patients?${params}`);
}

export interface PatientVisitHistoryItem {
  id: string;
  appointmentId: string;
  patientId: string;
  complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  instructions: string | null;
  followUpDate: string | null;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  prescriptions: Array<{
    id: string;
    versionNumber: number;
    notes: string | null;
    printedAt: string | null;
    createdAt: string;
    items: Array<{
      id: string;
      drugName: string;
      dose: string;
      frequency: string;
      duration: string;
      instructions: string | null;
    }>;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  appointment?: {
    clinicDate: string;
    type: string;
  };
}

export async function getPatient(id: string): Promise<PatientFull> {
  return api.get<PatientFull>(`/patients/${id}`);
}

export async function getPatientSummary(id: string): Promise<PatientSummary> {
  return api.get<PatientSummary>(`/patients/${id}/summary`);
}

export async function getPatientHistory(
  id: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<PatientVisitHistoryItem>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return api.get<PaginatedResult<PatientVisitHistoryItem>>(`/patients/${id}/history?${params}`);
}
