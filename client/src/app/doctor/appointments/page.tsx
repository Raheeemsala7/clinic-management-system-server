import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { todayClinicDate } from '@/lib/utils';
import { AppointmentCalendar, type CalendarAppointment } from '@/components/appointments/appointment-calendar';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DoctorAppointmentsPageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function DoctorAppointmentsPage({ searchParams }: DoctorAppointmentsPageProps) {
  const session = await requireRole(['DOCTOR', 'ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const today = todayClinicDate();
  const selectedDate = resolved.date || today;

  const queryParams = new URLSearchParams();
  queryParams.set('date', selectedDate);
  queryParams.set('doctorId', session.id);

  const appointmentsRes = await api
    .get<{ data: CalendarAppointment[] }>(`/appointments?${queryParams.toString()}`)
    .catch(() => ({ data: [] }));

  const doctorSelf = [
    {
      id: session.id,
      name: session.name,
      username: session.name,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            جدول مواعيدي والتقويم
          </h1>
          <p className="text-sm text-muted-foreground">
            متابعة جدول المرضى والحجوزات بالساعة لكل يوم
          </p>
        </div>
      </div>

      <AppointmentCalendar
        initialAppointments={appointmentsRes.data}
        doctors={doctorSelf}
        currentDoctorId={session.id}
        userRole="DOCTOR"
        initialDate={selectedDate}
      />
    </div>
  );
}
