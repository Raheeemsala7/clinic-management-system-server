'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createExpenseAction, type ExpenseActionResult } from '@/features/expenses/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ar } from '@/i18n/messages/ar';
import { Receipt, Loader2, Plus } from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  categories: ExpenseCategory[];
}

const initial: ExpenseActionResult = { success: false };

export function ExpenseForm({ categories }: ExpenseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createExpenseAction, initial);

  const todayIso = new Date().toISOString();

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-300 bg-green-50 text-green-900">
          <AlertDescription>تم تسجيل المصروف بنجاح وبانتظار الموافقة ✓</AlertDescription>
        </Alert>
      )}

      <input type="hidden" name="spentAt" value={todayIso} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">{ar.expenses.category} *</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            disabled={isPending}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">اختر فئة المصروف...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">{ar.expenses.amount} *</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            disabled={isPending}
            className="h-11 text-base font-semibold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{ar.expenses.description} *</Label>
        <Input
          id="description"
          name="description"
          type="text"
          placeholder="تفاصيل المصروف (مثال: مستلزمات طبية، شاش وقطن، صيانة...)"
          required
          disabled={isPending}
          className="h-11 text-sm"
        />
      </div>

      <Button type="submit" disabled={isPending} className="gap-2 font-semibold px-6">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        {ar.expenses.newExpense}
      </Button>
    </form>
  );
}
