'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BrandLogo } from './brand-logo';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * تذييل الصفحة (Footer) مطابق تماماً للموك أب في الصورة الجديدة مع دعم اللغتين
 */
export const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <footer className="bg-[#060F2E] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* العمود الأول (يمين في RTL): الشعار ونبذة الطبيب */}
          <div className="space-y-4">
            <BrandLogo variant="light" />
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              {t('aboutDoctor')}
            </p>
          </div>

          {/* العمود الثاني: روابط سريعة */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a href="#hero" className="hover:text-[#F5B800] transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#F5B800] transition-colors">
                  نبذة والمؤهلات
                </a>
              </li>
              <li>
                <a href="#clinic" className="hover:text-[#F5B800] transition-colors">
                  عيادتنا
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#F5B800] transition-colors">
                  آراء المرضى
                </a>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: الخدمات */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">
              {t('services')}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  مناظير الأنف والجيوب
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  جراحات الأذن
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  اللوزتين واللحمية
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  مناظير الحنجرة
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  التجميل الوظيفي
                </a>
              </li>
            </ul>
          </div>

          {/* العمود الرابع: تواصل معنا */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">
              {t('contactUs')}
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F5B800] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#F5B800] shrink-0" />
                <span>{t('whatsapp')}: +20 10 50792622</span>
              </a>
              <p className="hover:text-white transition-colors cursor-pointer">
                {t('facebook')}
              </p>
              <p>
                {t('address')}
              </p>
            </div>
          </div>
        </div>

        {/* سطر حقوق النشر السفلي */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>{t('rights')}</p>
          <p className="text-[#F5B800]/90">{t('developer')}</p>
        </div>
      </div>
    </footer>
  );
};
