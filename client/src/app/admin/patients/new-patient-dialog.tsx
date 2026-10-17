'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPatientAction } from '@/features/patients/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ar } from '@/messages/ar';
import { UserPlus, Loader2 } from 'lucide-react';

export function NewPatientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createPatientAction({ success: false }, formData);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? ar.errors.generic);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus className="size-4" />
          {ar.patients.newPatient}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ar.patients.newPatient}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName">{ar.patients.name} *</Label>
            <Input id="fullName" name="fullName" required placeholder="الاسم ثلاثي أو رباعي" disabled={isPending} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{ar.patients.phone} *</Label>
              <Input id="phone" name="phone" required placeholder="01xxxxxxxxx" dir="ltr" disabled={isPending} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">{ar.patients.gender} *</Label>
              <select
                id="gender"
                name="gender"
                required
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="MALE">{ar.patients.male}</option>
                <option value="FEMALE">{ar.patients.female}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">{ar.patients.dob}</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" disabled={isPending} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">{ar.patients.address}</Label>
              <Input id="address" name="address" placeholder="المدينة / المنطقة" disabled={isPending} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {ar.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin me-2" />}
              {ar.patients.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
