'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  type DoctorDaySchedule,
  type DoctorScheduleData,
  type DoctorScheduleShift,
  updateDoctorScheduleAction,
} from '@/features/doctor-schedule/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useI18n } from '@/i18n/use-i18n';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

const DAYS_CONFIG = [
  { dayOfWeek: 0, arName: 'الأحد', enName: 'Sunday', defaultWorking: true },
  { dayOfWeek: 1, arName: 'الاثنين', enName: 'Monday', defaultWorking: true },
  { dayOfWeek: 2, arName: 'الثلاثاء', enName: 'Tuesday', defaultWorking: true },
  { dayOfWeek: 3, arName: 'الأربعاء', enName: 'Wednesday', defaultWorking: true },
  { dayOfWeek: 4, arName: 'الخميس', enName: 'Thursday', defaultWorking: true },
  { dayOfWeek: 5, arName: 'الجمعة', enName: 'Friday', defaultWorking: false },
  { dayOfWeek: 6, arName: 'السبت', enName: 'Saturday', defaultWorking: false },
];

interface ScheduleFormProps {
  doctorId: string;
  doctorName?: string;
  initialSchedule: DoctorScheduleData;
}

export function DoctorScheduleForm({ doctorId, doctorName, initialSchedule }: ScheduleFormProps) {
  const { isAr, t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slotDuration, setSlotDuration] = useState<number>(initialSchedule.slotDurationMinutes || 30);
  const [weeklySchedule, setWeeklySchedule] = useState<DoctorDaySchedule[]>(() => {
    return DAYS_CONFIG.map((day) => {
      const existing = initialSchedule.weeklySchedule.find((s) => s.dayOfWeek === day.dayOfWeek);
      if (existing) return existing;
      return {
        dayOfWeek: day.dayOfWeek,
        isAvailable: day.defaultWorking,
        shifts: day.defaultWorking
          ? [
              { startTime: '08:00', endTime: '12:00' },
              { startTime: '16:00', endTime: '21:00' },
            ]
          : [],
      };
    });
  });

  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const slotDurations = [
    { value: 15, label: isAr ? '15 دقيقة' : '15 minutes' },
    { value: 20, label: isAr ? '20 دقيقة' : '20 minutes' },
    { value: 30, label: isAr ? '30 دقيقة (الافتراضي)' : '30 minutes (Default)' },
    { value: 45, label: isAr ? '45 دقيقة' : '45 minutes' },
    { value: 60, label: isAr ? '60 دقيقة (ساعة)' : '60 minutes (1 hour)' },
  ];

  const toggleDayAvailable = (dayOfWeek: number, isAvailable: boolean) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        let newShifts = day.shifts;
        if (isAvailable && (!newShifts || newShifts.length === 0)) {
          newShifts = [
            { startTime: '08:00', endTime: '12:00' },
            { startTime: '16:00', endTime: '21:00' },
          ];
        }
        return {
          ...day,
          isAvailable,
          shifts: isAvailable ? newShifts : [],
        };
      }),
    );
    setSavedSuccess(false);
  };

  const addShift = (dayOfWeek: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        const lastShift = day.shifts[day.shifts.length - 1];
        const newStart = lastShift ? lastShift.endTime : '16:00';
        const newEnd = lastShift ? '21:00' : '20:00';
        return {
          ...day,
          shifts: [...day.shifts, { startTime: newStart, endTime: newEnd }],
        };
      }),
    );
    setSavedSuccess(false);
  };

  const removeShift = (dayOfWeek: number, shiftIndex: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        return {
          ...day,
          shifts: day.shifts.filter((_, idx) => idx !== shiftIndex),
        };
      }),
    );
    setSavedSuccess(false);
  };

  const updateShift = (
    dayOfWeek: number,
    shiftIndex: number,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    setWeeklySchedule((prev) =>
      prev.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;
        return {
          ...day,
          shifts: day.shifts.map((s, idx) => {
            if (idx !== shiftIndex) return s;
            return { ...s, [field]: value };
          }),
        };
      }),
    );
    setSavedSuccess(false);
  };

  const applyDefaultPreset = () => {
    setWeeklySchedule(
      DAYS_CONFIG.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        isAvailable: day.dayOfWeek < 5, // Sun - Thu
        shifts:
          day.dayOfWeek < 5
            ? [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '16:00', endTime: '21:00' },
              ]
            : [],
      })),
    );
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    // Validate shifts
    for (const day of weeklySchedule) {
      if (day.isAvailable) {
        const dayConfig = DAYS_CONFIG.find((d) => d.dayOfWeek === day.dayOfWeek);
        const dayName = isAr ? dayConfig?.arName : dayConfig?.enName;
        if (!day.shifts || day.shifts.length === 0) {
          setError(
            isAr
              ? `يرجى إضافة فترة عمل واحدة على الأقل ليوم ${dayName} أو تعيينه كيوم إجازة.`
              : `Please add at least one shift for ${dayName} or set it as off-day.`,
          );
          return;
        }
        for (const shift of day.shifts) {
          if (!shift.startTime || !shift.endTime) {
            setError(
              isAr
                ? 'يرجى ملء جميع أوقات البدء والانتهاء لفترات العمل.'
                : 'Please fill all start and end times for work shifts.',
            );
            return;
          }
          if (shift.startTime >= shift.endTime) {
            setError(
              isAr
                ? `وقت بدء الفترة (${shift.startTime}) يجب أن يسبق وقت الانتهاء (${shift.endTime}).`
                : `Shift start time (${shift.startTime}) must precede end time (${shift.endTime}).`,
            );
            return;
          }
        }
      }
    }

    startTransition(async () => {
      const res = await updateDoctorScheduleAction(doctorId, {
        slotDurationMinutes: slotDuration,
        weeklySchedule,
      });

      if (res.success) {
        setSavedSuccess(true);
        router.refresh();
      } else {
        setError(res.error || (isAr ? 'حدث خطأ أثناء حفظ الجدول' : 'An error occurred while saving the schedule'));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Card */}
      <Card className="shadow-sm border-primary/20 bg-gradient-to-r from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                {isAr ? 'تحديد مواعيد العمل وفترات الكشف الأسبوعية' : 'Weekly Working Hours & Shifts'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? 'حدد أيام وفترات عملك المتاحة حتى تظهر تلقائياً لموظفي الاستقبال لحجز المرضى دون تعارض'
                  : 'Define your available working days and shifts so reception staff can schedule appointments without conflicts'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyDefaultPreset}
                className="text-xs gap-1.5"
              >
                <Sparkles className="size-3.5 text-primary" />
                {isAr
                  ? 'تطبيق الجدول النموذجي (الأحد-الخميس فترتين)'
                  : 'Apply Typical Schedule (Sun-Thu 2 Shifts)'}
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2 px-5">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isAr ? 'حفظ الجدول' : 'Save Schedule'}
              </Button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t flex items-center gap-4 flex-wrap">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                {isAr ? 'مدة الكشف / الموعد التقريبي' : 'Appointment / Slot Duration'}
              </Label>
              <select
                value={slotDuration}
                onChange={(e) => {
                  setSlotDuration(Number(e.target.value));
                  setSavedSuccess(false);
                }}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm font-medium"
              >
                {slotDurations.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground self-end pb-2">
              {isAr
                ? 'يتم تقسيم فترات العمل تلقائياً إلى مواعيد قابلة للاختيار بناءً على هذه المدة (مثلاً من 8:00 إلى 12:00 = 8 فترات كشف).'
                : 'Working shifts are automatically divided into bookable slots based on this duration (e.g. 8:00 to 12:00 = 8 slots).'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {savedSuccess && (
        <Alert className="border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="font-medium">
            {isAr
              ? 'تم حفظ جدول المواعيد الأسبوعي بنجاح! ستظهر هذه المواعيد لموظف الاستقبال عند اختيار أي يوم.'
              : 'Weekly schedule saved successfully! These slots will now appear to reception when booking.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Days of Week Cards */}
      <div className="space-y-3">
        {DAYS_CONFIG.map((dayConfig) => {
          const daySchedule = weeklySchedule.find((s) => s.dayOfWeek === dayConfig.dayOfWeek) || {
            dayOfWeek: dayConfig.dayOfWeek,
            isAvailable: false,
            shifts: [],
          };
          const isAvailable = daySchedule.isAvailable;
          const dayName = isAr ? `يوم ${dayConfig.arName}` : dayConfig.enName;

          return (
            <Card
              key={dayConfig.dayOfWeek}
              className={`transition-colors ${
                isAvailable ? 'border-border shadow-sm' : 'bg-muted/30 border-dashed opacity-85'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* Day Title & Toggle */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        id={`day-${dayConfig.dayOfWeek}`}
                        checked={isAvailable}
                        onCheckedChange={(checked) => toggleDayAvailable(dayConfig.dayOfWeek, checked)}
                      />
                      <Label
                        htmlFor={`day-${dayConfig.dayOfWeek}`}
                        className="text-base font-bold cursor-pointer"
                      >
                        {dayName}
                      </Label>
                    </div>

                    <Badge variant={isAvailable ? 'default' : 'outline'} className="text-xs">
                      {isAvailable
                        ? (isAr ? 'متاح للعمل' : 'Active / Working')
                        : (isAr ? 'عطلة / غير متاح' : 'Off-day / Unavailable')}
                    </Badge>
                  </div>

                  {/* Shifts Control */}
                  {isAvailable ? (
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">
                          {isAr
                            ? `فترات العمل (${daySchedule.shifts.length} فترة):`
                            : `Working shifts (${daySchedule.shifts.length}):`}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addShift(dayConfig.dayOfWeek)}
                          className="text-xs h-7 gap-1 text-primary hover:text-primary"
                        >
                          <Plus className="size-3.5" />
                          {isAr ? 'إضافة فترة عمل أخرى' : 'Add another shift'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {daySchedule.shifts.map((shift, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-muted/40 p-2.5 rounded-lg border flex-wrap text-sm"
                          >
                            <span className="text-xs font-semibold text-muted-foreground w-16">
                              {isAr ? `الفترة ${idx + 1}:` : `Shift ${idx + 1}:`}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{isAr ? 'من' : 'From'}</span>
                              <Input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) =>
                                  updateShift(dayConfig.dayOfWeek, idx, 'startTime', e.target.value)
                                }
                                className="h-8 w-28 text-center font-mono text-xs"
                                required
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{isAr ? 'إلى' : 'To'}</span>
                              <Input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) =>
                                  updateShift(dayConfig.dayOfWeek, idx, 'endTime', e.target.value)
                                }
                                className="h-8 w-28 text-center font-mono text-xs"
                                required
                              />
                            </div>

                            {daySchedule.shifts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeShift(dayConfig.dayOfWeek, idx)}
                                className="h-8 px-2 text-destructive hover:bg-destructive/10 ms-auto"
                                title={isAr ? 'حذف الفترة' : 'Delete shift'}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic flex items-center gap-1.5 py-1">
                      <span>
                        {isAr
                          ? 'إجازة أسبوعية — لن تظهر أي مواعيد للاستقبال في هذا اليوم'
                          : 'Weekly off-day — No booking slots will be generated for reception on this day'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-4 bg-background/95 p-4 rounded-lg shadow-md border backdrop-blur">
        <Button type="button" variant="outline" onClick={() => router.push('/doctor')}>
          {isAr ? 'العودة' : 'Back'}
        </Button>
        <Button type="submit" disabled={isPending} className="gap-2 px-6">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isAr ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
