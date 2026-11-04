'use client';

import React from 'react';
import { PaymentItem } from '../types/payments';
import { Phone, Clock, Printer } from 'lucide-react';

interface PaymentCardItemProps {
  payment: PaymentItem;
  onPayRemaining: (payment: PaymentItem) => void;
  onPrintReceipt: (payment: PaymentItem) => void;
}

export function PaymentCardItem({
  payment,
  onPayRemaining,
  onPrintReceipt,
}: PaymentCardItemProps) {
  const patient = payment.patient;
  const doctor = payment.doctor;
  const appointment = payment.appointment;
  const receivedBy = payment.receivedBy;

  const totalFee = appointment?.totalAmount ?? payment.amount;
  const remainingAmount = Math.max(0, Number(appointment?.remainingAmount || 0));
  const hasRemaining = !appointment?.isExempt && remainingAmount > 0;
  const isDeposit = (payment.paymentType === 'DEPOSIT' && hasRemaining) || (hasRemaining && payment.paymentType !== 'REMAINING');
  const isRemainingSettlement = payment.paymentType === 'REMAINING';

  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // تنسيق وقت العملية
  const formatTimeStr = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const isPm = hours >= 12;
      const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
      return `${displayHours}:${minutes} ${isPm ? 'م' : 'ص'}`;
    } catch {
      return '';
    }
  };

  const methodLabel =
    payment.method === 'CARD'
      ? 'بطاقة / فيزا'
      : payment.method === 'WALLET'
      ? 'محفظة إلكترونية'
      : 'نقدي';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all p-5 sm:p-6 relative overflow-hidden group">
      {/* شريط الإشارة الملون أسفل البطاقة */}
      <div
        className={`absolute bottom-0 right-0 left-0 h-1 transition-all ${
          hasRemaining
            ? 'bg-amber-400 group-hover:h-1.5'
            : 'bg-emerald-500 group-hover:h-1.5'
        }`}
      />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* الجانب الأيمن: بيانات المريض والزيارة والعملية */}
        <div className="space-y-3 flex-1 min-w-0">
          {/* 1. اسم المريض + الهاتف + الشارات */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h4 className="text-base sm:text-lg font-black text-[#0A164E] tracking-tight">
              {patient?.fullName || 'مريض غير مسجل'}
            </h4>

            {patient?.phone && (
              <span className="text-xs text-slate-500 font-mono flex items-center gap-1 dir-ltr">
                <span>{patient.phone}</span>
                <Phone className="w-3 h-3 text-rose-500 shrink-0" />
              </span>
            )}

            {/* شارة نوع الدفعة */}
            {isDeposit ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                عربون حجز موعد
              </span>
            ) : isRemainingSettlement ? (
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
                سداد متبقي الحجز
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                سداد كامل
              </span>
            )}

            {/* شارة طريقة الدفع */}
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
              {methodLabel}
            </span>

            {/* شارة حالة الإيصال */}
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                payment.status === 'VOIDED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {payment.status === 'VOIDED' ? 'ملغاة' : 'مسجلة'}
            </span>
          </div>

          {/* 2. نوع الحجز + الطبيب + وقت الموعد */}
          <div className="flex items-center gap-2.5 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">نوع الحجز:</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                {appointment?.type === 'FOLLOW_UP'
                  ? 'إعادة'
                  : appointment?.type === 'LAB_TESTS_IMAGING'
                  ? 'تحليل وأشعة'
                  : appointment?.type === 'TEST_RESULTS_REVIEW'
                  ? 'مراجعة فحوصات'
                  : appointment?.type === 'CONSULTATION'
                  ? 'استشارة'
                  : 'كشف'}
              </span>
            </div>

            {doctor && (
              <div className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">الطبيب:</span>
                <strong className="text-slate-700 font-bold">{doctor.name}</strong>
              </div>
            )}

            {appointment?.startTime && (
              <div className="flex items-center gap-1">
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">الموعد:</span>
                <strong className="text-slate-700 font-bold font-mono">
                  {appointment.startTime}
                </strong>
              </div>
            )}
          </div>

          {/* 3. ملاحظات العملية */}
          {payment.notes && (
            <div className="bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-2xl text-xs text-slate-600 font-medium inline-block max-w-full">
              {payment.notes}
            </div>
          )}

          {/* 4. تفاصيل المحصل والوقت وزر طباعة الإيصال */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>وقت العملية: {formatTimeStr(payment.createdAt)}</span>
              {receivedBy && (
                <>
                  <span>·</span>
                  <span>المحصل: {receivedBy.name || receivedBy.username}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onPrintReceipt(payment)}
              className="text-[#0040D8] hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الإيصال</span>
            </button>
          </div>
        </div>

        {/* الجانب الأيسر: المبالغ المالية وزر سداد المتبقي */}
        <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-r border-slate-100 pt-3 md:pt-0 md:pr-6 shrink-0 min-w-[170px]">
          <div className="text-right w-full">
            <span className="text-xs text-slate-400 font-medium block mb-1">
              المسدد في هذا الإيصال
            </span>
            <div
              className={`flex items-baseline justify-end gap-1.5 ${
                hasRemaining && !isRemainingSettlement
                  ? 'text-[#0A164E]'
                  : 'text-emerald-600'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                {formatMoney(payment.amount)}
              </span>
              <span
                className={`text-xs font-bold ${
                  hasRemaining && !isRemainingSettlement
                    ? 'text-slate-600'
                    : 'text-emerald-700'
                }`}
              >
                ج.م
              </span>
            </div>
          </div>

          <div className="text-right w-full text-xs text-slate-400 font-medium">
            <span>إجمالي الكشف: {totalFee} ج.م</span>
          </div>

          {/* زر أو شارة سداد المتبقي */}
          {hasRemaining && appointment?.id && (
            <button
              type="button"
              onClick={() => onPayRemaining(payment)}
              className="mt-1 w-full py-1.5 px-3 rounded-xl bg-[#FEFCE8] hover:bg-[#FEF08A] text-[#854D0E] border border-[#FDE047] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <span>المتبقي للتحصيل:</span>
              <span className="font-sans font-black">{remainingAmount} ج.م</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
