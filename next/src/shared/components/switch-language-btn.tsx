'use client';

import { setLocale } from '@/i18n/actions';
import { useRouter } from 'next/navigation';
export function SwitchLanguageBtn() {

  const router = useRouter();

  async function toggle(locale: 'ar' | 'en') {
    await setLocale(locale);
    router.refresh(); // لإعادة تحميل المحتوى والاتجاه باللغة الجديدة
  }

  return <button onClick={() => toggle('en')}>English</button>;

}
