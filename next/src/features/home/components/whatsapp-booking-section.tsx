'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * قسم الحجز عبر الواتساب - تفاعلي وفخم مع أنيميشن نبضي وزر جذاب فائق الاستجابة
 */
export const WhatsAppBookingSection = () => {
  const t = useTranslations('WhatsAppBooking');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const bookingMsg = isArabic
    ? 'مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.'
    : 'Hello Dr. Eslam, I would like to book an appointment at the ENT clinic.';

  const whatsappUrl = getWhatsAppUrl(bookingMsg, locale);

  const steps = [
    { num: '01', text: t('step1') },
    { num: '02', text: t('step2') },
    { num: '03', text: t('step3') },
  ];

  return (
    <section id="booking" className="py-16 sm:py-20 bg-gradient-to-br from-[#08143D] via-[#0A164E] to-[#060F2E] text-white relative overflow-hidden">
      {/* إضاءات جمالية خفيفة تنبض بالخلفية */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* الجانب الأيمن (في RTL): النصوص والخطوات وزر الحجز */}
          <div className="lg:col-span-7 text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3 }}
              className="text-[#F5B800] text-xs font-bold tracking-widest uppercase block mb-3"
            >
              {t('kicker')}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="text-3xl sm:text-5xl font-black text-white leading-tight mb-4 tracking-tight"
            >
              {t('title')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mb-8"
            >
              {t('description')}
            </motion.p>

            {/* خطوات الحجز الثلاث مع أرقام صفراء تظهر تباعاً */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-10">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.3, delay: 0.15 + idx * 0.06 }}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2.5 cursor-default group"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#F5B800] text-[#0A164E] font-black text-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {step.num}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* زر الحجز الكبير على واتساب مع تأثير نبض حيوي وهوفر ثلاثي الأبعاد */}
            <motion.a
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.35, delay: 0.3 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center gap-3 bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-black text-base sm:text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer group"
            >
              <span
                className="absolute -inset-1 rounded-2xl bg-amber-400 opacity-35 blur-sm animate-pulse -z-10"
                aria-hidden="true"
              />
              <WhatsAppIcon className="w-6 h-6 text-[#0A164E] group-hover:rotate-12 transition-transform duration-200" />
              <span>{t('bookBtn')}</span>
            </motion.a>
          </div>

          {/* الجانب الأيسر (في RTL): بطاقة بيانات التواصل ومواعيد العمل */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#0F205C]/60 backdrop-blur-md border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl relative transition-shadow duration-300 hover:shadow-blue-900/30"
            >
              {/* أيقونة الواتساب في الزاوية العلوية داخل مربع أزرق مع حركة نبض خفيفة */}
              <motion.div
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center mb-6 shadow-md"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </motion.div>

              {/* رقم الواتساب */}
              <div className="mb-6">
                <span className="text-xs font-bold text-[#F5B800] block mb-1">
                  {t('phoneLabel')}
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl sm:text-3xl font-black text-white hover:text-[#F5B800] transition-colors block tracking-tight group"
                >
                  <span dir="ltr" className="inline-block font-sans group-hover:scale-102 transition-transform">
                    {t('phoneValue')}
                  </span>
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
