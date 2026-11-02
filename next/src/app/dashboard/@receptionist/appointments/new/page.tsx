import React from 'react';
import { BookingForm } from '@/features/appointments';

export const metadata = {
  title: 'حجز موعد جديد — الاستقبال',
  description: 'تسجيل وحجز موعد جديد للمريض في العيادة',
};

export default function NewAppointmentPage() {
  return <BookingForm />;
}
