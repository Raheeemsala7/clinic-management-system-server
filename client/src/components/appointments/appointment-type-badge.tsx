'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import { getAppointmentTypeConfig } from '@/lib/appointment-types';
import { cn } from '@/lib/utils';

interface AppointmentTypeBadgeProps {
  type?: string | null;
  className?: string;
  showDot?: boolean;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppointmentTypeBadge({
  type,
  className,
  showDot = true,
  locale,
  size = 'md',
}: AppointmentTypeBadgeProps) {
  const currentLocale = useLocale() || 'ar';
  const effectiveLocale = locale || currentLocale;
  const config = getAppointmentTypeConfig(type);
  const label = effectiveLocale === 'en' ? config.enLabel : config.arLabel;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  }[size];

  const dotSizes = {
    sm: 'size-1',
    md: 'size-1.5',
    lg: 'size-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border transition-colors shadow-2xs shrink-0',
        sizeClasses,
        config.badgeClass,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn('rounded-full shrink-0', dotSizes, config.dotColorClass)}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
