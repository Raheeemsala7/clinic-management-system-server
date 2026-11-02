'use client';

import React from 'react';
import { DashboardLayout } from '@/shared/components/dashboard-layout';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';
import { UserRole } from '../types';

interface DashboardLayoutClientProps {
  role: UserRole;
  children: React.ReactNode;
}

/**
 * مكوّن العميل التجميعي للوحة التحكم الموحدة
 * يربط الـ SidebarHeader والـ DashboardSidebar والـ DashboardLayout المعتمد على shadcn
 */
export const DashboardLayoutClient = ({
  role,
  children,
}: DashboardLayoutClientProps) => {
  return (
    <DashboardLayout
      sidebar={<DashboardSidebar role={role} />}
      header={<DashboardHeader role={role} />}
    >
      {children}
    </DashboardLayout>
  );
};
