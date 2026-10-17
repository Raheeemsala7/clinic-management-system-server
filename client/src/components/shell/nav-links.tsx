'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/components/shell/nav-config';
import { type Role } from '@/lib/roles';

interface NavLinksProps {
  role: Role;
  onNavigate?: () => void;
  className?: string;
}

export function NavLinks({ role, onNavigate, className }: NavLinksProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];

  return (
    <nav className={cn('flex flex-col gap-1', className)} aria-label="التنقل">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-touch items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}


