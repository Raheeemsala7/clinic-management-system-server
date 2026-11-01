'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { TIMELINE_MILESTONES } from '../constants';
import { Stethoscope } from 'lucide-react';
import { cn } from 'cn';

/**
 * قسم نبذة والمؤهلات - ظهور فوري ومباشر دون تأخير
 */
export const AboutSection = () => {
  const t = useTranslations('About');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <section id="about" className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="text-start mb-12 sm:mb-16">
          <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
            {t('kicker')}
          </span>
          <h2 id="qualifications" className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* تخطيط من عمودين */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* الخط الزمني */}
          <div className="lg:col-span-7 order-1">
            <div
              className={cn(
                'relative space-y-8 py-2',
                isArabic
                  ? 'pr-6 border-r-2 border-[#1D4ED8]'
                  : 'pl-6 border-l-2 border-[#1D4ED8]'
              )}
            >
              {TIMELINE_MILESTONES.map((milestone) => (
                <div
                  key={milestone.id}
                  className="relative group text-start transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {/* النقطة الصفراء على الخط الزمني */}
                  <span
                    className={cn(
                      'absolute top-1.5 w-3.5 h-3.5 bg-[#F5B800] rounded-xs ring-4 ring-white group-hover:scale-125 transition-transform duration-150',
                      isArabic ? '-right-[31px]' : '-left-[31px]'
                    )}
                    aria-hidden="true"
                  />

                  <span className="text-xs sm:text-sm font-bold text-[#1D4ED8] block mb-1">
                    {milestone.year}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-[#0A164E] tracking-tight mb-0.5">
                    {milestone.degree}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {milestone.institution}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* إطار صورة الدكتور */}
          <div className="lg:col-span-5 order-2 flex justify-center">
            <div className="relative w-full max-w-[360px] transition-transform duration-200 hover:scale-[1.01]">
              <div
                className="absolute -top-3.5 -right-3.5 w-24 h-24 bg-[#1D4ED8] rounded-3xl -z-10"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-4 -left-4 w-28 h-28 bg-[#F5B800] rounded-3xl -z-10"
                aria-hidden="true"
              />

              <div className="w-full aspect-[4/5] min-h-[350px] bg-white/90 backdrop-blur-xs border-2 border-dashed border-[#1D4ED8] rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1D4ED8] flex items-center justify-center mb-3">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <p className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed">
                  {t('photoPlaceholder')}
                </p>
                <span className="text-xs text-slate-400 mt-2">
                  {t('photoBadge')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
