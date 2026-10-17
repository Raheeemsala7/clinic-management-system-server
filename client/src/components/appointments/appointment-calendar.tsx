'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatTime, todayClinicDate } from '@/lib/utils';
import { ar } from '@/messages/ar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewReceptionBookingDialog } from '@/app/reception/new-reception-booking-dialog';
import {
  Calendar as CalendarIcon,
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
} from 'lucide-react';
import type { DoctorOption } from '@/lib/doctor';

export interface CalendarAppointment {
  id: string;
  queueNumber: number;
  clinicDate: string;
  startTime?: string | null;
  endTime?: string | null;
  scheduledAt?: string | null;
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'SCHEDULED' | 'WALK_IN';
  type: 'CONSULTATION' | 'FOLLOW_UP';
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
}

// Working hours from 09:00 AM to 09:00 PM (12 hours) in 30-min intervals
const TIME_SLOTS = [
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
}: AppointmentCalendarProps) {
  const router = useRouter();
  const today = todayClinicDate();
  const [selectedDate, setSelectedDate] = useState(initialDate || today);
  const [selectedDoctorId, setSelectedDoctorId] = useState(currentDoctorId || doctors[0]?.id || '');

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

  // Map appointments to time slots
  const slotMap = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>();
    for (const slot of TIME_SLOTS) {
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
  }, [appointmentsForDate]);

  // Statistics
  const totalBooked = appointmentsForDate.length;
  const totalPaid = appointmentsForDate.reduce((acc, a) => acc + (a.paidAmount || 0), 0);
  const totalRemaining = appointmentsForDate.reduce((acc, a) => acc + (a.remainingAmount || 0), 0);
  const totalExempt = appointmentsForDate.filter((a) => a.isExempt).length;

  const selectedDoctorName = doctors.find((d) => d.id === selectedDoctorId)?.name;

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
            اليوم
          </Button>

          {/* Doctor filter dropdown for Reception and Admin */}
          {userRole !== 'DOCTOR' && doctors.length > 0 && (
            <div className="flex items-center gap-1.5 mr-2">
              <Filter className="size-4 text-muted-foreground" />
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="h-9 px-3 text-xs font-semibold rounded-lg border border-input bg-background"
              >
                <option value="">جميع الأطباء</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    د. {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick Booking Button */}
        {userRole !== 'DOCTOR' && (
          <NewReceptionBookingDialog
            doctorId={selectedDoctorId || doctors[0]?.id || ''}
            doctorName={selectedDoctorName}
            defaultDate={selectedDate}
            triggerButton={
              <Button className="gap-2 bg-primary text-primary-foreground font-bold shadow-sm">
                <Plus className="size-4" />
                حجز موعد جديد
              </Button>
            }
          />
        )}
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-muted-foreground block">مواعيد اليوم</span>
            <span className="text-2xl font-bold text-primary font-mono">{totalBooked}</span>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/70 border-emerald-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-emerald-800 block font-medium">المدفوع / العربين</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono">{totalPaid} ج.م</span>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/70 border-amber-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-amber-800 block font-medium">المتبقي للتحصيل</span>
            <span className="text-2xl font-bold text-amber-700 font-mono">{totalRemaining} ج.م</span>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/70 border-purple-200">
          <CardContent className="p-3 text-center">
            <span className="text-xs text-purple-800 block font-medium">حالات معفية (مجاني)</span>
            <span className="text-2xl font-bold text-purple-700 font-mono">{totalExempt}</span>
          </CardContent>
        </Card>
      </div>

      {/* CALENDAR TIMELINE & SLOTS */}
      <Card className="shadow-sm border">
        <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span>جدول الفترات الزمنية المتاحة والمحجوزة</span>
            <span className="text-xs font-normal text-muted-foreground">({selectedDate})</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono">الفترة: 09:00 ص - 09:00 م (30 دقيقة/كشف)</span>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5">
          {TIME_SLOTS.map((slotTime) => {
            const bookedAppts = slotMap.map.get(slotTime) || [];
            const isBooked = bookedAppts.length > 0;

            return (
              <div
                key={slotTime}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isBooked
                    ? 'bg-card border-primary/30 shadow-sm'
                    : 'bg-muted/10 border-dashed border-border/80 hover:bg-muted/30'
                }`}
              >
                {/* Time Indicator */}
                <div className="flex items-center gap-3 sm:w-40 shrink-0">
                  <div
                    className={`size-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      isBooked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {slotTime}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block font-mono">{slotTime}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {isBooked ? `${bookedAppts.length} مريض محجوز` : 'فترة شاغرة'}
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
                              {appt.patient?.fullName || 'مريض غير محدد'}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                              #{appt.queueNumber}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                appt.type === 'CONSULTATION'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-teal-50 text-teal-700'
                              }`}
                            >
                              {appt.type === 'CONSULTATION' ? 'كشف' : 'استشارة'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                            <span>{appt.patient?.phone}</span>
                            {appt.doctor && <span>• د. {appt.doctor.name}</span>}
                          </p>
                        </div>

                        {/* Financial and Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {appt.isExempt ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 gap-1 text-xs">
                              <Gift className="size-3" />
                              <span>معفي / مجاني</span>
                            </Badge>
                          ) : (appt.remainingAmount ?? 0) > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-xs font-mono">
                              <Coins className="size-3" />
                              <span>عربون: باقي {appt.remainingAmount} ج.م</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs font-mono">
                              <CheckCircle className="size-3" />
                              <span>مدفوع بالكامل ({appt.totalAmount} ج.م)</span>
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
                            {ar.appointmentStatus[appt.status] || appt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between border-t sm:border-t-0 sm:border-r pr-0 sm:pr-4 pt-2 sm:pt-0">
                    <span className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                      <Clock className="size-3.5 text-emerald-500" />
                      الموعد متاح للحجز
                    </span>

                    {userRole !== 'DOCTOR' && (
                      <NewReceptionBookingDialog
                        doctorId={selectedDoctorId || doctors[0]?.id || ''}
                        doctorName={selectedDoctorName}
                        defaultDate={selectedDate}
                        defaultStartTime={slotTime}
                        triggerButton={
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-primary gap-1 hover:bg-primary/10">
                            <Plus className="size-3.5" />
                            حجز هذه الفترة
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Unassigned or walk-in queue appointments */}
          {slotMap.unassigned.length > 0 && (
            <div className="pt-4 border-t mt-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">
                حجوزات حضور مباشر غير مقترنة بساعة محددة:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {slotMap.unassigned.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-lg border bg-muted/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold">{a.patient?.fullName}</p>
                      <p className="text-muted-foreground font-mono">طابور #{a.queueNumber}</p>
                    </div>
                    {a.isExempt ? (
                      <Badge className="bg-purple-100 text-purple-800">معفي</Badge>
                    ) : (a.remainingAmount ?? 0) > 0 ? (
                      <Badge className="bg-amber-100 text-amber-800">باقي {a.remainingAmount} ج.م</Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800">مدفوع</Badge>
                    )}
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
