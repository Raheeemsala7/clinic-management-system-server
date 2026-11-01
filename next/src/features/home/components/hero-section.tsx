'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HERO_STATS, getWhatsAppUrl } from '../constants';

/**
 * قسم الهيرو الرئيسي (الواجهة الترحيبية للعيادة)
 * يتضمن خلفية الأشكال المنحنية الرسمية `background-landing.svg` وصورة الطبيب المفرغة `profile-doctor.png`
 */
export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-br from-[#0B1A4F] via-[#0A164E] to-[#07133D] text-white pt-8 pb-16 lg:pt-14 lg:pb-24"
    >
      {/* إضاءات جمالية خفيفة في الخلفية */}
      <div
        className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* الجانب الأيمن (في RTL): النصوص والمعلومات والدعوة لاتخاذ إجراء */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start text-right order-1"
          >
            {/* العنوان الإنجليزي الصغير باللون الأصفر الذهبي */}
            <span className="text-[#F5B800] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 inline-block">
              ENT CLINIC · EASLAM ABDALLAH KAREEMA
            </span>

            {/* الاسم الرئيسي للطبيب بخط عريض وفخم */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white mb-4 tracking-tight">
              د. إسلام
              <br />
              عبدالله كريمة
            </h1>

            {/* نبذة عن التخصص */}
            <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              أخصائي الأنف والأذن والحنجرة وجراحاتها بأحدث طرق التشخيص والعلاج والمناظير الجراحية الدقيقة.
            </p>

            {/* أزرار الحجز والخدمات */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              {/* زر احجز كشف الأساسي ينقل مباشرة إلى واتساب */}
              <a
                href={getWhatsAppUrl('مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 text-base inline-flex items-center justify-center cursor-pointer"
              >
                احجز كشف
              </a>

              {/* زر الخدمات الطبية للتمرير إلى قسم الخدمات */}
              <a
                href="#services"
                className="border border-white/90 hover:border-white text-white hover:bg-white/10 font-medium px-8 py-3.5 rounded-xl transition-all text-base inline-flex items-center justify-center"
              >
                الخدمات الطبية
              </a>
            </div>

            {/* شريط الإحصائيات والمميزات السريعة أسفل الهيرو */}
            <div className="w-full pt-8 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-6">
              {HERO_STATS.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[#F5B800] font-bold text-base sm:text-lg">
                    {stat.title}
                  </span>
                  <span className="text-white/75 text-xs sm:text-sm mt-0.5">
                    {stat.subtitle}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* الجانب الأيسر (في RTL): خلفية الأشكال وصورة الدكتور */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 flex justify-center items-center order-2 relative"
          >
            {/* الحاوية النسبية بأبعاد (560 x 710) المتوافقة تماماً مع ملف الـ SVG وصورة الدكتور */}
            <div className="relative w-full max-w-[460px] aspect-[560/710] mx-auto select-none">
              {/* الخلفية الهندسية الرسمية للأشكال المنحنية */}
              <Image
                src="/background-landing.svg"
                alt=""
                fill
                priority
                className="object-contain pointer-events-none select-none z-0"
              />

              {/* صورة الدكتور المفرغة المطابقة لقياسات وموضع الـ SVG بدقة */}
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 460px"
                  className="object-contain object-bottom drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
