import React from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Clock, Users, User, Calendar, Plus, ShieldCheck } from 'lucide-react';
import { getTodayWaitingAppointmentsApi } from '../apis/appointment.api';
import { TableAppointmentsRowActions } from './table-appointments-row-actions';

interface TableAppoinmentsReceptionProps {
  doctorId?: string;
}

/**
 * جدول قائمة انتظار مواعيد اليوم لشاشة الاستقبال (Server Component)
 * يجلب البيانات مباشرة من GET /api/v1/queue/today
 * ويعرض الموقف المالي والمبالغ المتبقية لكل مريض
 */
export async function TableAppoinmentsReception({ doctorId }: TableAppoinmentsReceptionProps = {}) {
  const t = await getTranslations('Dashboard.receptionist.table');

  const patientsResponse = await getTodayWaitingAppointmentsApi(doctorId);
  

  if (!patientsResponse || !patientsResponse.status || !Array.isArray(patientsResponse.payload)) {
    const errorMsg =
      patientsResponse && 'message' in patientsResponse
        ? (patientsResponse.message as string)
        : t('errorMessage');
    throw new Error(errorMsg);
  }

  const patients = patientsResponse.payload;

  // في حالة عدم وجود مرضى في قائمة الانتظار اليوم
  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-12 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8] mb-4 shadow-2xs">
            <Users className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-lg font-black text-[#0A164E] mb-2">
            {t('emptyTitle')}
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {t('emptySubtitle')}
          </p>
          <Link
            href="/dashboard/appointments/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>حجز موعد أو كشف مباشر</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {/* شريط الإحصائية العلوية السريعة */}
      <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">إجمالي الحالات في الانتظار:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#0040D8] text-white text-xs font-black">
            {patients.length}
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>اليوم</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-xs">
              <th className="py-4 px-6 text-start">{t('number')}</th>
              <th className="py-4 px-6 text-start">{t('patient')}</th>
              <th className="py-4 px-6 text-start">{t('doctor')}</th>
              <th className="py-4 px-6 text-center">{t('appointmentType')}</th>
              <th className="py-4 px-6 text-center">{t('status')}</th>
              <th className="py-4 px-6 text-center">{t('waitingDuration')}</th>
              <th className="py-4 px-6 text-center">{t('financialStatus')}</th>
              <th className="py-4 px-6 text-end">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {patients.map((patient) => {
              const queueNo = String(patient.queueNumber).padStart(2, '0');

              return (
                <tr
                  key={patient.id}
                  className={`transition-colors ${
                    patient.status === 'PENDING_CHECKOUT'
                      ? 'bg-amber-50/50 hover:bg-amber-50/80 border-r-4 border-r-amber-500'
                      : patient.status === 'IN_PROGRESS'
                      ? 'bg-emerald-50/30 hover:bg-emerald-50/60 border-r-4 border-r-emerald-500'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* رقم الكشف */}
                  <td className="py-4 px-6 text-start">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-50 text-[#0040D8] font-black text-sm">
                      #{queueNo}
                    </span>
                  </td>

                  {/* اسم المريض وبياناته */}
                  <td className="py-4 px-6 text-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#0A164E] text-sm">
                        {patient.patientName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono" dir="ltr">
                          {patient.patientPhone || 'لا يوجد هاتف'}
                        </span>
                        {patient.patientAge && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            • {patient.patientAge} سنة
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* الطبيب المعالج */}
                  <td className="py-4 px-6 text-start">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-xs">{patient.doctorName || '-'}</span>
                    </div>
                  </td>

                  {/* نوع الكشف ومصدر الحجز */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {patient.type === 'EXAMINATION'
                          ? t('checkup')
                          : patient.type === 'CONSULTATION'
                          ? t('consultation')
                          : patient.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {patient.source === 'WALK_IN' ? 'كشف مباشر' : 'حجز مسبق'}
                      </span>
                    </div>
                  </td>

                  {/* الحالة */}
                  <td className="py-4 px-6 text-center">
                    {patient.status === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {t('inCheckup')}
                      </span>
                    ) : patient.status === 'PENDING_CHECKOUT' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                        {t('pendingCheckout')}
                      </span>
                    ) : patient.status === 'WAITING' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {t('waiting')}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {patient.status}
                      </span>
                    )}
                  </td>

                  {/* مدة الانتظار */}
                  <td className="py-4 px-6 text-center">
                    {patient.waitingMinutes !== null ? (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                        <Clock
                          className={`w-3.5 h-3.5 ${
                            patient.waitingMinutes > 30 ? 'text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span className={patient.waitingMinutes > 30 ? 'text-amber-700 font-bold' : ''}>
                          {t('minutes', { count: patient.waitingMinutes })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* الموقف المالي والمتبقي */}
                  <td className="py-4 px-6 text-center">
                    {patient.isExempt ? (
                      // حالة الإعفاء من الرسوم
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>{t('exempt')}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium mt-0.5">0 ج.م</span>
                      </div>
                    ) : patient.isFullyPaid ? (
                      // حالة مدفوع بالكامل
                      <div className="flex flex-col items-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t('paidInFull')}</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold mt-0.5">
                          {patient.totalAmount} ج.م
                        </span>
                      </div>
                    ) : patient.hasRemaining ? (
                      // حالة متبقي مبلغ (سداد جزئي أو متبقي)
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{t('remaining')}: {patient.remainingAmount} ج.م</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {t('paidOfTotal', { paid: patient.paidAmount, total: patient.totalAmount })}
                        </span>
                      </div>
                    ) : (
                      // غير مدفوع إطلاقاً
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{t('unpaid')}</span>
                        </span>
                        <span className="text-[11px] text-rose-600 font-bold mt-0.5">
                          {patient.totalAmount} ج.م
                        </span>
                      </div>
                    )}
                  </td>

                  {/* الإجراءات السريعة */}
                  <td className="py-4 px-6 text-end">
                    <TableAppointmentsRowActions
                      appointmentId={patient.id}
                      patientName={patient.patientName}
                      status={patient.status}
                      hasRemaining={patient.hasRemaining}
                      remainingAmount={patient.remainingAmount}
                      totalAmount={patient.totalAmount}
                      paidAmount={patient.paidAmount}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
