'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { AuthLanguageBtn } from './auth-language-btn';
import { LoginForm } from './login-form';
import { LoginHero } from './login-hero';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * العرض الكامل لصفحة تسجيل الدخول - تقسيم الشاشة إلى لوحتين متوازيتين مطابقة للصورة بدقة
 */
export const LoginPageClient = () => {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen w-full flex flex-col-reverse lg:flex-row bg-white" dir="ltr">
      {/* اللوحة اليسرى (White Panel): زر تبديل اللغة + نموذج تسجيل الدخول */}
      <section
        dir={isArabic ? 'rtl' : 'ltr'}
        className="w-full lg:w-[45%] xl:w-[42%] bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12 min-h-[500px] lg:min-h-screen relative z-10"
        aria-label="تسجيل الدخول"
      >
        {/* الشريط العلوي للوحة النموذج: زر تبديل اللغة في الزاوية اليسرى العلوية + رابط الرجوع للرئيسية */}
        <div className="flex items-center justify-between w-full mb-8">
          <AuthLanguageBtn />

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-[#1D4ED8] transition-colors inline-flex items-center gap-1.5"
          >
            {isArabic ? (
              <>
                <span>العودة للرئيسية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </>
            )}
          </Link>
        </div>

        {/* نموذج تسجيل الدخول في المنتصف */}
        <div className="my-auto py-6 sm:py-10">
          <LoginForm />
        </div>

        {/* تذييل بسيط وخفيف أسفل النموذج */}
        <div className="text-center sm:text-start pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {isArabic
              ? 'نظام إدارة العيادة © د. إسلام عبدالله كريمة — جميع الحقوق محفوظة'
              : 'Clinic Management System © Dr. Eslam Kareema — All rights reserved'}
          </p>
        </div>
      </section>

      {/* اللوحة اليمنى (Navy Hero Panel): الشعار + العنوان العريض + الأشكال الهندسية */}
      <section
        dir={isArabic ? 'rtl' : 'ltr'}
        className="w-full lg:w-[55%] xl:w-[58%]"
        aria-label="معلومات نظام العيادة"
      >
        <LoginHero />
      </section>
    </div>
  );
};

