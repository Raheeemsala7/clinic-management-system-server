'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { SERVICES_LIST, getWhatsAppUrl } from '../constants';
import { ServiceItem } from '../types';
import { BrandLogo } from './brand-logo';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';
import { cn } from 'cn';

/**
 * قسم الخدمات الطبية - أنيميشن سريع ومحسن للأداء مع دعم اللغتين
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
          {SERVICES_LIST.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              buttonText={t('bookConsultation')}
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
  index: number;
  buttonText: string;
  isArabic: boolean;
}

/**
 * بطاقة خدمة فردية - خفيفة وسريعة التفاعل مع تحويل مباشر إلى واتساب
 */
const ServiceCard = ({ service, index, buttonText, isArabic }: ServiceCardProps) => {
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

  const whatsappHref = getWhatsAppUrl(`مرحباً د. إسلام، أود حجز استشارة بخصوص: ${service.title}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.2), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={cn(
        'group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-shadow duration-200',
        isNavy
          ? 'bg-[#0A164E] text-white shadow-md hover:shadow-xl'
          : 'bg-white text-[#0A164E] border border-slate-100 shadow-xs hover:shadow-md'
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
          {service.title}
        </h3>

        <p
          className={cn(
            'text-sm leading-relaxed mb-5',
            isNavy ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {service.description}
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
          className={cn('inline-flex items-center gap-1.5 cursor-pointer', linkColorClass)}
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>{buttonText}</span>
          <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
        </a>
      </div>
    </motion.div>
  );
};
