'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Banknote, Wallet, X, CheckCircle2 } from 'lucide-react';
import { useCheckoutAppointmentMutation } from '../hooks/appointments.hook';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  remainingAmount: number;
  totalAmount: number;
  paidAmount: number;
  onSuccess: () => void;
}

export function CheckoutPaymentModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  remainingAmount,
  totalAmount,
  paidAmount,
  onSuccess,
}: CheckoutPaymentModalProps) {
  const t = useTranslations('Dashboard.receptionist.table');
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [amount, setAmount] = useState<number>(remainingAmount);
  const [notes, setNotes] = useState<string>('');
  const checkoutMutation = useCheckoutAppointmentMutation();
  const isPending = checkoutMutation.isPending;

  if (!isOpen) return null;

  const handleConfirm = () => {
    checkoutMutation.mutate(
      {
        id: appointmentId,
        payload: {
          method,
          amount: remainingAmount > 0 ? Number(amount) : 0,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8]">
              <CreditCard className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0A164E]">
                {t('checkoutModalTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {patientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Card Summary */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">سعر الكشف الإجمالي:</span>
              <span className="font-bold text-slate-700">{totalAmount} ج.م</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400 block mb-0.5">المدفوع مسبقاً:</span>
              <span className="font-bold text-emerald-600">{paidAmount} ج.م</span>
            </div>
            <div className="text-end">
              <span className="text-slate-400 block mb-0.5">المتبقي المطلوب:</span>
              <span className="font-black text-amber-700 text-sm">{remainingAmount} ج.م</span>
            </div>
          </div>

          {remainingAmount > 0 && (
            <>
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('selectPaymentMethod')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('CASH')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      method === 'CASH'
                        ? 'border-[#0040D8] bg-blue-50/40 text-[#0040D8] shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    <span>{t('cash')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('CARD')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      method === 'CARD'
                        ? 'border-[#0040D8] bg-blue-50/40 text-[#0040D8] shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    <span>{t('card')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('WALLET')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      method === 'WALLET'
                        ? 'border-[#0040D8] bg-blue-50/40 text-[#0040D8] shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mb-1" />
                    <span>{t('wallet')}</span>
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  المبلغ المُسدد (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  max={remainingAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-hidden focus:border-[#0040D8] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Notes input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ملاحظات إضافية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: تم السداد كاش بالكامل واستلام الروشتة"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-hidden focus:border-[#0040D8] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </>
          )}

          {remainingAmount === 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>المبلغ مدفوع بالكامل، يمكنك تأكيد إنهاء الزيارة ومغادرة المريض.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isPending ? 'جاري الحفظ...' : t('confirmAndCheckout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

