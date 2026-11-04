'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { PatientDetails, Patient } from '../types/patient';
import { PatientHeroBanner } from './patient-hero-banner';
import { PatientMetricCards } from './patient-metric-cards';
import { PatientPersonalInfoCard } from './patient-personal-info-card';
import { PatientMedicalHistoryCard } from './patient-medical-history-card';
import { PatientAttachmentsCard } from './patient-attachments-card';
import { PatientVisitsTable } from './patient-visits-table';
import { PatientNotesCard } from './patient-notes-card';
import { DeletePatientModal } from './delete-patient-modal';
import { EditPatientModal } from './edit-patient-modal';

interface PatientProfileViewProps {
  details: PatientDetails;
}

type TabType = 'overview' | 'visits' | 'payments' | 'attachments' | 'notes';

export function PatientProfileView({ details }: PatientProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('visits');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const patient = details.patient;
  const patientAsItem: Patient = {
    id: patient.id,
    fullName: patient.fullName,
    phone: patient.phone,
    gender: patient.gender,
    age: patient.age,
    dateOfBirth: patient.dateOfBirth || undefined,
    address: patient.address || undefined,
    chronicConditions: patient.chronicConditions,
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'visits', label: 'الزيارات' },
    { id: 'payments', label: 'المدفوعات' },
    { id: 'attachments', label: 'المرفقات' },
    { id: 'notes', label: 'ملاحظات' },
  ];

  return (
    <div className="space-y-6 select-none" dir="rtl">
      {/* 1. الشريط العلوي: العودة للمرضى + أزرار الإجراءات */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        {/* أزرار الإجراءات على اليسار */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/dashboard/appointments/new?patientId=${patient.id}`}
            className="h-10 px-4 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>حجز جديد</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>تعديل البيانات</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="h-10 px-3.5 rounded-xl border border-rose-200 bg-[#FFF5F5] hover:bg-rose-100 text-[#E11D48] font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>حذف</span>
          </button>
        </div>

        {/* زر العودة للمرضى على اليمين */}
        <Link
          href="/dashboard/patients"
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>العودة للمرضى</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* 2. بطاقة معلومات المريض الرئيسية (Hero Banner) */}
      <PatientHeroBanner details={details} />

      {/* 3. بطاقات الإحصائيات الأربع (KPI Metrics) */}
      <PatientMetricCards details={details} />

      {/* 4. التقسيم الرئيسي (عمودين متوازيين) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* العمود الأيمن (البيانات الشخصية والطبية والمرفقات) */}
        <div className="lg:col-span-4 space-y-5">
          <PatientPersonalInfoCard details={details} />
          <PatientMedicalHistoryCard details={details} />
          <PatientAttachmentsCard details={details} />
        </div>

        {/* العمود الأيسر (التبويبات وجدول الزيارات والملاحظات) */}
        <div className="lg:col-span-8 space-y-5">
          {/* بطاقة التبويبات والمحتوى */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            {/* شريط ألسنة التبويب */}
            <div className="flex items-center gap-4 px-6 pt-4 border-b border-slate-100 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 font-bold text-xs transition-all cursor-pointer whitespace-nowrap relative ${
                      isActive
                        ? 'text-[#0040D8] font-black'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0040D8] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* محتوى التبويب */}
            <div className="p-4 sm:p-5">
              {activeTab === 'visits' && (
                <PatientVisitsTable visits={details.previousAppointments || []} />
              )}

              {activeTab === 'overview' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  عرض موجز شامل لكافة التعاملات السابقة للمريض في العيادة
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  إجمالي المبالغ المسددة {details.financialSummary.totalPaid} ج.م والمتبقي{' '}
                  {details.financialSummary.outstandingBalance} ج.م
                </div>
              )}

              {activeTab === 'attachments' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  يمكن استعراض كافة المرفقات وصور الأشعة من القائمة الجانبية أو من تبويب المرفقات
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="p-4 text-center text-xs text-slate-400">
                  انظر قسم الملاحظات أدناه لإضافة واستعراض ملاحظات الاستقبال والطبيب
                </div>
              )}
            </div>
          </div>

          {/* قسم ملاحظات الطبيب والاستقبال */}
          <PatientNotesCard
            notes={details.notes}
            patientId={patient.id}
          />
        </div>
      </div>

      {/* مودال الحذف النهائي / الأرشفة */}
      <DeletePatientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        patient={patientAsItem}
        onSuccess={() => router.push('/dashboard/patients')}
      />

      {/* مودال تعديل بيانات المريض */}
      <EditPatientModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        patient={patientAsItem}
      />
    </div>
  );
}

