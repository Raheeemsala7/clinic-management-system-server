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
import { completeAction, setDoctorStatusAction } from '@/features/queue/actions';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';
import { useRouter } from 'next/navigation';

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

  const waitingCount = queue.filter((q) => q.status === 'WAITING').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{inProgressEntry.patientName}</CardTitle>
                <Badge variant="IN_PROGRESS">
                  {ar.appointmentStatus.IN_PROGRESS}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                رقم {inProgressEntry.queueNumber} •{' '}
                {ar.appointmentType[inProgressEntry.type]}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentVisit && (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">{ar.visits.complaint}: </span>
                    {currentVisit.complaint ?? '—'}
                  </p>
                  <p>
                    <span className="font-medium">{ar.visits.diagnosis}: </span>
                    {currentVisit.diagnosis ?? '—'}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap pt-2">
                {currentVisit && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/doctor/visits/${currentVisit.id}`}>
                      تحرير الزيارة
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/doctor/patients/${inProgressEntry.patientId}`}>
                    {ar.patients.summary}
                  </Link>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleComplete}
                  loading={completing}
                  disabled={completing || isPending}
                  aria-label={ar.visits.doneConfirm}
                >
                  {ar.visits.done} ✓
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
              لا يوجد مريض حالياً في الكشف
            </CardContent>
          </Card>
        )}
      </div>

      {/* Waiting queue (read-only) */}
      <aside>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {ar.queue.title}
              {waitingCount > 0 && (
                <span className="ms-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs h-5 w-5">
                  {waitingCount}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {queue.filter((q) => q.status === 'WAITING' || q.status === 'BOOKED').length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                {ar.queue.empty}
              </p>
            ) : (
              <ul className="divide-y" role="list">
                {queue
                  .filter((q) => q.status === 'WAITING' || q.status === 'BOOKED')
                  .map((entry) => (
                    <li key={entry.id} className="px-4 py-2.5 flex items-center gap-2 text-sm">
                      <span className="font-mono text-primary font-semibold">
                        #{entry.queueNumber}
                      </span>
                      <span className="flex-1 truncate">{entry.patientName}</span>
                      <Badge variant={entry.status} className="text-xs">
                        {ar.appointmentStatus[entry.status]}
                      </Badge>
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
