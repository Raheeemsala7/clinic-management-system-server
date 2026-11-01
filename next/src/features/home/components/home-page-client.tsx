'use client';

import React from 'react';
import { Navbar } from './navbar';
import { HeroSection } from './hero-section';
import { ServicesSection } from './services-section';
import { AboutSection } from './about-section';
import { ClinicSection } from './clinic-section';
import { ReviewsSection } from './reviews-section';
import { Footer } from './footer';
import { getWhatsAppUrl } from '../constants';
import { MessageCircle } from 'lucide-react';

/**
 * المكون الرئيسي للصفحة الرئيسية الذي يجمع الأقسام ويوفر زر الواتساب العائم للتواصل المباشر
 */
export const HomePageClient = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#F5B800] selection:text-slate-900">
      {/* شريط التنقل العلوي */}
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
      </main>

      {/* تذييل الصفحة (Footer) */}
      <Footer />

      {/* زر واتساب السريع العائم لخدمة المرضى الفورية */}
      <a
        href={getWhatsAppUrl('مرحباً د. إسلام، أود الاستفسار وحجز موعد كشف.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل عبر الواتساب على +20 10 50792622"
        className="fixed bottom-6 left-6 z-30 p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:mr-2 transition-all duration-300 text-xs font-bold">
          محادثة واتساب
        </span>
      </a>
    </div>
  );
};
