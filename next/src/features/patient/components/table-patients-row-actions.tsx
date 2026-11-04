'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit2, Trash2, FileText } from 'lucide-react';
import { Patient } from '../types/patient';
import { DeletePatientModal } from './delete-patient-modal';
import { EditPatientModal } from './edit-patient-modal';

interface TablePatientsRowActionsProps {
  patient: Patient;
}

export function TablePatientsRowActions({ patient }: TablePatientsRowActionsProps) {
  const pathname = usePathname();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // تحديد رابط ملف المريض بحسب ما إذا كان المستخدم طبيباً في view-patients أو موظف استقبال في patients
  const profileUrl = pathname?.includes('view-patients')
    ? `/dashboard/view-patients/${patient.id}`
    : `/dashboard/patients/${patient.id}`;

  return (
    <div className="flex items-center justify-end gap-1.5 flex-nowrap">
      {/* 1. زر عرض الملف */}
      <Link
        href={profileUrl}
        className="h-8 px-3 rounded-lg bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
      >
        <span>عرض الملف</span>
      </Link>

      {/* 2. زر تعديل */}
      <button
        type="button"
        onClick={() => setIsEditOpen(true)}
        className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
      >
        <span>تعديل</span>
        <Edit2 className="w-3 h-3 text-slate-400" />
      </button>

      {/* 3. زر حذف */}
      <button
        type="button"
        onClick={() => setIsDeleteOpen(true)}
        className="h-8 px-2.5 rounded-lg border border-rose-200 bg-[#FFF5F5] hover:bg-rose-100 active:scale-95 text-[#E11D48] font-bold text-xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
      >
        <span>حذف</span>
        <Trash2 className="w-3 h-3 text-[#E11D48]" />
      </button>

      {/* مودال الحذف النهائي / الأرشفة */}
      <DeletePatientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        patient={patient}
      />

      {/* مودال تعديل بيانات المريض */}
      <EditPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        patient={patient}
      />
    </div>
  );
}

