import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getServerI18n } from '@/i18n/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { todayClinicDate, formatTime } from '@/lib/utils';
import { getDoctors } from '@/lib/doctor';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { AppointmentRowActions } from './appointment-row-actions';
import { AppointmentCalendar, type CalendarAppointment } from '@/components/appointments/appointment-calendar';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import { PayRemainingDialog } from '@/components/payments/pay-remaining-dialog';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';
import { Calendar, Filter, CalendarDays, List, Coins, Gift, CalendarPlus, Edit } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface AppointmentItem {
  id: string;
  queueNumber: number;
  queueOrder: number;
  clinicDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scheduledAt: string | null;
  arrivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'SCHEDULED' | 'WALK_IN';
  type: string;
  postponedCount: number;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  isExempt?: boolean;
  exemptionReason?: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    gender: string;
    age?: number | null;
    dateOfBirth: string | null;
  };
  doctor: {
    id: string;
    name: string;
  };
}

interface AdminAppointmentsPageProps {
  searchParams: Promise<{ date?: string; status?: string; page?: string; view?: string; doctorId?: string }>;
}

export default async function AdminAppointmentsPage({ searchParams }: AdminAppointmentsPageProps) {
  await requireRole(['ADMIN']);
  const { t, locale, isAr } = await getServerI18n();
  const currency = isAr ? 'ج.م' : 'EGP';

  const resolvedParams = await searchParams;
  const today = todayClinicDate();
  const selectedDate = resolvedParams.date ?? today;
  const selectedStatus = resolvedParams.status ?? '';
  const currentView = resolvedParams.view ?? 'calendar';
  const selectedDoctorId = resolvedParams.doctorId ?? '';
  const page = Number(resolvedParams.page) || 1;

  const queryParams = new URLSearchParams();
  if (selectedDate) queryParams.set('date', selectedDate);
  if (selectedStatus) queryParams.set('status', selectedStatus);
  if (selectedDoctorId) queryParams.set('doctorId', selectedDoctorId);
  queryParams.set('page', String(page));
  queryParams.set('pageSize', '50');

  const [appointmentsRes, doctors, patientsRes] = await Promise.all([
    api.get<{ data: AppointmentItem[]; meta: { total: number; totalPages: number } }>(
      `/appointments?${queryParams.toString()}`,
    ).catch(() => ({ data: [], meta: { total: 0, totalPages: 1 } })),
    getDoctors().catch(() => []),
    api.get<PaginatedResult<PatientBasic>>('/patients?pageSize=50').catch(() => ({ data: [] })),
  ]);

  const appointments = appointmentsRes.data ?? [];
  const meta = appointmentsRes.meta ?? { total: 0, totalPages: 1 };

  const getStatusBadge = (status: AppointmentItem['status']) => {
    const label = t.appointmentStatus[status as keyof typeof t.appointmentStatus] || status;
    switch (status) {
      case 'WAITING':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{label}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-600 hover:bg-blue-600 animate-pulse">{label}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">{label}</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="text-muted-foreground">{label}</Badge>;
      case 'NO_SHOW':
        return <Badge variant="destructive">{label}</Badge>;
      case 'BOOKED':
      default:
        return <Badge variant="outline" className="border-primary/40 text-primary">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            {t.nav.appointments}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'إدارة مواعيد العيادة، الفترات الزمنية المتاحة، والتحصيل المالي'
              : 'Manage clinic appointments, available slots, and fee collections'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-muted p-1 rounded-lg border text-xs">
            <Button
              variant={currentView === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-bold"
              asChild
            >
              <Link href={`?date=${selectedDate}&view=calendar${selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''}`}>
                <CalendarDays className="size-3.5" />
                {t.adminAppointments.calendarView}
              </Link>
            </Button>
            <Button
              variant={currentView === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs font-bold"
              asChild
            >
              <Link href={`?date=${selectedDate}&view=table${selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ''}`}>
                <List className="size-3.5" />
                {t.adminAppointments.tableView}
              </Link>
            </Button>
          </div>

          <Button asChild className="gap-2 bg-primary text-primary-foreground font-bold shadow-sm">
            <Link href="/admin/appointments/new">
              <CalendarPlus className="size-4" />
              {isAr ? 'حجز موعد جديد' : 'New Booking'}
            </Link>
          </Button>

          <NewAppointmentDialog
            doctors={doctors}
            recentPatients={patientsRes.data.map((p) => ({ id: p.id, fullName: p.fullName, phone: p.phone }))}
          />
        </div>
      </div>

      {currentView === 'calendar' ? (
        /* CALENDAR VIEW */
        <AppointmentCalendar
          initialAppointments={appointments as unknown as CalendarAppointment[]}
          doctors={doctors}
          currentDoctorId={selectedDoctorId}
          userRole="ADMIN"
          initialDate={selectedDate}
        />
      ) : (
        /* TABLE LIST VIEW */
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <form method="GET" className="flex items-center gap-3 flex-wrap">
                <input type="hidden" name="view" value="table" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {t.common.date}:
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
                    {t.common.status}:
                  </span>
                  <select
                    name="status"
                    defaultValue={selectedStatus}
                    className="flex h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{t.common.all}</option>
                    <option value="WAITING">{t.appointmentStatus.WAITING}</option>
                    <option value="IN_PROGRESS">{t.appointmentStatus.IN_PROGRESS}</option>
                    <option value="BOOKED">{t.appointmentStatus.BOOKED}</option>
                    <option value="COMPLETED">{t.appointmentStatus.COMPLETED}</option>
                    <option value="CANCELLED">{t.appointmentStatus.CANCELLED}</option>
                    <option value="NO_SHOW">{t.appointmentStatus.NO_SHOW}</option>
                  </select>
                </div>

                <Button type="submit" size="sm" className="h-9 px-4 text-xs">
                  {t.common.apply}
                </Button>

                {(selectedDate !== today || selectedStatus) && (
                  <Button variant="ghost" size="sm" asChild className="h-9 px-3 text-xs">
                    <Link href="/admin/appointments?view=table">{t.common.reset}</Link>
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
                  <p className="font-medium">{t.common.noData}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.adminAppointments.noAppointmentsMatch}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t.queue.number}</TableHead>
                        <TableHead>{t.common.patient}</TableHead>
                        <TableHead>{t.queue.appointmentType}</TableHead>
                        <TableHead>{t.common.doctor}</TableHead>
                        <TableHead>{t.common.time}</TableHead>
                        <TableHead>{t.adminAppointments.financials}</TableHead>
                        <TableHead>{t.common.status}</TableHead>
                        <TableHead className="text-start">{t.common.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appt) => {
                        const hasRemaining = (appt.remainingAmount ?? 0) > 0;

                        return (
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
                            <TableCell>
                              <AppointmentTypeBadge type={appt.type} locale={locale} size="sm" />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {appt.doctor?.name}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {appt.startTime ? (
                                <span className="font-semibold text-foreground">{appt.startTime} {appt.endTime ? `- ${appt.endTime}` : ''}</span>
                              ) : appt.scheduledAt ? (
                                formatTime(appt.scheduledAt)
                              ) : appt.arrivedAt ? (
                                formatTime(appt.arrivedAt)
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {appt.isExempt ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 text-xs">
                                  <Gift className="size-3" />
                                  <span>{t.calendar.exemptBadge}</span>
                                </Badge>
                              ) : hasRemaining ? (
                                <div className="space-y-1">
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs font-mono">
                                    <Coins className="size-3" />
                                    <span>{t.calendar.depositRemaining} {appt.remainingAmount} {currency}</span>
                                  </Badge>
                                  <div>
                                    <PayRemainingDialog
                                      appointmentId={appt.id}
                                      patientName={appt.patient?.fullName || (isAr ? 'المريض' : 'Patient')}
                                      totalAmount={appt.totalAmount || 0}
                                      remainingAmount={appt.remainingAmount || 0}
                                    />
                                  </div>
                                </div>
                              ) : (appt.totalAmount ?? 0) > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-mono">
                                  {t.calendar.fullyPaid} ({appt.totalAmount} {currency})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  {isAr ? 'غير محدد' : 'Unspecified'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appt.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <Link href={`/admin/appointments/${appt.id}/edit`} title={isAr ? 'تعديل الحجز' : 'Edit Booking'}>
                                    <Edit className="size-4" />
                                  </Link>
                                </Button>
                                <AppointmentRowActions id={appt.id} status={appt.status} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
                  <Link href={`?date=${selectedDate}&status=${selectedStatus}&view=table&page=${p}`}>{p}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
