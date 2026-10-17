import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IUser extends Document {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: 'ADMIN' | 'DOCTOR' | 'RECEPTION';
  isActive: boolean;
  lastLoginAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'DOCTOR', 'RECEPTION'], required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
