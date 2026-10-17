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
  Stethoscope,
} from 'lucide-react';
import { type Role } from '@/lib/roles';
import { ar } from '@/messages/ar';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  RECEPTION: [
    { href: '/reception', label: ar.nav.queue, icon: CalendarClock },
    { href: '/reception/appointments', label: 'التقويم والمواعيد', icon: CalendarDays },
    { href: '/reception/patients', label: ar.nav.patients, icon: Users },
    { href: '/reception/payments', label: ar.nav.payments, icon: CreditCard },
    { href: '/reception/expenses', label: ar.nav.expenses, icon: ReceiptText },
    { href: '/reception/closing', label: ar.nav.closing, icon: Wallet },
  ],
  DOCTOR: [
    { href: '/doctor', label: ar.nav.today, icon: Stethoscope },
    { href: '/doctor/appointments', label: 'التقويم والمواعيد', icon: CalendarDays },
    { href: '/doctor/schedule', label: 'أوقات العمل الأسبوعية', icon: CalendarClock },
    { href: '/doctor/patients', label: ar.nav.patients, icon: Users },
  ],
  ADMIN: [
    { href: '/admin', label: ar.nav.dashboard, icon: LayoutDashboard },
    { href: '/admin/appointments', label: ar.nav.appointments, icon: CalendarDays },
    { href: '/admin/patients', label: ar.nav.patients, icon: Users },
    { href: '/admin/payments', label: ar.nav.payments, icon: CreditCard },
    { href: '/admin/expenses', label: ar.nav.expenses, icon: ReceiptText },
    { href: '/admin/closing', label: ar.nav.closing, icon: Wallet },
    { href: '/admin/reports', label: ar.nav.reports, icon: BarChart3 },
    { href: '/admin/users', label: ar.nav.users, icon: UserCog },
    { href: '/admin/audit', label: ar.nav.audit, icon: ScrollText },
    { href: '/admin/settings', label: ar.nav.settings, icon: Settings },
  ],
};
