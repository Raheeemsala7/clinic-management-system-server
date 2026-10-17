import mongoose, { Schema, Document } from 'mongoose';
import { transformOptions } from './base';

export interface ISetting extends Document<string> {
  _id: string; // setting key
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema(
  {
    _id: { type: String, required: true }, // key
    value: { type: String, required: true },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Setting = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
