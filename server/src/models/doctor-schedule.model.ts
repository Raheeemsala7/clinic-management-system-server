import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IDoctorScheduleShift {
  startTime: string; // "08:00"
  endTime: string;   // "12:00"
}

export interface IDoctorDaySchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  isAvailable: boolean;
  shifts: IDoctorScheduleShift[];
}

export interface IDoctorSchedule extends Document {
  id: string;
  doctorId: string;
  slotDurationMinutes: number;
  weeklySchedule: IDoctorDaySchedule[];
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const DayScheduleSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    isAvailable: { type: Boolean, default: true },
    shifts: { type: [ShiftSchema], default: [] },
  },
  { _id: false },
);

const DoctorScheduleSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    doctorId: { type: String, required: true, unique: true, index: true },
    slotDurationMinutes: { type: Number, default: 30 },
    weeklySchedule: { type: [DayScheduleSchema], default: [] },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const DoctorSchedule =
  mongoose.models.DoctorSchedule || mongoose.model<IDoctorSchedule>('DoctorSchedule', DoctorScheduleSchema);
