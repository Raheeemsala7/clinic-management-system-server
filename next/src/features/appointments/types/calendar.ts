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
  doctorId?: string;
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
  appointments?: DaySlotAppointment[];
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
  doctorId?: string;
  doctorName: string;
}

export interface MonthDayItem {
  date: string;
  dayNumber: number;
  dayName: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isOffDay: boolean;
  appointmentsCount: number;
}

export interface MonthRangeData {
  year: number;
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  days: MonthDayItem[];
}

export interface AppointmentsCalendarData {
  date: string;
  doctorId: string;
  isDoctorView?: boolean;
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
  monthRange?: MonthRangeData;
  monthAppointments?: WeekAppointmentItem[];
}

export type CalendarViewMode = 'list' | 'week' | 'month';
