'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SERVICES_LIST, getWhatsAppUrl } from '../constants';
import { ServiceItem } from '../types';
import { BrandLogo } from './brand-logo';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';
import { cn } from 'cn';

/**
 * قسم الخدمات الطبية - يدعم الترجمة الكاملة (عربي/إنجليزي) وظهور فوري عبر CSS
 */
export const ServicesSection = () => {
  const t = useTranslations('Services');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <section id="services" className="py-16 sm:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="flex items-start justify-between mb-10 sm:mb-14">
          <div className="text-start">
            <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
              {t('kicker')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
              {t('title')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              {t('subtitle')}
            </p>
          </div>

          <div className="hidden sm:block">
            <BrandLogo variant="dark" showText={false} />
          </div>
        </div>

        {/* شبكة البطاقات (9 خدمات) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES_LIST.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              buttonText={t('bookConsultation')}
              title={t(`items.${service.id}.title`)}
              description={t(`items.${service.id}.description`)}
              locale={locale}
              isArabic={isArabic}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: ServiceItem;
  buttonText: string;
  title: string;
  description: string;
  locale: string;
  isArabic: boolean;
}

/**
 * بطاقة خدمة فردية - خفيفة وسريعة التفاعل مع تحويل مباشر إلى واتساب ودعم كامل للغتين
 */
const ServiceCard = ({
  service,
  buttonText,
  title,
  description,
  locale,
  isArabic,
}: ServiceCardProps) => {
  const isNavy = service.theme === 'navy';

  const badgeClasses = {
    blue: 'bg-[#1D4ED8] text-white',
    yellow: 'bg-[#F5B800] text-[#0A164E] font-bold',
    navy: 'bg-[#0A164E] text-white',
  }[service.badgeColor];

  const linkColorClass =
    service.linkColor === 'yellow'
      ? 'text-[#F5B800] group-hover:text-amber-300'
      : 'text-[#1D4ED8] group-hover:text-blue-700';

  const consultationMsg = isArabic
    ? `مرحباً د. إسلام، أود حجز استشارة بخصوص: ${title}`
    : `Hello Dr. Eslam, I would like to book a consultation regarding: ${title}`;

  const whatsappHref = getWhatsAppUrl(consultationMsg, locale);

  return (
    <div
      className={cn(
        'group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.99] cursor-pointer',
        isNavy
          ? 'bg-[#0A164E] text-white shadow-md'
          : 'bg-white text-[#0A164E] border border-slate-100 shadow-xs'
      )}
    >
      <div>
        <div className="flex justify-end mb-3">
          <span
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
              badgeClasses
            )}
          >
            {service.number}
          </span>
        </div>

        <h3
          className={cn(
            'text-lg sm:text-xl font-bold mb-2.5 tracking-tight',
            isNavy ? 'text-white' : 'text-[#0A164E]'
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            'text-sm leading-relaxed mb-5',
            isNavy ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {description}
        </p>
      </div>

      <div
        className={cn(
          'pt-3.5 border-t flex items-center justify-between text-xs font-bold',
          isNavy ? 'border-white/10' : 'border-slate-100'
        )}
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('inline-flex items-center gap-1.5', linkColorClass)}
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>{buttonText}</span>
          <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
        </a>
      </div>
    </div>
  );
};
