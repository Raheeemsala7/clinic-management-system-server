import React from 'react';
import { ClosingView } from '@/features/closing/components/closing-view';

export const metadata = {
  title: 'الإغلاق اليومي ومطابقة الصندوق | الإدارة',
  description: 'مراجعة حركة اليوم ومطابقة النقد الفعلي وإغلاق الصندوق للإدارة',
};

export default function AdminClosingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <ClosingView />
    </div>
  );
}
