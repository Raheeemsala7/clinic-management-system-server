'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface TableAppointmentsRowActionsProps {
  appointmentId: string;
  patientName: string;
  hasRemaining: boolean;
  remainingAmount: number;
}

export function TableAppointmentsRowActions({
  appointmentId,
  patientName,
  hasRemaining,
  remainingAmount,
}: TableAppointmentsRowActionsProps) {
  const t = useTranslations('Dashboard.receptionist.table');

  const handleAdmit = () => {
    toast.success(`تم استدعاء المريض ${patientName} للدخول لغرفة الكشف`);
  };

  const handlePostpone = () => {
    toast.info(`تم تأجيل دور المريض ${patientName}`);
  };

  const handleCancel = () => {
    toast.error(`تم إلغاء حجز المريض ${patientName}`);
  };

  const handlePayRemaining = () => {
    toast.info(`فتح نافذة تحصيل المتبقي (${remainingAmount} ج.م) للمريض ${patientName}`);
  };

  return (
    <div className="inline-flex items-center gap-1.5 justify-end">
      {/* زر إدخال المريض للعيادة */}
      <button
        type="button"
        onClick={handleAdmit}
        title={t('admit')}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{t('admit')}</span>
      </button>

      {/* زر تحصيل المتبقي إذا كان عليه مبلغ متبقي */}
      {hasRemaining && (
        <button
          type="button"
          onClick={handlePayRemaining}
          title={t('payRemaining')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>سداد</span>
        </button>
      )}

      {/* زر تأجيل الدور */}
      <button
        type="button"
        onClick={handlePostpone}
        title={t('postpone')}
        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
      >
        <Clock className="w-3.5 h-3.5" />
      </button>

      {/* زر إلغاء */}
      <button
        type="button"
        onClick={handleCancel}
        title={t('cancel')}
        className="p-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
      >
        <XCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

