'use client';

import { useState, useTransition } from 'react';
import { useI18n } from '@/i18n/use-i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney, formatTime } from '@/lib/utils';
import { submitClosingAction, reopenClosingAction } from '@/features/closing/actions';
import { Lock, Unlock, AlertTriangle, CheckCircle2, History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export interface ClosingPreview {
  clinicDate: string;
  totalCashPayments: string;
  totalApprovedExpenses: string;
  expectedCash: string;
}

export interface DailyClosingRecord {
  id: string;
  clinicDate: string;
  expectedCash: string;
  actualCash: string;
  difference: string;
  notes: string | null;
  closedAt: string;
  reopenedAt: string | null;
  closedBy: {
    id: string;
    name: string;
    username: string;
  };
}

interface AdminClosingViewProps {
  preview: ClosingPreview | null;
  currentClosing: DailyClosingRecord | null;
  history: DailyClosingRecord[];
}

export function AdminClosingView({ preview, currentClosing, history }: AdminClosingViewProps) {
  const { t, locale, isAr } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [actualInput, setActualInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const expectedVal = parseFloat(preview?.expectedCash ?? '0');
  const actualVal = actualInput ? parseFloat(actualInput) : expectedVal;
  const liveDiff = actualInput ? actualVal - expectedVal : 0;

  const handleCloseDay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.set('actualCash', actualInput || String(expectedVal));
    if (notesInput) formData.set('notes', notesInput);

    startTransition(async () => {
      const res = await submitClosingAction({ success: false }, formData);
      if (!res.success) {
        setErrorMessage(res.error ?? t.errors.serverError);
      } else {
        setSuccessMessage(t.closing.closed);
        setActualInput('');
        setNotesInput('');
      }
    });
  };

  const handleReopen = (closingId: string) => {
    if (!confirm(t.closing.reopenConfirm)) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await reopenClosingAction(closingId);
      if (!res.success) {
        setErrorMessage(res.error ?? t.errors.serverError);
      } else {
        setSuccessMessage(t.closing.reopened);
      }
    });
  };

  const isClosedToday = !!currentClosing && !currentClosing.reopenedAt;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-green-300 bg-green-50 text-green-900">
          <CheckCircle2 className="size-4 shrink-0 text-green-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Top Today Status Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cash flow summary card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{t.closing.preview}</CardTitle>
              <Badge variant={isClosedToday ? 'outline' : 'default'} className={isClosedToday ? 'border-amber-400 text-amber-700 bg-amber-50' : 'bg-emerald-600'}>
                {isClosedToday ? t.closing.alreadyClosed : (isAr ? 'الصندوق مفتوح اليوم' : 'Cashbox Open Today')}
              </Badge>
            </div>
            <CardDescription>{t.common.today} ({preview?.clinicDate})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{t.closing.expectedCash}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {formatMoney(preview?.expectedCash ?? '0', locale)}
                </p>
              </div>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="size-5" />
              </div>
            </div>

            <div className="space-y-2 text-sm pt-1">
              <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowDownLeft className="size-4 text-emerald-600" />
                  {t.closing.totalCashPayments}
                </span>
                <span className="font-semibold text-emerald-700">
                  {formatMoney(preview?.totalCashPayments ?? '0', locale)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowUpRight className="size-4 text-destructive" />
                  {t.closing.totalApprovedExpenses}
                </span>
                <span className="font-semibold text-destructive">
                  - {formatMoney(preview?.totalApprovedExpenses ?? '0', locale)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action card: Close or Reopen */}
        <Card className="shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {isClosedToday ? t.closing.alreadyClosed : t.closing.title}
            </CardTitle>
            <CardDescription>
              {isClosedToday
                ? (isAr ? 'بيانات إغلاق صندوق اليوم' : 'Today Closing Details')
                : (isAr ? 'تسجيل النقدية الفعلية وإغلاق الصندوق لهذا اليوم' : 'Record actual cash and close register for today')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isClosedToday ? (
              <div className="space-y-4">
                <div className="rounded-lg border bg-amber-50/50 border-amber-200 p-4 text-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t.closing.actualCash}:</span>
                    <span className="font-bold text-base text-foreground">
                      {formatMoney(currentClosing.actualCash, locale)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t.closing.difference}:</span>
                    <span
                      className={`font-semibold text-sm px-2 py-0.5 rounded ${
                        parseFloat(currentClosing.difference) === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : parseFloat(currentClosing.difference) > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {formatMoney(currentClosing.difference, locale)}
                      {parseFloat(currentClosing.difference) === 0
                        ? ` (${t.closing.balanced})`
                        : parseFloat(currentClosing.difference) > 0
                          ? ` (${t.closing.overage})`
                          : ` (${t.closing.shortage})`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-amber-200/60">
                    <span>{t.closing.closedBy}: {currentClosing.closedBy?.name ?? '-'}</span>
                    <span>{formatTime(currentClosing.closedAt)}</span>
                  </div>
                  {currentClosing.notes && (
                    <p className="text-xs text-muted-foreground italic bg-background/60 p-2 rounded border border-amber-200/40">
                      &quot;{currentClosing.notes}&quot;
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 flex items-center justify-center gap-2"
                  onClick={() => handleReopen(currentClosing.id)}
                  disabled={isPending}
                >
                  <Unlock className="size-4" />
                  {t.closing.reopen}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCloseDay} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="actualCash">{t.closing.actualCash}</Label>
                  <Input
                    id="actualCash"
                    type="number"
                    min="0"
                    step="0.01"
                    value={actualInput}
                    onChange={(e) => setActualInput(e.target.value)}
                    placeholder={preview?.expectedCash ?? '0'}
                    required
                    disabled={isPending}
                  />
                  {actualInput && (
                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <span className="text-muted-foreground">{t.closing.difference}:</span>
                      <span
                        className={`font-semibold ${
                          liveDiff === 0
                            ? 'text-emerald-700'
                            : liveDiff > 0
                              ? 'text-blue-700'
                              : 'text-destructive'
                        }`}
                      >
                        {formatMoney(liveDiff, locale)}
                        {liveDiff === 0
                          ? ` (${t.closing.balanced})`
                          : liveDiff > 0
                            ? ` (${t.closing.overage})`
                            : ` (${t.closing.shortage})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes">{t.common.notes} ({t.common.optional})</Label>
                  <Input
                    id="notes"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder={isAr ? 'ملاحظات حول الإغلاق أو أسباب الفروقات...' : 'Closing notes or explanation for discrepancies...'}
                    disabled={isPending}
                  />
                </div>

                <Button type="submit" disabled={isPending} className="w-full">
                  <Lock className="size-4 ms-2" />
                  {t.closing.submit}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">{t.closing.history}</CardTitle>
          </div>
          <CardDescription>
            {isAr ? 'سجل الإغلاقات اليومية السابقة وإعادة الفتح' : 'History of previous daily closings and reopens'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t.common.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.common.date}</TableHead>
                    <TableHead>{t.closing.expectedCash}</TableHead>
                    <TableHead>{t.closing.actualCash}</TableHead>
                    <TableHead>{t.closing.difference}</TableHead>
                    <TableHead>{t.closing.closedBy}</TableHead>
                    <TableHead>{t.common.status}</TableHead>
                    <TableHead>{t.common.notes}</TableHead>
                    <TableHead className="text-start">{t.common.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => {
                    const diffNum = parseFloat(record.difference);
                    const isReopened = !!record.reopenedAt;
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {record.clinicDate}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatMoney(record.expectedCash, locale)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold">
                          {formatMoney(record.actualCash, locale)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              diffNum === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : diffNum > 0
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {diffNum > 0 ? '+' : ''}
                            {formatMoney(record.difference, locale)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {record.closedBy?.name ?? '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {isReopened ? (
                            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">
                              {isAr ? 'أُعيد فتحه' : 'Reopened'}
                            </Badge>
                          ) : (
                            <Badge variant="default" className="bg-emerald-600">
                              {isAr ? 'مغلق' : 'Closed'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {record.notes ?? '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {!isReopened && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800 h-8 px-2"
                              onClick={() => handleReopen(record.id)}
                              disabled={isPending}
                            >
                              <Unlock className="size-3.5 me-1" />
                              {t.closing.reopen}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
