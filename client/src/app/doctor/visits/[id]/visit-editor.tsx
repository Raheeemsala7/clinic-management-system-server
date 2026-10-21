'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useI18n } from '@/i18n/use-i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { autosaveVisitAction } from '@/features/visits/actions';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface VisitData {
  id: string;
  appointmentId: string;
  patientId: string;
  complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  instructions: string | null;
  followUpDate: string | null;
  status: 'OPEN' | 'CLOSED';
  version: number;
}

interface VisitEditorProps {
  visit: VisitData & { patient: unknown };
}

export function VisitEditor({ visit }: VisitEditorProps) {
  const { t, isAr } = useI18n();
  const [version, setVersion] = useState(visit.version);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'conflict'>('idle');
  const [conflictOpen, setConflictOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isClosed = visit.status === 'CLOSED';

  const triggerSave = () => {
    if (isClosed || !formRef.current) return;
    setSaveStatus('saving');

    const fd = new FormData(formRef.current);
    fd.set('visitId', visit.id);
    fd.set('version', String(version));

    startTransition(async () => {
      const result = await autosaveVisitAction({} as never, fd);
      if (result.success && result.newVersion) {
        setVersion(result.newVersion);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else if (result.code === 'VERSION_CONFLICT') {
        setSaveStatus('conflict');
        setConflictOpen(true);
      } else if (!result.success) {
        setSaveStatus('idle');
        toast.error(result.error ?? t.errors.INTERNAL_SERVER_ERROR);
      }
    });
  };

  const handleChange = () => {
    if (isClosed) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(triggerSave, 1500);
  };

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <>
      {isClosed && (
        <Alert variant="warning">
          <AlertTitle>{t.visits.closed}</AlertTitle>
        </Alert>
      )}

      <form ref={formRef} className="space-y-4">
        {/* Save status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground h-5">
          {saveStatus === 'saving' && <span>{t.common.saving}</span>}
          {saveStatus === 'saved' && <span className="text-green-600">✓ {t.common.saved}</span>}
          {saveStatus === 'conflict' && (
            <span className="text-destructive">{t.visits.conflictTitle}</span>
          )}
          <span className="ms-auto">v{version}</span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="complaint">{t.visits.complaint}</Label>
          <Textarea
            id="complaint"
            name="complaint"
            defaultValue={visit.complaint ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="diagnosis">{t.visits.diagnosis}</Label>
          <Textarea
            id="diagnosis"
            name="diagnosis"
            defaultValue={visit.diagnosis ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">{t.visits.notes}</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={visit.notes ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="instructions">{t.visits.instructions}</Label>
          <Textarea
            id="instructions"
            name="instructions"
            defaultValue={visit.instructions ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="followUpDate">{t.visits.followUpDate}</Label>
          <Input
            id="followUpDate"
            name="followUpDate"
            type="date"
            defaultValue={visit.followUpDate?.slice(0, 10) ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
          />
        </div>

        {!isClosed && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {saveStatus === 'saved'
                ? (isAr ? '✓ تم حفظ التغييرات تلقائياً' : '✓ Changes autosaved')
                : (isAr ? 'يتم الحفظ التلقائي أثناء الكتابة' : 'Autosaves while typing')}
            </span>
            <Button
              type="button"
              onClick={triggerSave}
              disabled={isPending}
              size="sm"
              className="gap-2 px-5 font-semibold"
            >
              {isAr ? 'حفظ الملاحظات الطبية' : 'Save Clinical Notes'}
            </Button>
          </div>
        )}
      </form>

      {/* Version conflict dialog */}
      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.visits.conflictTitle}</DialogTitle>
            <DialogDescription>
              {t.visits.conflictDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConflictOpen(false);
                window.location.reload();
              }}
            >
              {t.visits.conflictReload}
            </Button>
            <Button
              onClick={() => {
                setConflictOpen(false);
                setSaveStatus('idle');
              }}
            >
              {t.visits.conflictKeep}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



