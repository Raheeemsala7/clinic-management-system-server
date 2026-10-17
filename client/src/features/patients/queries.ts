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

export async function getPatient(id: string): Promise<PatientFull> {
  return api.get<PatientFull>(`/patients/${id}`);
}

export async function getPatientSummary(id: string): Promise<PatientSummary> {
  return api.get<PatientSummary>(`/patients/${id}/summary`);
}
