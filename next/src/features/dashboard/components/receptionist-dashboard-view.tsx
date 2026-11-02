'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { WaitingPatient } from '../types';

/**
 * المحتوى الخاص بشاشة الاستقبال (Receptionist Dashboard) - مطابق تماماً للصورة 3
 */
export const ReceptionistDashboardView = () => {
  const patients: WaitingPatient[] = [
    {
      id: 'p-1',
      number: '#1',
      name: 'محمد علاء',
      type: 'كشف',
      status: 'في الانتظار',
      waitingTime: '0 دقيقة',
    },
    {
      id: 'p-2',
      number: '#2',
      name: '[اسم المريض]',
      type: 'استشارة',
      status: 'في الانتظار',
      waitingTime: '12 دقيقة',
    },
    {
      id: 'p-3',
      number: '#3',
      name: '[اسم المريض]',
      type: 'كشف',
      status: 'داخل الكشف',
      waitingTime: '25 دقيقة',
    },
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة + زر حجز موعد جديد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black text-[#0A164E] tracking-tight">
            قائمة الانتظار
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            قائمة انتظار اليوم وإدارة تدفق المرضى وتنسيق الكشف
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>طبيب: متاح</span>
          </div>
        </div>

        {/* زر حجز موعد / تسجيل مريض */}
        <Link
          href="/dashboard/bookings/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>حجز موعد / تسجيل مريض</span>
        </Link>
      </div>

      {/* جدول قائمة انتظار المرضى */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
                <th className="py-4 px-6 text-start">الرقم</th>
                <th className="py-4 px-6 text-start">المريض</th>
                <th className="py-4 px-6 text-center">نوع الموعد</th>
                <th className="py-4 px-6 text-center">الحالة</th>
                <th className="py-4 px-6 text-center">مدة الانتظار</th>
                <th className="py-4 px-6 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* الرقم */}
                  <td className="py-4 px-6 font-black text-[#1D4ED8] text-start">
                    {patient.number}
                  </td>

                  {/* اسم المريض */}
                  <td className="py-4 px-6 font-bold text-[#0A164E] text-start">
                    {patient.name}
                  </td>

                  {/* نوع الموعد */}
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#1D4ED8]">
                      {patient.type}
                    </span>
                  </td>

                  {/* الحالة */}
                  <td className="py-4 px-6 text-center">
                    {patient.status === 'في الانتظار' ? (
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-[#EAB308] text-slate-950">
                        {patient.status}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-[#0040D8] text-white">
                        {patient.status}
                      </span>
                    )}
                  </td>

                  {/* مدة الانتظار */}
                  <td className="py-4 px-6 text-center text-slate-500 font-semibold text-xs">
                    {patient.waitingTime}
                  </td>

                  {/* الإجراءات */}
                  <td className="py-4 px-6 text-end">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                      >
                        إدخال
                      </button>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                      >
                        تأجيل
                      </button>

                      <button
                        type="button"
                        className="px-2 py-1.5 text-red-500 hover:text-red-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

