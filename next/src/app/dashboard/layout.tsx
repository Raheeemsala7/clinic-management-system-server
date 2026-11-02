import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { cookies } from 'next/headers';
import {
  DashboardLayoutClient,
  AdminDashboardView,
  DoctorDashboardView,
  ReceptionistDashboardView,
  UserRole,
} from '@/features/dashboard';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  admin?: React.ReactNode;
  doctor?: React.ReactNode;
  receptionist?: React.ReactNode;
}

/**
 * تخطيط لوحة التحكم الموحد - ثابت مع اختلاف المحتوى حسب دور المستخدم (Role-Based Dashboard)
 */
export default async function DashboardLayout({
  children,
  admin,
  doctor,
  receptionist,
}: DashboardLayoutProps) {
  // جلب الجلسة الحالية وتحديد دور المستخدم
  const session = await getServerSession(authOptions);
  console.log(session);
  


  const rawRole = ( session?.user.role || 'ADMIN').toUpperCase();
  const role: UserRole =
    rawRole === 'DOCTOR'
      ? 'DOCTOR'
      : rawRole.startsWith('RECEPT')
      ? 'RECEPTIONIST'
      : 'ADMIN';

  // تحديد المحتوى المطلوب عرضه بناءً على الدور الحالي
  const renderRoleContent = () => {
    switch (role) {
      case 'DOCTOR':
        return doctor || <DoctorDashboardView />;
      case 'RECEPTIONIST':
        return receptionist || <ReceptionistDashboardView />;
      case 'ADMIN':
      default:
        return admin || <AdminDashboardView />;
    }
  };

  return (
    <DashboardLayoutClient role={role}>
      {children || renderRoleContent()}
    </DashboardLayoutClient>
  );
}
