'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { ar } from '@/messages/ar';
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
        toast.error(result.error ?? ar.errors.INTERNAL_SERVER_ERROR);
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
          <AlertTitle>{ar.visits.closed}</AlertTitle>
        </Alert>
      )}

      <form ref={formRef} className="space-y-4">
        {/* Save status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground h-5">
          {saveStatus === 'saving' && <span>{ar.common.saving}</span>}
          {saveStatus === 'saved' && <span className="text-green-600">✓ {ar.common.saved}</span>}
          {saveStatus === 'conflict' && (
            <span className="text-destructive">{ar.visits.versionConflict}</span>
          )}
          <span className="ms-auto">v{version}</span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="complaint">{ar.visits.complaint}</Label>
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
          <Label htmlFor="diagnosis">{ar.visits.diagnosis}</Label>
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
          <Label htmlFor="notes">{ar.visits.notes}</Label>
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
          <Label htmlFor="instructions">{ar.visits.instructions}</Label>
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
          <Label htmlFor="followUpDate">{ar.visits.followUpDate}</Label>
          <Input
            id="followUpDate"
            name="followUpDate"
            type="date"
            defaultValue={visit.followUpDate?.slice(0, 10) ?? ''}
            onChange={handleChange}
            disabled={isClosed || isPending}
          />
        </div>
      </form>

      {/* Version conflict dialog */}
      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ar.visits.versionConflict}</DialogTitle>
            <DialogDescription>
              تم تحديث الزيارة من جهاز آخر. ماذا تريد أن تفعل؟
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
              {ar.visits.versionConflictReload}
            </Button>
            <Button
              onClick={() => {
                setConflictOpen(false);
                setSaveStatus('idle');
              }}
            >
              {ar.visits.versionConflictKeep}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
