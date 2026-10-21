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
import { Play, Stethoscope, FileText } from 'lucide-react';
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
      }
    });
  };

  const handleStatusToggle = () => {
    const newStatus = doctorStatus === 'AVAILABLE' ? 'BREAK' : 'AVAILABLE';
    startTransition(async () => {
      const result = await setDoctorStatusAction(newStatus);
      if (!result.success) toast.error(result.error ?? t.errors.serverError);
    });
  };

  const handleStartPatient = (id: string) => {
    startTransition(async () => {
      const res = await startAction(id);
      if (!res.success) {
        toast.error(res.error ?? t.errors.serverError);
      } else {
        router.refresh();
      }
    });
  };

  const waitingPatients = queue.filter((q) => q.status === 'WAITING');
  const waitingCount = waitingPatients.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current patient */}
      <div className="lg:col-span-2 space-y-4">
        {/* Doctor status control */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <DoctorStatusBadge status={doctorStatus} />
          {doctorStatus !== 'WITH_PATIENT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              disabled={isPending}
            >
              {doctorStatus === 'AVAILABLE'
                ? t.doctorStatus.setBreak
                : t.doctorStatus.setAvailable}
            </Button>
          )}
          {wsStatus === 'disconnected' && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {t.common.connectionLost}
            </span>
          )}
        </div>

        {inProgressEntry ? (
          <Card className="border-2 border-primary/40 shadow-sm">
            <CardHeader className="bg-primary/5 border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {t.doctorToday.currentPatientInExam}:
                  </span>
                  <CardTitle className="text-xl font-bold text-foreground mt-0.5">
                    {inProgressEntry.patientName}
                  </CardTitle>
                </div>
                <Badge variant="IN_PROGRESS" className="bg-blue-600 text-white animate-pulse">
                  {t.appointmentStatus.IN_PROGRESS}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-mono">
                  {t.doctorToday.queueNumberPrefix}{inProgressEntry.queueNumber}
                </span>
                <AppointmentTypeBadge type={inProgressEntry.type} locale={locale} size="sm" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {currentVisit && (
                <div className="space-y-2 rounded-lg bg-muted/30 p-3 border text-sm">
                  <p>
                    <span className="font-semibold">{t.visits.complaint}: </span>
                    {currentVisit.complaint ?? t.doctorToday.notRecordedYet}
                  </p>
                  <p>
                    <span className="font-semibold">{t.visits.diagnosis}: </span>
                    {currentVisit.diagnosis ?? t.doctorToday.notRecordedYet}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-1">
                {currentVisit ? (
                  <Button asChild size="default" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold gap-1.5 shadow-sm">
                    <Link href={`/doctor/visits/${currentVisit.id}`}>
                      {t.doctorToday.writeExamAndRx}
                    </Link>
                  </Button>
                ) : inProgressEntry.visitId ? (
                  <Button asChild size="default" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold gap-1.5 shadow-sm">
                    <Link href={`/doctor/visits/${inProgressEntry.visitId}`}>
                      {t.doctorToday.writeExamAndRx}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="default" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold gap-1.5 shadow-sm">
                    <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                      {t.doctorToday.openVisitAndExam}
                    </Link>
                  </Button>
                )}

                <Button asChild variant="outline" size="default" className="gap-1.5 font-bold border-primary/30 text-primary hover:bg-primary/10">
                  <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                    <FileText className="size-4" />
                    {t.doctorToday.patientVisitsReport}
                  </Link>
                </Button>

                <Button
                  variant="default"
                  size="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold ms-auto"
                  onClick={handleComplete}
                  loading={completing}
                  disabled={completing || isPending}
                  aria-label={t.visits.doneConfirm}
                >
                  {t.visits.done} {t.doctorToday.completeAndDischarge}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Stethoscope className="size-7" />
              </div>
              <div>
                <p className="font-bold text-foreground text-lg">
                  {t.doctorToday.noPatientInRoom}
                </p>
                {waitingPatients.length > 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.doctorToday.waitingCountPrefix} <span className="font-bold text-primary">{waitingPatients.length}</span> {t.doctorToday.patientsInWaiting}. {t.doctorToday.nextPatient} <span className="font-bold text-foreground">{waitingPatients[0].patientName} (#{waitingPatients[0].queueNumber})</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.doctorToday.queueEmpty}
                  </p>
                )}
              </div>
              {waitingPatients.length > 0 && (
                <Button
                  onClick={() => handleStartPatient(waitingPatients[0].id)}
                  disabled={isPending}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-md"
                >
                  <Play className="size-4 fill-white" />
                  {isAr ? 'بدء كشف المريض التالي الآن' : 'Start Next Patient Exam Now'} ({waitingPatients[0].patientName})
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Waiting queue list */}
      <aside>
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>{t.queue.title}</span>
                {waitingCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                    {waitingCount} {isAr ? 'في الانتظار' : 'waiting'}
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {queue.filter((q) => q.status === 'WAITING' || q.status === 'BOOKED').length === 0 ? (
              <p className="px-4 py-8 text-sm text-center text-muted-foreground">
                {t.queue.empty}
              </p>
            ) : (
              <ul className="divide-y" role="list">
                {queue
                  .filter((q) => q.status === 'WAITING' || q.status === 'BOOKED')
                  .map((entry) => (
                    <li key={entry.id} className="px-4 py-3 flex items-center justify-between gap-2 text-sm hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.5 rounded">
                          #{entry.queueNumber}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/doctor/patients/${entry.patientId}`}
                            className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors block"
                            title={isAr ? 'عرض الملف الطبي للمريض' : 'View Patient Medical File'}
                          >
                            {entry.patientName}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant={entry.status} className="text-[10px]">
                              {t.appointmentStatus[entry.status as keyof typeof t.appointmentStatus] || entry.status}
                            </Badge>
                            <AppointmentTypeBadge type={entry.type} locale={locale} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-primary hover:bg-primary/10 gap-1 font-semibold"
                          title={t.doctorToday.patientVisitsReport}
                        >
                          <Link href={`/doctor/patients/${entry.patientId}`}>
                            <FileText className="size-3.5" />
                            {t.doctorToday.patientVisitsReport}
                          </Link>
                        </Button>

                        {!inProgressEntry && entry.status === 'WAITING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 shrink-0 gap-1 font-semibold"
                            onClick={() => handleStartPatient(entry.id)}
                            disabled={isPending}
                          >
                            <Play className="size-3 fill-emerald-800" />
                            {t.doctorToday.startExam}
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
