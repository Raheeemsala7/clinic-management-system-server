import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IAuditLog extends Document {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: any;
  after?: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: transformOptions, toObject: transformOptions },
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
