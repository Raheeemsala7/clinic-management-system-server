import { DoctorSchedule, Appointment, User, IDoctorDaySchedule } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const ARABIC_DAYS = [
  'الأحد',     // 0
  'الاثنين',   // 1
  'الثلاثاء',  // 2
  'الأربعاء',  // 3
  'الخميس',    // 4
  'الجمعة',    // 5
  'السبت',     // 6
];

export function getDefaultWeeklySchedule(): IDoctorDaySchedule[] {
  return [
    {
      dayOfWeek: 0, // الأحد
      isAvailable: true,
      shifts: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      dayOfWeek: 1, // الاثنين
      isAvailable: true,
      shifts: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      dayOfWeek: 2, // الثلاثاء
      isAvailable: true,
      shifts: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      dayOfWeek: 3, // الأربعاء
      isAvailable: true,
      shifts: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      dayOfWeek: 4, // الخميس
      isAvailable: true,
      shifts: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      dayOfWeek: 5, // الجمعة - إجازة أسبوعية
      isAvailable: false,
      shifts: [],
    },
    {
      dayOfWeek: 6, // السبت - غير متاح / إجازة
      isAvailable: false,
      shifts: [],
    },
  ];
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export class DoctorScheduleService {
  static async getDoctorSchedule(doctorId: string) {
    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR', deletedAt: null });
    if (!doctor) throw new NotFoundError('Doctor not found');

    let schedule = await DoctorSchedule.findOne({ doctorId });
    if (!schedule || !schedule.weeklySchedule || schedule.weeklySchedule.length === 0) {
      return {
        doctorId,
        slotDurationMinutes: schedule?.slotDurationMinutes || 30,
        weeklySchedule: getDefaultWeeklySchedule(),
      };
    }

    return schedule.toJSON();
  }

  static async updateDoctorSchedule(doctorId: string, dto: { slotDurationMinutes?: number; weeklySchedule: IDoctorDaySchedule[] }) {
    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR', deletedAt: null });
    if (!doctor) throw new NotFoundError('Doctor not found');

    const slotDurationMinutes = dto.slotDurationMinutes && dto.slotDurationMinutes > 0 ? dto.slotDurationMinutes : 30;
    const weeklySchedule = dto.weeklySchedule || getDefaultWeeklySchedule();

    // Validate shifts
    for (const day of weeklySchedule) {
      if (day.isAvailable && day.shifts) {
        for (const shift of day.shifts) {
          if (!shift.startTime || !shift.endTime) {
            throw new BadRequestError('كل فترة عمل يجب أن تحتوي على وقت بدء ووقت انتهاء');
          }
          if (timeToMinutes(shift.startTime) >= timeToMinutes(shift.endTime)) {
            throw new BadRequestError(`وقت البدء (${shift.startTime}) يجب أن يسبق وقت الانتهاء (${shift.endTime})`);
          }
        }
      }
    }

    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId },
      {
        doctorId,
        slotDurationMinutes,
        weeklySchedule,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return schedule.toJSON();
  }

  static async getAvailableSlots(doctorId: string, dateStr: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestError('صيغة التاريخ غير صالحة، الصيغة المطلوبة YYYY-MM-DD');
    }

    const today = getTodayClinicDate();
    if (dateStr < today) {
      return {
        date: dateStr,
        dayOfWeek: new Date(dateStr + 'T12:00:00Z').getUTCDay(),
        dayName: ARABIC_DAYS[new Date(dateStr + 'T12:00:00Z').getUTCDay()],
        isWorkingDay: false,
        isPast: true,
        message: 'لا يمكن حجز موعد في تاريخ ماضٍ',
        shifts: [],
        slots: [],
        availableCount: 0,
        bookedCount: 0,
      };
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR', deletedAt: null });
    if (!doctor) throw new NotFoundError('Doctor not found');

    const scheduleDoc = await DoctorSchedule.findOne({ doctorId });
    const weeklySchedule =
      scheduleDoc?.weeklySchedule && scheduleDoc.weeklySchedule.length > 0
        ? scheduleDoc.weeklySchedule
        : getDefaultWeeklySchedule();
    const slotDuration = scheduleDoc?.slotDurationMinutes || 30;

    // Determine day of week
    const targetDate = new Date(dateStr + 'T12:00:00Z');
    const dayOfWeek = targetDate.getUTCDay();
    const dayName = ARABIC_DAYS[dayOfWeek];

    const dayConfig = weeklySchedule.find((d: any) => d.dayOfWeek === dayOfWeek);

    if (!dayConfig || !dayConfig.isAvailable || !dayConfig.shifts || dayConfig.shifts.length === 0) {
      return {
        date: dateStr,
        dayOfWeek,
        dayName,
        isWorkingDay: false,
        isPast: false,
        message: `الطبيب غير متاح في هذا اليوم (${dayName}) - إجازة أسبوعية`,
        shifts: [],
        slots: [],
        availableCount: 0,
        bookedCount: 0,
      };
    }

    // Fetch existing appointments on that date
    const bookedAppointments = await Appointment.find({
      doctorId,
      clinicDate: dateStr,
      status: { $nin: ['CANCELLED'] },
    }).select('startTime endTime queueNumber status');

    // Current time in Cairo timezone for today check
    const nowCairo = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
    const currentMinutes = timeToMinutes(nowCairo);
    const isToday = dateStr === today;

    const slots: Array<{
      startTime: string;
      endTime: string;
      shiftIndex: number;
      isBooked: boolean;
      isPast: boolean;
      isAvailable: boolean;
    }> = [];

    dayConfig.shifts.forEach((shift: { startTime: string; endTime: string }, shiftIndex: number) => {
      const shiftStart = timeToMinutes(shift.startTime);
      const shiftEnd = timeToMinutes(shift.endTime);

      for (let m = shiftStart; m + slotDuration <= shiftEnd; m += slotDuration) {
        const slotStartStr = minutesToTime(m);
        const slotEndStr = minutesToTime(m + slotDuration);

        // Check if booked
        const isBooked = bookedAppointments.some((appt) => {
          if (!appt.startTime) return false;
          // Slot overlaps if starts at same time or inside interval
          return appt.startTime === slotStartStr;
        });

        // Check if past (if date is today)
        const isPast = isToday && m < currentMinutes;
        const isAvailable = !isBooked && !isPast;

        slots.push({
          startTime: slotStartStr,
          endTime: slotEndStr,
          shiftIndex,
          isBooked,
          isPast,
          isAvailable,
        });
      }
    });

    return {
      date: dateStr,
      dayOfWeek,
      dayName,
      isWorkingDay: true,
      isPast: false,
      slotDurationMinutes: slotDuration,
      shifts: dayConfig.shifts,
      slots,
      availableCount: slots.filter((s) => s.isAvailable).length,
      bookedCount: slots.filter((s) => s.isBooked).length,
    };
  }
}
