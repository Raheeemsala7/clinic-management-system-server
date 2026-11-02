import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import {
  DashboardLayoutClient,
  AdminDashboardView,
  DoctorDashboardView,
  ReceptionistDashboardView,
  UserRole,
} from '@/features/dashboard';
import DashboardContent from '@/features/dashboard/components/dashboard-content';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  admin?: React.ReactNode;
  doctor?: React.ReactNode;
  receptionist?: React.ReactNode;
}

/**
 * تخطيط لوحة التحكم الموحد - ثابت مع اختلاف المحتوى حسب دور المستخدم (Role-Based Dashboard)
 * معتمد على معمارية shadcn/ui الرسمية المتوافقة مع نمط AI-Productivity-Platform
 */
export default async function DashboardLayout({
  children,
  admin,
  doctor,
  receptionist,
}: DashboardLayoutProps) {


  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent
        admin={admin}
        doctor={doctor}
        receptionist={receptionist}
        children={children}
      />
    </Suspense>);
}
