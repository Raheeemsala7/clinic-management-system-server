'use client';

import React, { useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { archivePatientAction, deletePatientAction } from '../apis/patient.action';
import { Patient } from '../types/patient';

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess?: () => void;
}

export function DeletePatientModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: DeletePatientModalProps) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isArchiving, startArchiveTransition] = useTransition();

  if (!isOpen || !patient) return null;

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const res = await deletePatientAction(patient.id);
      if (res.status) {
        toast.success(`تم حذف ملف المريض (${patient.fullName}) بنجاح`);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(res.message || 'فشل حذف المريض');
      }
    });
  };

  const handleArchive = () => {
    startArchiveTransition(async () => {
      const res = await archivePatientAction(patient.id);
      if (res.status) {
        toast.success(`تمت أرشفة ملف المريض (${patient.fullName}) بنجاح`);
        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        toast.error(res.message || 'فشل أرشفة ملف المريض');
      }
    });
  };

  const isBusy = isDeleting || isArchiving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* أيقونة سلة المهملات داخل دائرة وردية هادئة مطابقة للصورة */}
        <div className="w-16 h-16 rounded-full bg-[#FFE4E6] flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Trash2 className="w-7 h-7 text-[#E11D48] stroke-[1.8]" />
        </div>

        {/* عنوان النافذة */}
        <h3 className="text-xl sm:text-2xl font-black text-[#0A164E] tracking-tight mb-3">
          حذف المريض؟
        </h3>

        {/* نص الرسالة التوضيحية */}
        <p className="text-sm text-slate-500 leading-relaxed mb-1">
          سيتم حذف ملف <strong className="text-[#0A164E] font-black">{patient.fullName}</strong> وكل زياراته ومدفوعاته، ولا يمكن التراجع.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          يمكنك{' '}
          <button
            type="button"
            onClick={handleArchive}
            disabled={isBusy}
            className="text-[#0040D8] font-bold underline hover:text-blue-700 cursor-pointer inline-block"
          >
            أرشفته
          </button>{' '}
          بدل الحذف.
        </p>

        {/* أزرار الإجراءات الثلاثة مطابقة للتصميم */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* زر الحذف النهائي */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="h-11 rounded-xl bg-[#DC2626] hover:bg-rose-700 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف نهائي'}
          </button>

          {/* زر الأرشفة */}
          <button
            type="button"
            onClick={handleArchive}
            disabled={isBusy}
            className="h-11 rounded-xl bg-white hover:bg-blue-50 text-[#0040D8] border border-[#BFDBFE] font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isArchiving ? <Loader2 className="w-4 h-4 animate-spin text-[#0040D8]" /> : 'أرشفة'}
          </button>

          {/* زر الإلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="h-11 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

