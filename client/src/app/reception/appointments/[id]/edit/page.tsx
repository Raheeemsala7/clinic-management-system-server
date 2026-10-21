import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { requireRole } from '@/lib/session';
import { api } from '@/lib/api/client';
import { getDoctors } from '@/lib/doctor';
import { BookingForm } from '@/features/appointments/booking-form';

export const dynamic = 'force-dynamic';

interface EditBookingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
  const user = await requireRole(['RECEPTION', 'ADMIN']);

  const { id } = await params;
  const [appointment, doctors] = await Promise.all([
    api.get<any>(`/appointments/${id}`).catch(() => null),
    getDoctors().catch(() => []),
  ]);

  if (!appointment) {
    notFound();
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ar' ? 'ar' : 'en';

  return (
    <div className="py-2">
      <BookingForm
        doctors={doctors}
        userRole={user.role as 'RECEPTION' | 'ADMIN'}
        locale={locale}
        initialAppointment={appointment}
      />
    </div>
  );
}
