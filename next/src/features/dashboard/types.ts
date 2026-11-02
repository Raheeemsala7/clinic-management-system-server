import { LucideIcon } from 'lucide-react';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'RECEPTION';

export interface DashboardNavItem {
  id: string;
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  isActive?: boolean;
}

export interface WaitingPatient {
  id: string;
  number: string;
  name: string;
  type: 'كشف' | 'استشارة' | 'إعادة كشف';
  status: 'في الانتظار' | 'داخل الكشف' | 'تم الكشف';
  waitingTime: string;
}

