export interface CalendarSummary {
  totalToday: number;
  totalPaid: number;
  totalRemaining: number;
  totalExempt: number;
}

export interface DaySlotAppointment {
  id: string;
  queueNumber: number;
  queueOrder: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  type: string;
  status: string;
  startTime: string;
  endTime?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
  hasRemaining: boolean;
  isExempt: boolean;
  notes?: string;
}

export interface DaySlotItem {
  time: string;
  isBooked: boolean;
  isAvailable: boolean;
  appointment?: DaySlotAppointment | null;
}

export interface WeekDayItem {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isOffDay: boolean;
}

export interface WeekAppointmentItem {
  id: string;
  clinicDate: string;
  startTime: string;
  endTime?: string;
  patientName: string;
  type: string;
  status: string;
  queueNumber?: number;
  doctorName: string;
}

export interface AppointmentsCalendarData {
  date: string;
  doctorId: string;
  doctor?: { id: string; name: string } | null;
  allDoctors: Array<{ id: string; name: string }>;
  summary: CalendarSummary;
  daySlots: DaySlotItem[];
  weekRange: {
    startDate: string;
    endDate: string;
    days: WeekDayItem[];
  };
  weekAppointments: WeekAppointmentItem[];
}

export type CalendarViewMode = 'list' | 'week';

