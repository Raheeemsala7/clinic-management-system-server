'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ar } from '@/messages/ar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorStatusBadge } from '@/components/shell/doctor-status-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/toast';
import { useQueueRealtime } from '@/hooks/use-queue-realtime';
import { completeAction, setDoctorStatusAction, startAction } from '@/features/queue/actions';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';
import { useRouter } from 'next/navigation';
import { Play, Stethoscope, FileText } from 'lucide-react';

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
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [doctorStatus, setDoctorStatus] = useState(initialDoctorStatus.status);
  const [completing, setCompleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { status: wsStatus } = useQueueRealtime({
    onQueueUpdate: (payload) => {
      if (Array.isArray(payload)) {
        setQueue(payload as QueueEntry[]);
        router.refresh(); // Refresh to load new visit data
      }
    },
    onDoctorStatusChanged: (payload) => {
      if (payload.doctorId === doctorId) {
        setDoctorStatus(payload.status as DoctorStatus['status']);
      }
    },
    onNextPatient: () => {
      router.refresh(); // Reload to get current patient visit
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
        toast.error(result.error ?? ar.errors.INTERNAL_SERVER_ERROR);
      }
    });
  };

  const handleStatusToggle = () => {
    const newStatus = doctorStatus === 'AVAILABLE' ? 'BREAK' : 'AVAILABLE';
    startTransition(async () => {
      const result = await setDoctorStatusAction(newStatus);
      if (!result.success) toast.error(result.error ?? ar.errors.INTERNAL_SERVER_ERROR);
    });
  };

  const handleStartPatient = (id: string) => {
    startTransition(async () => {
      const res = await startAction(id);
      if (!res.success) {
        toast.error(res.error ?? ar.errors.INTERNAL_SERVER_ERROR);
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
                ? ar.doctorStatus.setBreak
                : ar.doctorStatus.setAvailable}
            </Button>
          )}
          {wsStatus === 'disconnected' && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {ar.common.connectionLost}
            </span>
          )}
        </div>

        {inProgressEntry ? (
          <Card className="border-2 border-primary/40 shadow-sm">
            <CardHeader className="bg-primary/5 border-b pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground font-medium">المريض الحالي في غرفة الكشف:</span>
                  <CardTitle className="text-xl font-bold text-foreground mt-0.5">{inProgressEntry.patientName}</CardTitle>
                </div>
                <Badge variant="IN_PROGRESS" className="bg-blue-600 text-white animate-pulse">
                  {ar.appointmentStatus.IN_PROGRESS}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                رقم الدور #{inProgressEntry.queueNumber} •{' '}
                {ar.appointmentType[inProgressEntry.type]}
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {currentVisit && (
                <div className="space-y-2 rounded-lg bg-muted/30 p-3 border text-sm">
                  <p>
                    <span className="font-semibold">{ar.visits.complaint}: </span>
                    {currentVisit.complaint ?? 'لم تسجل بعد'}
                  </p>
                  <p>
                    <span className="font-semibold">{ar.visits.diagnosis}: </span>
                    {currentVisit.diagnosis ?? 'لم يسجل بعد'}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-1">
                {currentVisit && (
                  <Button asChild size="default" className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold gap-1.5 shadow-sm">
                    <Link href={`/doctor/visits/${currentVisit.id}`}>
                      كتابة الفحص والروشتة 🩺
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="default" className="gap-1.5 font-bold">
                  <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                    <FileText className="size-4" />
                    الملف الطبي
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold ms-auto"
                  onClick={handleComplete}
                  loading={completing}
                  disabled={completing || isPending}
                  aria-label={ar.visits.doneConfirm}
                >
                  {ar.visits.done} وخروج المريض ✓
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
                <p className="font-bold text-foreground text-lg">لا يوجد مريض حالياً في غرفة الكشف</p>
                {waitingPatients.length > 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    يوجد <span className="font-bold text-primary">{waitingPatients.length}</span> مريض في الانتظار. المريض القادم: <span className="font-bold text-foreground">{waitingPatients[0].patientName} (#{waitingPatients[0].queueNumber})</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">قائمة الانتظار فارغة حالياً</p>
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
                  بدء كشف المريض التالي الآن ({waitingPatients[0].patientName})
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
                <span>{ar.queue.title}</span>
                {waitingCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                    {waitingCount} في الانتظار
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {queue.filter((q) => q.status === 'WAITING' || q.status === 'BOOKED').length === 0 ? (
              <p className="px-4 py-8 text-sm text-center text-muted-foreground">
                {ar.queue.empty}
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
                            title="عرض الملف الطبي للمريض"
                          >
                            {entry.patientName}
                          </Link>
                          <Badge variant={entry.status} className="text-[10px] mt-0.5">
                            {ar.appointmentStatus[entry.status]}
                          </Badge>
                        </div>
                      </div>

                      {!inProgressEntry && entry.status === 'WAITING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 shrink-0 gap-1"
                          onClick={() => handleStartPatient(entry.id)}
                          disabled={isPending}
                        >
                          <Play className="size-3 fill-emerald-800" />
                          ابدأ الكشف
                        </Button>
                      )}
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
