'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { SidebarProvider, SidebarInset } from '@/shared/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

/**
 * Shell تخطيط لوحة التحكم المعتمد على مكونات shadcn/ui الرسمية
 * يدعم تلقائياً اتجاه RTL في اللغة العربية وLTR في الإنجليزية
 */
export const DashboardLayout = ({
  children,
  sidebar,
  header,
}: DashboardLayoutProps) => {
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <SidebarProvider
      dir={dir}
      className="flex h-dvh w-full overflow-hidden bg-[#F6F8FC] print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:block"
    >
      <div className="print:hidden">
        {sidebar}
      </div>
      <SidebarInset className="flex flex-1 flex-col overflow-hidden min-w-0 bg-[#F6F8FC] print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:block">
        <div className="print:hidden">
          {header}
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block">
          <div className="max-w-7xl mx-auto w-full print:max-w-none print:m-0 print:p-0 print:w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
