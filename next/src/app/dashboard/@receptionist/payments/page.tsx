import React from 'react';
import { PaymentsView } from '@/features/payments/components/payments-view';

export const metadata = {
  title: 'سجل المدفوعات والتحصيل اليومي | العيادة',
  description: 'سجل المبالغ المحصلة وعربون الحجوزات والمبالغ المتبقية في العيادة',
};

export default function ReceptionistPaymentsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PaymentsView />
    </div>
  );
}
