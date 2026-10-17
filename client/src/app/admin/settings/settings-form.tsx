'use client';

import { useActionState, useTransition } from 'react';
import { ar } from '@/messages/ar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api/client';
import { toast } from '@/components/ui/toast';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (v) data[k] = String(v); });

    startTransition(async () => {
      try {
        // Direct call via the server action would be better; this is client-side for simplicity
        const res = await fetch('/api/settings/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast.success('تم حفظ الإعدادات');
          setError(null);
        } else {
          setError(ar.errors.INTERNAL_SERVER_ERROR);
        }
      } catch {
        setError(ar.errors.NETWORK_ERROR);
      }
    });
  };

  const fields = [
    { key: 'clinicName', label: ar.settings.clinicName },
    { key: 'doctorDisplayName', label: ar.settings.doctorDisplayName },
    { key: 'specialty', label: ar.settings.specialty },
    { key: 'address', label: ar.settings.address },
    { key: 'phone', label: ar.settings.phone },
    { key: 'workingHoursText', label: ar.settings.workingHours },
    { key: 'defaultConsultationFee', label: ar.settings.defaultFee },
    { key: 'currencyCode', label: ar.settings.currency },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={f.key}>{f.label}</Label>
          <Input
            id={f.key}
            name={f.key}
            defaultValue={initialSettings[f.key] ?? ''}
            disabled={isPending}
          />
        </div>
      ))}

      <Button type="submit" loading={isPending} className="w-full">
        {ar.settings.save}
      </Button>
    </form>
  );
}

// Need React import for useState
import * as React from 'react';
