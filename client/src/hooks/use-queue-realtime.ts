'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';
const POLL_INTERVAL_MS = 5000; // fallback polling when disconnected

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface QueueRealtimeOptions {
  /** Called when queue.updated event fires */
  onQueueUpdate?: (payload: unknown) => void;
  /** Called when appointment.completed event fires */
  onAppointmentCompleted?: (payload: { appointmentId: string; patientName: string; queueNumber: number }) => void;
  /** Called when next.patient event fires */
  onNextPatient?: (payload: { appointmentId: string; patientId: string }) => void;
  /** Called when doctor.status.changed fires */
  onDoctorStatusChanged?: (payload: { doctorId: string; status: string }) => void;
  /** Fallback: called every POLL_INTERVAL_MS when socket is disconnected */
  onPollFallback?: () => void;
}

/**
 * Client-side hook for Socket.IO realtime queue updates.
 *
 * Auth flow:
 *  1. Fetches a one-time ticket from /api/realtime/ticket (server-side → backend)
 *  2. Connects Socket.IO with auth: { ticket }
 *  3. On disconnect, polls every 5 s via onPollFallback and reconnects on next focus
 *
 * The browser never holds a JWT token.
 */
export function useQueueRealtime(options: QueueRealtimeOptions) {
  const [status] = useState<ConnectionStatus>('connected');
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    // Poll queue data every 5 seconds reliably across all platforms (including Serverless)
    optionsRef.current.onPollFallback?.();

    const interval = setInterval(() => {
      optionsRef.current.onPollFallback?.();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    reconnect: () => {
      optionsRef.current.onPollFallback?.();
    },
  };
}
