'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BrandLogo } from './brand-logo';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * تذييل الصفحة (Footer) مع دعم كامل للغتين (عربي/إنجليزي)
 */
export const Footer = () => {
  const t = useTranslations('Footer');
  const locale = useLocale();

  return (
    <footer className="bg-[#060F2E] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* العمود الأول: الشعار ونبذة الطبيب */}
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
                  {t('links.home')}
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#F5B800] transition-colors">
                  {t('links.about')}
                </a>
              </li>
              <li>
                <a href="#clinic" className="hover:text-[#F5B800] transition-colors">
                  {t('links.clinic')}
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-[#F5B800] transition-colors">
                  {t('links.reviews')}
                </a>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: الخدمات */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">
              {t('servicesTitle')}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  {t('links.sinus')}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  {t('links.earSurgery')}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  {t('links.tonsils')}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  {t('links.larynx')}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#F5B800] transition-colors">
                  {t('links.rhinoplasty')}
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
                href={getWhatsAppUrl(undefined, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#F5B800] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#F5B800] shrink-0" />
                <span>
                  {t('whatsapp')}:{' '}
                  <span dir="ltr" className="font-medium inline-block font-sans">
                    +20 10 50792622
                  </span>
                </span>
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
