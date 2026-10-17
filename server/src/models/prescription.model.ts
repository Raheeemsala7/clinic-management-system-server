import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IPrescriptionItem {
  id: string;
  drugName: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
  sortOrder: number;
}

export interface IPrescription extends Document {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  versionNumber: number;
  supersedesId?: string;
  notes?: string;
  printedAt?: Date;
  items: IPrescriptionItem[];
  createdAt: Date;
}

export interface IPrescriptionTemplate extends Document {
  id: string;
  doctorId: string;
  name: string;
  notes?: string;
  items: any[];
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionItemSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    drugName: { type: String, required: true },
    dose: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
    sortOrder: { type: Number, default: 0 },
  },
  { toJSON: transformOptions, toObject: transformOptions },
);

const PrescriptionSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    visitId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    doctorId: { type: String, required: true },
    versionNumber: { type: Number, default: 1 },
    supersedesId: { type: String },
    notes: { type: String },
    printedAt: { type: Date },
    items: { type: [PrescriptionItemSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: transformOptions, toObject: transformOptions },
);

const PrescriptionTemplateSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    doctorId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    notes: { type: String },
    items: { type: Array, default: [] },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Prescription =
  mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

export const PrescriptionTemplate =
  mongoose.models.PrescriptionTemplate ||
  mongoose.model<IPrescriptionTemplate>('PrescriptionTemplate', PrescriptionTemplateSchema);
