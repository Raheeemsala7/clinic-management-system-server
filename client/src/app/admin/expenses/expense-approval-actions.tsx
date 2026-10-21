'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { approveExpenseAction, rejectExpenseDirectAction } from '@/features/expenses/actions';
import { useI18n } from '@/i18n/use-i18n';

interface ExpenseApprovalActionsProps {
  expenseId: string;
  description: string;
}

export function ExpenseApprovalActions({ expenseId, description }: ExpenseApprovalActionsProps) {
  const { t, isAr } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveExpenseAction(expenseId);
      if (res.success) {
        toast.success(isAr ? 'تمت الموافقة على المصروف بنجاح' : 'Expense approved successfully');
      } else {
        toast.error(res.error || (isAr ? 'فشلت عملية الموافقة' : 'Approval failed'));
      }
    });
  };

  const handleRejectConfirm = () => {
    startTransition(async () => {
      const res = await rejectExpenseDirectAction(expenseId, reason);
      if (res.success) {
        toast.success(isAr ? 'تم رفض المصروف' : 'Expense rejected');
        setRejectOpen(false);
        setReason('');
      } else {
        toast.error(res.error || (isAr ? 'فشلت عملية رفض المصروف' : 'Rejection failed'));
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-9 px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          onClick={handleApprove}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          {t.expenses.approve}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3 gap-1.5 border-destructive text-destructive hover:bg-destructive/10 text-xs font-semibold"
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
        >
          <X className="size-3.5" />
          {t.expenses.reject}
        </Button>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">
              {isAr ? 'تأكيد رفض المصروف' : 'Confirm Expense Rejection'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr ? 'هل أنت متأكد من رفض المصروف:' : 'Are you sure you want to reject expense:'} &quot;{description}&quot;؟
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-bold text-foreground block">
              {isAr ? 'سبب الرفض (اختياري)' : 'Rejection Reason (Optional)'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isAr ? 'اكتب سبب الرفض هنا...' : 'Enter rejection reason here...'}
              className="w-full min-h-[80px] rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRejectConfirm}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isAr ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
