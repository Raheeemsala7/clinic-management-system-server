'use client';

import React from 'react';
import { BrandLogo } from './brand-logo';
import { NAV_LINKS, getWhatsAppUrl, CLINIC_WHATSAPP_NUMBER } from '../constants';
import { Phone, MapPin, Clock, ShieldCheck, MessageCircle } from 'lucide-react';

/**
 * تذييل الصفحة (Footer) بتناسق الألوان ومعلومات الاتصال ورابط واتساب المباشر
 */
export const Footer = () => {
  return (
    <footer className="bg-[#0A164E] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* العمود الأول: الشعار ونبذة الطبيب */}
          <div className="space-y-4">
            <BrandLogo variant="light" />
            <p className="text-sm text-white/75 leading-relaxed">
              عيادة متخصصة في تشخيص وعلاج أمراض وجراحات الأنف والأذن والحنجرة بأحدث المناظير الميكروسكوبية الدقيقة.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#F5B800] pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>أعلى معايير التعقيم والجودة الطبية</span>
            </div>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-[#F5B800] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود الثالث: مواعيد العمل */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">
              مواعيد العمل
            </h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#F5B800] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">السبت — الخميس:</span>
                  <span className="text-xs text-white/70">5:00 م — 10:00 م</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#F5B800] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">الجمعة:</span>
                  <span className="text-xs text-white/70">مغلق (حالات الطوارئ فقط)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* العمود الرابع: بيانات التواصل والحجز */}
          <div>
            <h4 className="text-base font-bold text-white mb-4 border-b border-white/10 pb-2">
              التواصل والحجز
            </h4>
            <div className="space-y-3 text-sm text-white/75 mb-4">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F5B800] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#F5B800]" />
                <span className="dir-ltr text-right font-medium">+20 10 50792622</span>
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F5B800]" />
                <span>العيادة مجهزة بأحدث المناظير</span>
              </p>
            </div>
            <a
              href={getWhatsAppUrl('مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-md text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              احجز موعدك الآن عبر واتساب
            </a>
          </div>
        </div>

        {/* سطر حقوق النشر */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} عيادة د. إسلام عبدالله كريمة. جميع الحقوق محفوظة.</p>
          <p className="text-[#F5B800]/90">تصميم وتطوير نظام إدارة العيادات الذكي</p>
        </div>
      </div>
    </footer>
  );
};
