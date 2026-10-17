import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IPayment extends Document {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'WALLET';
  kind: 'CONSULTATION' | 'FOLLOW_UP' | 'OTHER';
  status: 'RECORDED' | 'VOIDED';
  voidReason?: string;
  paymentType?: 'FULL' | 'DEPOSIT' | 'REMAINING' | 'OTHER';
  notes?: string;
  receivedById: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    appointmentId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['CASH', 'CARD', 'WALLET'], required: true },
    kind: { type: String, enum: ['CONSULTATION', 'FOLLOW_UP', 'OTHER'], required: true },
    paymentType: {
      type: String,
      enum: ['FULL', 'DEPOSIT', 'REMAINING', 'OTHER'],
      default: 'FULL',
    },
    notes: { type: String },
    status: { type: String, enum: ['RECORDED', 'VOIDED'], default: 'RECORDED' },
    voidReason: { type: String },
    voidedById: { type: String },
    receivedById: { type: String, required: true },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
