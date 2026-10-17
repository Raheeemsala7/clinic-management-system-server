'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAppointmentAction } from '@/features/appointments/actions';
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
import { CalendarPlus, Loader2, Search } from 'lucide-react';
import type { DoctorOption } from '@/lib/doctor';

interface PatientOption {
  id: string;
  fullName: string;
  phone: string;
}

interface NewAppointmentDialogProps {
  doctors: DoctorOption[];
  recentPatients: PatientOption[];
}

export function NewAppointmentDialog({ doctors, recentPatients }: NewAppointmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [source, setSource] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [type, setType] = useState<'CONSULTATION' | 'FOLLOW_UP'>('CONSULTATION');

  const filteredPatients = recentPatients.filter((p) =>
    p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.phone.includes(patientSearch),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('يرجى اختيار مريض من القائمة');
      return;
    }
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('patientId', selectedPatientId);

    startTransition(async () => {
      const res = await createAppointmentAction({ success: false }, formData);
      if (res.success) {
        setOpen(false);
        setSelectedPatientId('');
        setPatientSearch('');
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
          <CalendarPlus className="size-4" />
          {ar.queue.newAppointment}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{ar.queue.newAppointment}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="doctorId">{ar.common.doctor} *</Label>
            <select
              id="doctorId"
              name="doctorId"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>{ar.common.patient} *</Label>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المريض أو رقم الهاتف..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="ps-9 h-9 text-sm"
                disabled={isPending}
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-md border border-input p-1 space-y-1 bg-muted/20">
              {filteredPatients.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  لا يوجد مرضى مطابقين. يرجى إضافة المريض أولاً من قسم المرضى.
                </p>
              ) : (
                filteredPatients.map((p) => {
                  const isSelected = selectedPatientId === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded text-start transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{p.fullName}</span>
                      <span className="font-mono opacity-80">{p.phone}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Type & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="source">{ar.common.reason}</Label>
              <select
                id="source"
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value as 'WALK_IN' | 'SCHEDULED')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="WALK_IN">{ar.appointmentSource.WALK_IN}</option>
                <option value="SCHEDULED">{ar.appointmentSource.SCHEDULED}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">{ar.common.status}</Label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'CONSULTATION' | 'FOLLOW_UP')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="CONSULTATION">{ar.appointmentType.CONSULTATION}</option>
                <option value="FOLLOW_UP">{ar.appointmentType.FOLLOW_UP}</option>
              </select>
            </div>
          </div>

          {source === 'SCHEDULED' && (
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt">وقت الموعد</Label>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                disabled={isPending}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {ar.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending || !selectedPatientId}>
              {isPending && <Loader2 className="size-4 animate-spin me-2" />}
              {ar.common.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
