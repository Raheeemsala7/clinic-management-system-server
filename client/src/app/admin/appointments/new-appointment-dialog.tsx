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
import { useI18n } from '@/i18n/use-i18n';
import { todayClinicDate } from '@/lib/utils';
import { CalendarPlus, Loader2, Search, Coins, Gift, Clock } from 'lucide-react';
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

const COMMON_FEES = [100, 150, 200, 250, 300, 400];

export function NewAppointmentDialog({ doctors, recentPatients }: NewAppointmentDialogProps) {
  const router = useRouter();
  const { t, locale, isAr } = useI18n();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [source, setSource] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [type, setType] = useState<'CONSULTATION' | 'FOLLOW_UP'>('CONSULTATION');

  const today = todayClinicDate();
  const [clinicDate, setClinicDate] = useState(today);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:30');

  // Pricing & Exemption
  const [isExempt, setIsExempt] = useState(false);
  const [exemptionReason, setExemptionReason] = useState(
    isAr ? 'حالة إنسانية / إعفاء إداري' : 'Humanitarian / Administrative Waiver'
  );
  const [totalAmount, setTotalAmount] = useState('200');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');

  const numTotal = isExempt ? 0 : Math.max(0, Number(totalAmount) || 0);
  const numPaid = isExempt ? 0 : Math.min(numTotal, Math.max(0, Number(paidAmount) || 0));
  const numRemaining = isExempt ? 0 : Math.max(0, numTotal - numPaid);

  const filteredPatients = recentPatients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError(isAr ? 'يرجى اختيار مريض من القائمة' : 'Please select a patient from the list');
      return;
    }
    const today = todayClinicDate();
    if (clinicDate < today) {
      setError(
        isAr
          ? 'لا يمكن حجز موعد في تاريخ ماضٍ، يرجى اختيار تاريخ اليوم أو موعد قادم'
          : 'Cannot book an appointment in the past. Please select today or a future date'
      );
      return;
    }
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('patientId', selectedPatientId);
    formData.set('clinicDate', clinicDate);
    formData.set('startTime', startTime);
    formData.set('endTime', endTime);
    formData.set('scheduledAt', `${clinicDate}T${startTime}:00.000Z`);
    formData.set('isExempt', isExempt ? 'true' : 'false');
    if (isExempt) formData.set('exemptionReason', exemptionReason);
    formData.set('totalAmount', String(numTotal));
    formData.set('paidAmount', String(numPaid));
    formData.set('paymentMethod', paymentMethod);

    startTransition(async () => {
      const res = await createAppointmentAction({ success: false }, formData);
      if (res.success) {
        setOpen(false);
        setSelectedPatientId('');
        setPatientSearch('');
        router.refresh();
      } else {
        setError(res.error ?? t.errors.generic);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm font-bold bg-primary text-primary-foreground">
          <CalendarPlus className="size-4" />
          {t.queue.newAppointment}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarPlus className="size-5 text-primary" />
            {isAr ? 'حجز موعد وتحديد الرسوم' : 'Book Appointment & Set Fees'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Doctor Selection */}
          <div className="space-y-1">
            <Label htmlFor="doctorId" className="text-xs font-bold">
              {t.common.doctor} *
            </Label>
            <select
              id="doctorId"
              name="doctorId"
              required
              disabled={isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {isAr ? 'د.' : 'Dr.'} {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">{t.common.patient} *</Label>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={
                  isAr ? 'ابحث باسم المريض أو رقم الهاتف...' : 'Search by patient name or phone...'
                }
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="ps-9 h-9 text-sm"
                disabled={isPending}
              />
            </div>

            <div className="max-h-36 overflow-y-auto rounded-md border border-input p-1 space-y-1 bg-muted/20">
              {filteredPatients.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {isAr
                    ? 'لا يوجد مرضى مطابقين. يرجى إضافة المريض أولاً من قسم المرضى.'
                    : 'No matching patients found. Please add the patient first in Patients.'}
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
                      <span className="font-mono opacity-80" dir="ltr">
                        {p.phone}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/20 p-2.5 rounded-lg border">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? 'تاريخ الحجز' : 'Clinic Date'}</Label>
              <Input
                type="date"
                value={clinicDate}
                min={todayClinicDate()}
                onChange={(e) => setClinicDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? 'من الساعة' : 'Start Time'}</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? 'إلى الساعة' : 'End Time'}</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Type & Source */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="source" className="text-xs">
                {isAr ? 'نوع الحضور' : 'Attendance Type'}
              </Label>
              <select
                id="source"
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value as 'WALK_IN' | 'SCHEDULED')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="WALK_IN">{isAr ? 'حضور مباشر (طابور)' : 'Walk-in (Queue)'}</option>
                <option value="SCHEDULED">
                  {isAr ? 'حجز مسبق بميعاد' : 'Scheduled Appointment'}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="type" className="text-xs">
                {isAr ? 'نوع الكشف' : 'Examination Type'}
              </Label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'CONSULTATION' | 'FOLLOW_UP')}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CONSULTATION">{isAr ? 'كشف جديد' : 'New Examination'}</option>
                <option value="FOLLOW_UP">
                  {isAr ? 'استشارة / إعادة كشف' : 'Follow-up Consultation'}
                </option>
              </select>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Coins className="size-4" />
                {isAr ? 'المعاملة المالية والرسوم' : 'Financials & Fees'}
              </Label>
              <button
                type="button"
                onClick={() => setIsExempt(!isExempt)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  isExempt
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Gift className="size-3.5 inline mr-1" />
                {isExempt
                  ? isAr
                    ? 'كشف معفي / مجاني ✓'
                    : 'Exempt / Free ✓'
                  : isAr
                    ? 'إعفاء من الرسوم'
                    : 'Exempt from Fees'}
              </button>
            </div>

            {isExempt ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-xs space-y-1 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <span>{isAr ? 'سبب الإعفاء:' : 'Exemption Reason:'}</span>
                <Input
                  value={exemptionReason}
                  onChange={(e) => setExemptionReason(e.target.value)}
                  placeholder={
                    isAr ? 'سبب إعفاء المريض من الرسوم' : 'Reason for fee exemption'
                  }
                />
              </div>
            ) : (
              <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">
                      {isAr ? 'إجمالي الكشف (ج.م)' : 'Total Fee (EGP)'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="font-bold text-sm font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {isAr ? 'المدفوع الآن (عربون)' : 'Paid Now (Deposit)'}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={numTotal}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="font-bold text-sm font-mono text-emerald-700 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-background border text-xs font-mono">
                  <span>
                    {isAr ? 'المتبقي:' : 'Remaining:'}{' '}
                    <strong className="text-amber-700 dark:text-amber-400 font-bold">
                      {numRemaining} {isAr ? 'ج.م' : 'EGP'}
                    </strong>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(String(numTotal))}
                      className="px-2 py-0.5 text-[11px] rounded bg-emerald-50 text-emerald-700 border hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                      {isAr ? 'كامل' : 'Full'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(String(Math.floor(numTotal / 2)))}
                      className="px-2 py-0.5 text-[11px] rounded bg-amber-50 text-amber-700 border hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300"
                    >
                      {isAr ? 'نصف' : 'Half'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount('0')}
                      className="px-2 py-0.5 text-[11px] rounded bg-muted text-muted-foreground border hover:bg-muted/80"
                    >
                      0
                    </button>
                  </div>
                </div>

                {numPaid > 0 && (
                  <div className="space-y-1 pt-1">
                    <Label className="text-xs">{isAr ? 'طريقة الدفع' : 'Payment Method'}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('CASH')}
                      >
                        {isAr ? 'كاش' : 'Cash'}
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('CARD')}
                      >
                        {isAr ? 'فيزا' : 'Card'}
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === 'WALLET' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentMethod('WALLET')}
                      >
                        {isAr ? 'محفظة' : 'Wallet'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedPatientId}
              className="gap-2 bg-primary text-primary-foreground font-bold"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
