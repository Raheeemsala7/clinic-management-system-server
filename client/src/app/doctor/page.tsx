import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { DoctorTodayScreen } from './doctor-today-screen';
import { getServerI18n } from '@/i18n/server';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';
import { Stethoscope } from 'lucide-react';

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
  const { t, isAr } = await getServerI18n();

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
      if (inProgress.visitId) {
        currentVisit = await api.get<Visit>(`/visits/${inProgress.visitId}`);
      } else {
        // Fallback: get appointment to find visitId
        const appt = await api.get<{ visit?: { id: string } }>(`/appointments/${inProgress.id}`);
        if (appt.visit?.id) {
          currentVisit = await api.get<Visit>(`/visits/${appt.visit.id}`);
        }
      }
    } catch {
      // Visit may not exist yet
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Stethoscope className="size-6 text-primary" />
            <span>{isAr ? 'شاشة كشف اليوم' : "Today's Clinical Session"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAr
              ? 'متابعة طابور الانتظار الحي وإدارة تدفق المرضى وفحوصات العيادة'
              : 'Live waiting queue monitoring, patient flow, and clinical examinations'}
          </p>
        </div>
      </div>

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
