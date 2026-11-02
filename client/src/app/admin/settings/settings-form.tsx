'use client';

import * as React from 'react';
import { useTransition, useState } from 'react';
import { useI18n } from '@/i18n/use-i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/toast';
import { updateSettingsAction } from '@/features/settings/actions';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { t, isAr } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { if (v) data[k] = String(v); });

    startTransition(async () => {
      const res = await updateSettingsAction(data);
      if (res.success) {
        toast.success(isAr ? 'تم حفظ الإعدادات' : 'Settings saved successfully');
        setError(null);
      } else {
        setError(res.error || t.errors.INTERNAL_SERVER_ERROR);
      }
    });
  };

  const fields = [
    { key: 'clinicName', label: t.settings.clinicName },
    { key: 'doctorDisplayName', label: t.settings.doctorDisplayName },
    { key: 'specialty', label: t.settings.specialty },
    { key: 'address', label: t.settings.address },
    { key: 'phone', label: t.settings.phone },
    { key: 'workingHoursText', label: t.settings.workingHours },
    { key: 'defaultConsultationFee', label: t.settings.defaultFee },
    { key: 'currencyCode', label: t.settings.currency },
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
        {t.settings.save}
      </Button>
    </form>
  );
}
