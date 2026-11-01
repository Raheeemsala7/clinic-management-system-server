'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getWhatsAppUrl } from '../constants';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';

/**
 * قسم الهيرو الرئيسي - ظهور فوري للمحتوى دون أي بطء أو تأخير في التحميل
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
      {/* إضاءات جمالية خفيفة في الخلفية */}
      <div
        className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* الجانب الأيمن (في RTL): النصوص والمعلومات وأزرار الإجراء */}
          <div className="lg:col-span-7 flex flex-col items-start text-start order-1">
            {/* العنوان الإنجليزي الصغير باللون الأصفر الذهبي */}
            <span className="text-[#F5B800] text-xs sm:text-sm font-bold tracking-widest uppercase mb-2 inline-block">
              {t('kicker')}
            </span>

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
              {/* زر احجز كشف ينقل مباشرة إلى واتساب مع أيقونة واتساب الرسمية */}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold px-7 py-3 rounded-xl transition-all duration-150 shadow-lg hover:shadow-xl hover:scale-102 active:scale-95 text-sm sm:text-base inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-slate-950" />
                <span>{t('bookCheckup')}</span>
              </a>

              {/* زر الخدمات الطبية للتمرير السلس */}
              <a
                href="#services"
                className="border border-white/85 hover:border-white text-white hover:bg-white/10 font-medium px-7 py-3 rounded-xl transition-all duration-150 hover:scale-102 active:scale-95 text-sm sm:text-base inline-flex items-center justify-center"
              >
                {t('medicalServices')}
              </a>
            </div>

            {/* شريط الإحصائيات والمميزات السريعة أسفل الهيرو */}
            <div className="w-full pt-6 border-t border-white/10 grid grid-cols-3 gap-2 sm:gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
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

          {/* الجانب الأيسر (في RTL): خلفية الأشكال وصورة الدكتور */}
          <div className="lg:col-span-5 flex justify-center items-center order-2 relative">
            {/* الحاوية النسبية بأبعاد (560 x 710) المتوافقة تماماً مع الـ SVG وصورة الدكتور */}
            <div className="relative w-full max-w-[430px] aspect-[560/710] mx-auto select-none">
              <Image
                src="/background-landing.svg"
                alt=""
                fill
                priority
                className="object-contain pointer-events-none select-none z-0"
              />

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
    </section>
  );
};
