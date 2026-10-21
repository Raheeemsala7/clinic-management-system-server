'use client';

import { useState, useTransition } from 'react';
import { useI18n, type Messages } from '@/i18n/use-i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DoctorStatusBadge } from '@/components/shell/doctor-status-badge';
import { toast } from '@/components/ui/toast';
import { useQueueRealtime } from '@/hooks/use-queue-realtime';
import {
  arriveAction,
  startAction,
  completeAction,
  cancelAction,
  noShowAction,
  postponeAction,
} from '@/features/queue/actions';
import type { QueueEntry, DoctorStatus } from '@/features/queue/queries';
import { useRouter } from 'next/navigation';

interface QueueBoardProps {
  initialQueue: QueueEntry[];
  initialDoctorStatus: DoctorStatus;
  doctorId: string;
  currentUserId: string;
}

export function QueueBoard({
  initialQueue,
  initialDoctorStatus,
  doctorId,
}: QueueBoardProps) {
  const { t, locale } = useI18n();
  const [queue, setQueue] = useState<QueueEntry[]>(initialQueue);
  const [doctorStatus, setDoctorStatus] = useState(initialDoctorStatus.status);
  const [doneAlert, setDoneAlert] = useState<{ patientName: string; queueNumber: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Realtime updates via Socket.IO
  const { status: wsStatus, reconnect } = useQueueRealtime({
    onQueueUpdate: (payload) => {
      if (Array.isArray(payload)) setQueue(payload as QueueEntry[]);
    },
    onAppointmentCompleted: (payload) => {
      setDoneAlert({ patientName: payload.patientName, queueNumber: payload.queueNumber });
      // Play a subtle alert sound if the browser allows it
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch { /* AudioContext not available */ }
    },
    onDoctorStatusChanged: (payload) => {
      if (payload.doctorId === doctorId) {
        setDoctorStatus(payload.status as DoctorStatus['status']);
      }
    },
    onPollFallback: () => {
      router.refresh();
    },
  });

  const handleAction = (fn: (id: string) => Promise<{ success: boolean; error?: string }>, id: string) => {
    startTransition(async () => {
      const result = await fn(id);
      if (!result.success) {
        toast.error(result.error ?? t.errors.serverError);
      }
    });
  };

  const handleLetInNext = () => {
    const next = queue.find((q) => q.status === 'WAITING');
    if (!next) return;
    setDoneAlert(null);
    handleAction(startAction, next.id);
  };

  const activeStatuses = ['BOOKED', 'WAITING', 'IN_PROGRESS'] as const;
  const activeQueue = queue.filter((q) =>
    (activeStatuses as readonly string[]).includes(q.status),
  );

  return (
    <div className="space-y-4">
      {/* Doctor status + realtime indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <DoctorStatusBadge status={doctorStatus} />
        {wsStatus === 'disconnected' && (
          <span
            className="inline-flex items-center gap-1 text-xs text-amber-600"
            aria-live="polite"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            {t.common.connectionLost}
            <button
              onClick={() => void reconnect()}
              className="underline ms-1"
              type="button"
            >
              {t.common.retry}
            </button>
          </span>
        )}
        {wsStatus === 'connecting' && (
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {t.common.reconnecting}
          </span>
        )}
      </div>

      {/* "Doctor done" alert */}
      {doneAlert && (
        <Alert
          variant="warning"
          className="animate-pulse-alert border-2 border-accent"
          role="alert"
          aria-live="assertive"
        >
          <AlertTitle className="text-accent font-bold">{t.queue.doneAlert}</AlertTitle>
          <AlertDescription>
            <p>
              {doneAlert.patientName} — #{doneAlert.queueNumber}
            </p>
            <Button
              variant="amber"
              size="sm"
              className="mt-2"
              onClick={handleLetInNext}
              disabled={isPending}
            >
              {t.queue.letInNext}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Queue table */}
      {activeQueue.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed text-muted-foreground">
          {t.queue.empty}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm" role="grid" aria-label={t.queue.title}>
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.queue.number}</th>
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.queue.patient}</th>
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.queue.appointmentType}</th>
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.queue.status}</th>
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.queue.waitingTime}</th>
                <th className="px-3 py-3 text-start font-medium" scope="col">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {activeQueue.map((entry) => (
                <QueueRow
                  key={entry.id}
                  entry={entry}
                  t={t}
                  locale={locale}
                  isPending={isPending}
                  onArrive={() => handleAction(arriveAction, entry.id)}
                  onStart={() => handleAction(startAction, entry.id)}
                  onComplete={() => handleAction(completeAction, entry.id)}
                  onCancel={() => handleAction(cancelAction, entry.id)}
                  onNoShow={() => handleAction(noShowAction, entry.id)}
                  onPostpone={() => handleAction(postponeAction, entry.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface QueueRowProps {
  entry: QueueEntry;
  t: Messages;
  locale: string;
  isPending: boolean;
  onArrive: () => void;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onNoShow: () => void;
  onPostpone: () => void;
}

function QueueRow({ entry, t, locale, isPending, onArrive, onStart, onComplete, onCancel, onNoShow, onPostpone }: QueueRowProps) {
  const statusLabel = t.appointmentStatus[entry.status as keyof typeof t.appointmentStatus] || entry.status;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-3 py-3 font-mono font-semibold text-primary">
        #{entry.queueNumber}
        {entry.postponedCount > 0 && (
          <span className="ms-1 text-xs text-muted-foreground font-mono">
            ({t.queue.postponedShort}{entry.postponedCount})
          </span>
        )}
      </td>
      <td className="px-3 py-3 font-medium">{entry.patientName}</td>
      <td className="px-3 py-3">
        <AppointmentTypeBadge type={entry.type} locale={locale} size="sm" />
      </td>
      <td className="px-3 py-3">
        <Badge variant={entry.status as keyof typeof Badge}>{statusLabel}</Badge>
      </td>
      <td className="px-3 py-3 text-muted-foreground font-mono">
        {entry.waitingMinutes !== null ? `${entry.waitingMinutes} ${t.queue.min}` : '—'}
      </td>
      <td className="px-3 py-3">
        <div className="flex gap-1.5 flex-wrap">
          {entry.status === 'BOOKED' && (
            <>
              <Button size="sm" variant="outline" onClick={onArrive} disabled={isPending}>
                {t.queue.arrive}
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isPending}>
                {t.queue.cancel}
              </Button>
              <Button size="sm" variant="ghost" onClick={onNoShow} disabled={isPending}>
                {t.queue.noShow}
              </Button>
            </>
          )}
          {entry.status === 'WAITING' && (
            <>
              <Button size="sm" onClick={onStart} disabled={isPending}>
                {t.queue.letIn}
              </Button>
              <Button size="sm" variant="outline" onClick={onPostpone} disabled={isPending}>
                {t.queue.postpone}
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel} disabled={isPending}>
                {t.queue.cancel}
              </Button>
            </>
          )}
          {entry.status === 'IN_PROGRESS' && (
            <Button size="sm" variant="secondary" onClick={onComplete} disabled={isPending}>
              {t.visits.done}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
