'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  arriveAction,
  startAction,
  completeAction,
  cancelAction,
  noShowAction,
  postponeAction,
} from '@/features/queue/actions';
import { ar } from '@/messages/ar';
import { Check, Play, UserX, Clock, X, CheckCheck } from 'lucide-react';

interface AppointmentRowActionsProps {
  id: string;
  status: string;
}

export function AppointmentRowActions({ id, status }: AppointmentRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (actionFn: (id: string) => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      await actionFn(id);
    });
  };

  if (status === 'BOOKED') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10"
        onClick={() => handleAction(arriveAction)}
        disabled={isPending}
      >
        <Check className="size-3.5 me-1" />
        {ar.queue.arrive}
      </Button>
    );
  }

  if (status === 'WAITING') {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => handleAction(startAction)}
          disabled={isPending}
        >
          <Play className="size-3 me-1 fill-white" />
          {ar.queue.letIn}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2 text-xs"
          onClick={() => handleAction(postponeAction)}
          disabled={isPending}
          title={ar.queue.postpone}
        >
          <Clock className="size-3" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
          onClick={() => handleAction(cancelAction)}
          disabled={isPending}
          title={ar.queue.cancel}
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  if (status === 'IN_PROGRESS') {
    return (
      <Button
        size="sm"
        className="h-8 px-2.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => handleAction(completeAction)}
        disabled={isPending}
      >
        <CheckCheck className="size-3.5 me-1" />
        إنهاء الفحص
      </Button>
    );
  }

  return null;
}
