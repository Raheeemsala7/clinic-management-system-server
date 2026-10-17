import { checkAuth } from '@/proxy';
import { api } from '@/lib/api/client';
import { QueueBoard } from './queue-board';
import { ar } from '@/messages/ar';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';

export const dynamic = 'force-dynamic';

export default async function ReceptionHomePage() {
  const user = checkAuth(['RECEPTION', 'ADMIN']);

  // Fetch the doctor to get doctorId (single doctor in v1 — first DOCTOR user)
  const usersResult = await api.get<{ data: Array<{ id: string; role: string }> }>('/users');
  const doctor = usersResult.data.find((u) => u.role === 'DOCTOR');
  const doctorId = doctor?.id ?? '';

  const [queue, doctorStatus] = await Promise.all([
    doctorId
      ? api.get<QueueEntry[]>(`/queue/today?doctorId=${doctorId}`)
      : Promise.resolve<QueueEntry[]>([]),
    doctorId
      ? api.get<DoctorStatus>(`/doctor-status?doctorId=${doctorId}`)
      : Promise.resolve<DoctorStatus>({ doctorId: '', status: 'AVAILABLE', updatedAt: '' }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{ar.queue.title}</h1>
      <QueueBoard
        initialQueue={queue}
        initialDoctorStatus={doctorStatus}
        doctorId={doctorId}
        currentUserId={user.id}
      />
    </div>
  );
}
