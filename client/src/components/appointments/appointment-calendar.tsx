'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTime, todayClinicDate } from '@/lib/utils';
import { useI18n } from '@/i18n/use-i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import {
  Calendar as CalendarIcon,
  CalendarX,
  Clock,
  User,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Coins,
  Gift,
  AlertCircle,
  Filter,
  Settings,
  Loader2,
  CalendarPlus,
  Edit,
} from 'lucide-react';
import type { DoctorOption } from '@/lib/doctor';
import {
  type AvailableSlotsResponse,
  getDoctorAvailableSlotsAction,
} from '@/features/doctor-schedule/actions';

export interface CalendarAppointment {
  id: string;
  queueNumber: number;
  clinicDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scheduledAt?: string | null;
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'SCHEDULED' | 'WALK_IN';
  type: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentStatus?: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT';
  isExempt?: boolean;
  exemptionReason?: string | null;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  doctor?: {
    id: string;
    name: string;
  } | null;
}

interface AppointmentCalendarProps {
  initialAppointments: CalendarAppointment[];
  doctors: DoctorOption[];
  currentDoctorId?: string;
  userRole: 'RECEPTION' | 'DOCTOR' | 'ADMIN';
  initialDate?: string;
  initialScheduleData?: AvailableSlotsResponse | null;
}

// Fallback working hours only if no doctor is selected in reception/admin view
const DEFAULT_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
];

export function AppointmentCalendar({
  initialAppointments,
  doctors,
  currentDoctorId,
  userRole,
  initialDate,
  initialScheduleData,
}: AppointmentCalendarProps) {
  const router = useRouter();
  const { t, locale, isAr } = useI18n();
  const currency = isAr ? 'ج.م' : 'EGP';
  const today = todayClinicDate();
  const [selectedDate, setSelectedDate] = useState(initialDate || today);
  const [selectedDoctorId, setSelectedDoctorId] = useState(currentDoctorId || doctors[0]?.id || '');
  const [scheduleData, setScheduleData] = useState<AvailableSlotsResponse | null>(initialScheduleData || null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // Fetch doctor available slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId) {
      setScheduleData(null);
      return;
    }

    if (
      initialScheduleData &&
      initialScheduleData.doctorId === selectedDoctorId &&
      selectedDate === (initialDate || today)
    ) {
      setScheduleData(initialScheduleData);
      return;
    }

    let active = true;
    setIsLoadingSchedule(true);
    getDoctorAvailableSlotsAction(selectedDoctorId, selectedDate)
      .then((data) => {
        if (active) {
          setScheduleData(data);
          setIsLoadingSchedule(false);
        }
      })
      .catch(() => {
        if (active) {
          setScheduleData(null);
          setIsLoadingSchedule(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDoctorId, selectedDate, currentDoctorId, initialScheduleData]);

  // Navigate dates
  const handleDateChange = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    const params = new URLSearchParams(window.location.search);
    params.set('date', newDateStr);
    if (selectedDoctorId) params.set('doctorId', selectedDoctorId);
    router.push(`?${params.toString()}`);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    handleDateChange(today);
  };

  // Filter appointments for the selected date and doctor
  const appointmentsForDate = useMemo(() => {
    return initialAppointments.filter((a) => {
      const matchDate = a.clinicDate === selectedDate;
      const matchDoc = !selectedDoctorId || a.doctor?.id === selectedDoctorId;
      return matchDate && matchDoc;
    });
  }, [initialAppointments, selectedDate, selectedDoctorId]);

  // Active working slots: ONLY show the doctor's available working shifts for this date!
  const activeSlots = useMemo(() => {
    if (scheduleData) {
      if (!scheduleData.isWorkingDay) {
        return [];
      }
      return scheduleData.slots.map((s) => s.startTime);
    }
    // Only fall back to default slots if no doctor is chosen
    return selectedDoctorId ? [] : DEFAULT_TIME_SLOTS;
  }, [scheduleData, selectedDoctorId]);

  // Map appointments to time slots
  const slotMap = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const slot of activeSlots) {
      map.set(slot, []);
    }

    const unassigned: CalendarAppointment[] = [];

    for (const appt of appointmentsForDate) {
      if (appt.startTime && map.has(appt.startTime)) {
        map.get(appt.startTime)!.push(appt);
      } else if (appt.scheduledAt) {
        const time = new Date(appt.scheduledAt).toISOString().substring(11, 16);
        if (map.has(time)) {
          map.get(time)!.push(appt);
        } else {
          unassigned.push(appt);
        }
      } else {
        unassigned.push(appt);
      }
    }

    return { map, unassigned };
  }, [activeSlots, appointmentsForDate]);

  // Statistics
  const totalBooked = appointmentsForDate.length;
  const totalPaid = appointmentsForDate.reduce((acc, a) => acc + (a.paidAmount || 0), 0);
  const totalRemaining = appointmentsForDate.reduce((acc, a) => acc + (a.remainingAmount || 0), 0);
  const totalExempt = appointmentsForDate.filter((a) => a.isExempt).length;

  const isOffDay = scheduleData && !scheduleData.isWorkingDay;

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        {/* Date Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-lg overflow-hidden bg-background">
            <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-9 w-9">
              <ChevronRight className="size-4" />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 text-sm font-semibold bg-transparent border-0 focus:outline-none cursor-pointer"
            />
            <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-9 w-9">
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          <Button
            variant={selectedDate === today ? 'default' : 'outline'}
            size="sm"
            onClick={handleToday}
            className="text-xs font-bold"
          >
            {t.common.today}
          </Button>

          {/* Doctor filter dropdown for Reception and Admin */}
          {userRole !== 'DOCTOR' && doctors.length > 0 && (
            <div className="flex items-center gap-1.5 mr-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  const params = new URLSearchParams(window.location.search);
                  params.set('date', selectedDate);
                  if (e.target.value) params.set('doctorId', e.target.value);
                  else params.delete('doctorId');
                  router.push(`?${params.toString()}`);
                }}
                className="h-9 px-3 text-xs font-semibold rounded-lg border border-input bg-background"
              >
                <option value="">{t.calendar.allDoctors}</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t.calendar.doctorPrefix} {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dedicated Booking Page Action */}
        {userRole !== 'DOCTOR' && !isOffDay && (
          <Button asChild className="gap-2 bg-primary text-primary-foreground font-bold shadow-sm">
            <Link
              href={`/${userRole.toLowerCase()}/appointments/new?doctorId=${encodeURIComponent(
                selectedDoctorId || doctors[0]?.id || ''
              )}&date=${encodeURIComponent(selectedDate)}`}
            >
              <CalendarPlus className="size-4" />
              {locale === 'en' ? 'New Booking' : 'حجز موعد جديد'}
            </Link>
          </Button>
        )}
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-muted-foreground block">{t.calendar.todayAppointments}</span>
            <span className="text-2xl font-bold text-primary font-mono">{totalBooked}</span>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/70 border-emerald-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-emerald-800 block font-medium">{t.calendar.paidDeposits}</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono">{totalPaid} {currency}</span>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/70 border-amber-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-amber-800 block font-medium">{t.calendar.remainingToCollect}</span>
            <span className="text-2xl font-bold text-amber-700 font-mono">{totalRemaining} {currency}</span>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/70 border-purple-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-purple-800 block font-medium">{t.calendar.exemptCases}</span>
            <span className="text-2xl font-bold text-purple-700 font-mono">{totalExempt}</span>
          </CardContent>
        </Card>
      </div>

      {/* CALENDAR TIMELINE & SLOTS */}
      <Card className="shadow-sm border">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span>{t.calendar.slotsTableTitle}</span>
            <span className="text-xs font-normal text-muted-foreground">({selectedDate})</span>
            {isLoadingSchedule && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
          </CardTitle>

          {/* Schedule Status & Shifts Header */}
          {scheduleData && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {!scheduleData.isWorkingDay ? (
                <Badge variant="destructive" className="font-semibold gap-1">
                  <CalendarX className="size-3" />
                  {t.calendar.weeklyOff}
                </Badge>
              ) : (
                <>
                  <span className="text-muted-foreground font-mono">
                    {t.calendar.workingShifts}: {scheduleData.shifts.map((s) => `${s.startTime} - ${s.endTime}`).join(' | ')}
                  </span>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {scheduleData.slotDurationMinutes} {t.calendar.minPerExam}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[11px] font-mono">
                    {scheduleData.availableCount} {t.calendar.vacant}
                  </Badge>
                </>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 space-y-2.5">
          {/* OFF DAY BANNER (Doctor not available on this day) */}
          {isOffDay && (
            <div className="p-8 text-center rounded-xl border border-dashed bg-amber-50/50 border-amber-200/80 space-y-3 my-2">
              <div className="size-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <CalendarX className="size-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {t.calendar.doctorNotAvailable} ({scheduleData.dayName})
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {t.calendar.doctorOffDesc}
                </p>
              </div>
              {userRole === 'DOCTOR' && (
                <div className="pt-2">
                  <Link href="/doctor/schedule">
                    <Button variant="outline" size="sm" className="gap-2 text-xs border-amber-300 hover:bg-amber-100/50">
                      <Settings className="size-3.5" />
                      {t.calendar.editWorkingHours}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE WORKING SLOTS (Only hours inside doctor's working shifts) */}
          {activeSlots.map((slotTime) => {
            const bookedAppts = slotMap.map.get(slotTime) || [];
            const isBooked = bookedAppts.length > 0;

            return (
              <div
                key={slotTime}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isBooked
                    ? 'bg-card border-primary/30 shadow-sm'
                    : 'bg-muted/10 border-dashed border-border/80 hover:bg-muted/30'
                  }`}
              >
                {/* Time Indicator */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${isBooked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {slotTime}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block font-mono">{slotTime}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {isBooked
                        ? `${bookedAppts.length} ${bookedAppts.length === 1 ? t.calendar.bookedPatient : t.calendar.bookedPatients}`
                        : t.calendar.availableSlot}
                    </span>
                  </div>
                </div>

                {/* Appointment Content or Available Slot Booking */}
                {isBooked ? (
                  <div className="flex-1 flex flex-wrap items-center justify-between gap-3 border-t sm:border-t-0 sm:border-r pr-0 sm:pr-4 pt-2 sm:pt-0">
                    {bookedAppts.map((appt) => (
                      <div key={appt.id} className="flex-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">
                              {appt.patient?.fullName || t.calendar.unspecifiedPatient}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                              #{appt.queueNumber}
                            </Badge>
                            <AppointmentTypeBadge type={appt.type} locale={locale} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                            <span>{appt.patient?.phone}</span>
                            {appt.doctor && <span>• {t.calendar.doctorPrefix} {appt.doctor.name}</span>}
                          </p>
                        </div>

                        {/* Financial and Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {appt.isExempt ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 text-xs">
                              <Gift className="size-3" />
                              <span>{t.calendar.exemptBadge}</span>
                            </Badge>
                          ) : (appt.remainingAmount ?? 0) > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs font-mono">
                              <Coins className="size-3" />
                              <span>{t.calendar.depositRemaining} {appt.remainingAmount} {currency}</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs font-mono">
                              <CheckCircle className="size-3" />
                              <span>{t.calendar.fullyPaid} ({appt.totalAmount} {currency})</span>
                            </Badge>
                          )}

                          <Badge
                            variant={
                              appt.status === 'COMPLETED'
                                ? 'default'
                                : appt.status === 'IN_PROGRESS'
                                  ? 'destructive'
                                  : appt.status === 'WAITING'
                                    ? 'secondary'
                                    : 'outline'
                            }
                            className="text-xs"
                          >
                            {t.appointmentStatus[appt.status as keyof typeof t.appointmentStatus] || appt.status}
                          </Badge>

                          {userRole !== 'DOCTOR' && (
                            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <Link
                                href={`/${userRole.toLowerCase()}/appointments/${appt.id}/edit`}
                                title={locale === 'en' ? 'Edit Booking' : 'تعديل الحجز'}
                              >
                                <Edit className="size-3.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between border-t sm:border-t-0 sm:border-r pr-0 sm:pr-4 pt-2 sm:pt-0">
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Clock className="size-3.5 text-emerald-500" />
                      {locale === 'en' ? 'Slot available for booking' : 'الموعد متاح للحجز'}
                    </span>

                    {userRole !== 'DOCTOR' && (
                      <Button asChild size="sm" variant="ghost" className="h-8 text-xs text-primary gap-1 hover:bg-primary/10">
                        <Link
                          href={`/${userRole.toLowerCase()}/appointments/new?doctorId=${encodeURIComponent(
                            selectedDoctorId || doctors[0]?.id || ''
                          )}&date=${encodeURIComponent(selectedDate)}&startTime=${encodeURIComponent(slotTime)}`}
                        >
                          <Plus className="size-3.5" />
                          {locale === 'en' ? 'Book this slot' : 'حجز هذه الفترة'}
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned or walk-in queue appointments or bookings outside working shifts */}
          {slotMap.unassigned.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">
                {isOffDay
                  ? (locale === 'en' ? 'Bookings registered for this date:' : 'حجوزات مسجلة مسبقاً في هذا اليوم:')
                  : (locale === 'en' ? 'Additional / Walk-in bookings:' : 'حجوزات إضافية / حضور مباشر غير مقترنة بفترة شاغرة:')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slotMap.unassigned.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold">{a.patient?.fullName}</p>
                      <p className="text-muted-foreground font-mono">
                        {a.startTime ? `${a.startTime} • ` : ''}{t.calendar.queueNumber} #{a.queueNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <AppointmentTypeBadge type={a.type} locale={locale} size="sm" />
                      {a.isExempt ? (
                        <Badge className="bg-purple-100 text-purple-800">{isAr ? 'معفي' : 'Exempt'}</Badge>
                      ) : (a.remainingAmount ?? 0) > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800 font-mono">
                          {isAr ? 'باقي' : 'Due'} {a.remainingAmount} {currency}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 font-mono">{isAr ? 'مدفوع' : 'Paid'}</Badge>
                      )}
                      {userRole !== 'DOCTOR' && (
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                          <Link
                            href={`/${userRole.toLowerCase()}/appointments/${a.id}/edit`}
                            title={locale === 'en' ? 'Edit Booking' : 'تعديل الحجز'}
                          >
                            <Edit className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
