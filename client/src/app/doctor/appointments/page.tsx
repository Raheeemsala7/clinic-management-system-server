import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { todayClinicDate } from '@/lib/utils';
import { getServerI18n } from '@/i18n/server';
import { AppointmentCalendar, type CalendarAppointment } from '@/components/appointments/appointment-calendar';
import { type AvailableSlotsResponse } from '@/features/doctor-schedule/actions';
import { CalendarDays, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface DoctorAppointmentsPageProps {
  searchParams?: Promise<{ date?: string }>;
}

export default async function DoctorAppointmentsPage({ searchParams }: DoctorAppointmentsPageProps) {
  const session = await requireRole(['DOCTOR', 'ADMIN']);
  const { t } = await getServerI18n();

  const resolved = searchParams ? await searchParams : {};
  const today = todayClinicDate();
  const selectedDate = resolved.date || today;

  const queryParams = new URLSearchParams();
  queryParams.set('date', selectedDate);
  queryParams.set('doctorId', session.id);

  const [appointmentsRes, scheduleRes] = await Promise.all([
    api
      .get<{ data: CalendarAppointment[] }>(`/appointments?${queryParams.toString()}`)
      .catch(() => ({ data: [] })),
    api
      .get<AvailableSlotsResponse>(`/doctor-schedule/${session.id}/available-slots?date=${encodeURIComponent(selectedDate)}`)
      .catch(() => null),
  ]);

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
            {t.calendar.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.calendar.subtitle}
          </p>
        </div>
        <Link href="/doctor/schedule">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" />
            {t.calendar.editWorkingHours}
          </Button>
        </Link>
      </div>

      <AppointmentCalendar
        initialAppointments={appointmentsRes.data}
        doctors={doctorSelf}
        currentDoctorId={session.id}
        userRole="DOCTOR"
        initialDate={selectedDate}
        initialScheduleData={scheduleRes}
      />
    </div>
  );
}
