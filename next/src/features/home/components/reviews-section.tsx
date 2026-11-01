'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { PATIENT_REVIEWS } from '../constants';
import { Star } from 'lucide-react';
import { cn } from 'cn';

/**
 * قسم آراء المرضى - أنيميشن ظهور متتابع سريع وتأثيرات تحويم فاخرة
 */
export const ReviewsSection = () => {
  const t = useTranslations('Reviews');

  return (
    <section id="reviews" className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم مع تأثير ظهور متصاعد */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
          className="text-start mb-12 sm:mb-16"
        >
          <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
            {t('kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
            {t('title')}
          </h2>
        </motion.div>

        {/* شبكة البطاقات الثلاث بأنيميشن Stagger سلس */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {PATIENT_REVIEWS.map((review, idx) => {
            const borderTopClass = {
              yellow: 'border-t-4 border-[#F5B800] hover:shadow-amber-100',
              blue: 'border-t-4 border-[#1D4ED8] hover:shadow-blue-100',
              navy: 'border-t-4 border-[#0A164E] hover:shadow-slate-200',
            }[review.accent];

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.35,
                  delay: idx * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={cn(
                  'group bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-100 flex flex-col justify-between transition-shadow duration-300 hover:shadow-xl cursor-default',
                  borderTopClass
                )}
              >
                <div>
                  {/* النجوم الخمسة باللون الأصفر مع ظهور رشيق */}
                  <div className="flex items-center gap-1 text-[#F5B800] mb-5">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-current text-[#F5B800] transition-transform duration-200 group-hover:scale-110"
                        style={{ transitionDelay: `${i * 35}ms` }}
                      />
                    ))}
                  </div>

                  {/* نص المراجعة */}
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                    {t(`items.${review.id}.text`)}
                  </p>
                </div>

                {/* معلومات المريض والصورة الرمزية بالحدود المتقطعة مع حركة دوران ناعمة عند التحويم */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#1D4ED8] flex items-center justify-center text-xs font-medium text-[#1D4ED8] bg-blue-50/50 shrink-0 group-hover:rotate-12 group-hover:scale-105 transition-transform duration-300">
                    {t('photo')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A164E]">
                      {t(`items.${review.id}.name`)}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {t('verifiedPatient')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
