'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES_LIST, getWhatsAppUrl } from '../constants';
import { ServiceItem } from '../types';
import { BrandLogo } from './brand-logo';
import { cn } from 'cn';

/**
 * قسم الخدمات الطبية - شبكة 3x3 متجاوبة بتصميم بطاقات مطابقة للموك أب، وتحويل الحجز إلى واتساب مباشرة
 */
export const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="flex items-start justify-between mb-12 sm:mb-16">
          {/* الجانب الأيمن (في RTL): العناوين */}
          <div className="text-right">
            <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
              OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
              الخدمات الطبية
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              رعاية متكاملة للأنف والأذن والحنجرة بتقنيات المناظير والجراحات الدقيقة.
            </p>
          </div>

          {/* الجانب الأيسر (في RTL): أيقونة الشعار */}
          <div className="hidden sm:block">
            <BrandLogo variant="dark" showText={false} />
          </div>
        </div>

        {/* شبكة البطاقات (9 خدمات) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
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
}

/**
 * بطاقة خدمة فردية تراعي الثيم (أبيض أو كحلي) والألوان الخاصة بالبادج والرابط، وتفتح واتساب عند النقر
 */
const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const isNavy = service.theme === 'navy';

  // تحديد خلفية ولون بادج الترقيم
  const badgeClasses = {
    blue: 'bg-[#1D4ED8] text-white',
    yellow: 'bg-[#F5B800] text-[#0A164E] font-bold',
    navy: 'bg-[#0A164E] text-white',
  }[service.badgeColor];

  // تحديد لون رابط الحجز في الأسفل
  const linkColorClass =
    service.linkColor === 'yellow'
      ? 'text-[#F5B800] group-hover:text-amber-300'
      : 'text-[#1D4ED8] group-hover:text-blue-700';

  const whatsappHref = getWhatsAppUrl(`مرحباً د. إسلام، أود حجز استشارة بخصوص: ${service.title}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-300',
        isNavy
          ? 'bg-[#0A164E] text-white shadow-lg hover:shadow-xl hover:shadow-blue-950/20'
          : 'bg-white text-[#0A164E] border border-slate-100 shadow-sm hover:shadow-md'
      )}
    >
      <div>
        {/* بادج الترقيم في الركن العلوي */}
        <div className="flex justify-end mb-4">
          <span
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
              badgeClasses
            )}
          >
            {service.number}
          </span>
        </div>

        {/* عنوان الخدمة */}
        <h3
          className={cn(
            'text-lg sm:text-xl font-bold mb-3 tracking-tight',
            isNavy ? 'text-white' : 'text-[#0A164E]'
          )}
        >
          {service.title}
        </h3>

        {/* وصف الخدمة */}
        <p
          className={cn(
            'text-sm leading-relaxed mb-6',
            isNavy ? 'text-slate-300' : 'text-slate-500'
          )}
        >
          {service.description}
        </p>
      </div>

      {/* فاصل ورابط الحجز أسفل البطاقة ينقل مباشرة إلى واتساب */}
      <div
        className={cn(
          'pt-4 border-t flex items-center justify-between text-xs font-bold transition-colors',
          isNavy ? 'border-white/10' : 'border-slate-100'
        )}
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('flex items-center gap-1.5 transition-transform group-hover:-translate-x-1 cursor-pointer', linkColorClass)}
        >
          احجز استشارة <span aria-hidden="true">←</span>
        </a>
      </div>
    </motion.div>
  );
};
