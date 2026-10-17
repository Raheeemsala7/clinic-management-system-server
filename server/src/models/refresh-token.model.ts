import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IRefreshToken extends Document {
  id: string;
  userId: string;
  tokenHash: string;
  family: string;
  expiresAt: Date;
  revokedAt?: Date;
  userAgent?: string;
  ip?: string;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: transformOptions, toObject: transformOptions },
);

export const RefreshToken =
  mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
