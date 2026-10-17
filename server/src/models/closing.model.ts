import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IDailyClosing extends Document {
  id: string;
  clinicDate: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  notes?: string;
  closedById: string;
  closedAt: Date;
  reopenedAt?: Date;
  reopenedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyClosingSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    clinicDate: { type: String, required: true, unique: true },
    expectedCash: { type: Number, required: true },
    actualCash: { type: Number, required: true },
    difference: { type: Number, required: true },
    notes: { type: String },
    closedById: { type: String, required: true },
    closedAt: { type: Date, default: Date.now },
    reopenedAt: { type: Date },
    reopenedById: { type: String },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const DailyClosing =
  mongoose.models.DailyClosing || mongoose.model<IDailyClosing>('DailyClosing', DailyClosingSchema);
