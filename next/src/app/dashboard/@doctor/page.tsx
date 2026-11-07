import { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { DoctorDashboardView, DoctorDashboardSkeleton } from '@/features/dashboard';
import { getTodayWaitingAppointmentsApi } from '@/features/appointments/apis/appointment.api';

async function DoctorDashboardData() {
  try {
    const res = await getTodayWaitingAppointmentsApi();
    if (!res || !res.status) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center text-red-900 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in-50">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black mb-2">تعذر جلب قائمة الانتظار</h3>
          <p className="text-xs text-red-700 mb-6 leading-relaxed">
            {res?.message || 'حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى أو التأكد من تشغيل السيرفر.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </Link>
        </div>
      );
    }
    const initialQueue = Array.isArray(res.payload) ? res.payload : [];
    return <DoctorDashboardView initialQueue={initialQueue} />;
  } catch (error: any) {
    if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center text-red-900 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in-50">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black mb-2">فشل تحميل قائمة الكشوفات</h3>
        <p className="text-xs text-red-700 mb-6 leading-relaxed">
          {error?.message || 'حدث خطأ غير متوقع أثناء تحميل الصفحة.'}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>إعادة المحاولة</span>
        </Link>
      </div>
    );
  }
}

export default function DoctorPage() {
  return (
    <Suspense fallback={<DoctorDashboardSkeleton />}>
      <DoctorDashboardData />
    </Suspense>
  );
}
