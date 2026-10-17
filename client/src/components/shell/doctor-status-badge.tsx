import { Badge } from '@/components/ui/badge';
import { ar } from '@/messages/ar';

interface DoctorStatusBadgeProps {
  status: 'AVAILABLE' | 'WITH_PATIENT' | 'BREAK';
  className?: string;
}

/** Doctor availability badge shown to every role. */
export function DoctorStatusBadge({ status, className }: DoctorStatusBadgeProps) {
  return (
    <Badge variant={status} className={className}>
      <span className="me-1 inline-block size-2 rounded-full bg-current" aria-hidden="true" />
      {`${ar.roles.DOCTOR}: ${ar.doctorStatus[status]}`}
    </Badge>
  );
}
