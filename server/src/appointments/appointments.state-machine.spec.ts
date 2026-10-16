import { AppointmentStatus } from '@prisma/client';

/**
 * Pure state machine tests — no DB, no DI.
 */

type TransitionMap = Record<AppointmentStatus, AppointmentStatus[]>;

const TRANSITIONS: TransitionMap = {
  BOOKED: [AppointmentStatus.WAITING, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
  WAITING: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED, AppointmentStatus.WAITING],
  IN_PROGRESS: [AppointmentStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

describe('Appointment State Machine', () => {
  // ── Allowed transitions ─────────────────────────────────────────────────────
  it('BOOKED -> WAITING (arrive)', () => {
    expect(canTransition(AppointmentStatus.BOOKED, AppointmentStatus.WAITING)).toBe(true);
  });

  it('BOOKED -> CANCELLED', () => {
    expect(canTransition(AppointmentStatus.BOOKED, AppointmentStatus.CANCELLED)).toBe(true);
  });

  it('BOOKED -> NO_SHOW', () => {
    expect(canTransition(AppointmentStatus.BOOKED, AppointmentStatus.NO_SHOW)).toBe(true);
  });

  it('WAITING -> IN_PROGRESS (start)', () => {
    expect(canTransition(AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS)).toBe(true);
  });

  it('WAITING -> CANCELLED', () => {
    expect(canTransition(AppointmentStatus.WAITING, AppointmentStatus.CANCELLED)).toBe(true);
  });

  it('WAITING -> WAITING (postpone is idempotent)', () => {
    expect(canTransition(AppointmentStatus.WAITING, AppointmentStatus.WAITING)).toBe(true);
  });

  it('IN_PROGRESS -> COMPLETED', () => {
    expect(canTransition(AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED)).toBe(true);
  });

  // ── Forbidden transitions ───────────────────────────────────────────────────
  it('BOOKED -> IN_PROGRESS is forbidden', () => {
    expect(canTransition(AppointmentStatus.BOOKED, AppointmentStatus.IN_PROGRESS)).toBe(false);
  });

  it('COMPLETED -> CANCELLED is forbidden', () => {
    expect(canTransition(AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED)).toBe(false);
  });

  it('COMPLETED -> IN_PROGRESS is forbidden', () => {
    expect(canTransition(AppointmentStatus.COMPLETED, AppointmentStatus.IN_PROGRESS)).toBe(false);
  });

  it('CANCELLED -> WAITING is forbidden', () => {
    expect(canTransition(AppointmentStatus.CANCELLED, AppointmentStatus.WAITING)).toBe(false);
  });

  it('NO_SHOW -> BOOKED is forbidden', () => {
    expect(canTransition(AppointmentStatus.NO_SHOW, AppointmentStatus.BOOKED)).toBe(false);
  });

  it('IN_PROGRESS -> BOOKED is forbidden', () => {
    expect(canTransition(AppointmentStatus.IN_PROGRESS, AppointmentStatus.BOOKED)).toBe(false);
  });

  // ── Terminal states ─────────────────────────────────────────────────────────
  it('COMPLETED has no outgoing transitions', () => {
    expect(TRANSITIONS[AppointmentStatus.COMPLETED]).toHaveLength(0);
  });

  it('CANCELLED has no outgoing transitions', () => {
    expect(TRANSITIONS[AppointmentStatus.CANCELLED]).toHaveLength(0);
  });

  it('NO_SHOW has no outgoing transitions', () => {
    expect(TRANSITIONS[AppointmentStatus.NO_SHOW]).toHaveLength(0);
  });
});
