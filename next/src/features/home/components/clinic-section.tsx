'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrandLogo } from './brand-logo';
import { CLINIC_FACILITIES } from '../constants';
import { Building2, Stethoscope, Eye, Clock, Laptop } from 'lucide-react';
import { cn } from 'cn';

/**
 * قسم عيادتنا - معرض صور المرافق بأسلوب Bento Grid وبحدود متقطعة مطابقة للتصميم
 */
export const ClinicSection = () => {
  const featured = CLINIC_FACILITIES.find((f) => f.isFeatured);
  const items = CLINIC_FACILITIES.filter((f) => !f.isFeatured);

  // أيقونات توضيحية خفيفة لكل مرفق
  const facilityIcons: Record<string, React.ReactNode> = {
    '[غرفة الكشف]': <Stethoscope className="w-6 h-6 text-[#1D4ED8] mb-2" />,
    '[الأجهزة]': <Laptop className="w-6 h-6 text-[#1D4ED8] mb-2" />,
    '[المناظير]': <Eye className="w-6 h-6 text-[#1D4ED8] mb-2" />,
    '[صالة الانتظار]': <Clock className="w-6 h-6 text-[#1D4ED8] mb-2" />,
  };

  return (
    <section id="clinic" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="flex items-start justify-between mb-12 sm:mb-16">
          <div className="text-right">
            <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
              OUR CLINIC
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
              عيادتنا
            </h2>
          </div>

          <div className="hidden sm:block">
            <BrandLogo variant="dark" showText={false} />
          </div>
        </div>

        {/* شبكة البنتو جرد (Bento Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* البطاقة الرئيسية (الواجهة / الاستقبال) - في اليمين على الشاشات الكبيرة */}
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className="lg:col-span-7 min-h-[320px] sm:min-h-[380px] bg-white border-2 border-dashed border-[#1D4ED8] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-blue-700 hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 group-hover:bg-blue-100 text-[#1D4ED8] flex items-center justify-center mb-4 transition-colors">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0A164E]">
                {featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                مساحة مجهزة بأعلى معايير الراحة والتعقيم لاستقبال المرضى
              </p>
            </motion.div>
          )}

          {/* الشبكة الرباعية (2x2) - في اليسار */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {items.map((facility, idx) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className={cn(
                  'min-h-[150px] sm:min-h-[180px] bg-white border-2 border-dashed border-[#1D4ED8] rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm hover:border-blue-700 hover:bg-blue-50/20 transition-all cursor-pointer group'
                )}
              >
                {facilityIcons[facility.title]}
                <h4 className="text-sm sm:text-base font-bold text-[#0A164E] group-hover:text-[#1D4ED8] transition-colors">
                  {facility.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

