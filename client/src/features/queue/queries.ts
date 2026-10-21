import 'server-only';
import { api } from '@/lib/api/client';

export interface QueueEntry {
  id: string;
  queueNumber: number;
  queueOrder: number;
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'SCHEDULED' | 'WALK_IN';
  type: 'EXAMINATION' | 'FOLLOW_UP' | 'POST_OPERATIVE' | 'LAB_TESTS_IMAGING' | 'TEST_RESULTS_REVIEW' | 'CONSULTATION' | string;
  postponedCount: number;
  patientId: string;
  patientName: string;
  visitId?: string | null;
  waitingMinutes: number | null;
}

export interface DoctorStatus {
  doctorId: string;
  status: 'AVAILABLE' | 'WITH_PATIENT' | 'BREAK';
  updatedAt: string;
}

export async function getTodayQueue(doctorId: string): Promise<QueueEntry[]> {
  // Private, user-specific data — no-store caching (set in api client)
  return api.get<QueueEntry[]>(`/queue/today?doctorId=${doctorId}`);
}

export async function getDoctorStatus(doctorId: string): Promise<DoctorStatus> {
  return api.get<DoctorStatus>(`/doctor-status?doctorId=${doctorId}`);
}
