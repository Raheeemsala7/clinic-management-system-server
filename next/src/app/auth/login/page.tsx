import { Metadata } from 'next';
import { LoginPageClient } from '@/features/auth';

export const metadata: Metadata = {
  title: 'تسجيل الدخول — نظام إدارة عيادة د. إسلام عبدالله كريمة',
  description: 'تسجيل الدخول إلى لوحة نظام إدارة عيادة الأنف والأذن والحنجرة - د. إسلام عبدالله كريمة',
};

/**
 * صفحة تسجيل الدخول إلى نظام إدارة العيادة
 */
export default function LoginPage() {
  return <LoginPageClient />;
}
