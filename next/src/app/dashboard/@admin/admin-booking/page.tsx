import React from 'react';
import { BookingForm } from '@/features/appointments';

export const metadata = {
  title: 'حجز موعد جديد | المدير',
  description: 'تسجيل وحجز موعد جديد للمريض في العيادة من لوحة المدير',
};

export default function AdminNewAppointmentPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0A164E] tracking-tight">
          تسجيل وحجز موعد جديد
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-400">
          إضافة مريض وتحديد موعد الكشف وتفاصيل السداد والعربون
        </p>
      </div>

      <BookingForm />
    </div>
  );
}

