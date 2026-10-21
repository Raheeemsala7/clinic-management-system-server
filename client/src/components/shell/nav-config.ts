import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  CreditCard,
  ReceiptText,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  ScrollText,
  CalendarDays,
  CalendarPlus,
  Stethoscope,
} from 'lucide-react';
import { type Role } from '@/lib/roles';

export interface NavItem {
  href: string;
  label?: string;
  arLabel: string;
  enLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  RECEPTION: [
    { href: '/reception', arLabel: 'قائمة الانتظار', enLabel: 'Waiting Queue', icon: CalendarClock },
    { href: '/reception/appointments', arLabel: 'التقويم والمواعيد', enLabel: 'Appointments', icon: CalendarDays },
    { href: '/reception/appointments/new', arLabel: 'حجز جديد', enLabel: 'New Booking', icon: CalendarPlus },
    { href: '/reception/patients', arLabel: 'المرضى', enLabel: 'Patients', icon: Users },
    { href: '/reception/payments', arLabel: 'المدفوعات', enLabel: 'Payments', icon: CreditCard },
    { href: '/reception/expenses', arLabel: 'المصروفات', enLabel: 'Expenses', icon: ReceiptText },
    { href: '/reception/closing', arLabel: 'الإغلاق اليومي', enLabel: 'Daily Closing', icon: Wallet },
  ],
  DOCTOR: [
    { href: '/doctor', arLabel: 'شاشة كشف اليوم', enLabel: 'Today Overview', icon: Stethoscope },
    { href: '/doctor/appointments', arLabel: 'التقويم والمواعيد', enLabel: 'Appointments', icon: CalendarDays },
    { href: '/doctor/schedule', arLabel: 'أوقات العمل الأسبوعية', enLabel: 'Doctor Schedule', icon: CalendarClock },
    { href: '/doctor/patients', arLabel: 'المرضى', enLabel: 'Patients', icon: Users },
  ],
  ADMIN: [
    { href: '/admin', arLabel: 'لوحة التحكم', enLabel: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', arLabel: 'المواعيد والتقويم', enLabel: 'Appointments', icon: CalendarDays },
    { href: '/admin/appointments/new', arLabel: 'حجز جديد', enLabel: 'New Booking', icon: CalendarPlus },
    { href: '/admin/patients', arLabel: 'المرضى', enLabel: 'Patients', icon: Users },
    { href: '/admin/payments', arLabel: 'المدفوعات', enLabel: 'Payments', icon: CreditCard },
    { href: '/admin/expenses', arLabel: 'المصروفات', enLabel: 'Expenses', icon: ReceiptText },
    { href: '/admin/closing', arLabel: 'الإغلاق اليومي', enLabel: 'Daily Closing', icon: Wallet },
    { href: '/admin/reports', arLabel: 'التقارير', enLabel: 'Reports', icon: BarChart3 },
    { href: '/admin/users', arLabel: 'المستخدمون', enLabel: 'Users', icon: UserCog },
    { href: '/admin/audit', arLabel: 'سجل التدقيق', enLabel: 'Audit Log', icon: ScrollText },
    { href: '/admin/settings', arLabel: 'الإعدادات', enLabel: 'Settings', icon: Settings },
  ],
};

// Backward-compatible export
export const NAV_ITEMS: Record<Role, { href: string; label: string; icon: LucideIcon }[]> = {
  RECEPTION: NAV_ITEMS_BY_ROLE.RECEPTION.map((i) => ({ ...i, label: i.arLabel })),
  DOCTOR: NAV_ITEMS_BY_ROLE.DOCTOR.map((i) => ({ ...i, label: i.arLabel })),
  ADMIN: NAV_ITEMS_BY_ROLE.ADMIN.map((i) => ({ ...i, label: i.arLabel })),
};
