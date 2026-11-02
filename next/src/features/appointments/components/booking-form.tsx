'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../schemas/booking.schema';
import { BookingFormType } from '../types/booking';
import { PatientStepCard } from './patient-step-card';
import { BookingSummaryPanel } from './booking-summary-panel';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * النموذج الشامل لحجز موعد جديد
 * منسق بأسلوب احترافي ومقسّم إلى أجزاء مستقلة مع استخدام react-hook-form و zodResolver
 */
export function BookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<BookingFormType>({
    resolver: zodResolver(bookingSchema()),
    defaultValues: {
      patientId: '',
      patientName: '',
      patientPhone: '',
      hasChronicDisease: false,
      chronicDiseases: [],
      chronicNotes: '',
      appointmentType: 'examination',
      doctorId: 'doc-1',
      appointmentDate: '2026-11-02',
      appointmentTime: '04:30 م',
      attendanceType: 'direct',
      examinationFee: 300,
      paidAmount: 0,
      isExempt: false,
      exemptionReason: '',
      attachments: [],
      notes: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: BookingFormType) => {
    setIsSubmitting(true);
    try {
      console.log('✅ تم إرسال بيانات الحجز بنجاح:', data);
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('تم تأكيد وحفظ الحجز بنجاح!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الحجز، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: typeof methods.formState.errors) => {
    console.log('❌ خطأ في التحقق من البيانات:', errors);
    toast.error('يرجى التحقق من صحة البيانات وإكمال الحقول المطلوبة.');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="space-y-6 pb-24 lg:pb-8">
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

            {/* سيتم إضافة الأقسام المتبقية (2 و 3 و 4 و 5) خطوة بخطوة بالترتيب */}
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
