import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { todayClinicDate } from '@/lib/utils';
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
            جدول مواعيدي والتقويم
          </h1>
          <p className="text-sm text-muted-foreground">
            متابعة جدول المرضى والحجوزات بالساعة وفقاً لفترات عملك الأسبوعية
          </p>
        </div>
        <Link href="/doctor/schedule">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" />
            تعديل أوقات العمل
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

