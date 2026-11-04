import React from 'react';
import { ExpensesView } from '@/features/expenses/components/expenses-view';

export const metadata = {
  title: 'إدارة واعتماد المصروفات | العيادة',
  description: 'متابعة بنود المصروفات، سقف الصرف الشهري للاستقبال، واعتماد أو رفض المصروفات',
};

export default function AdminExpensesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <ExpensesView isAdmin={true} />
    </div>
  );
}

