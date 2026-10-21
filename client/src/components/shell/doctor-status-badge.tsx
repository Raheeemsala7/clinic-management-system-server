'use client';

import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/i18n/use-i18n';

interface DoctorStatusBadgeProps {
  status: 'AVAILABLE' | 'WITH_PATIENT' | 'BREAK';
  className?: string;
}

/** Doctor availability badge shown to every role. */
export function DoctorStatusBadge({ status, className }: DoctorStatusBadgeProps) {
  const { t } = useI18n();

  return (
    <Badge variant={status} className={className}>
      <span className="me-1 inline-block size-2 rounded-full bg-current" aria-hidden="true" />
      {`${t.roles.DOCTOR}: ${t.doctorStatus[status]}`}
    </Badge>
  );
}
