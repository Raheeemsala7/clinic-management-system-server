import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { ar } from '@/messages/ar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { todayClinicDate, formatTime, formatMoney } from '@/lib/utils';
import { getDoctors } from '@/lib/doctor';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { AppointmentRowActions } from './appointment-row-actions';
import { AppointmentCalendar, type CalendarAppointment } from '@/components/appointments/appointment-calendar';
import { PayRemainingDialog } from '@/components/payments/pay-remaining-dialog';
import type { PaginatedResult, PatientBasic } from '@/features/patients/queries';
import { Calendar, Filter, Users, Clock, AlertCircle, CalendarDays, List, Coins, Gift } from 'lucide-react';
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
  type: 'CONSULTATION' | 'FOLLOW_UP';
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

  const resolvedParams = await searchParams;
  const today = todayClinicDate();
  const selectedDate = resolvedParams.date ?? today;
  const selectedStatus = resolvedParams.status ?? '';
  const currentView = resolvedParams.view ?? 'calendar'; // default to calendar
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
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="size-6 text-primary" />
            {ar.nav.appointments}
          </h1>
          <p className="text-sm text-muted-foreground">
            إدارة مواعيد العيادة، الفترات الزمنية المتاحة، والتحصيل المالي
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
                عرض التقويم
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
                عرض الجدول
              </Link>
            </Button>
          </div>

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
                    <Link href="/admin/appointments?view=table">{ar.common.reset}</Link>
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
                        <TableHead>{ar.common.time}</TableHead>
                        <TableHead>الرسوم والمدفوعات</TableHead>
                        <TableHead>{ar.common.status}</TableHead>
                        <TableHead className="text-start">{ar.common.actions}</TableHead>
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
                                  <span>معفي / مجاني</span>
                                </Badge>
                              ) : hasRemaining ? (
                                <div className="space-y-1">
                                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs font-mono">
                                    <Coins className="size-3" />
                                    <span>عربون: باقي {appt.remainingAmount} ج.م</span>
                                  </Badge>
                                  <div>
                                    <PayRemainingDialog
                                      appointmentId={appt.id}
                                      patientName={appt.patient?.fullName || 'المريض'}
                                      totalAmount={appt.totalAmount || 0}
                                      remainingAmount={appt.remainingAmount || 0}
                                    />
                                  </div>
                                </div>
                              ) : (appt.totalAmount ?? 0) > 0 ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-mono">
                                  مدفوع بالكامل ({appt.totalAmount} ج.م)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  غير محدد
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appt.status)}
                            </TableCell>
                            <TableCell>
                              <AppointmentRowActions id={appt.id} status={appt.status} />
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
