'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PATIENT_REVIEWS } from '../constants';
import { Star } from 'lucide-react';
import { cn } from 'cn';

/**
 * قسم آراء المرضى - 3 بطاقات بأشرطة ألوان علوية مميزة وتقييم النجوم
 */
export const ReviewsSection = () => {
  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="text-right mb-16">
          <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
            PATIENT REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
            آراء المرضى
          </h2>
        </div>

        {/* شبكة البطاقات الثلاث */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PATIENT_REVIEWS.map((review, idx) => {
            // شريط الحافة العلوية الملون بحسب التصميم (أصفر، أزرق، كحلي)
            const borderTopClass = {
              yellow: 'border-t-4 border-[#F5B800]',
              blue: 'border-t-4 border-[#1D4ED8]',
              navy: 'border-t-4 border-[#0A164E]',
            }[review.accent];

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className={cn(
                  'bg-white rounded-3xl p-7 shadow-sm border border-slate-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md',
                  borderTopClass
                )}
              >
                <div>
                  {/* النجوم الخمسة باللون الأصفر */}
                  <div className="flex items-center gap-1 text-[#F5B800] mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-current text-[#F5B800]"
                      />
                    ))}
                  </div>

                  {/* نص المراجعة ورأي المريض */}
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
                    {review.text}
                  </p>
                </div>

                {/* معلومات المريض وصورته الرمزية بالحدود المتقطعة */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#1D4ED8] flex items-center justify-center text-xs font-medium text-[#1D4ED8] bg-blue-50/50 shrink-0">
                    صورة
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A164E]">
                      {review.patientName}
                    </h4>
                    <span className="text-xs text-slate-400">مريض موثق</span>
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

