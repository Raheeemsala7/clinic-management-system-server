'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useRejectExpenseMutation } from '../hooks/expenses.hook';
import { ExpenseItem } from '../types/expenses';

interface RejectExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseItem | null;
}

export function RejectExpenseModal({ isOpen, onClose, expense }: RejectExpenseModalProps) {
  const [reason, setReason] = useState('');
  const rejectMutation = useRejectExpenseMutation();

  if (!isOpen || !expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rejectMutation.mutate(
      { id: expense.id, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onClose();
          setReason('');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0A164E]">
                رفض المصروف
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مبلغ: {expense.amount} ج.م - {expense.category?.name || 'مصروف'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              سبب الرفض (اختياري)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب رفض اعتماد هذا المصروف..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-sm font-medium transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={rejectMutation.isPending}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الرفض...</span>
                </>
              ) : (
                <span>تأكيد الرفض</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={rejectMutation.isPending}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

