import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { todayClinicDate, formatTime } from '@/lib/utils';
import { getDoctors } from '@/lib/doctor';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { AppointmentRowActions } from './appointment-row-actions';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';
import { Calendar, Filter, Users, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface AppointmentItem {
  id: string;
  queueNumber: number;
  queueOrder: number;
  clinicDate: string;
  scheduledAt: string | null;
  arrivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'SCHEDULED' | 'WALK_IN';
  type: 'CONSULTATION' | 'FOLLOW_UP';
  postponedCount: number;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    gender: string;
    dateOfBirth: string | null;
  };
  doctor: {
    id: string;
    name: string;
  };
}

interface AdminAppointmentsPageProps {
  searchParams: Promise<{ date?: string; status?: string; page?: string }>;
}

export default async function AdminAppointmentsPage({ searchParams }: AdminAppointmentsPageProps) {
  await requireRole(['ADMIN']);

  const resolvedParams = await searchParams;
  const today = todayClinicDate();
  const selectedDate = resolvedParams.date ?? today;
  const selectedStatus = resolvedParams.status ?? '';
  const page = Number(resolvedParams.page) || 1;

  const queryParams = new URLSearchParams();
  if (selectedDate) queryParams.set('date', selectedDate);
  if (selectedStatus) queryParams.set('status', selectedStatus);
  queryParams.set('page', String(page));
  queryParams.set('pageSize', '25');

  const [appointmentsRes, doctors, patientsRes] = await Promise.all([
    api.get<{ data: AppointmentItem[]; meta: { total: number; totalPages: number } }>(
      `/appointments?${queryParams}`,
    ).catch(() => ({ data: [], meta: { total: 0, totalPages: 1 } })),
    getDoctors(),
    api.get<PaginatedResult<PatientBasic>>('/patients?pageSize=50').catch(() => ({ data: [] })),
  ]);

  const appointments = appointmentsRes.data ?? [];
  const meta = appointmentsRes.meta ?? { total: 0, totalPages: 1 };

  // Status badge style helper
  const getStatusBadge = (status: AppointmentItem['status']) => {
    switch (status) {
      case 'WAITING':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{ar.appointmentStatus.WAITING}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-600 hover:bg-blue-600 animate-pulse">{ar.appointmentStatus.IN_PROGRESS}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">{ar.appointmentStatus.COMPLETED}</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-muted-foreground">{ar.appointmentStatus.CANCELLED}</Badge>;
      case 'NO_SHOW':
        return <Badge variant="destructive">{ar.appointmentStatus.NO_SHOW}</Badge>;
      case 'BOOKED':
      default:
        return <Badge variant="outline" className="border-primary/40 text-primary">{ar.appointmentStatus.BOOKED}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{ar.nav.appointments}</h1>
          <p className="text-sm text-muted-foreground">
            إدارة مواعيد العيادة وقائمة الحجوزات ({meta.total} {ar.nav.appointments})
          </p>
        </div>
        <NewAppointmentDialog
          doctors={doctors}
          recentPatients={patientsRes.data.map((p) => ({ id: p.id, fullName: p.fullName, phone: p.phone }))}
        />
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-sm">
        <CardContent className="p-3">
          <form method="GET" className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3.5" />
                {ar.common.date}:
              </span>
              <input
                type="date"
                name="date"
                defaultValue={selectedDate}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Filter className="size-3.5" />
                {ar.common.status}:
              </span>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{ar.common.all}</option>
                <option value="WAITING">{ar.appointmentStatus.WAITING}</option>
                <option value="IN_PROGRESS">{ar.appointmentStatus.IN_PROGRESS}</option>
                <option value="BOOKED">{ar.appointmentStatus.BOOKED}</option>
                <option value="COMPLETED">{ar.appointmentStatus.COMPLETED}</option>
                <option value="CANCELLED">{ar.appointmentStatus.CANCELLED}</option>
                <option value="NO_SHOW">{ar.appointmentStatus.NO_SHOW}</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="h-9 px-4 text-xs">
              {ar.common.apply}
            </Button>

            {(selectedDate !== today || selectedStatus) && (
              <Button variant="ghost" size="sm" asChild className="h-9 px-3 text-xs">
                <Link href="/admin/appointments">{ar.common.reset}</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table of Appointments */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="size-10 mx-auto mb-2 text-muted-foreground/40" />
              <p className="font-medium">{ar.common.noData}</p>
              <p className="text-xs text-muted-foreground mt-1">لا توجد مواعيد مسجلة بالتاريخ أو الفلتر المحدد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{ar.queue.number}</TableHead>
                    <TableHead>{ar.common.patient}</TableHead>
                    <TableHead>{ar.common.doctor}</TableHead>
                    <TableHead>{ar.common.reason}</TableHead>
                    <TableHead>{ar.common.status}</TableHead>
                    <TableHead>{ar.common.time}</TableHead>
                    <TableHead className="text-start">{ar.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-mono font-bold text-sm">
                        #{appt.queueNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{appt.patient?.fullName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{appt.patient?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {appt.doctor?.name}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <span className="block font-medium">
                            {appt.type === 'CONSULTATION' ? ar.appointmentType.CONSULTATION : ar.appointmentType.FOLLOW_UP}
                          </span>
                          <span className="block text-muted-foreground">
                            {appt.source === 'SCHEDULED' ? ar.appointmentSource.SCHEDULED : ar.appointmentSource.WALK_IN}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appt.status)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {appt.scheduledAt ? formatTime(appt.scheduledAt) : (appt.arrivedAt ? formatTime(appt.arrivedAt) : '-')}
                      </TableCell>
                      <TableCell>
                        <AppointmentRowActions id={appt.id} status={appt.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-4">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              className="size-9 p-0"
              asChild
            >
              <Link href={`?date=${selectedDate}&status=${selectedStatus}&page=${p}`}>{p}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
