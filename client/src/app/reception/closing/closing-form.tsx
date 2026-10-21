'use client';

import { useActionState } from 'react';
import { submitClosingAction, type ClosingActionResult } from '@/features/closing/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n/use-i18n';
import { formatMoney } from '@/lib/utils';

interface ClosingFormProps {
  expectedCash: string;
}

const initial: ClosingActionResult = { success: false };

export function ClosingForm({ expectedCash }: ClosingFormProps) {
  const { t, locale, isAr } = useI18n();
  const [state, formAction, isPending] = useActionState(submitClosingAction, initial);

  if (state.success && state.data) {
    const diff = parseFloat(state.data.difference);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-green-700">
            {isAr ? '✓ تم إغلاق اليوم' : '✓ Daily Closing Completed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t.closing.expectedCash}</span>
            <span>{formatMoney(state.data.expectedCash, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.closing.actualCash}</span>
            <span>{formatMoney(state.data.actualCash, locale)}</span>
          </div>
          <div className={`flex justify-between font-semibold ${diff >= 0 ? 'text-green-700' : 'text-destructive'}`}>
            <span>{t.closing.difference}</span>
            <span>{formatMoney(state.data.difference, locale)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="actualCash">{t.closing.actualCash}</Label>
        <Input
          id="actualCash"
          name="actualCash"
          type="number"
          min="0"
          step="0.01"
          placeholder={expectedCash}
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">{t.common.notes} ({t.common.optional})</Label>
        <Input
          id="notes"
          name="notes"
          type="text"
          disabled={isPending}
        />
      </div>

      <Button type="submit" loading={isPending} className="w-full">
        {t.closing.submit}
      </Button>
    </form>
  );
}
