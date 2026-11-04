import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { TableAppointmentsSkeleton } from '@/features/appointments/components/table-appointments-skeleton';
import { TableAppointmentsError } from '@/features/appointments/components/table-appointments-error';
import { TableAppoinmentsReception } from '@/features/appointments/components/table-appoinments-reception';

/**
 * المحتوى الخاص بشاشة الاستقبال (Receptionist Dashboard) - Server Component مع Suspense & ErrorBoundary
 */
export async function ReceptionistDashboardView() {
  const t = await getTranslations('Dashboard.receptionist');
  const tDoctorStatus = await getTranslations('Dashboard.doctorStatus');

  return (
    <div className="space-y-6">
      {/* رأس الصفحة + زر حجز موعد جديد */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-start">
          <h2 className="text-3xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('subtitle')}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>{tDoctorStatus('available')}</span>
          </div>
        </div>

        {/* زر حجز موعد / تسجيل مريض */}
        <Link
          href="/dashboard/appointments/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0040D8] hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('bookPatient')}</span>
        </Link>
      </div>

      {/* جدول قائمة انتظار المرضى مع معالجة الأخطاء وحالة التحميل التفاعلية */}
      <ErrorBoundary errorComponent={TableAppointmentsError}>
        <Suspense fallback={<TableAppointmentsSkeleton />}>
          <TableAppoinmentsReception />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
