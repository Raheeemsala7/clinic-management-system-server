import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IAttachment extends Document {
  id: string;
  visitId: string;
  patientId: string;
  uploadedById: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    visitId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    uploadedById: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storageKey: { type: String, required: true },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const Attachment =
  mongoose.models.Attachment || mongoose.model<IAttachment>('Attachment', AttachmentSchema);
