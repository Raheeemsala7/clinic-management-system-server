'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * قسم الحجز عبر الواتساب (مطابق للموك أب الجديد بالحرف)
 */
export const WhatsAppBookingSection = () => {
  const t = useTranslations('WhatsAppBooking');

  const steps = [
    { num: '01', text: t('step1') },
    { num: '02', text: t('step2') },
    { num: '03', text: t('step3') },
  ];

  return (
    <section id="booking" className="py-20 bg-gradient-to-br from-[#08143D] via-[#0A164E] to-[#060F2E] text-white relative overflow-hidden">
      {/* إضاءات جمالية خفيفة في الخلفية */}
      <div
        className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* الجانب الأيمن (في RTL): النصوص والخطوات وزر الحجز */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-right"
          >
            <span className="text-[#F5B800] text-xs font-bold tracking-widest uppercase block mb-3">
              {t('kicker')}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight">
              {t('title')}
            </h2>

            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              {t('description')}
            </p>

            {/* خطوات الحجز الثلاث مع أرقام صفراء */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-10">
              {steps.map((step) => (
                <div key={step.num} className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#F5B800] text-[#0A164E] font-black text-xs flex items-center justify-center shrink-0">
                    {step.num}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            {/* زر الحجز الكبير على واتساب مع أيقونة واتساب الرسمية */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer group"
            >
              <WhatsAppIcon className="w-6 h-6 text-[#0A164E] group-hover:scale-110 transition-transform" />
              <span>{t('bookBtn')}</span>
            </a>
          </motion.div>

          {/* الجانب الأيسر (في RTL): بطاقة بيانات التواصل ومواعيد العمل */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="bg-[#0F205C]/60 backdrop-blur-md border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl relative">
              {/* أيقونة الواتساب في الزاوية العلوية داخل مربع أزرق */}
              <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center mb-6 shadow-md">
                <WhatsAppIcon className="w-6 h-6" />
              </div>

              {/* رقم الواتساب */}
              <div className="mb-6">
                <span className="text-xs font-bold text-[#F5B800] block mb-1">
                  {t('phoneLabel')}
                </span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl sm:text-3xl font-black text-white hover:text-[#F5B800] transition-colors dir-ltr block text-right tracking-tight"
                >
                  {t('phoneValue')}
                </a>
              </div>

              <div className="border-b border-white/10 my-5" />

              {/* العنوان */}
              <div className="mb-6">
                <span className="text-xs font-bold text-[#F5B800] block mb-1">
                  {t('addressLabel')}
                </span>
                <p className="text-lg font-bold text-white">
                  {t('addressValue')}
                </p>
              </div>

              <div className="border-b border-white/10 my-5" />

              {/* مواعيد العمل */}
              <div>
                <span className="text-xs font-bold text-[#F5B800] block mb-1">
                  {t('hoursLabel')}
                </span>
                <p className="text-lg font-bold text-white">
                  {t('hoursValue')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

