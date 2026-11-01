'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TIMELINE_MILESTONES } from '../constants';
import { Stethoscope } from 'lucide-react';

/**
 * قسم نبذة والمؤهلات - يحتوي على خط زمني للمسيرة المهنية وإطار صورة الدكتور
 */
export const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="text-right mb-16">
          <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
            ABOUT THE DOCTOR
          </span>
          <h2 id="qualifications" className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
            نبذة والمؤهلات
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl">
            [اكتب هنا نبذة قصيرة عن الدكتور وفلسفته في العلاج]
          </p>
        </div>

        {/* تخطيط من عمودين */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* الجانب الأيمن (في RTL): الخط الزمني للمؤهلات والخبرات */}
          <div className="lg:col-span-7 order-1">
            <div className="relative pr-6 border-r-2 border-[#1D4ED8] space-y-10 py-2">
              {TIMELINE_MILESTONES.map((milestone, idx) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative group text-right"
                >
                  {/* النقطة الصفراء على الخط الزمني */}
                  <span
                    className="absolute -right-[31px] top-1.5 w-3.5 h-3.5 bg-[#F5B800] rounded-xs ring-4 ring-white group-hover:scale-125 transition-transform"
                    aria-hidden="true"
                  />

                  {/* السنة باللون الأزرق */}
                  <span className="text-xs sm:text-sm font-bold text-[#1D4ED8] block mb-1">
                    {milestone.year}
                  </span>

                  {/* اسم المؤهل / الدرجة العلمية بخط كحلي عريض */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#0A164E] tracking-tight mb-0.5">
                    {milestone.degree}
                  </h3>

                  {/* الجهة المانحة أو المستشفى */}
                  <p className="text-sm text-slate-500">
                    {milestone.institution}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* الجانب الأيسر (في RTL): إطار صورة الدكتور مع الأشكال الهندسية الملونة */}
          <div className="lg:col-span-5 order-2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-[380px]"
            >
              {/* الشكل الأزرق المنحني البارز في الأعلى واليمين */}
              <div
                className="absolute -top-4 -right-4 w-28 h-28 bg-[#1D4ED8] rounded-3xl -z-10"
                aria-hidden="true"
              />

              {/* الشكل الأصفر المنحني البارز في الأسفل واليسار */}
              <div
                className="absolute -bottom-5 -left-5 w-32 h-32 bg-[#F5B800] rounded-3xl -z-10"
                aria-hidden="true"
              />

              {/* البطاقة ذات الحدود المتقطعة */}
              <div className="w-full aspect-[4/5] min-h-[380px] bg-white/90 backdrop-blur-xs border-2 border-dashed border-[#1D4ED8] rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1D4ED8] flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <p className="text-slate-600 font-bold text-sm sm:text-base leading-relaxed">
                  [صورة ثانية للدكتور أثناء العمل]
                </p>
                <span className="text-xs text-slate-400 mt-2">
                  جراحات المناظير الميكروسكوبية
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

