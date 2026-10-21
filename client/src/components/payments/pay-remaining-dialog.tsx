'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { payRemainingAction } from '@/features/appointments/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/use-i18n';

interface PayRemainingDialogProps {
  appointmentId: string;
  patientName: string;
  totalAmount: number;
  remainingAmount: number;
  triggerButton?: React.ReactNode;
}

export function PayRemainingDialog({
  appointmentId,
  patientName,
  totalAmount,
  remainingAmount,
  triggerButton,
}: PayRemainingDialogProps) {
  const router = useRouter();
  const { t, isAr } = useI18n();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(String(remainingAmount));
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currency = isAr ? 'ج.م' : 'EGP';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError(t.payRemaining.invalidAmount);
      return;
    }

    startTransition(async () => {
      const res = await payRemainingAction(appointmentId, numAmount, method, notes);
      if (res.success) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1300);
      } else {
        setError(res.error || t.payRemaining.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button size="sm" variant="outline" className="text-xs gap-1 border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100">
            <Coins className="size-3.5" />
            {t.payRemaining.buttonLabel} ({remainingAmount} {currency})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Coins className="size-5 text-amber-600" />
            {t.payRemaining.dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="size-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="font-bold text-foreground">{t.payRemaining.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-xs">
              <p>
                {isAr ? 'المريض:' : 'Patient:'} <span className="font-bold text-foreground">{patientName}</span>
              </p>
              <div className="flex justify-between font-mono pt-1 text-muted-foreground border-t">
                <span>{isAr ? 'إجمالي الحجز:' : 'Total Fee:'} {totalAmount} {currency}</span>
                <span className="font-bold text-amber-700">
                  {isAr ? 'المتبقي المطلوب:' : 'Remaining Due:'} {remainingAmount} {currency}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">
                {t.payRemaining.amountToPay} ({currency}) *
              </Label>
              <Input
                type="number"
                min="1"
                max={remainingAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-bold text-lg font-mono text-emerald-700"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? 'طريقة الدفع' : 'Payment Method'}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={method === 'CASH' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMethod('CASH')}
                >
                  {t.payRemaining.cash}
                </Button>
                <Button
                  type="button"
                  variant={method === 'CARD' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMethod('CARD')}
                >
                  {t.payRemaining.card}
                </Button>
                <Button
                  type="button"
                  variant={method === 'WALLET' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMethod('WALLET')}
                >
                  {t.payRemaining.wallet}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t.payRemaining.notes} ({t.common.optional})</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.payRemaining.notesPlaceholder}
              />
            </div>

            <DialogFooter className="pt-2 flex justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                {t.payRemaining.cancel}
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-bold">
                {isPending ? <Loader2 className="size-4 animate-spin" /> : t.payRemaining.confirm}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
