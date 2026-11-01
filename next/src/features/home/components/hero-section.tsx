'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * قسم الهيرو الرئيسي - أنيميشن ناعم وسريع للظهور، مع حركة طفو ثلاثية الأبعاد خفيفة لصورة الدكتور
 */
export const HeroSection = () => {
  const t = useTranslations('Hero');
  const locale = useLocale();

  const stats = [
    { title: t('stat1Title'), desc: t('stat1Desc') },
    { title: t('stat2Title'), desc: t('stat2Desc') },
    { title: t('stat3Title'), desc: t('stat3Desc') },
  ];

  const whatsappHref = getWhatsAppUrl(undefined, locale);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-[#0B1A4F] via-[#0A164E] to-[#07133D] text-white pt-6 pb-14 lg:pt-12 lg:pb-20"
    >
      {/* إضاءات جمالية متوهجة تنبض بنعومة في الخلفية */}
      <div
        className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* الجانب الأيمن (في RTL): النصوص والمعلومات وأزرار الإجراء - ظهور فوري 100% بدون أي تأخير عند الـ Refresh */}
          <div className="lg:col-span-7 flex flex-col items-start text-start order-1">
            {/* العنوان الإنجليزي الصغير باللون الأصفر الذهبي مع مؤشر نبضي حيوي */}
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B800] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F5B800]" />
              </span>
              <span className="text-[#F5B800] text-xs sm:text-sm font-bold tracking-widest uppercase inline-block">
                {t('kicker')}
              </span>
            </div>

            {/* الاسم الرئيسي للطبيب بخط عريض وفخم */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white mb-3 tracking-tight">
              {t('doctorTitleFirst')}
              <br />
              {t('doctorTitleSecond')}
            </h1>

            {/* نبذة عن التخصص */}
            <p className="text-white/85 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-7">
              {t('speciality')}
            </p>

            {/* أزرار الحجز والخدمات */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
              {/* زر احجز كشف ينقل مباشرة إلى واتساب مع تأثير نبض وهوفر ناعم */}
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-2xl text-sm sm:text-base inline-flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span
                  className="absolute -inset-0.5 rounded-xl bg-amber-400 opacity-30 blur-xs animate-pulse -z-10"
                  aria-hidden="true"
                />
                <WhatsAppIcon className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform duration-200" />
                <span>{t('bookCheckup')}</span>
              </motion.a>

              {/* زر الخدمات الطبية للتمرير السلس */}
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                href="#services"
                className="border border-white/80 hover:border-white text-white hover:bg-white/10 font-medium px-7 py-3.5 rounded-xl text-sm sm:text-base inline-flex items-center justify-center backdrop-blur-xs transition-colors"
              >
                {t('medicalServices')}
              </motion.a>
            </div>

            {/* شريط الإحصائيات والمميزات السريعة أسفل الهيرو */}
            <div className="w-full pt-6 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col cursor-default hover:-translate-y-0.5 transition-transform duration-150"
                >
                  <span className="text-[#F5B800] font-bold text-sm sm:text-base lg:text-lg">
                    {stat.title}
                  </span>
                  <span className="text-white/75 text-xs sm:text-sm mt-0.5">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* الجانب الأيسر (في RTL): خلفية الأشكال وصورة الدكتور - ثابتة تماماً دون أي حركة */}
          <div className="lg:col-span-5 flex justify-center items-center order-2 relative">
            <div className="relative w-full max-w-[430px] aspect-[560/710] mx-auto select-none">
              <div className="relative w-full h-full">
                {/* خلفية الأشكال الهندسية المنحنية */}
                <Image
                  src="/background-landing.svg"
                  alt=""
                  fill
                  priority
                  className="object-contain pointer-events-none select-none z-0"
                />

                {/* صورة الدكتور المفرغة المطابقة لقياسات وموضع الـ SVG بدقة - ثابتة تماماً ولا تتحرك نهائياً */}
                <div
                  className="absolute top-0 bottom-0 z-10 pointer-events-none"
                  style={{
                    left: '5.357%',
                    width: '90.017%',
                    height: '100%',
                  }}
                >
                  <Image
                    src="/profile-doctor.png"
                    alt="د. إسلام عبدالله كريمة - أخصائي الأنف والأذن والحنجرة"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 430px"
                    className="object-contain object-bottom drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
