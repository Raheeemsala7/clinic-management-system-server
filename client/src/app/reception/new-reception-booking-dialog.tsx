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
import { ar } from '@/messages/ar';
import { computeAge } from '@/lib/utils';
import {
  CalendarPlus,
  Search,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { PatientBasic } from '@/features/patients/queries';
import type { DoctorOption } from '@/lib/doctor';

interface NewReceptionBookingDialogProps {
  doctorId: string;
  doctorName?: string;
}

export function NewReceptionBookingDialog({ doctorId, doctorName }: NewReceptionBookingDialogProps) {
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
  const [newDateOfBirth, setNewDateOfBirth] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Appointment fields
  const [source, setSource] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [type, setType] = useState<'CONSULTATION' | 'FOLLOW_UP'>('CONSULTATION');
  const [scheduledAt, setScheduledAt] = useState('');

  // Status/Feedback
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ queueNumber?: number; patientName: string } | null>(null);

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
    // If search term looks like a phone, prefill it
    if (/^01\d{8,9}$/.test(searchTerm.trim())) {
      setNewPhone(searchTerm.trim());
    } else if (searchTerm.trim().length > 2) {
      setNewFullName(searchTerm.trim());
    }
    setError(null);
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
    setNewDateOfBirth('');
    setNewAddress('');
    setSource('WALK_IN');
    setType('CONSULTATION');
    setScheduledAt('');
    setError(null);
    setSuccessInfo(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let patientIdToBook = selectedPatient?.id;
    let patientNameToDisplay = selectedPatient?.fullName ?? '';

    // If in new patient mode, create the patient first
    if (isNewPatientMode) {
      if (!newFullName.trim() || !newPhone.trim()) {
        setError('يرجى إدخال اسم العميل ورقم الهاتف');
        return;
      }

      startTransition(async () => {
        const createRes = await createQuickPatientAction({
          fullName: newFullName.trim(),
          phone: newPhone.trim(),
          gender: newGender,
          dateOfBirth: newDateOfBirth || undefined,
          address: newAddress || undefined,
        });

        if (!createRes.success || !createRes.patient) {
          setError(createRes.error ?? ar.errors.generic);
          return;
        }

        patientIdToBook = createRes.patient.id;
        patientNameToDisplay = createRes.patient.fullName;

        // Proceed to book
        await makeBooking(patientIdToBook, patientNameToDisplay);
      });
      return;
    }

    if (!patientIdToBook) {
      setError('يرجى اختيار عميل أو تسجيل عميل جديد');
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
    if (source === 'SCHEDULED' && scheduledAt) {
      formData.set('scheduledAt', scheduledAt);
    }

    const res = await createAppointmentAction({ success: false }, formData);
    if (res.success) {
      setSuccessInfo({ patientName });
      router.refresh();
      setTimeout(() => {
        setOpen(false);
        resetAll();
      }, 1500);
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
        <Button size="lg" className="gap-2 bg-primary shadow-md hover:bg-primary/95 text-primary-foreground font-semibold">
          <CalendarPlus className="size-5" />
          حجز موعد / تسجيل مريض
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">حجز موعد جديد</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                فحص العميل (جديد أم قديم) وتأكيد الإضافة لقائمة الانتظار
                {doctorName && ` مع ${doctorName}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        {successInfo ? (
          <div className="py-8 text-center space-y-3">
            <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">تم تسجيل الحجز بنجاح!</h3>
            <p className="text-sm text-muted-foreground">
              تم إدراج المريض <span className="font-semibold text-foreground">{successInfo.patientName}</span> في قائمة كشف اليوم.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="space-y-5 py-2">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* STEP 1: Patient Search & Classification */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-1.5">
                  <Search className="size-4 text-primary" />
                  الخطوة 1: ابحث برقم الهاتف أو اسم المريض
                </Label>
                {selectedPatient && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:bg-primary/10"
                    onClick={() => {
                      setSelectedPatient(null);
                      setIsNewPatientMode(false);
                    }}
                  >
                    تغيير العميل
                  </Button>
                )}
              </div>

              {!selectedPatient && !isNewPatientMode && (
                <>
                  <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="أدخل رقم هاتف العميل (مثال: 010...) أو الاسم..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-9 h-11 text-base shadow-inner"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Search Results Display */}
                  {hasSearched && (
                    <div className="space-y-2 pt-1">
                      {searchResults.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <UserCheck className="size-3.5" />
                            تم العثور على عملاء مسجلين مسبقاً (عميل قديم):
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-lg border p-1 bg-muted/20">
                            {searchResults.map((p) => {
                              const age = p.dateOfBirth ? computeAge(p.dateOfBirth) : null;
                              return (
                                <button
                                  type="button"
                                  key={p.id}
                                  onClick={() => handleSelectExisting(p)}
                                  className="w-full p-2.5 rounded-md border bg-card hover:bg-primary/5 hover:border-primary/50 text-start flex items-center justify-between gap-3 transition-colors group"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-foreground group-hover:text-primary">
                                        {p.fullName}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300">
                                        عميل قديم
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                      <span className="font-mono">{p.phone}</span>
                                      {age !== null && <span>• {age} سنة</span>}
                                      {p.address && <span>• {p.address}</span>}
                                    </div>
                                  </div>
                                  <Button size="sm" type="button" variant="outline" className="h-8 text-xs shrink-0 group-hover:bg-primary group-hover:text-white">
                                    اختيار للحجز
                                  </Button>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/70 p-4 text-center space-y-2.5">
                          <p className="text-sm font-semibold text-amber-900">
                            لم يتم العثور على أي عميل مسجل بهذا الرقم أو الاسم (عميل جديد)
                          </p>
                          <Button
                            type="button"
                            onClick={handleStartNewPatient}
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm"
                          >
                            <UserPlus className="size-4" />
                            تسجيل هذا الشخص كـ «عميل جديد»
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {!hasSearched && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary hover:bg-primary/10"
                        onClick={handleStartNewPatient}
                      >
                        + تسجيل عميل جديد مباشرة
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Display Chosen Existing Patient */}
              {selectedPatient && (
                <Card className="border-2 border-emerald-400 bg-emerald-50/50 shadow-sm">
                  <CardContent className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <UserCheck className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-base">{selectedPatient.fullName}</span>
                          <Badge className="bg-emerald-600 text-white text-xs">عميل قديم مسجل</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {selectedPatient.phone}
                          {selectedPatient.dateOfBirth && ` • ${computeAge(selectedPatient.dateOfBirth)} سنة`}
                          {selectedPatient.address && ` • ${selectedPatient.address}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-emerald-300 text-emerald-800"
                      onClick={() => setSelectedPatient(null)}
                    >
                      تغيير
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* New Patient Form Mode */}
              {isNewPatientMode && (
                <Card className="border-2 border-primary/40 bg-primary/5 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-sm text-primary flex items-center gap-1.5">
                        <Sparkles className="size-4 text-primary" />
                        بيانات العميل الجديد (سيتم حفظه في سجل العيادة)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setIsNewPatientMode(false)}
                      >
                        إلغاء والعودة للبحث
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="newFullName" className="text-xs font-semibold">اسم المريض الكامل *</Label>
                        <Input
                          id="newFullName"
                          required
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          placeholder="مثال: محمد أحمد علي"
                          className="h-9 bg-background text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newPhone" className="text-xs font-semibold">رقم الهاتف *</Label>
                        <Input
                          id="newPhone"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="01xxxxxxxxx"
                          dir="ltr"
                          className="h-9 bg-background text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="newGender" className="text-xs font-semibold">الجنس *</Label>
                        <select
                          id="newGender"
                          value={newGender}
                          onChange={(e) => setNewGender(e.target.value as 'MALE' | 'FEMALE')}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="MALE">{ar.patients.male}</option>
                          <option value="FEMALE">{ar.patients.female}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newDateOfBirth" className="text-xs">تاريخ الميلاد</Label>
                        <Input
                          id="newDateOfBirth"
                          type="date"
                          value={newDateOfBirth}
                          onChange={(e) => setNewDateOfBirth(e.target.value)}
                          className="h-9 bg-background text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="newAddress" className="text-xs">العنوان</Label>
                        <Input
                          id="newAddress"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="المنطقة أو المدينة"
                          className="h-9 bg-background text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* STEP 2: Appointment Details */}
            {(selectedPatient || isNewPatientMode) && (
              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-bold flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" />
                  الخطوة 2: بيانات الموعد والكشف
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="apptType" className="text-xs">نوع الكشف</Label>
                    <select
                      id="apptType"
                      value={type}
                      onChange={(e) => setType(e.target.value as 'CONSULTATION' | 'FOLLOW_UP')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="CONSULTATION">{ar.appointmentType.CONSULTATION} (كشف جديد)</option>
                      <option value="FOLLOW_UP">{ar.appointmentType.FOLLOW_UP} (إعادة / استشارة)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="apptSource" className="text-xs">حالة الحضور</Label>
                    <select
                      id="apptSource"
                      value={source}
                      onChange={(e) => setSource(e.target.value as 'WALK_IN' | 'SCHEDULED')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="WALK_IN">{ar.appointmentSource.WALK_IN} (المريض في العيادة الآن)</option>
                      <option value="SCHEDULED">{ar.appointmentSource.SCHEDULED} (حجز مسبق بوقت)</option>
                    </select>
                  </div>
                </div>

                {source === 'SCHEDULED' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="scheduledAt" className="text-xs">وقت الموعد المسبق</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                {ar.common.cancel}
              </Button>
              <Button
                type="submit"
                disabled={isPending || (!selectedPatient && !isNewPatientMode)}
                className="gap-2 px-6 font-semibold"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isNewPatientMode ? 'حفظ العميل وتأكيد الحجز ✓' : 'تأكيد الحجز وإضافة للانتظار ✓'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
