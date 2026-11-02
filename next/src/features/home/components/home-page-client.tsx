'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
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
import { useSession } from 'next-auth/react';

/**
 * المكون الرئيسي للصفحة الرئيسية - يتضمن شريط تقدم التمرير الانسيابي وزر الواتساب العائم التفاعلي
 */
export const HomePageClient = () => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const session = useSession()
  console.log(session);
  

  // شريط تقدم التمرير الرشيق في أعلى الصفحة
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#F5B800] selection:text-slate-900 relative">
      {/* شريط تقدم التمرير الفاخر في أعلى الشاشة */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F5B800] via-[#1D4ED8] to-[#F5B800] origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* شريط التنقل العلوي المتجاوب */}
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

      {/* زر واتساب السريع العائم مع حلقة نبض وتأثير طفو حيوي */}
      <div
        className={cn(
          'fixed bottom-5 z-40 flex items-center',
          isArabic ? 'left-5' : 'right-5'
        )}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center"
        >
          {/* حلقة نبض رادارية تلفت انتباه الزائر بنعومة */}
          <span
            className="absolute -inset-1 rounded-full bg-emerald-500 opacity-35 animate-ping pointer-events-none"
            aria-hidden="true"
          />

          <motion.a
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            href={getWhatsAppUrl(undefined, locale)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('whatsappAria')}
            className="relative p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center cursor-pointer group transition-colors duration-200"
          >
            <WhatsAppIcon className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-200" />
            <span
              className={cn(
                'max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 text-xs font-bold text-white',
                isArabic
                  ? 'group-hover:max-w-xs group-hover:mr-2'
                  : 'group-hover:max-w-xs group-hover:ml-2'
              )}
            >
              {t('whatsappChat')}
            </span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};
