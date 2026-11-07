import { Suspense } from 'react';
import { DoctorDashboardView, DoctorDashboardSkeleton } from '@/features/dashboard';
import { getTodayWaitingAppointmentsApi } from '@/features/appointments/apis/appointment.api';

async function DoctorDashboardData() {
  try {
    const res = await getTodayWaitingAppointmentsApi();
    const initialQueue = res && res.status && Array.isArray(res.payload) ? res.payload : [];
    return <DoctorDashboardView initialQueue={initialQueue} />;
  } catch (error) {
    return <DoctorDashboardView initialQueue={[]} />;
  }
}

export default function DoctorPage() {
  return (
    <Suspense fallback={<DoctorDashboardSkeleton />}>
      <DoctorDashboardData />
    </Suspense>
  );
}
