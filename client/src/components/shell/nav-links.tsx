'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS_BY_ROLE } from '@/components/shell/nav-config';
import { type Role } from '@/lib/roles';

interface NavLinksProps {
  role: Role;
  onNavigate?: () => void;
  className?: string;
  locale?: 'en' | 'ar';
}

export function NavLinks({ role, onNavigate, className, locale = 'ar' }: NavLinksProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS_BY_ROLE[role] || [];

  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="Navigation">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== '/reception' &&
            item.href !== '/doctor' &&
            item.href !== '/admin' &&
            pathname.startsWith(`${item.href}/`));
        const Icon = item.icon;
        const label = locale === 'en' ? item.enLabel : item.arLabel;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-touch items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
