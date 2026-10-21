'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/use-i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorStatusBadge } from '@/components/shell/doctor-status-badge';
import { toast } from '@/components/ui/toast';
import { useQueueRealtime } from '@/hooks/use-queue-realtime';
import { completeAction, setDoctorStatusAction, startAction } from '@/features/queue/actions';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';
import { useRouter } from 'next/navigation';
import {
  Play,
  Stethoscope,
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  Coffee,
  Check,
} from 'lucide-react';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';

interface Visit {
  id: string;
  appointmentId: string;
  patientId: string;
  complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  instructions: string | null;
  followUpDate: string | null;
  status: 'OPEN' | 'CLOSED';
  version: number;
}

interface DoctorTodayScreenProps {
  doctorId: string;
  initialQueue: QueueEntry[];
  initialDoctorStatus: DoctorStatus;
  inProgressEntry: QueueEntry | null;
  currentVisit: Visit | null;
}

export function DoctorTodayScreen({
  doctorId,
  initialQueue,
  initialDoctorStatus,
  inProgressEntry,
  currentVisit,
}: DoctorTodayScreenProps) {
  const { t, locale, isAr } = useI18n();
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [doctorStatus, setDoctorStatus] = useState(initialDoctorStatus.status);
  const [completing, setCompleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [queueTab, setQueueTab] = useState<'WAITING' | 'COMPLETED' | 'ALL'>('WAITING');
  const router = useRouter();

  const { status: wsStatus } = useQueueRealtime({
    onQueueUpdate: (payload) => {
      if (Array.isArray(payload)) {
        setQueue(payload as QueueEntry[]);
        router.refresh();
      }
    },
    onDoctorStatusChanged: (payload) => {
      if (payload.doctorId === doctorId) {
        setDoctorStatus(payload.status as DoctorStatus['status']);
      }
    },
    onNextPatient: () => {
      router.refresh();
    },
    onPollFallback: () => router.refresh(),
  });

  const handleComplete = () => {
    if (!inProgressEntry || completing) return;
    setCompleting(true);
    startTransition(async () => {
      const result = await completeAction(inProgressEntry.id);
      setCompleting(false);
      if (!result.success) {
        toast.error(result.error ?? t.errors.serverError);
      } else {
        toast.success(isAr ? 'تم إنهاء الكشف بنجاح' : 'Examination completed successfully');
        router.refresh();
      }
    });
  };

  const handleStatusToggle = () => {
    const newStatus = doctorStatus === 'AVAILABLE' ? 'BREAK' : 'AVAILABLE';
    startTransition(async () => {
      const result = await setDoctorStatusAction(newStatus);
      if (!result.success) {
        toast.error(result.error ?? t.errors.serverError);
      } else {
        setDoctorStatus(newStatus);
      }
    });
  };

  const handleStartPatient = (id: string) => {
    startTransition(async () => {
      const res = await startAction(id);
      if (!res.success) {
        toast.error(res.error ?? t.errors.serverError);
      } else {
        toast.success(isAr ? 'تم بدء الكشف وإدخال المريض' : 'Examination started');
        router.refresh();
      }
    });
  };

  const waitingPatients = queue.filter((q) => q.status === 'WAITING');
  const completedPatients = queue.filter((q) => q.status === 'COMPLETED');
  const nextWaitingPatient = waitingPatients[0] || null;

  const filteredQueue = queue.filter((q) => {
    if (queueTab === 'WAITING') return q.status === 'WAITING' || q.status === 'BOOKED';
    if (queueTab === 'COMPLETED') return q.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── TOP KPI & DOCTOR STATUS BAR ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Doctor Availability Control */}
        <Card className="bg-card border shadow-xs flex flex-col justify-between p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {isAr ? 'حالة الطبيب' : 'Doctor Status'}
            </span>
            <DoctorStatusBadge status={doctorStatus} />
          </div>
          {doctorStatus !== 'WITH_PATIENT' && (
            <Button
              variant={doctorStatus === 'AVAILABLE' ? 'outline' : 'default'}
              size="sm"
              onClick={handleStatusToggle}
              disabled={isPending}
              className="w-full text-xs h-8 gap-1.5 font-bold"
            >
              {doctorStatus === 'AVAILABLE' ? (
                <>
                  <Coffee className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t.doctorStatus.setBreak}</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>{t.doctorStatus.setAvailable}</span>
                </>
              )}
            </Button>
          )}
          {doctorStatus === 'WITH_PATIENT' && (
            <span className="text-2xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500 animate-ping" />
              {isAr ? 'جلسة فحص نشطة' : 'Active exam in progress'}
            </span>
          )}
        </Card>

        {/* Card 2: Waiting Patients */}
        <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50 p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
            <span>{isAr ? 'في الانتظار' : 'In Queue'}</span>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-200 font-mono">
              {waitingPatients.length}
            </span>
            <span className="text-xs text-amber-700/80 dark:text-amber-400">
              {isAr ? 'حالة متبقية' : 'patients'}
            </span>
          </div>
        </Card>

        {/* Card 3: Completed Visits Today */}
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <span>{isAr ? 'تم الكشف' : 'Completed'}</span>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
              {completedPatients.length}
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400">
              {isAr ? 'كشف منجز' : 'examined'}
            </span>
          </div>
        </Card>

        {/* Card 4: Total Queue */}
        <Card className="bg-muted/30 border p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{isAr ? 'إجمالي الحالات اليوم' : 'Total Today'}</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
              {queue.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {isAr ? 'موعد مسجل' : 'registered'}
            </span>
          </div>
        </Card>
      </div>

      {/* Connection notice if WebSocket disconnected */}
      {wsStatus === 'disconnected' && (
        <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            {t.common.connectionLost}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.refresh()}
            className="h-6 text-xs text-amber-800 hover:text-amber-950 font-bold"
          >
            {isAr ? 'تحديث الآن' : 'Refresh Now'}
          </Button>
        </div>
      )}

      {/* ── MAIN WORKSPACE GRID ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT/MAIN: ACTIVE EXAMINATION ROOM (7 COLS) ────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          {inProgressEntry ? (
            /* ACTIVE PATIENT IN ROOM */
            <Card className="border-2 border-primary/40 shadow-sm overflow-hidden bg-card">
              <CardHeader className="bg-primary/5 border-b p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        {t.doctorToday.currentPatientInExam}
                      </span>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground">
                      {inProgressEntry.patientName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                      {t.doctorToday.queueNumberPrefix}{inProgressEntry.queueNumber}
                    </span>
                    <AppointmentTypeBadge type={inProgressEntry.type} locale={locale} size="md" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Clinical Notes & Diagnosis Preview */}
                {currentVisit ? (
                  <div className="rounded-xl bg-muted/30 p-4 border border-border/70 space-y-3 text-sm">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block mb-0.5">
                        {t.visits.complaint}:
                      </span>
                      <p className="text-foreground font-medium">
                        {currentVisit.complaint || (
                          <span className="text-muted-foreground italic text-xs">
                            {t.doctorToday.notRecordedYet}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-xs font-bold text-muted-foreground block mb-0.5">
                        {t.visits.diagnosis}:
                      </span>
                      <p className="text-foreground font-medium">
                        {currentVisit.diagnosis || (
                          <span className="text-muted-foreground italic text-xs">
                            {t.doctorToday.notRecordedYet}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-muted/20 p-4 border border-dashed text-xs text-muted-foreground text-center">
                    {isAr
                      ? 'لم يتم فتح استمارة الزيارة الطبية بعد، اضغط على الزر أدناه لبدء التدوين.'
                      : 'Medical visit form not opened yet. Click below to begin charting.'}
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    {currentVisit ? (
                      <Button
                        asChild
                        size="default"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold gap-2 shadow-sm flex-1 sm:flex-none"
                      >
                        <Link href={`/doctor/visits/${currentVisit.id}`}>
                          <Stethoscope className="size-4" />
                          <span>{t.doctorToday.writeExamAndRx}</span>
                        </Link>
                      </Button>
                    ) : inProgressEntry.visitId ? (
                      <Button
                        asChild
                        size="default"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold gap-2 shadow-sm flex-1 sm:flex-none"
                      >
                        <Link href={`/doctor/visits/${inProgressEntry.visitId}`}>
                          <Stethoscope className="size-4" />
                          <span>{t.doctorToday.writeExamAndRx}</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="default"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold gap-2 shadow-sm flex-1 sm:flex-none"
                      >
                        <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                          <Stethoscope className="size-4" />
                          <span>{t.doctorToday.openVisitAndExam}</span>
                        </Link>
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="default"
                      className="gap-2 font-bold border-primary/25 text-primary hover:bg-primary/10 flex-1 sm:flex-none"
                    >
                      <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                        <FileText className="size-4" />
                        <span>{t.doctorToday.patientVisitsReport}</span>
                      </Link>
                    </Button>
                  </div>

                  <Button
                    variant="default"
                    size="default"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
                    onClick={handleComplete}
                    loading={completing}
                    disabled={completing || isPending}
                    aria-label={t.visits.doneConfirm}
                  >
                    <CheckCircle2 className="size-4" />
                    <span>{t.visits.done} {t.doctorToday.completeAndDischarge}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* EMPTY EXAMINATION ROOM (READY FOR NEXT PATIENT) */
            <Card className="border border-dashed shadow-xs bg-card">
              <CardContent className="flex flex-col items-center justify-center py-10 sm:py-14 text-center px-4 space-y-4">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <Stethoscope className="size-8" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-extrabold text-foreground text-lg sm:text-xl">
                    {t.doctorToday.noPatientInRoom}
                  </h3>
                  {nextWaitingPatient ? (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {isAr ? 'الغرفة متاحة لاستقبال الحالات. المريض التالي في الدور هو: ' : 'The examination room is ready. Next patient in queue is: '}
                      <strong className="text-foreground font-bold">
                        {nextWaitingPatient.patientName} (#{nextWaitingPatient.queueNumber})
                      </strong>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t.doctorToday.queueEmpty}
                    </p>
                  )}
                </div>

                {nextWaitingPatient && (
                  <div className="pt-2 w-full sm:w-auto">
                    <Button
                      onClick={() => handleStartPatient(nextWaitingPatient.id)}
                      disabled={isPending}
                      size="lg"
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold px-6 shadow-md text-sm sm:text-base"
                    >
                      <Play className="size-4 fill-white" />
                      <span>{t.doctorToday.startExam}: {nextWaitingPatient.patientName}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT: RESPONSIVE WAITING QUEUE LIST (5 COLS) ──────────────── */}
        <aside className="lg:col-span-5">
          <Card className="shadow-xs border overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <span>{t.queue.title}</span>
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs font-bold">
                  {queue.length} {isAr ? 'إجمالي' : 'total'}
                </Badge>
              </div>

              {/* Responsive Filter Tabs */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setQueueTab('WAITING')}
                  className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center ${
                    queueTab === 'WAITING'
                      ? 'bg-background text-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isAr ? 'في الانتظار' : 'Waiting'} ({waitingPatients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueTab('COMPLETED')}
                  className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center ${
                    queueTab === 'COMPLETED'
                      ? 'bg-background text-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isAr ? 'تم الكشف' : 'Done'} ({completedPatients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueTab('ALL')}
                  className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center ${
                    queueTab === 'ALL'
                      ? 'bg-background text-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'} ({queue.length})
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 max-h-[calc(100vh-18rem)] overflow-y-auto space-y-3">
              {filteredQueue.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm space-y-2">
                  <UserCheck className="size-8 text-muted-foreground/50 mx-auto" />
                  <p>
                    {queueTab === 'WAITING'
                      ? isAr
                        ? 'لا يوجد مرضى في الانتظار حالياً ✓'
                        : 'No patients waiting in queue ✓'
                      : isAr
                        ? 'لا توجد عناصر مطابقة'
                        : 'No matching entries'}
                  </p>
                </div>
              ) : (
                filteredQueue.map((entry) => {
                  const isCurrent = inProgressEntry?.id === entry.id;
                  const isWaiting = entry.status === 'WAITING';

                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl border transition-all text-sm space-y-3 ${
                        isCurrent
                          ? 'border-primary/50 bg-primary/5 shadow-xs'
                          : 'border-border/80 bg-card hover:bg-muted/30 shadow-2xs'
                      }`}
                    >
                      {/* Row 1: Queue # & Full Patient Name & Origin */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <span className="font-mono text-primary font-bold text-xs bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                            #{entry.queueNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/doctor/patients/${entry.patientId}`}
                              className="font-bold text-foreground text-base hover:text-primary transition-colors block break-words"
                              title={isAr ? 'عرض الملف الطبي للمريض' : 'View Patient Medical File'}
                            >
                              {entry.patientName}
                            </Link>
                          </div>
                        </div>

                        {entry.waitingMinutes !== null && entry.waitingMinutes !== undefined && isWaiting && (
                          <span className="text-[11px] text-muted-foreground shrink-0 font-mono">
                            {isAr ? `منذ ${entry.waitingMinutes} د` : `${entry.waitingMinutes}m ago`}
                          </span>
                        )}
                      </div>

                      {/* Row 2: Badges Bar */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={entry.status} className="text-2xs font-medium px-2 py-0">
                          {t.appointmentStatus[entry.status as keyof typeof t.appointmentStatus] || entry.status}
                        </Badge>
                        <AppointmentTypeBadge type={entry.type} locale={locale} size="sm" />
                        {entry.source && (
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                            {entry.source === 'WALK_IN'
                              ? isAr ? 'طابور مباشر' : 'Walk-in'
                              : isAr ? 'حجز مسبق' : 'Scheduled'}
                          </span>
                        )}
                      </div>

                      {/* Row 3: Action Buttons (Ample spacing, perfectly responsive!) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        {isWaiting && !inProgressEntry ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs gap-1.5 font-bold shadow-xs flex-1 sm:flex-none"
                            onClick={() => handleStartPatient(entry.id)}
                            disabled={isPending}
                          >
                            <Play className="size-3.5 fill-white" />
                            <span>{t.doctorToday.startExam}</span>
                          </Button>
                        ) : null}

                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs text-primary border-primary/25 hover:bg-primary/10 gap-1.5 font-semibold flex-1 sm:flex-none"
                        >
                          <Link href={`/doctor/patients/${entry.patientId}`}>
                            <FileText className="size-3.5" />
                            <span>{isAr ? 'الملف الطبي والزيارات' : 'Medical File & Visits'}</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
