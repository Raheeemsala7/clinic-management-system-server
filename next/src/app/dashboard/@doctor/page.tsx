import { DoctorDashboardView } from '@/features/dashboard';
import { getTodayWaitingAppointmentsApi } from '@/features/appointments/apis/appointment.api';

export default async function DoctorPage() {
  const res = await getTodayWaitingAppointmentsApi();
  const initialQueue = res && res.status && Array.isArray(res.payload) ? res.payload : [];

  return <DoctorDashboardView initialQueue={initialQueue} />;
}
