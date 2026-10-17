import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { todayClinicDate } from '@/lib/utils';
import { getDoctors } from '@/lib/doctor';
import { AppointmentCalendar, type CalendarAppointment } from '@/components/appointments/appointment-calendar';
import { type AvailableSlotsResponse } from '@/features/doctor-schedule/actions';
import { CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ReceptionAppointmentsPageProps {
  searchParams?: Promise<{ date?: string; doctorId?: string }>;
}

export default async function ReceptionAppointmentsPage({ searchParams }: ReceptionAppointmentsPageProps) {
  await requireRole(['RECEPTION', 'ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const today = todayClinicDate();
  const selectedDate = resolved.date || today;

  const queryParams = new URLSearchParams();
  queryParams.set('date', selectedDate);
  if (resolved.doctorId) queryParams.set('doctorId', resolved.doctorId);

  const [appointmentsRes, doctors] = await Promise.all([
    api
      .get<{ data: CalendarAppointment[] }>(`/appointments?${queryParams.toString()}`)
      .catch(() => ({ data: [] })),
    getDoctors().catch(() => []),
  ]);

  const targetDoctorId = resolved.doctorId || doctors[0]?.id;
  const scheduleRes = targetDoctorId
    ? await api
        .get<AvailableSlotsResponse>(`/doctor-schedule/${targetDoctorId}/available-slots?date=${encodeURIComponent(selectedDate)}`)
        .catch(() => null)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            تقويم المواعيد والحجوزات
          </h1>
          <p className="text-sm text-muted-foreground">
            عرض الفترات الزمنية الشاغرة والمحجوزة بالساعة لكل طبيب وإدارة حجوزات العيادة
          </p>
        </div>
      </div>

      <AppointmentCalendar
        initialAppointments={appointmentsRes.data}
        doctors={doctors}
        currentDoctorId={resolved.doctorId}
        userRole="RECEPTION"
        initialDate={selectedDate}
        initialScheduleData={scheduleRes}
      />
    </div>
  );
}

