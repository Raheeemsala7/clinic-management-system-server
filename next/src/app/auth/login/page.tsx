import { AuthLanguageBtn } from '@/features/auth/components/auth-language-btn';
import { LoginForm } from '@/features/auth/components/login-form';
import { LoginHero } from '@/features/auth/components/login-hero';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

/**
 * إنشاء الـ Metadata الخاصة بالصفحة ديناميكياً بناءً على لغة المستخدم الحالية
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.login');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

/**
 * صفحة تسجيل الدخول إلى نظام إدارة العيادة
 * يتم تحديد كافة الاتجاهات وترتيب العناصر عبر أصناف Tailwind CSS مباشرة
 * بدون الحاجة لقراءة كود اللغة أو حقن سمة dir يدوياً
 */
export default async function LoginPage() {
  const t = await getTranslations('Auth.login');

  return (
    <div className="min-h-screen w-full flex flex-col-reverse lg:flex-row rtl:lg:flex-row-reverse bg-white">
      {/* اللوحة البيضاء (White Panel): زر تبديل اللغة + نموذج تسجيل الدخول */}
      <section
        className="w-full lg:w-[45%] xl:w-[42%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-[500px] lg:min-h-screen relative z-10"
        aria-label={t('formAria')}
      >
        {/* الشريط العلوي للوحة النموذج: زر تبديل اللغة + رابط الرجوع للرئيسية */}
        <div className="flex items-center justify-between w-full mb-8">
          <AuthLanguageBtn />

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-[#1D4ED8] transition-colors inline-flex items-center gap-1.5 group"
          >
            <span>{t('backToHome')}</span>
            <ArrowLeft className="w-3.5 h-3.5 transition-transform rtl:rotate-0 ltr:rotate-180 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* نموذج تسجيل الدخول في المنتصف */}
        <div className="my-auto py-6 sm:py-10">
          <LoginForm />
        </div>

        {/* تذييل أسفل النموذج */}
        <div className="text-center sm:text-start pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {t('footerCopyright')}
          </p>
        </div>
      </section>

      {/* اللوحة الكحلية (Navy Hero Panel): الشعار + العنوان العريض + الأشكال الهندسية */}
      <section
        className="w-full lg:w-[55%] xl:w-[58%]"
        aria-label={t('heroAria')}
      >
        <LoginHero />
      </section>
    </div>
  );
}
