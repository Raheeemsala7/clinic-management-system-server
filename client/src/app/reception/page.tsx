import { requireRole } from '@/lib/session';
import { getPrimaryDoctor } from '@/lib/doctor';
import { getTodayQueue, getDoctorStatus } from '@/features/queue/queries';
import { QueueBoard } from './queue-board';
import { ar } from '@/messages/ar';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';

import { NewReceptionBookingDialog } from './new-reception-booking-dialog';

export const dynamic = 'force-dynamic';

export default async function ReceptionHomePage() {
  const user = await requireRole(['RECEPTION', 'ADMIN']);

  // Fetch the doctor to get doctorId (single doctor in v1 — first DOCTOR user)
  const doctor = await getPrimaryDoctor();
  const doctorId = doctor?.id ?? '';

  let queue: QueueEntry[] = [];
  let doctorStatus: DoctorStatus = { doctorId: '', status: 'AVAILABLE', updatedAt: '' };

  if (doctorId) {
    const [queueResult, statusResult] = await Promise.allSettled([
      getTodayQueue(doctorId),
      getDoctorStatus(doctorId),
    ]);

    if (queueResult.status === 'fulfilled') {
      queue = queueResult.value ?? [];
    }
    if (statusResult.status === 'fulfilled') {
      doctorStatus = statusResult.value ?? { doctorId, status: 'AVAILABLE', updatedAt: '' };
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ar.queue.title}</h1>
          <p className="text-sm text-muted-foreground">قائمة انتظار اليوم وإدارة تدفق المرضى وتنسيق الكشف</p>
        </div>
        <NewReceptionBookingDialog doctorId={doctorId} doctorName={doctor?.name} />
      </div>

      <QueueBoard
        initialQueue={queue}
        initialDoctorStatus={doctorStatus}
        doctorId={doctorId}
        currentUserId={user.id}
      />
    </div>
  );
}
