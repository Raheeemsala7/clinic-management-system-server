import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IAppointment extends Document {
  id: string;
  patientId: string;
  doctorId: string;
  clinicDate: string;
  source: 'SCHEDULED' | 'WALK_IN';
  scheduledAt?: Date;
  type: 'CONSULTATION' | 'FOLLOW_UP';
  status: 'BOOKED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  queueNumber: number;
  queueOrder: number;
  postponedCount: number;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    patientId: { type: String, required: true, ref: 'Patient', index: true },
    doctorId: { type: String, required: true, ref: 'User', index: true },
    clinicDate: { type: String, required: true, index: true },
    source: { type: String, enum: ['SCHEDULED', 'WALK_IN'], required: true },
    scheduledAt: { type: Date },
    type: { type: String, enum: ['CONSULTATION', 'FOLLOW_UP'], required: true },
    status: {
      type: String,
      enum: ['BOOKED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'BOOKED',
      index: true,
    },
    queueNumber: { type: Number, required: true },
    queueOrder: { type: Number, required: true },
    postponedCount: { type: Number, default: 0 },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    createdById: { type: String, required: true, ref: 'User' },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Appointment =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
