import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { transformOptions } from './base';

export interface IExpenseCategory extends Document {
  id: string;
  name: string;
  isActive: boolean;
}

export interface IExpense extends Document {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  spentAt: Date;
  recordedById: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedById?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseCategorySchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { toJSON: transformOptions, toObject: transformOptions },
);

const ExpenseSchema = new Schema(
  {
    _id: { type: String, default: uuidv4 },
    categoryId: { type: String, required: true, ref: 'ExpenseCategory', index: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    spentAt: { type: Date, required: true, index: true },
    recordedById: { type: String, required: true, index: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedById: { type: String },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true, toJSON: transformOptions, toObject: transformOptions },
);

export const ExpenseCategory =
  mongoose.models.ExpenseCategory || mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
