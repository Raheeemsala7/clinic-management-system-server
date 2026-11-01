'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { BrandLogo } from './brand-logo';
import { getWhatsAppUrl } from '../constants';
import { SwitchLanguageBtn } from '@/shared/components/switch-language-btn';
import { WhatsAppIcon } from '@/shared/components/whatsapp-icon';
import { cn } from 'cn';

/**
 * شريط التنقل العلوي (Navbar) مع زر تبديل اللغة وزر الحجز المباشر عبر واتساب
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('Nav');
  const locale = useLocale();

  // استشعار التمرير لإضافة ظل خلفي وتأثير زجاجي بلوري
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t('home'), href: '#hero' },
    { label: t('about'), href: '#about' },
    { label: t('services'), href: '#services' },
    { label: t('clinic'), href: '#clinic' },
    { label: t('reviews'), href: '#reviews' },
  ];

  const whatsappHref = getWhatsAppUrl(undefined, locale);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        isScrolled
          ? 'bg-[#0A164E]/92 backdrop-blur-md shadow-lg border-b border-white/10 py-2.5 sm:py-3'
          : 'bg-[#0A164E] py-3 sm:py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          {/* الجانب الأيمن (في الـ RTL): الشعار - يخفي اسم الطبيب على شاشات الموبايل للحفاظ على المساحة */}
          <div className="flex items-center shrink-0">
            <BrandLogo variant="light" />
          </div>

          {/* المنتصف: روابط التنقل السلس للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#F5B800] after:absolute after:bottom-0 after:right-0 after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* الجانب الأيسر (في الـ RTL): زر تبديل اللغة + زر احجز الآن المباشر إلى واتساب + زر قائمة الجوال */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* زر تبديل اللغة */}
            <SwitchLanguageBtn variant="light" />

            {/* زر احجز الآن المباشر عبر واتساب مع تأثير هوفر وانتقال رشيق */}
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md hover:shadow-xl inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors duration-150 group"
            >
              <WhatsAppIcon className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform duration-200" />
              <span>{t('bookNow')}</span>
            </motion.a>

            {/* زر قائمة الجوال للشاشات الصغيرة */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* قائمة الجوال المنبثقة */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/10 pb-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-center bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{t('bookNow')}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
