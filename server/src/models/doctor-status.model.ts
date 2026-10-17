import mongoose, { Schema, Document } from 'mongoose';
import { transformOptions } from './base';

export interface IDoctorStatus extends Document<string> {
  _id: string; // doctorId
  status: 'AVAILABLE' | 'WITH_PATIENT' | 'BREAK';
  createdAt: Date;
  updatedAt: Date;
}

const DoctorStatusSchema = new Schema(
  {
    _id: { type: String, required: true }, // doctorId
    status: { type: String, enum: ['AVAILABLE', 'WITH_PATIENT', 'BREAK'], default: 'AVAILABLE' },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const DoctorStatus =
  mongoose.models.DoctorStatus || mongoose.model<IDoctorStatus>('DoctorStatus', DoctorStatusSchema);
