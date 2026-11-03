'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../schemas/booking.schema';
import { AppointmentPayload, BookingFormType } from '../types/booking';
import { PatientStepCard } from './patient-step-card';
import { AppointmentTypeStepCard } from './appointment-type-step-card';
import { DoctorTimingStepCard } from './doctor-timing-step-card';
import { FinancialStepCard } from './financial-step-card';
import { AttachmentsNotesStepCard } from './attachments-notes-step-card';
import { BookingSummaryPanel } from './booking-summary-panel';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateAppointmentMutation } from '../hooks/appointments.hook';


export function BookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createAppointment, isPaused: isCreating } = useCreateAppointmentMutation()

  const methods = useForm<BookingFormType>({
    resolver: zodResolver(bookingSchema()),
    defaultValues: {
      patientId: '',
      patientName: '',
      patientPhone: '',
      patientGender: '',
      patientAge: undefined,
      hasChronicDisease: false,
      chronicDiseases: [],
      chronicNotes: '',
      appointmentType: 'CONSULTATION',
      doctorId: '',
      appointmentDate: '2026-11-02',
      appointmentTime: '',
      source: 'WALK_IN',
      examinationFee: 300,
      paidAmount: 0,
      isExempt: false,
      exemptionReason: '',
      attachments: [],
      notes: '',
    },
    mode: 'onChange',
  });

  console.log(methods.formState.errors);


  async function onSubmit(data: BookingFormType) {
    setIsSubmitting(true);
    try {
      console.log('✅ تم إرسال بيانات الحجز بنجاح:', data);
      const payload: AppointmentPayload = {
        clinicDate: data.appointmentDate,
        type: data.appointmentType,
        totalAmount: data.examinationFee,
        paidAmount: data.paidAmount,
        source: data.source,
        isExempt: data.isExempt,
        exemptionReason: data.exemptionReason,
        attachments: data.attachments,
        notes: data.notes,
        patientId: data.patientId,
        doctorId: data.doctorId,
        scheduledAt:data.appointmentDate,
        
      }
      console.log("await createAppointment(payload)111");

      await createAppointment(payload)
      console.log("await createAppointment(payload)222");
      // toast.success('تم تأكيد وحفظ الحجز بنجاح!');
      // router.push('/dashboard');
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 pb-24 lg:pb-8">
        {/* شريط الإلغاء والعودة للرئيسية */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span>إلغاء والعودة</span>
          </Link>
        </div>

        {/* رأس الصفحة الرئيسي */}
        <div className="text-start">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
            حجز موعد جديد
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أدخل بيانات الحجز في شاشة واحدة، والملخص يُحدث تلقائياً
          </p>
        </div>

        {/* التخطيط الشبكي: عمود النموذج الرئيسي (يمين في RTL) + عمود الملخص الجانبي (يسار في RTL) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* العمود الرئيسي للبطاقات */}
          <div className="flex-1 w-full space-y-5">
            {/* 1. القسم الأول: المريض والتاريخ المرضي */}
            <PatientStepCard />

            {/* 2. القسم الثاني: نوع الموعد */}
            <AppointmentTypeStepCard />

            {/* 3. القسم الثالث: الطبيب والتوقيت */}
            <DoctorTimingStepCard />

            {/* 4 و 5. الأقسام المالية والمرفقات */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7">
                <FinancialStepCard />
              </div>
              <div className="lg:col-span-5">
                <AttachmentsNotesStepCard />
              </div>
            </div>
          </div>

          {/* عمود الملخص الجانبي الثابت */}
          <BookingSummaryPanel
            isSubmitting={isSubmitting}
            onCancel={() => router.push('/dashboard')}
          />
        </div>
      </form>
    </FormProvider>
  );
}
