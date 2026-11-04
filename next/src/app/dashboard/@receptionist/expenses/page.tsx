import React from 'react';
import { ExpensesView } from '@/features/expenses/components/expenses-view';

export const metadata = {
  title: 'تسجيل المصروفات الشهرية | العيادة',
  description: 'تسجيل مصروفات ومشتريات العيادة ومتابعة حالة الاعتماد وسقف الصرف التلقائي',
};

export default function ReceptionistExpensesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <ExpensesView isAdmin={false} />
    </div>
  );
}

