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
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(async () => {
    // Clean up any existing socket
    if (socketRef.current?.connected) return;
    socketRef.current?.disconnect();

    setStatus('connecting');

    // Fetch a fresh one-time ticket from our own Route Handler
    let ticket: string;
    try {
      const res = await fetch('/api/realtime/ticket', { cache: 'no-store' });
      if (!res.ok) {
        setStatus('disconnected');
        return;
      }
      const data = (await res.json()) as { ticket: string };
      ticket = data.ticket;
    } catch {
      setStatus('disconnected');
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { ticket },
      transports: ['websocket'],
      reconnection: false, // we handle reconnection ourselves
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('connected');
      // Clear fallback poll when connected
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
      // Start fallback polling
      if (!pollRef.current) {
        pollRef.current = setInterval(() => {
          optionsRef.current.onPollFallback?.();
        }, POLL_INTERVAL_MS);
      }
    });

    socket.on('connect_error', () => {
      setStatus('disconnected');
    });

    // Queue events
    socket.on('queue.updated', (payload: unknown) => {
      optionsRef.current.onQueueUpdate?.(payload);
    });

    socket.on('appointment.completed', (payload: { appointmentId: string; patientName: string; queueNumber: number }) => {
      optionsRef.current.onAppointmentCompleted?.(payload);
    });

    socket.on('next.patient', (payload: { appointmentId: string; patientId: string }) => {
      optionsRef.current.onNextPatient?.(payload);
    });

    socket.on('doctor.status.changed', (payload: { doctorId: string; status: string }) => {
      optionsRef.current.onDoctorStatusChanged?.(payload);
    });
  }, []);

  // Reconnect on window focus after disconnect
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'disconnected') void connect();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, connect]);

  // Initial connect
  useEffect(() => {
    void connect();
    return () => {
      socketRef.current?.disconnect();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connect]);

  return { status, reconnect: connect };
}
