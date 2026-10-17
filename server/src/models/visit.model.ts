import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IVisit extends Document {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  complaint?: string;
  diagnosis?: string;
  notes?: string;
  instructions?: string;
  followUpDate?: Date;
  status: 'OPEN' | 'CLOSED';
  closedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    appointmentId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true, index: true },
    complaint: { type: String },
    diagnosis: { type: String },
    notes: { type: String },
    instructions: { type: String },
    followUpDate: { type: Date },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    closedAt: { type: Date },
    version: { type: Number, default: 1 },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Visit = mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);
