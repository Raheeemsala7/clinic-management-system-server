import { cookies } from 'next/headers';
import { requireRole } from '@/lib/session';
import { getDoctors } from '@/lib/doctor';
import { BookingForm } from '@/features/appointments/booking-form';

export const dynamic = 'force-dynamic';

interface NewBookingPageProps {
  searchParams?: Promise<{
    doctorId?: string;
    date?: string;
    startTime?: string;
  }>;
}

export default async function AdminNewBookingPage({ searchParams }: NewBookingPageProps) {
  await requireRole(['ADMIN']);

  const resolved = searchParams ? await searchParams : {};
  const doctors = await getDoctors().catch(() => []);
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ar' ? 'ar' : 'en';

  return (
    <div className="py-2">
      <BookingForm
        doctors={doctors}
        userRole="ADMIN"
        locale={locale}
        defaultDoctorId={resolved.doctorId}
        defaultDate={resolved.date}
        defaultStartTime={resolved.startTime}
      />
    </div>
  );
}
