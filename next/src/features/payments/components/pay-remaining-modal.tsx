'use client';

import React, { useState } from 'react';
import { usePayRemainingPaymentMutation } from '../hooks/payments.hook';
import { X, Coins, Banknote, CreditCard, Wallet, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaymentMethod } from '../types/payments';

interface PayRemainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export function PayRemainingModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  totalAmount,
  paidAmount,
  remainingAmount,
}: PayRemainingModalProps) {
  const [amount, setAmount] = useState<number>(remainingAmount);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState<string>('');
  const payMutation = usePayRemainingPaymentMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    payMutation.mutate(
      {
        appointmentId,
        amount: Number(amount),
        method,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* رأس النافذة */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0A164E]">
                سداد المبلغ المتبقي
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                المريض: <strong className="text-slate-700">{patientName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* نموذج السداد */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* تفاصيل المبالغ */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">إجمالي الكشف</span>
              <span className="font-black text-[#0A164E]">{totalAmount} ج.م</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">المسدد سابقاً</span>
              <span className="font-black text-emerald-600">{paidAmount} ج.م</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5">المتبقي حالياً</span>
              <span className="font-black text-rose-600">{remainingAmount} ج.م</span>
            </div>
          </div>

          {/* المبلغ المراد تحصيله الآن */}
          <div>
            <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
              المبلغ المدفوع الآن (ج.م) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-black text-[#0A164E] focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all font-sans"
                required
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ج.م
              </span>
            </div>
            {amount < remainingAmount && (
              <p className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>سيتبقى بعد هذا الإيصال: {remainingAmount - amount} ج.م</span>
              </p>
            )}
          </div>

          {/* طريقة الدفع */}
          <div>
            <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('CASH')}
                className={cn(
                  'h-11 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                  method === 'CASH'
                    ? 'border-[#0040D8] bg-blue-50/70 text-[#0040D8] font-black shadow-xs ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Banknote className="w-4 h-4" />
                <span>نقدي</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={cn(
                  'h-11 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                  method === 'CARD'
                    ? 'border-[#0040D8] bg-blue-50/70 text-[#0040D8] font-black shadow-xs ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <CreditCard className="w-4 h-4" />
                <span>بطاقة / فيزا</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('WALLET')}
                className={cn(
                  'h-11 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer',
                  method === 'WALLET'
                    ? 'border-[#0040D8] bg-blue-50/70 text-[#0040D8] font-black shadow-xs ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <Wallet className="w-4 h-4" />
                <span>محفظة</span>
              </button>
            </div>
          </div>

          {/* ملاحظات الإيصال */}
          <div>
            <label className="block text-xs font-bold text-[#0A164E] mb-1.5">
              ملاحظات التحصيل (اختياري)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: سداد باقي قيمة الكشف عند الخروج"
              className="w-full h-11 px-3.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1D4ED8] focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* أزرار الإجراء */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={payMutation.isPending}
              className="h-11 px-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={payMutation.isPending || amount <= 0}
              className="h-11 px-5 rounded-2xl bg-[#0040D8] hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل السداد...</span>
                </>
              ) : (
                <span>تأكيد السداد وإصدار الإيصال</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

