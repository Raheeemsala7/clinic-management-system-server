'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BrandLogo } from './brand-logo';
import { CLINIC_FACILITIES } from '../constants';
import { Building2, Stethoscope, Eye, Clock, Laptop } from 'lucide-react';
import { cn } from 'cn';

/**
 * قسم عيادتنا - معرض صور المرافق بأسلوب Bento Grid مع أنيميشن سلس ومحسن للأداء
 */
export const ClinicSection = () => {
  const t = useTranslations('Clinic');
  const featured = CLINIC_FACILITIES.find((f) => f.isFeatured);
  const items = CLINIC_FACILITIES.filter((f) => !f.isFeatured);

  const facilityIcons: Record<string, React.ReactNode> = {
    '[غرفة الكشف]': <Stethoscope className="w-5 h-5 text-[#1D4ED8] mb-1.5" />,
    '[الأجهزة]': <Laptop className="w-5 h-5 text-[#1D4ED8] mb-1.5" />,
    '[المناظير]': <Eye className="w-5 h-5 text-[#1D4ED8] mb-1.5" />,
    '[صالة الانتظار]': <Clock className="w-5 h-5 text-[#1D4ED8] mb-1.5" />,
  };

  return (
    <section id="clinic" className="py-16 sm:py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* رأس القسم */}
        <div className="flex items-start justify-between mb-10 sm:mb-14">
          <div className="text-start">
            <span className="text-[#1D4ED8] text-xs font-bold tracking-widest uppercase block mb-2">
              {t('kicker')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A164E] tracking-tight">
              {t('title')}
            </h2>
          </div>

          <div className="hidden sm:block">
            <BrandLogo variant="dark" showText={false} />
          </div>
        </div>

        {/* شبكة البنتو جرد (Bento Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.008 }}
              className="lg:col-span-7 min-h-[280px] sm:min-h-[350px] bg-white border-2 border-dashed border-[#1D4ED8] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md hover:border-blue-700 hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 group-hover:bg-blue-100 text-[#1D4ED8] flex items-center justify-center mb-3 transition-colors">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0A164E]">
                {featured.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                {t('receptionDesc')}
              </p>
            </motion.div>
          )}

          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 sm:gap-4">
            {items.map((facility, idx) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.25, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -2 }}
                className={cn(
                  'min-h-[140px] sm:min-h-[165px] bg-white border-2 border-dashed border-[#1D4ED8] rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm hover:border-blue-700 hover:bg-blue-50/20 transition-all cursor-pointer group'
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
