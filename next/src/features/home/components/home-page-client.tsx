'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Navbar } from './navbar';
import { HeroSection } from './hero-section';
import { ServicesSection } from './services-section';
import { AboutSection } from './about-section';
import { ClinicSection } from './clinic-section';
import { ReviewsSection } from './reviews-section';
import { WhatsAppBookingSection } from './whatsapp-booking-section';
import { Footer } from './footer';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';
import { cn } from 'cn';

/**
 * المكون الرئيسي للصفحة الرئيسية الذي يجمع الأقسام ويوفر زر الواتساب العائم للتواصل المباشر مع دعم كامل للغتين
 */
export const HomePageClient = () => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#F5B800] selection:text-slate-900">
      {/* شريط التنقل العلوي المتجاوب مع زر تبديل اللغة */}
      <Navbar />

      {/* المحتوى الرئيسي للموقع */}
      <main className="flex-1">
        {/* قسم الواجهة (Hero) */}
        <HeroSection />

        {/* قسم الخدمات الطبية (Services) */}
        <ServicesSection />

        {/* قسم نبذة والمؤهلات (About & Qualifications) */}
        <AboutSection />

        {/* قسم مرافق العيادة (Clinic Facilities) */}
        <ClinicSection />

        {/* قسم آراء المرضى (Patient Reviews) */}
        <ReviewsSection />

        {/* قسم الحجز المباشر عبر واتساب (WhatsApp Booking) */}
        <WhatsAppBookingSection />
      </main>

      {/* تذييل الصفحة (Footer) */}
      <Footer />

      {/* زر واتساب السريع العائم لخدمة المرضى الفورية */}
      <a
        href={getWhatsAppUrl(undefined, locale)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsappAria')}
        className={cn(
          'fixed bottom-5 z-30 p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer group',
          isArabic ? 'left-5' : 'right-5'
        )}
      >
        <WhatsAppIcon className="w-6 h-6" />
        <span
          className={cn(
            'max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 text-xs font-bold',
            isArabic
              ? 'group-hover:max-w-xs group-hover:mr-2'
              : 'group-hover:max-w-xs group-hover:ml-2'
          )}
        >
          {t('whatsappChat')}
        </span>
      </a>
    </div>
  );
};
