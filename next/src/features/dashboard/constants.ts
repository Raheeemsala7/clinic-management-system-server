import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Users,
  CreditCard,
  Receipt,
  Lock,
  BarChart3,
  UserCog,
  History,
  Settings,
  Stethoscope,
  Clock,
  ListOrdered,
} from 'lucide-react';
import { DashboardNavItem, UserRole } from './types';

export const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'dashboard', title: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, isActive: true },
  { id: 'appointments', title: 'المواعيد', href: '/dashboard/appointments', icon: Calendar },
  { id: 'new-booking', title: 'حجز جديد', href: '/dashboard/bookings/new', icon: CalendarPlus },
  { id: 'patients', title: 'المرضى', href: '/dashboard/patients', icon: Users },
  { id: 'payments', title: 'المدفوعات', href: '/dashboard/payments', icon: CreditCard },
  { id: 'expenses', title: 'المصروفات', href: '/dashboard/expenses', icon: Receipt },
  { id: 'closing', title: 'الإغلاق اليومي', href: '/dashboard/closing', icon: Lock },
  { id: 'reports', title: 'التقارير', href: '/dashboard/reports', icon: BarChart3 },
  { id: 'users', title: 'المستخدمون', href: '/dashboard/users', icon: UserCog },
  { id: 'audit', title: 'سجل العمليات', href: '/dashboard/audit', icon: History },
  { id: 'settings', title: 'الإعدادات', href: '/dashboard/settings', icon: Settings },
];

export const DOCTOR_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'today-checkup', title: 'شاشة كشف اليوم', href: '/dashboard', icon: Stethoscope, isActive: true },
  { id: 'calendar', title: 'التقويم والمواعيد', href: '/dashboard/calendar', icon: Calendar },
  { id: 'weekly-hours', title: 'أوقات العمل الأسبوعية', href: '/dashboard/schedule', icon: Clock },
  { id: 'patients', title: 'المرضى', href: '/dashboard/patients', icon: Users },
];

export const RECEPTIONIST_NAV_ITEMS: DashboardNavItem[] = [
  { id: 'queue', title: 'قائمة الانتظار', href: '/dashboard', icon: ListOrdered, isActive: true },
  { id: 'calendar', title: 'التقويم والمواعيد', href: '/dashboard/calendar', icon: Calendar },
  { id: 'new-booking', title: 'حجز جديد', href: '/dashboard/bookings/new', icon: CalendarPlus },
  { id: 'patients', title: 'المرضى', href: '/dashboard/patients', icon: Users },
  { id: 'payments', title: 'المدفوعات', href: '/dashboard/payments', icon: CreditCard },
  { id: 'expenses', title: 'المصروفات', href: '/dashboard/expenses', icon: Receipt },
  { id: 'closing', title: 'الإغلاق اليومي', href: '/dashboard/closing', icon: Lock },
];

export const ROLE_CONFIG: Record<
  UserRole,
  {
    roleLabel: string;
    greeting: string;
    showDoctorStatus: boolean;
    navItems: DashboardNavItem[];
  }
> = {
  ADMIN: {
    roleLabel: 'لوحة: مدير',
    greeting: 'مرحباً بك، المدير',
    showDoctorStatus: false,
    navItems: ADMIN_NAV_ITEMS,
  },
  DOCTOR: {
    roleLabel: 'لوحة: طبيب',
    greeting: 'مرحباً د. إسلام',
    showDoctorStatus: true,
    navItems: DOCTOR_NAV_ITEMS,
  },
  RECEPTIONIST: {
    roleLabel: 'لوحة: استقبال',
    greeting: 'مرحباً بك، الاستقبال',
    showDoctorStatus: true,
    navItems: RECEPTIONIST_NAV_ITEMS,
  },
  RECEPTION: {
    roleLabel: 'لوحة: استقبال',
    greeting: 'مرحباً بك، الاستقبال',
    showDoctorStatus: true,
    navItems: RECEPTIONIST_NAV_ITEMS,
  },
};

