import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge supports both generic tones and appointment/status states so callers can
 * pass `variant={entry.status}` directly.
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        success: 'border-transparent bg-status-completed text-status-completed-fg',
        // Appointment statuses
        BOOKED: 'border-transparent bg-status-booked text-status-booked-fg',
        WAITING: 'border-transparent bg-status-waiting text-status-waiting-fg',
        IN_PROGRESS: 'border-transparent bg-status-in-progress text-status-in-progress-fg',
        COMPLETED: 'border-transparent bg-status-completed text-status-completed-fg',
        CANCELLED: 'border-transparent bg-status-cancelled text-status-cancelled-fg',
        NO_SHOW: 'border-transparent bg-status-no-show text-status-no-show-fg',
        // Expense / payment states
        PENDING: 'border-transparent bg-status-waiting text-status-waiting-fg',
        APPROVED: 'border-transparent bg-status-completed text-status-completed-fg',
        REJECTED: 'border-transparent bg-status-cancelled text-status-cancelled-fg',
        RECORDED: 'border-transparent bg-status-completed text-status-completed-fg',
        VOIDED: 'border-transparent bg-status-no-show text-status-no-show-fg',
        AVAILABLE: 'border-transparent bg-status-completed text-status-completed-fg',
        WITH_PATIENT: 'border-transparent bg-status-in-progress text-status-in-progress-fg',
        BREAK: 'border-transparent bg-status-waiting text-status-waiting-fg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
