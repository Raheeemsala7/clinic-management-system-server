import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { VisitEditor } from './visit-editor';

export const dynamic = 'force-dynamic';

export interface Visit {
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
  patient: {
    fullName: string;
    dateOfBirth: string | null;
    gender: string;
    allergies: string[];
    chronicConditions: string[];
    generalNotes: string | null;
  };
}

export default async function VisitPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['DOCTOR', 'ADMIN']);
  const { id } = await params;

  const visit = await api.get<Visit>(`/visits/${id}`);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{visit.patient.fullName}</h1>
        {visit.patient.allergies.length > 0 && (
          <p className="mt-1 text-sm text-destructive">
            {ar.patients.allergies}: {visit.patient.allergies.join('، ')}
          </p>
        )}
        {visit.patient.chronicConditions.length > 0 && (
          <p className="mt-0.5 text-sm text-accent">
            {ar.patients.chronicConditions}: {visit.patient.chronicConditions.join('، ')}
          </p>
        )}
      </div>

      <VisitEditor visit={visit} />
    </div>
  );
}
