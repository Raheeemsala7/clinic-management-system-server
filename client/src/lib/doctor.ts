import 'server-only';
import { cache } from 'react';
import { api } from '@/lib/api/client';

export interface DoctorOption {
  id: string;
  name: string;
}

export interface DoctorStatusValue {
  doctorId: string;
  status: 'AVAILABLE' | 'WITH_PATIENT' | 'BREAK';
  updatedAt: string;
}

/** Active doctors. Cached per-request so multiple components share one call. */
export const getDoctors = cache(async (): Promise<DoctorOption[]> => {
  try {
    return await api.get<DoctorOption[]>('/users/doctors');
  } catch {
    return [];
  }
});

/** The clinic is single-doctor; the primary doctor is the first active one. */
export const getPrimaryDoctor = cache(async (): Promise<DoctorOption | null> => {
  const doctors = await getDoctors();
  return doctors[0] ?? null;
});

export const getDoctorStatus = cache(async (doctorId: string): Promise<DoctorStatusValue | null> => {
  if (!doctorId) return null;
  try {
    return await api.get<DoctorStatusValue>(`/doctor-status?doctorId=${doctorId}`);
  } catch {
    return null;
  }
});

/** Primary doctor status (if any). */
export const getPrimaryDoctorStatus = cache(async (): Promise<DoctorStatusValue | null> => {
  const doctor = await getPrimaryDoctor();
  if (!doctor) return null;
  return getDoctorStatus(doctor.id);
});
