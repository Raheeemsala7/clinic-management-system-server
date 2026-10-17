import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IDrug extends Document {
  id: string;
  name: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DrugSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Drug = mongoose.models.Drug || mongoose.model<IDrug>('Drug', DrugSchema);
