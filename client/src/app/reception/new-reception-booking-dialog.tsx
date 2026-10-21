'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchPatientsAction, createQuickPatientAction } from '@/features/patients/actions';
import { createAppointmentAction } from '@/features/appointments/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { ar } from '@/i18n/messages/ar';
import { computeAge, todayClinicDate } from '@/lib/utils';
import {
  CalendarPlus,
  Search,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Coins,
  Gift,
  ArrowRight,
} from 'lucide-react';
import type { PatientBasic } from '@/features/patients/queries';
import {
  getDoctorAvailableSlotsAction,
  type AvailableSlotsResponse,
} from '@/features/doctor-schedule/actions';

interface NewReceptionBookingDialogProps {
  doctorId: string;
  doctorName?: string;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  triggerButton?: React.ReactNode;
}

const COMMON_SLOTS = [
  { start: '09:00', end: '09:30' },
  { start: '09:30', end: '10:00' },
  { start: '10:00', end: '10:30' },
  { start: '10:30', end: '11:00' },
  { start: '11:00', end: '11:30' },
  { start: '11:30', end: '12:00' },
  { start: '12:00', end: '12:30' },
  { start: '13:00', end: '13:30' },
  { start: '14:00', end: '14:30' },
  { start: '15:00', end: '15:30' },
  { start: '16:00', end: '16:30' },
  { start: '17:00', end: '17:30' },
  { start: '18:00', end: '18:30' },
  { start: '19:00', end: '19:30' },
  { start: '20:00', end: '20:30' },
];

const COMMON_FEES = [100, 150, 200, 250, 300, 400];

const EXEMPTION_PRESETS = [
  'حالة إنسانية / غير مقتدر',
  'استشارة مجانية بعد كشف',
  'توصية وإعفاء من الطبيب',
  'طبيب زميل أو عائلة الطبيب',
  'تأمين / رعاية خاصة',
];

export function NewReceptionBookingDialog({
  doctorId,
  doctorName,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  triggerButton,
}: NewReceptionBookingDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientBasic[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected or New Patient state
  const [selectedPatient, setSelectedPatient] = useState<PatientBasic | null>(null);
  const [isNewPatientMode, setIsNewPatientMode] = useState(false);

  // New patient form fields
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [newAge, setNewAge] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Appointment scheduling fields
  const today = todayClinicDate();
  const [clinicDate, setClinicDate] = useState(defaultDate || today);
  const [source, setSource] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [type, setType] = useState<'CONSULTATION' | 'FOLLOW_UP'>('CONSULTATION');
  const [startTime, setStartTime] = useState(defaultStartTime || '10:00');
  const [endTime, setEndTime] = useState(defaultEndTime || '10:30');

  // Pricing & Payment fields
  const [isExempt, setIsExempt] = useState(false);
  const [exemptionReason, setExemptionReason] = useState(EXEMPTION_PRESETS[0]);
  const [totalAmount, setTotalAmount] = useState('200');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>('CASH');
  const [notes, setNotes] = useState('');

  // Doctor availability & Slots state
  const [slotsData, setSlotsData] = useState<AvailableSlotsResponse | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Status/Feedback
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    queueNumber?: number;
    patientName: string;
    paidAmount?: number;
    remainingAmount?: number;
  } | null>(null);

  // Calculate dynamic financial values
  const numTotal = isExempt ? 0 : Math.max(0, Number(totalAmount) || 0);
  const numPaid = isExempt ? 0 : Math.min(numTotal, Math.max(0, Number(paidAmount) || 0));
  const numRemaining = isExempt ? 0 : Math.max(0, numTotal - numPaid);

  // Live fetch available slots when date or doctor changes
  useEffect(() => {
    if (!doctorId || !clinicDate || !open) return;
    let isCancelled = false;
    setIsLoadingSlots(true);

    getDoctorAvailableSlotsAction(doctorId, clinicDate).then((res) => {
      if (!isCancelled) {
        setSlotsData(res);
        setIsLoadingSlots(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [doctorId, clinicDate, open]);

  // Debounced live search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPatientsAction(searchTerm.trim());
      setSearchResults(results);
      setHasSearched(true);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectExisting = (patient: PatientBasic) => {
    setSelectedPatient(patient);
    setIsNewPatientMode(false);
    setError(null);
  };

  const handleStartNewPatient = () => {
    setSelectedPatient(null);
    setIsNewPatientMode(true);
    if (/^01\d{8,9}$/.test(searchTerm.trim())) {
      setNewPhone(searchTerm.trim());
    } else if (searchTerm.trim().length > 2) {
      setNewFullName(searchTerm.trim());
    }
    setError(null);
  };

  const handleDateOfBirthChange = (dob: string) => {
    setNewDateOfBirth(dob);
    if (dob) {
      const calculated = computeAge(dob);
      if (calculated !== null) {
        setNewAge(String(calculated));
      }
    }
  };

  const resetAll = () => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedPatient(null);
    setIsNewPatientMode(false);
    setNewFullName('');
    setNewPhone('');
    setNewGender('MALE');
    setNewAge('');
    setNewDateOfBirth('');
    setNewAddress('');
    setClinicDate(defaultDate || today);
    setSource('WALK_IN');
    setType('CONSULTATION');
    setStartTime(defaultStartTime || '10:00');
    setEndTime(defaultEndTime || '10:30');
    setIsExempt(false);
    setExemptionReason(EXEMPTION_PRESETS[0]);
    setTotalAmount('200');
    setPaidAmount('0');
    setPaymentMethod('CASH');
    setNotes('');
    setError(null);
    setSuccessInfo(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (clinicDate < today) {
      setError('لا يمكن حجز موعد في تاريخ ماضٍ، يرجى اختيار تاريخ اليوم أو موعد مستقبلي');
      return;
    }

    if (source === 'SCHEDULED' && slotsData && !slotsData.isWorkingDay) {
      setError(slotsData.message || 'الطبيب غير متاح في هذا التاريخ (إجازة أسبوعية)');
      return;
    }

    let patientIdToBook = selectedPatient?.id;
    let patientNameToDisplay = selectedPatient?.fullName ?? '';

    if (isNewPatientMode) {
      if (!newFullName.trim() || !newPhone.trim()) {
        setError('يرجى إدخال اسم المريض ورقم الهاتف');
        return;
      }

      const parsedAge = Number(newAge);
      if (!newAge || Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        setError('يرجى إدخال عمر المريض بشكل صحيح (إجباري)');
        return;
      }

      startTransition(async () => {
        const createRes = await createQuickPatientAction({
          fullName: newFullName.trim(),
          phone: newPhone.trim(),
          gender: newGender,
          age: parsedAge,
          dateOfBirth: newDateOfBirth || undefined,
          address: newAddress || undefined,
        });

        if (!createRes.success || !createRes.patient) {
          setError(createRes.error ?? ar.errors.generic);
          return;
        }

        patientIdToBook = createRes.patient.id;
        patientNameToDisplay = createRes.patient.fullName;
        await makeBooking(patientIdToBook, patientNameToDisplay);
      });
      return;
    }

    if (!patientIdToBook) {
      setError('يرجى اختيار مريض أو تسجيل مريض جديد');
      return;
    }

    startTransition(async () => {
      await makeBooking(patientIdToBook!, patientNameToDisplay);
    });
  };

  const makeBooking = async (patientId: string, patientName: string) => {
    const formData = new FormData();
    formData.set('patientId', patientId);
    formData.set('doctorId', doctorId);
    formData.set('source', source);
    formData.set('type', type);
    formData.set('clinicDate', clinicDate);
    formData.set('startTime', startTime);
    formData.set('endTime', endTime);
    formData.set('scheduledAt', `${clinicDate}T${startTime}:00.000Z`);

    // Financial data
    formData.set('isExempt', isExempt ? 'true' : 'false');
    if (isExempt) {
      formData.set('exemptionReason', exemptionReason);
    }
    formData.set('totalAmount', String(numTotal));
    formData.set('paidAmount', String(numPaid));
    formData.set('paymentMethod', paymentMethod);
    if (notes) formData.set('notes', notes);

    const res = await createAppointmentAction({ success: false }, formData);
    if (res.success) {
      setSuccessInfo({
        patientName,
        paidAmount: numPaid,
        remainingAmount: numRemaining,
      });
      router.refresh();
      setTimeout(() => {
        setOpen(false);
        resetAll();
      }, 1600);
    } else {
      setError(res.error ?? ar.errors.generic);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetAll();
      }}
    >
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button size="lg" className="gap-2 bg-primary shadow-md hover:bg-primary/95 text-primary-foreground font-semibold">
            <CalendarPlus className="size-5" />
            حجز موعد / تسجيل مريض
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">حجز موعد جديد وتحديد الرسوم</DialogTitle>
              {doctorName && <p className="text-xs text-muted-foreground">الطبيب المختار: د. {doctorName}</p>}
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successInfo ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="size-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">تم تأكيد الحجز بنجاح!</h3>
            <p className="text-muted-foreground">للمريض: <span className="font-semibold text-foreground">{successInfo.patientName}</span></p>
            <div className="flex justify-center gap-4 text-sm font-mono pt-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                المدفوع: {successInfo.paidAmount} ج.م
              </span>
              {(successInfo.remainingAmount ?? 0) > 0 && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  المتبقي: {successInfo.remainingAmount} ج.م
                </span>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="space-y-5 pt-3">
            {/* STEP 1: PATIENT SELECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-1.5">
                  <UserCheck className="size-4 text-primary" />
                  1. اختيار المريض
                </Label>
                {selectedPatient && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary h-7"
                    onClick={() => setSelectedPatient(null)}
                  >
                    تغيير المريض
                  </Button>
                )}
              </div>

              {selectedPatient ? (
                <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-base">{selectedPatient.fullName}</p>
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <span>{selectedPatient.phone}</span>
                      <span>•</span>
                      <span>{selectedPatient.gender === 'MALE' ? 'ذكر' : 'أنثى'}</span>
                      {selectedPatient.dateOfBirth && (
                        <>
                          <span>•</span>
                          <span>{computeAge(selectedPatient.dateOfBirth)} سنة</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    مريض مسجل
                  </Badge>
                </div>
              ) : isNewPatientMode ? (
                <Card className="border-2 border-dashed border-primary/40 bg-muted/20">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <UserPlus className="size-4" />
                        تسجيل مريض جديد في النظام
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground h-6"
                        onClick={() => setIsNewPatientMode(false)}
                      >
                        العودة للبحث
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">الاسم بالكامل *</Label>
                        <Input
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          placeholder="مثال: أحمد محمد علي"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">رقم الهاتف *</Label>
                        <Input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="01012345678"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">النوع</Label>
                        <select
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as any)}
                          className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background"
                        >
                          <option value="MALE">ذكر</option>
                          <option value="FEMALE">أنثى</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-primary">العمر (بالسنوات) *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="130"
                          value={newAge}
                          onChange={(e) => setNewAge(e.target.value)}
                          placeholder="مثال: 32"
                          className="font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">تاريخ الميلاد (اختياري)</Label>
                        <Input
                          type="date"
                          value={newDateOfBirth}
                          onChange={(e) => handleDateOfBirthChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ابحث برقم الهاتف أو الاسم..."
                      className="pr-9"
                    />
                    {isSearching && (
                      <Loader2 className="absolute left-3 top-3 size-4 text-muted-foreground animate-spin" />
                    )}
                  </div>

                  {/* Search results dropdown */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-md divide-y max-h-48 overflow-y-auto bg-background shadow-md">
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectExisting(p)}
                          className="p-2.5 hover:bg-muted cursor-pointer flex items-center justify-between text-sm transition-colors"
                        >
                          <div>
                            <p className="font-semibold">{p.fullName}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.phone}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-primary">
                            اختيار
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasSearched && searchResults.length === 0 && !isSearching && (
                    <div className="p-3 border rounded-md bg-muted/30 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">لم يتم العثور على مريض بهذا الاسم أو الرقم</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={handleStartNewPatient}
                      >
                        <UserPlus className="size-3.5" />
                        تسجيل كـ مريض جديد الآن
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: APPOINTMENT TIME & DATE */}
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-bold flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                2. الموعد والتوقيت
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">تاريخ الكشف / الحجز *</Label>
                  <Input
                    type="date"
                    value={clinicDate}
                    min={today}
                    onChange={(e) => setClinicDate(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">لا يمكن حجز مواعيد في تواريخ ماضية</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">نوع الحضور</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={source === 'WALK_IN' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSource('WALK_IN')}
                    >
                      حضور فوري (طابور)
                    </Button>
                    <Button
                      type="button"
                      variant={source === 'SCHEDULED' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSource('SCHEDULED')}
                    >
                      حجز مسبق بموعد
                    </Button>
                  </div>
                </div>
              </div>

              {/* Doctor Availability & Slot Selector */}
              {isLoadingSlots ? (
                <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground bg-muted/30 rounded-lg border">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>جارٍ فحص جدول الطبيب والمواعيد المتاحة ليوم {clinicDate}...</span>
                </div>
              ) : slotsData && !slotsData.isWorkingDay ? (
                <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{slotsData.message || `الطبيب غير متاح في هذا اليوم (${slotsData.dayName})`}</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                    هذا اليوم عطلة أسبوعية محددة في جدول الطبيب. يرجى اختيار تاريخ عمل آخر لحجز الموعد.
                  </p>
                </div>
              ) : slotsData && slotsData.isWorkingDay ? (
                <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5 text-primary" />
                      المواعيد المتاحة من جدول الطبيب ({slotsData.dayName}):
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{slotsData.availableCount} متاح</span>
                      {' • '}
                      <span>{slotsData.bookedCount} محجوز</span>
                    </span>
                  </div>

                  {slotsData.slots.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2 bg-muted/40 rounded">
                      لا توجد فترات عمل محددة للطبيب في هذا اليوم
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto p-1.5 border rounded-md bg-background">
                      {slotsData.slots.map((slot) => {
                        const isSelected = startTime === slot.startTime;

                        if (slot.isBooked) {
                          return (
                            <div
                              key={slot.startTime}
                              className="p-1.5 rounded text-center border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60 text-xs flex flex-col items-center justify-center select-none"
                              title="هذا الموعد محجوز مسبقاً لمريض آخر"
                            >
                              <span className="font-mono line-through text-[11px]">{slot.startTime}</span>
                              <span className="text-[9px] text-destructive font-semibold">محجوز</span>
                            </div>
                          );
                        }

                        if (slot.isPast) {
                          return (
                            <div
                              key={slot.startTime}
                              className="p-1.5 rounded text-center border bg-muted/30 text-muted-foreground/60 cursor-not-allowed opacity-50 text-xs flex flex-col items-center justify-center select-none"
                              title="هذا الوقت انقضى اليوم"
                            >
                              <span className="font-mono text-[11px]">{slot.startTime}</span>
                              <span className="text-[9px]">انقضى</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => {
                              setStartTime(slot.startTime);
                              setEndTime(slot.endTime);
                            }}
                            className={`p-1.5 rounded text-center border text-xs transition-all flex flex-col items-center justify-center ${isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm font-bold scale-[1.02]'
                                : 'bg-background hover:bg-primary/10 hover:border-primary/50 text-foreground'
                              }`}
                          >
                            <span className="font-mono font-medium">{slot.startTime}</span>
                            <span className="text-[9px] opacity-75">إلى {slot.endTime}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Manual time selector for fine tuning */}
                  <div className="pt-2 border-t mt-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="text-[11px] text-muted-foreground">الوقت المختار (من):</Label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="h-8 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-muted-foreground">الوقت المختار (إلى):</Label>
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="h-8 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback if slots data not yet available */
                <div className="space-y-2 bg-muted/20 p-3 rounded-lg border">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="size-3.5 text-primary" />
                        من الساعة
                      </Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        <Clock className="size-3.5 text-primary" />
                        إلى الساعة
                      </Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">نوع الكشف</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === 'CONSULTATION' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setType('CONSULTATION')}
                  >
                    كشف أول مرة (جديد)
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'FOLLOW_UP' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setType('FOLLOW_UP')}
                  >
                    استشارة / إعادة كشف
                  </Button>
                </div>
              </div>
            </div>

            {/* STEP 3: FINANCIAL DETAILS & MANUAL FEES */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-1.5">
                  <Coins className="size-4 text-emerald-600" />
                  3. الرسوم والمدفوعات المالية
                </Label>

                {/* Exemption Switch */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isExempt;
                    setIsExempt(nextVal);
                    if (nextVal) {
                      setPaidAmount('0');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${isExempt
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  <Gift className="size-3.5" />
                  <span>{isExempt ? 'الكشف مجاني / معفي ✓' : 'إعفاء من الرسوم (مجاني)'}</span>
                </button>
              </div>

              {isExempt ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <Gift className="size-4 text-emerald-600" />
                    <span>تم تحديد هذا الكشف كـ مجاني / معفي بالكامل من الرسوم</span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-emerald-900">سبب الإعفاء:</Label>
                    <select
                      value={exemptionReason}
                      onChange={(e) => setExemptionReason(e.target.value)}
                      className="w-full h-9 px-3 text-xs rounded-md border border-emerald-300 bg-white"
                    >
                      {EXEMPTION_PRESETS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-card p-3 rounded-lg border">
                  {/* Total Amount Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold">إجمالي رسوم الكشف (ج.م) *</Label>
                      <span className="text-[11px] text-muted-foreground">اكتب المبلغ بيدك أو اختر سريعاً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          step="10"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          className="font-bold text-base text-foreground font-mono"
                          placeholder="مثال: 250"
                          required
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">ج.م</span>
                      </div>
                      <div className="flex gap-1 overflow-x-auto">
                        {COMMON_FEES.map((fee) => (
                          <button
                            key={fee}
                            type="button"
                            onClick={() => setTotalAmount(String(fee))}
                            className={`px-2 py-1.5 text-xs rounded border transition-colors ${totalAmount === String(fee)
                                ? 'bg-primary text-primary-foreground font-bold border-primary'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                              }`}
                          >
                            {fee}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Partial Payment / Deposit Input */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-emerald-700">المبلغ المدفوع الآن (عربون أو كامل)</Label>
                      <span className="text-[11px] text-muted-foreground">يمكن دفع جزء لحجز الموعد والباقي لاحقاً</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min="0"
                          max={numTotal}
                          step="10"
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          className="font-bold text-base text-emerald-700 font-mono"
                          placeholder="0"
                        />
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">ج.م</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPaidAmount(String(numTotal))}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        >
                          دفع كامل ({numTotal})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaidAmount(String(Math.floor(numTotal / 2)))}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded border bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        >
                          دفع النصف ({Math.floor(numTotal / 2)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaidAmount('0')}
                          className="px-2 py-1.5 text-xs rounded border bg-muted text-muted-foreground hover:bg-muted/80"
                        >
                          بدون دفع (0)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Summary Banner */}
                  <div className="p-3 bg-muted/40 rounded-lg border grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">إجمالي الكشف</span>
                      <span className="font-bold text-foreground text-sm font-mono">{numTotal} ج.م</span>
                    </div>
                    <div className="border-x">
                      <span className="text-emerald-700 block text-[11px] font-semibold">المدفوع (عربون)</span>
                      <span className="font-bold text-emerald-700 text-sm font-mono">{numPaid} ج.م</span>
                    </div>
                    <div>
                      <span className="text-amber-700 block text-[11px] font-semibold">المتبقي على المريض</span>
                      <span className="font-bold text-amber-700 text-sm font-mono">{numRemaining} ج.م</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  {numPaid > 0 && (
                    <div className="space-y-1 pt-1">
                      <Label className="text-xs">طريقة دفع العربون / المبلغ</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMethod('CASH')}
                        >
                          نقدي (كاش)
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMethod('CARD')}
                        >
                          بطاقة (فيزا)
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === 'WALLET' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMethod('WALLET')}
                        >
                          محفظة إلكترونية
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Notes */}
              <div className="space-y-1">
                <Label className="text-xs">ملاحظات الحجز (اختياري)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: مريض قادم من طرف د. عاصم / دفع 50 ج.م عربون وباقي 150 ج.م"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 bg-primary text-primary-foreground font-bold px-6 shadow-md"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري الحجز والتسجيل...
                  </>
                ) : (
                  <>
                    <span>تأكيد الحجز</span>
                    <ArrowRight className="size-4 rotate-180" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
