'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavLinks } from '@/components/shell/nav-links';
import { homePathForRole } from '@/lib/roles';
import { type Role } from '@/lib/roles';
import { useI18n } from '@/i18n/use-i18n';

interface MobileNavProps {
  role: Role;
  locale?: 'en' | 'ar';
}

export function MobileNav({ role, locale: propLocale }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { t, locale: activeLocale } = useI18n();
  const locale = propLocale || activeLocale;

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t.nav.menu}
        onClick={() => setOpen(true)}
        className="size-10 rounded-lg hover:bg-muted"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Off-canvas Drawer (RTL start = Right side) */}
      <div
        className={`fixed inset-y-0 start-0 z-50 w-72 sm:w-80 bg-card border-e shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
      >
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <Link
              href={homePathForRole(role)}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 font-bold text-primary text-base"
            >
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Stethoscope className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span>{t.common.appName}</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="size-8 rounded-md hover:bg-muted"
              aria-label={t.common.close}
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Role badge banner */}
          <div className="rounded-lg bg-muted/40 p-2.5 border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.common.role}</span>
            <Badge variant="secondary" className="font-semibold text-xs">
              {t.roles[role]}
            </Badge>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-1">
            <NavLinks role={role} locale={locale} onNavigate={() => setOpen(false)} />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground text-center">
          <p className="font-medium text-foreground">{t.common.appName}</p>
          <p className="text-[11px] opacity-75 mt-0.5">{t.common.appSubtitle}</p>
        </div>
      </div>
    </div>
  );
}
