import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { VisitEditor } from './visit-editor';

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
  patient: {
    fullName: string;
    dateOfBirth: string | null;
    gender: string;
    allergies: string[];
    chronicConditions: string[];
    generalNotes: string | null;
  };
}

export default async function VisitPage({ params }: { params: { id: string } }) {
  checkAuth(['DOCTOR', 'ADMIN']);

  const visit = await api.get<Visit>(`/visits/${params.id}`);

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">
          {visit.patient.fullName}
        </h1>
        {visit.patient.allergies.length > 0 && (
          <p className="text-sm text-destructive mt-1">
            ⚠️ حساسية: {visit.patient.allergies.join(', ')}
          </p>
        )}
        {visit.patient.chronicConditions.length > 0 && (
          <p className="text-sm text-amber-600 mt-0.5">
            أمراض مزمنة: {visit.patient.chronicConditions.join(', ')}
          </p>
        )}
      </div>

      <VisitEditor visit={visit} />
    </div>
  );
}
