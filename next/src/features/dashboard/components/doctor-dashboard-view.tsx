'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Clock,
  CheckCircle2,
  Users,
  Activity,
  FileText,
  LogIn,
  RefreshCw,
  Phone,
  User,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TodayQueueItem } from '@/features/appointments/apis/appointment.api';
import {
  useTodayQueueQuery,
  useDoctorStatusQuery,
  useUpdateDoctorStatusMutation,
  useAdmitAppointmentMutation,
  useFinishExamAppointmentMutation,
} from '@/features/appointments/hooks/appointments.hook';

interface DoctorDashboardViewProps {
  initialQueue?: TodayQueueItem[];
}

/**
 * دالة مساعدة لتنسيق مدة الانتظار بالاستقبال بصيغة مقروءة وواضحة للطبيب
 */
function formatWaitingTime(mins?: number | null) {
  if (mins === null || mins === undefined) return 'في الاستقبال حالياً';
  if (mins <= 1) return 'وصل للتو (أقل من دقيقة)';
  if (mins < 60) return `في الاستقبال منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  const remMinutes = mins % 60;
  return remMinutes > 0
    ? `في الاستقبال منذ ${hours} س و ${remMinutes} د`
    : `في الاستقبال منذ ${hours} ساعة`;
}

/**
 * شاشة كشف اليوم للطبيب (Doctor Dashboard)
 * مربوطة مباشرة بـ GET /api/v1/queue/today وبـ React Query مع Auto-polling
 */
export const DoctorDashboardView = ({ initialQueue = [] }: DoctorDashboardViewProps) => {
  const t = useTranslations('Dashboard.doctor');
  const tDoctorStatus = useTranslations('Dashboard.doctorStatus');

  const [activeTab, setActiveTab] = useState<'waiting' | 'past' | 'done' | 'all'>('waiting');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // استعلامات React Query
  const {
    data: queue = initialQueue,
    isFetching,
    refetch,
  } = useTodayQueueQuery(initialQueue);

  const { data: doctorStatusData, isFetching: isStatusFetching } = useDoctorStatusQuery();
  const updateStatusMutation = useUpdateDoctorStatusMutation();
  const admitMutation = useAdmitAppointmentMutation();
  const finishExamMutation = useFinishExamAppointmentMutation();

  const isAvailable = (doctorStatusData?.status || 'AVAILABLE') === 'AVAILABLE';

  // تصنيف المرضى
  const waitingPatients = queue.filter(
    (p) => p.status === 'WAITING' || p.status === 'BOOKED'
  );
  const inProgressPatient = queue.find((p) => p.status === 'IN_PROGRESS');
  const completedPatients = queue.filter(
    (p) => p.status === 'COMPLETED' || p.status === 'PENDING_CHECKOUT'
  );
  const pastPatients = queue.filter((p) => Boolean(p.isPastAppointment));

  const totalCount = queue.length;
  const waitingCount = waitingPatients.length;
  const completedCount = completedPatients.length;
  const pastCount = pastPatients.length;

  // المريض النشط في غرفة الكشف
  // الأولوية دائماً للمريض الموجود حالياً داخل الكشف (IN_PROGRESS)
  // وإن لم يوجد، المريض المحدد يدويًا، أو أول مريض في الانتظار
  const selectedPatient = selectedPatientId
    ? queue.find((p) => p.id === selectedPatientId)
    : null;
  const activeExamPatient = inProgressPatient || selectedPatient || waitingPatients[0] || null;

  // القائمة المفلترة حسب التبويب المختار
  const filteredPatients =
    activeTab === 'waiting'
      ? waitingPatients
      : activeTab === 'past'
      ? pastPatients
      : activeTab === 'done'
      ? completedPatients
      : queue;

  return (
    <div className="space-y-6">
      {/* رأس الصفحة + مؤشر التحديث */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{t('subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={cn('w-3.5 h-3.5 text-slate-500', isFetching && 'animate-spin')} />
          <span>{isFetching ? 'جاري التحديث...' : 'تحديث القائمة'}</span>
        </button>
      </div>

      {/* تنبيه وجود حجوزات قديمة متبقية لم تنتهِ */}
      {pastCount > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start shadow-2xs animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-black text-amber-950 text-sm">
                تنبيه: يوجد {pastCount} كشوفات سابقة غير مكتملة من أيام ماضية
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                هذه الحالات سُجلت بتواريخ سابقة ولم يتم إنهاء كشفها أو حضورها، وتم إدراجها لمتابعتها مع المرضى فوراً.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto',
              activeTab === 'past'
                ? 'bg-amber-950 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            )}
          >
            عرض الحجوزات السابقة ({pastCount})
          </button>
        </div>
      )}

      {/* صف بطاقات المتابعة والحالة الأربعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة حالة الطبيب */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">
              {tDoctorStatus('title')}
            </span>
            {isStatusFetching && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate('AVAILABLE')}
              className={cn(
                'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60',
                isAvailable
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>{tDoctorStatus('available')}</span>
            </button>

            <button
              type="button"
              disabled={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate('BREAK')}
              className={cn(
                'flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center border cursor-pointer disabled:opacity-60',
                !isAvailable
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {tDoctorStatus('takeBreak')}
            </button>
          </div>
        </div>

        {/* بطاقة في الانتظار (إطار أصفر) */}
        <div className="bg-[#FFFDF0] rounded-2xl p-5 shadow-xs border-2 border-brand-yellow flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-500">
            {t('waitingStatus')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">{waitingCount}</span>
            <span className="text-xs font-bold text-slate-500">{t('remainingCases')}</span>
          </div>
        </div>

        {/* بطاقة تم الكشف (إطار أزرق فاتح) */}
        <div className="bg-[#F0F5FF] rounded-2xl p-5 shadow-xs border border-blue-200 flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-500">
            {t('completedCheckup')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">{completedCount}</span>
            <span className="text-xs font-bold text-slate-500">{t('doneCheckup')}</span>
          </div>
        </div>

        {/* بطاقة إجمالي الحالات اليوم */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between text-center">
          <span className="text-xs font-semibold text-slate-400">
            {t('totalCases')}
          </span>
          <div className="flex items-baseline justify-center gap-2 my-1">
            <span className="text-3xl font-black text-[#0A164E]">{totalCount}</span>
            <span className="text-xs font-bold text-slate-500">{t('registeredAppointments')}</span>
          </div>
        </div>
      </div>

      {/* القسم الرئيسي ذو العمودين: قائمة الانتظار (يمين) + شاشة الكشف الكبرى (يسار) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[500px]">
        {/* العمود الأيمن (في RTL): قائمة الانتظار التفاعلية */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0040D8]" />
                <h3 className="font-black text-base text-[#0A164E]">
                  {t('queueTitle')}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] text-xs font-bold">
                {t('totalBadge', { count: totalCount })}
              </span>
            </div>

            {/* أزرار التصفية: في الانتظار / حجوزات سابقة / تم الكشف / الكل */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl mb-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('waiting')}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'waiting'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.waiting')} ({waitingCount})
              </button>

              {pastCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('past')}
                  className={cn(
                    'flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                    activeTab === 'past'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  )}
                >
                  سابقة ({pastCount})
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('done')}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'done'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.done')} ({completedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={cn(
                  'flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  activeTab === 'all'
                    ? 'bg-[#0A164E] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {t('tabs.all')} ({totalCount})
              </button>
            </div>

            {/* قائمة كروت المرضى */}
            {filteredPatients.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm font-semibold flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
                <p>{t('emptyQueue')}</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredPatients.map((patient) => {
                  const isCurrentInExam = patient.status === 'IN_PROGRESS';
                  const isSelected = activeExamPatient?.id === patient.id;
                  const queueNo = String(patient.queueNumber).padStart(2, '0');

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={cn(
                        'p-3.5 rounded-2xl border transition-all cursor-pointer text-start relative',
                        isCurrentInExam
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-xs ring-1 ring-emerald-300'
                          : isSelected
                          ? 'bg-blue-50/40 border-[#0040D8] shadow-xs ring-1 ring-blue-500/20'
                          : patient.isPastAppointment
                          ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300 hover:bg-amber-50/60'
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        {/* رقم الدور + الاسم والبيانات */}
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              'w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0',
                              isCurrentInExam
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : patient.isPastAppointment
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-50 text-[#0040D8]'
                            )}
                          >
                            #{queueNo}
                          </span>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-[#0A164E] text-sm">
                                {patient.patientName}
                              </span>

                              {isCurrentInExam && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {t('activeExam')}
                                </span>
                              )}

                              {patient.isPastAppointment && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Calendar className="w-3 h-3 text-amber-700" />
                                  <span>حجز سابق ({patient.clinicDate})</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium flex-wrap">
                              <span dir="ltr" className="font-mono">
                                {patient.patientPhone || '—'}
                              </span>
                              {patient.patientAge && (
                                <span>• {patient.patientAge} {t('yearsOld')}</span>
                              )}
                              <span>• {patient.type === 'EXAMINATION' ? t('checkup') : patient.type === 'CONSULTATION' ? t('consultation') : patient.type}</span>
                            </div>

                            {/* شارة إظهار مدة بقاء المريض في الاستقبال */}
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 text-[#0040D8] text-[11px] font-bold">
                              <Clock className="w-3.5 h-3.5 text-[#0040D8]" />
                              <span>{formatWaitingTime(patient.waitingMinutes)}</span>
                            </div>
                          </div>
                        </div>

                        {/* الحالة والأزرار السريعة */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Link
                            href={`/dashboard/examination/${patient.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0040D8] hover:bg-blue-100 text-[11px] font-bold transition-all shadow-2xs whitespace-nowrap"
                          >
                            كشف وروشتة 📋
                          </Link>

                          {/* زر الإدخال السريع إذا كان في الانتظار */}
                          {(patient.status === 'WAITING' || patient.status === 'BOOKED') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                admitMutation.mutate(patient.id);
                              }}
                              disabled={admitMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                            >
                              {admitMutation.isPending && admitMutation.variables === patient.id
                                ? t('admitting')
                                : t('admitNow')}
                            </button>
                          )}

                          {patient.status === 'PENDING_CHECKOUT' && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              بانتظار المحاسبة
                            </span>
                          )}

                          {patient.status === 'COMPLETED' && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                              تم الكشف
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>محدث تلقائياً كل 10 ثوانٍ</span>
            <span className="font-semibold text-slate-500">
              {waitingCount} مريض في صالة الانتظار
            </span>
          </div>
        </div>

        {/* العمود الأيسر (في RTL): شاشة غرفة الكشف التفاعلية الكبرى */}
        <div className="lg:col-span-7 flex flex-col">
          {inProgressPatient ? (
            /* الحالة 1: يوجد مريض حالياً داخل الكشف (IN_PROGRESS) */
            <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
              {/* شريط الإشعار العلوي باللون الأخضر */}
              <div className="absolute top-0 inset-x-0 bg-emerald-500 text-white py-1.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>غرفة الكشف مشغولة حالياً — {t('activeExam')}</span>
              </div>

              <div className="mt-4">
                {/* رأس بيانات المريض */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                      #{String(inProgressPatient.queueNumber).padStart(2, '0')}
                    </span>
                    <div className="text-start">
                      <h3 className="text-2xl font-black text-[#0A164E]">
                        {inProgressPatient.patientName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
                        <span dir="ltr" className="font-mono flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {inProgressPatient.patientPhone || '—'}
                        </span>
                        {inProgressPatient.patientAge && (
                          <span>• {inProgressPatient.patientAge} {t('yearsOld')}</span>
                        )}
                        {inProgressPatient.patientGender && (
                          <span>• {inProgressPatient.patientGender === 'MALE' ? 'ذكر' : 'أنثى'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* رابط فتح الملف الطبي */}
                  <Link
                    href={`/dashboard/view-patients/${inProgressPatient.patientId}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-[#0040D8] font-bold text-xs hover:bg-blue-100 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{t('viewPatientFile')}</span>
                  </Link>
                </div>

                {/* شبكة تفاصيل الزيارة والحساب ومدة الانتظار */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                  <div className="bg-slate-50 rounded-2xl p-4 text-start">
                    <span className="text-xs text-slate-400 block mb-1">نوع الموعد</span>
                    <span className="text-sm font-black text-[#0A164E]">
                      {inProgressPatient.type === 'EXAMINATION'
                        ? t('checkup')
                        : inProgressPatient.type === 'CONSULTATION'
                        ? t('consultation')
                        : inProgressPatient.type}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-start">
                    <span className="text-xs text-slate-400 block mb-1">وقت الانتظار بالاستقبال</span>
                    <span className="text-sm font-black text-[#0040D8] flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#0040D8]" />
                      <span>{formatWaitingTime(inProgressPatient.waitingMinutes)}</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 text-start">
                    <span className="text-xs text-slate-400 block mb-1">{t('financialSummary')}</span>
                    <span
                      className={cn(
                        'text-sm font-black',
                        inProgressPatient.remainingAmount > 0
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      )}
                    >
                      {inProgressPatient.remainingAmount > 0
                        ? `${t('remaining')} ${inProgressPatient.remainingAmount} ${t('egp')}`
                        : t('paid')}
                    </span>
                  </div>

                  {inProgressPatient.isPastAppointment && (
                    <div className="bg-amber-50 rounded-2xl p-4 text-start col-span-2 border border-amber-200">
                      <span className="text-xs text-amber-700 block mb-1 font-bold">تاريخ الحجز المسبق</span>
                      <span className="text-sm font-black text-amber-950">
                        {inProgressPatient.clinicDate} (حجز قديم معلق تم إدخاله للكشف)
                      </span>
                    </div>
                  )}
                </div>

                {/* تذكير إنهاء الكشف */}
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3 text-start">
                  <Stethoscope className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    عند الانتهاء من الفحص، اضغط على زر إنهاء الكشف بالأسفل. سيتم نقل المريض مباشرة إلى الاستقبال لتسوية الحساب وخروجه دون فقدان بياناته المالية.
                  </p>
                </div>
              </div>

              {/* أزرار الإجراءات: فحص المريض وكتابة الروشتة + إنهاء الكشف */}
              <div className="mt-8 pt-4 border-t border-slate-100 space-y-2.5">
                <Link
                  href={`/dashboard/examination/${inProgressPatient.id}`}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#0040D8] hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Stethoscope className="w-5 h-5 stroke-[2.2]" />
                  <span>فحص المريض وكتابة الكشف والروشتة (Rx) 🩺</span>
                </Link>

                <button
                  type="button"
                  disabled={finishExamMutation.isPending}
                  onClick={() => finishExamMutation.mutate(inProgressPatient.id)}
                  className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  <span>
                    {finishExamMutation.isPending
                      ? t('finishing')
                      : t('finishExam')}
                  </span>
                </button>
              </div>
            </div>
          ) : waitingPatients.length > 0 ? (
            /* الحالة 2: الغرفة فارغة ولكن يوجد مرضى في الانتظار */
            <div className="bg-white border-2 border-dashed border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xs h-full">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0040D8] mb-4 shadow-2xs">
                <Stethoscope className="w-8 h-8 stroke-[1.8]" />
              </div>

              <h3 className="text-2xl font-black text-[#0A164E] mb-2 tracking-tight">
                {t('readyForNext')}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                {t('clickToAdmit')}
              </p>

              {/* بطاقة أول مريض قادم في الانتظار */}
              {activeExamPatient && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 w-full max-w-md text-start mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400">
                      المريض القادم في الطابور
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0040D8] text-white text-xs font-black">
                      #{String(activeExamPatient.queueNumber).padStart(2, '0')}
                    </span>
                  </div>

                  <h4 className="font-black text-lg text-[#0A164E] mb-1">
                    {activeExamPatient.patientName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span dir="ltr" className="font-mono">
                      {activeExamPatient.patientPhone}
                    </span>
                    {activeExamPatient.patientAge && (
                      <span>• {activeExamPatient.patientAge} {t('yearsOld')}</span>
                    )}
                    <span>
                      • {activeExamPatient.type === 'EXAMINATION' ? t('checkup') : t('consultation')}
                    </span>
                  </div>

                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100/70 text-[#0040D8] text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#0040D8]" />
                    <span>{formatWaitingTime(activeExamPatient.waitingMinutes)}</span>
                  </div>

                  {activeExamPatient.isPastAppointment && (
                    <div className="mt-2 text-xs font-bold text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                      حجز سابق معلق من تاريخ: {activeExamPatient.clinicDate}
                    </div>
                  )}
                </div>
              )}

              {/* أزرار الإجراءات للمريض القادم: إدخال أو كشف مباشر */}
              {activeExamPatient && (
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={admitMutation.isPending}
                    onClick={() => admitMutation.mutate(activeExamPatient.id)}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {admitMutation.isPending
                        ? t('admitting')
                        : t('admitNext')}
                    </span>
                  </button>

                  <Link
                    href={`/dashboard/examination/${activeExamPatient.id}`}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all cursor-pointer shadow-2xs"
                  >
                    <Stethoscope className="w-4 h-4 text-[#0040D8]" />
                    <span>فتح الكشف والروشتة 🩺</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* الحالة 3: الغرفة فارغة ولا يوجد أي مرضى في قائمة الانتظار اليوم */
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xs h-full">
              <div className="w-16 h-16 rounded-2xl bg-[#0A164E] flex items-center justify-center mb-5 shadow-md">
                <div className="grid grid-cols-2 gap-1 w-7 h-7" aria-hidden="true">
                  <span className="w-3 h-3 rounded-xs bg-[#1D4ED8]" />
                  <span className="w-3 h-3 rounded-xs bg-white" />
                  <span className="w-3 h-3 rounded-xs bg-[#081544]" />
                  <span className="w-3 h-3 rounded-xs bg-brand-yellow" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-[#0A164E] mb-2 tracking-tight">
                {t('emptyRoomTitle')}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm">
                {t('emptyRoomSubtitle')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
