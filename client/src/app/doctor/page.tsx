import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { DoctorTodayScreen } from './doctor-today-screen';
import { ar } from '@/messages/ar';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';

export const dynamic = 'force-dynamic';

interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  instructions: string | null;
  followUpDate: string | null;
  status: 'OPEN' | 'CLOSED';
  version: number;
}

export default async function DoctorTodayPage() {
  const user = await requireRole(['DOCTOR', 'ADMIN']);

  const [queue, doctorStatus] = await Promise.all([
    api.get<QueueEntry[]>(`/queue/today?doctorId=${user.id}`),
    api.get<DoctorStatus>(`/doctor-status?doctorId=${user.id}`),
  ]);

  // Find current in-progress appointment
  const inProgress = queue.find((q) => q.status === 'IN_PROGRESS');

  // If there is an in-progress appointment, fetch the visit
  let currentVisit: Visit | null = null;
  if (inProgress) {
    try {
      // Get appointment to find visitId
      const appt = await api.get<{ visit?: { id: string } }>(`/appointments/${inProgress.id}`);
      if (appt.visit?.id) {
        currentVisit = await api.get<Visit>(`/visits/${appt.visit.id}`);
      }
    } catch {
      // Visit may not exist yet
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ar.nav.today}</h1>
      <DoctorTodayScreen
        doctorId={user.id}
        initialQueue={queue}
        initialDoctorStatus={doctorStatus}
        inProgressEntry={inProgress ?? null}
        currentVisit={currentVisit}
      />
    </div>
  );
}
