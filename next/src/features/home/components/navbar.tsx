'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { NAV_LINKS, getWhatsAppUrl } from '../constants';
import { cn } from 'cn';

/**
 * شريط التنقل العلوي (Navbar) مع زر الحجز عبر الواتساب وقائمة الجوال المتجاوبة
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // استشعار التمرير لإضافة ظل خلفي وتأثير زجاجي بلوري
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        isScrolled
          ? 'bg-[#0A164E]/90 backdrop-blur-md shadow-lg border-b border-white/10 py-3'
          : 'bg-[#0A164E] py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* الجانب الأيمن (في الـ RTL): الشعار واسم الطبيب */}
          <div className="flex items-center">
            <BrandLogo variant="light" />
          </div>

          {/* المنتصف: روابط التنقل السلس للشاشات المتوسطة والكبيرة */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="روابط الموقع الرئيسية">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-[#F5B800] after:absolute after:bottom-0 after:right-0 after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* الجانب الأيسر (في الـ RTL): زر احجز الآن المباشر إلى واتساب + زر قائمة الجوال */}
          <div className="flex items-center gap-3">
            <a
              href={getWhatsAppUrl('مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center justify-center cursor-pointer"
            >
              احجز الآن
            </a>

            {/* زر القائمة للشاشات الصغيرة */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              aria-label="فتح القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* قائمة الجوال المنبثقة */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 pb-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-white/90 hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={getWhatsAppUrl('مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.')}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center mt-3 bg-[#F5B800] hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
            >
              احجز موعدك الآن عبر واتساب
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
