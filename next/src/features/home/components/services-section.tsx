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
 * قسم الخدمات الطبية - أنيميشن ظهور متتابع سريع وانتقالات هوفر راقية
 */
export const ServicesSection = () => {
  const t = useTranslations('Services');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <section id="services" className="py-16 sm:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم مع تأثير ظهور ناعم وسريع */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-10 sm:mb-14"
        >
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
        </motion.div>

        {/* شبكة البطاقات (9 خدمات) مع أنيميشن Stagger سريع */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES_LIST.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
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
  index: number;
  buttonText: string;
  title: string;
  description: string;
  locale: string;
  isArabic: boolean;
}

/**
 * بطاقة خدمة فردية - حركة رفع سلسة وانزلاق للسهم عند التحويم
 */
const ServiceCard = ({
  service,
  index,
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        'group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-shadow duration-200 cursor-pointer',
        isNavy
          ? 'bg-[#0A164E] text-white shadow-md hover:shadow-2xl hover:shadow-blue-950/30'
          : 'bg-white text-[#0A164E] border border-slate-100 shadow-xs hover:shadow-xl hover:border-blue-100'
      )}
    >
      <div>
        <div className="flex justify-end mb-3">
          <span
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-transform duration-200 group-hover:scale-110',
              badgeClasses
            )}
          >
            {service.number}
          </span>
        </div>

        <h3
          className={cn(
            'text-lg sm:text-xl font-bold mb-2.5 tracking-tight transition-colors',
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
          className={cn('inline-flex items-center gap-1.5 transition-transform duration-200', linkColorClass)}
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
          <span>{buttonText}</span>
          <span
            aria-hidden="true"
            className={cn(
              'transition-transform duration-200',
              isArabic ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
            )}
          >
            {isArabic ? '←' : '→'}
          </span>
        </a>
      </div>
    </motion.div>
  );
};
