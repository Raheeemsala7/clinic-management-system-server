import { requireRole } from '@/lib/session';
import { getDoctorScheduleAction } from '@/features/doctor-schedule/actions';
import { DoctorScheduleForm } from './schedule-form';
import { getServerI18n } from '@/i18n/server';

export const dynamic = 'force-dynamic';

export default async function DoctorSchedulePage() {
  const user = await requireRole(['DOCTOR', 'ADMIN']);
  const { t, isAr } = await getServerI18n();

  const schedule = await getDoctorScheduleAction(user.id);
  const initialSchedule = schedule || {
    doctorId: user.id,
    slotDurationMinutes: 30,
    weeklySchedule: [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">
          {isAr ? 'أوقات العمل الأسبوعية' : 'Weekly Working Hours'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAr
            ? 'إدارة أيام العمل والإجازات وتحديد الفترات الصباحية والمسائية'
            : 'Manage active working days, off-days, and morning/evening shifts'}
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
