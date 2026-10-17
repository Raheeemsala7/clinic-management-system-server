import { requireRole } from '@/lib/session';
import { getDoctorScheduleAction } from '@/features/doctor-schedule/actions';
import { DoctorScheduleForm } from './schedule-form';
import { ar } from '@/messages/ar';

export const dynamic = 'force-dynamic';

export default async function DoctorSchedulePage() {
  const user = await requireRole(['DOCTOR', 'ADMIN']);

  const schedule = await getDoctorScheduleAction(user.id);
  const initialSchedule = schedule || {
    doctorId: user.id,
    slotDurationMinutes: 30,
    weeklySchedule: [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">أوقات العمل الأسبوعية</h1>
        <p className="text-sm text-muted-foreground">
          إدارة أيام العمل والإجازات وتحديد الفترات الصباحية والمسائية
        </p>
      </div>

      <DoctorScheduleForm
        doctorId={user.id}
        doctorName={user.name}
        initialSchedule={initialSchedule}
      />
    </div>
  );
}
