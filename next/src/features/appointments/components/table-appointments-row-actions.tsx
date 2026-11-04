'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, XCircle, CreditCard, LogIn, Stethoscope } from 'lucide-react';
import {
  useAdmitAppointmentMutation,
  useFinishExamAppointmentMutation,
  usePostponeAppointmentMutation,
  useCancelAppointmentMutation,
} from '../hooks/appointments.hook';
import { CheckoutPaymentModal } from './checkout-payment-modal';

interface TableAppointmentsRowActionsProps {
  appointmentId: string;
  patientName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'BOOKED' | 'PENDING_CHECKOUT';
  hasRemaining: boolean;
  remainingAmount: number;
  totalAmount: number;
  paidAmount: number;
}

export function TableAppointmentsRowActions({
  appointmentId,
  patientName,
  status,
  hasRemaining,
  remainingAmount,
  totalAmount,
  paidAmount,
}: TableAppointmentsRowActionsProps) {
  const t = useTranslations('Dashboard.receptionist.table');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const admitMutation = useAdmitAppointmentMutation();
  const finishExamMutation = useFinishExamAppointmentMutation();
  const postponeMutation = usePostponeAppointmentMutation();
  const cancelMutation = useCancelAppointmentMutation();

  const isAnyPending =
    admitMutation.isPending ||
    finishExamMutation.isPending ||
    postponeMutation.isPending ||
    cancelMutation.isPending;

  const handleAdmit = () => {
    admitMutation.mutate(appointmentId);
  };

  const handleFinishExam = () => {
    finishExamMutation.mutate(appointmentId);
  };

  const handlePostpone = () => {
    postponeMutation.mutate(appointmentId);
  };

  const handleCancel = () => {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء حجز المريض ${patientName}؟`)) return;
    cancelMutation.mutate(appointmentId);
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 justify-end">
        {/* الحالة 1: في صالة الانتظار أو محجوز -> زر إدخال للطبيب */}
        {(status === 'WAITING' || status === 'BOOKED') && (
          <button
            type="button"
            onClick={handleAdmit}
            disabled={isAnyPending}
            title={t('admit')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0040D8] hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <LogIn className={`w-3.5 h-3.5 ${admitMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{t('admit')}</span>
          </button>
        )}

        {/* الحالة 2: داخل الكشف مع الطبيب -> زر إنهاء الكشف من جانب الطبيب أو الاستقبال */}
        {status === 'IN_PROGRESS' && (
          <button
            type="button"
            onClick={handleFinishExam}
            disabled={isAnyPending}
            title={t('finishExam')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            <Stethoscope className={`w-3.5 h-3.5 ${finishExamMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{t('finishExam')}</span>
          </button>
        )}

        {/* الحالة 3: خرج من الكشف وبانتظار المحاسبة والخروج -> زر تحصيل المتبقي وإنهاء الزيارة */}
        {status === 'PENDING_CHECKOUT' && (
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(true)}
            disabled={isAnyPending}
            title={hasRemaining ? t('checkoutAndSettle') : t('checkout')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-60 text-white font-bold text-xs transition-all cursor-pointer shadow-md animate-pulse"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{hasRemaining ? t('checkoutAndSettle') : t('checkout')}</span>
          </button>
        )}

        {/* زر تأجيل الدور (متاح في الانتظار فقط) */}
        {(status === 'WAITING' || status === 'BOOKED') && (
          <button
            type="button"
            onClick={handlePostpone}
            disabled={isAnyPending}
            title={t('postpone')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95 disabled:opacity-60 text-slate-600 transition-colors cursor-pointer"
          >
            <Clock className={`w-3.5 h-3.5 ${postponeMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* زر إلغاء */}
        {status !== 'PENDING_CHECKOUT' && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isAnyPending}
            title={t('cancel')}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 active:scale-95 disabled:opacity-60 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <XCircle className={`w-3.5 h-3.5 ${cancelMutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* نافذة تسوية الحساب والمغادرة النهائية */}
      <CheckoutPaymentModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        appointmentId={appointmentId}
        patientName={patientName}
        remainingAmount={remainingAmount}
        totalAmount={totalAmount}
        paidAmount={paidAmount}
        onSuccess={() => {}}
      />
    </>
  );
}
