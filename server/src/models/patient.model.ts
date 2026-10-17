import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IPatient extends Document {
  id: string;
  fullName: string;
  searchName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age?: number;
  dateOfBirth?: Date;
  address?: string;
  allergies: string[];
  chronicConditions: string[];
  generalNotes?: string;
  createdById: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    fullName: { type: String, required: true },
    searchName: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    gender: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    age: { type: Number },
    dateOfBirth: { type: Date },
    address: { type: String },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    generalNotes: { type: String },
    createdById: { type: String, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
