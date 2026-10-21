'use client';

import React, { useState, useEffect, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/toast';
import {
  APPOINTMENT_TYPES_LIST,
  getAppointmentTypeConfig,
  type AppointmentTypeId,
} from '@/lib/appointment-types';
import { AppointmentTypeBadge } from '@/components/appointments/appointment-type-badge';
import { PatientSummaryPanel } from '@/components/appointments/patient-summary-panel';
import {
  searchPatientsAction,
  createQuickPatientAction,
  getPatientBookingSummaryAction,
  type PatientBookingSummary,
} from '@/features/patients/actions';
import {
  createAppointmentAction,
  updateAppointmentAction,
  uploadBookingAttachmentsAction,
} from '@/features/appointments/actions';
import {
  getDoctorAvailableSlotsAction,
  type AvailableSlotsResponse,
} from '@/features/doctor-schedule/actions';
import {
  computeAge,
  todayClinicDate,
  formatMoney,
  validateFourPartName,
  cn,
} from '@/lib/utils';
import type { PatientBasic } from '@/features/patients/queries';
import {
  User,
  UserCheck,
  UserPlus,
  Search,
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon,
  Trash2,
  CreditCard,
  Gift,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Stethoscope,
  X,
  FileCheck,
} from 'lucide-react';

interface StagedAttachment {
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  existingId?: string;
  url?: string;
}

interface BookingFormProps {
  doctors: Array<{ id: string; name: string }>;
  userRole: 'RECEPTION' | 'ADMIN';
  locale?: 'en' | 'ar';
  initialAppointment?: any;
  defaultDoctorId?: string;
  defaultDate?: string;
  defaultStartTime?: string;
}

const COMMON_FEES = [100, 150, 200, 250, 300, 400];
const EXEMPTION_PRESETS_AR = [
  'حالة إنسانية / غير مقتدر',
  'استشارة مجانية بعد كشف',
  'توصية وإعفاء من الطبيب',
  'طبيب زميل أو عائلة الطبيب',
  'تأمين / رعاية خاصة',
];
const EXEMPTION_PRESETS_EN = [
  'Humanitarian case / Low-income',
  'Free consultation follow-up',
  'Doctor recommendation / waiver',
  'Doctor colleague or family',
  'Special care / Insurance',
];

const DEFAULT_SLOTS = [
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

export function BookingForm({
  doctors,
  userRole,
  locale = 'ar',
  initialAppointment,
  defaultDoctorId,
  defaultDate,
  defaultStartTime,
}: BookingFormProps) {
  const router = useRouter();
  const isAr = locale === 'ar';
  const isEdit = Boolean(initialAppointment?.id);
  const today = todayClinicDate();
  const [isPending, startTransition] = useTransition();

  // ─── Section 1: Patient Selection ──────────────────────────────────────────
  const [patientMode, setPatientMode] = useState<'search' | 'new'>(
    initialAppointment ? 'search' : 'search',
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PatientBasic[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientBasic | null>(
    initialAppointment?.patient || null,
  );
  const [bookingSummary, setBookingSummary] = useState<PatientBookingSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // New Patient Form
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [newAge, setNewAge] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // ─── Section 2: Appointment Type ───────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<AppointmentTypeId>(
    (initialAppointment?.type as AppointmentTypeId) || 'EXAMINATION',
  );

  // ─── Section 3: Scheduling ─────────────────────────────────────────────────
  const [doctorId, setDoctorId] = useState<string>(
    initialAppointment?.doctorId || defaultDoctorId || doctors[0]?.id || '',
  );
  const [clinicDate, setClinicDate] = useState<string>(
    initialAppointment?.clinicDate || defaultDate || today,
  );
  const [source, setSource] = useState<'WALK_IN' | 'SCHEDULED'>(
    initialAppointment?.source || 'WALK_IN',
  );
  const [startTime, setStartTime] = useState<string>(
    initialAppointment?.startTime || defaultStartTime || '10:00',
  );
  const [endTime, setEndTime] = useState<string>(
    initialAppointment?.endTime || '10:30',
  );
  const [slotsData, setSlotsData] = useState<AvailableSlotsResponse | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // ─── Section 4: Attachments ────────────────────────────────────────────────
  const [stagedAttachments, setStagedAttachments] = useState<StagedAttachment[]>(() => {
    if (initialAppointment?.attachments && Array.isArray(initialAppointment.attachments)) {
      return initialAppointment.attachments.map((att: any) => ({
        previewUrl: att.url,
        name: att.fileName || 'Attachment',
        size: att.fileSize || 0,
        type: att.mimeType || 'image/jpeg',
        existingId: att.id,
        url: att.url,
      }));
    }
    return [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Section 5: Financials ─────────────────────────────────────────────────
  const [totalAmount, setTotalAmount] = useState<string>(
    String(initialAppointment?.totalAmount ?? '200'),
  );
  const [paidAmount, setPaidAmount] = useState<string>(
    String(initialAppointment?.paidAmount ?? '0'),
  );
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WALLET'>(
    'CASH',
  );
  const [isExempt, setIsExempt] = useState<boolean>(
    Boolean(initialAppointment?.isExempt ?? false),
  );
  const exemptionPresets = isAr ? EXEMPTION_PRESETS_AR : EXEMPTION_PRESETS_EN;
  const [exemptionReason, setExemptionReason] = useState<string>(
    initialAppointment?.exemptionReason || exemptionPresets[0],
  );
  const [notes, setNotes] = useState<string>(initialAppointment?.notes || '');

  // Validation & Error
  const [formError, setFormError] = useState<string | null>(null);

  // Financial calculations
  const numTotal = isExempt ? 0 : Math.max(0, Number(totalAmount) || 0);
  const numPaid = isExempt ? 0 : Math.min(numTotal, Math.max(0, Number(paidAmount) || 0));
  const numRemaining = isExempt ? 0 : Math.max(0, numTotal - numPaid);

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Debounced search for existing patients
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPatientsAction(searchTerm.trim());
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load patient booking summary when patient is selected
  useEffect(() => {
    if (!selectedPatient?.id) {
      setBookingSummary(null);
      return;
    }

    let active = true;
    setIsLoadingSummary(true);

    getPatientBookingSummaryAction(selectedPatient.id).then((summary) => {
      if (active) {
        setBookingSummary(summary);
        setIsLoadingSummary(false);
      }
    });

    return () => {
      active = false;
    };
  }, [selectedPatient?.id]);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    if (!doctorId || !clinicDate) return;
    let active = true;
    setIsLoadingSlots(true);

    getDoctorAvailableSlotsAction(doctorId, clinicDate).then((res) => {
      if (active) {
        setSlotsData(res);
        setIsLoadingSlots(false);
      }
    });

    return () => {
      active = false;
    };
  }, [doctorId, clinicDate]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectPatient = (patient: PatientBasic) => {
    setSelectedPatient(patient);
    setSearchTerm('');
    setSearchResults([]);
    setFormError(null);
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setBookingSummary(null);
    setSearchTerm('');
  };

  const handleDobChange = (dob: string) => {
    setNewDateOfBirth(dob);
    if (dob) {
      const calculated = computeAge(dob);
      if (calculated !== null) setNewAge(String(calculated));
    }
  };

  // Image Upload & Staging
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const newStaged: StagedAttachment[] = [...stagedAttachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (newStaged.length >= 5) {
        toast.error(
          isAr
            ? 'الحد الأقصى 5 مرفقات للحجز الواحد'
            : 'Maximum 5 attachments allowed per booking',
        );
        break;
      }

      if (!allowed.includes(file.type)) {
        toast.error(
          isAr
            ? `الملف ${file.name} غير مدعوم (صور JPEG أو PNG أو WebP فقط)`
            : `File ${file.name} is not supported (JPEG, PNG, WebP only)`,
        );
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          isAr
            ? `حجم الملف ${file.name} كبير جداً (أقصى حد 5 ميجابايت)`
            : `File ${file.name} exceeds 5MB limit`,
        );
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newStaged.push({
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    setStagedAttachments(newStaged);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (index: number) => {
    const updated = [...stagedAttachments];
    const removed = updated.splice(index, 1)[0];
    if (removed.file && removed.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    setStagedAttachments(updated);
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate date
    if (clinicDate < today) {
      setFormError(
        isAr
          ? 'لا يمكن حجز موعد في تاريخ ماضٍ، اختر تاريخ اليوم أو موعداً مستقبلياً'
          : 'Cannot book in the past. Please choose today or a future date',
      );
      return;
    }

    // 2. Validate doctor schedule if scheduled
    if (source === 'SCHEDULED' && slotsData && !slotsData.isWorkingDay) {
      setFormError(
        slotsData.message ||
          (isAr
            ? 'الطبيب غير متاح في هذا التاريخ (إجازة أسبوعية)'
            : 'Doctor is not available on this date'),
      );
      return;
    }

    // 3. Resolve Patient
    let patientIdToBook = selectedPatient?.id;

    if (!isEdit && patientMode === 'new') {
      const nameCheck = validateFourPartName(newFullName);
      if (!nameCheck.isValid) {
        setFormError(
          isAr
            ? 'يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع مفصولة بمسافات)'
            : 'Full four-part name is required (at least 4 parts)',
        );
        return;
      }

      if (!newPhone.trim()) {
        setFormError(isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required');
        return;
      }

      const parsedAge = Number(newAge);
      if (!newAge || Number.isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        setFormError(isAr ? 'يرجى إدخال العمر بشكل صحيح' : 'Valid age is required');
        return;
      }

      // Create new patient
      const createRes = await createQuickPatientAction({
        fullName: nameCheck.normalized,
        phone: newPhone.trim(),
        gender: newGender,
        age: parsedAge,
        dateOfBirth: newDateOfBirth || undefined,
        address: newAddress || undefined,
      });

      if (!createRes.success || !createRes.patient) {
        setFormError(
          createRes.error ||
            (isAr ? 'فشل إنشاء سجل المريض الجديد' : 'Failed to register patient'),
        );
        return;
      }

      patientIdToBook = createRes.patient.id;
    }

    if (!patientIdToBook) {
      setFormError(
        isAr
          ? 'يرجى اختيار مريض مسجل أو إدخال بيانات مريض جديد'
          : 'Please select an existing patient or register a new one',
      );
      return;
    }

    startTransition(async () => {
      try {
        // 4. Upload newly added file attachments
        const newlyAddedFiles = stagedAttachments.filter((att) => att.file);
        let uploadedMetas: any[] = stagedAttachments
          .filter((att) => att.existingId && att.url)
          .map((att) => ({
            id: att.existingId,
            fileName: att.name,
            fileSize: att.size,
            mimeType: att.type,
            url: att.url,
          }));

        if (newlyAddedFiles.length > 0) {
          const filesPayload: Array<{ name: string; data: string }> = [];
          for (const item of newlyAddedFiles) {
            if (item.file) {
              const base64 = await fileToBase64(item.file);
              filesPayload.push({ name: item.file.name, data: base64 });
            }
          }

          const uploadRes = await uploadBookingAttachmentsAction(filesPayload);
          if (uploadRes.success && uploadRes.attachments) {
            uploadedMetas = [...uploadedMetas, ...uploadRes.attachments];
          } else {
            toast.error(uploadRes.error || (isAr ? 'فشل رفع بعض المرفقات' : 'Upload error'));
          }
        }

        // 5. Submit Booking (Create or Update)
        if (isEdit) {
          const res = await updateAppointmentAction(initialAppointment.id, {
            type: selectedType,
            clinicDate,
            startTime,
            endTime,
            notes,
            attachments: uploadedMetas,
            totalAmount: numTotal,
            paidAmount: numPaid,
            isExempt,
            exemptionReason: isExempt ? exemptionReason : undefined,
          });

          if (res.success) {
            toast.success(
              isAr ? 'تم تحديث بيانات الحجز بنجاح' : 'Booking updated successfully',
            );
            router.push(`/${userRole.toLowerCase()}/appointments`);
          } else {
            setFormError(res.error || (isAr ? 'فشل تحديث الحجز' : 'Failed to update booking'));
          }
        } else {
          const formData = new FormData();
          formData.set('patientId', patientIdToBook!);
          formData.set('doctorId', doctorId);
          formData.set('source', source);
          formData.set('type', selectedType);
          formData.set('clinicDate', clinicDate);
          formData.set('startTime', startTime);
          formData.set('endTime', endTime);
          formData.set('scheduledAt', `${clinicDate}T${startTime}:00.000Z`);
          formData.set('isExempt', isExempt ? 'true' : 'false');
          if (isExempt) formData.set('exemptionReason', exemptionReason);
          formData.set('totalAmount', String(numTotal));
          formData.set('paidAmount', String(numPaid));
          formData.set('paymentMethod', paymentMethod);
          if (notes) formData.set('notes', notes);
          if (uploadedMetas.length > 0) {
            formData.set('attachments', JSON.stringify(uploadedMetas));
          }

          const res = await createAppointmentAction({ success: false }, formData);
          if (res.success) {
            toast.success(
              isAr ? 'تم تسجيل وتأكيد الحجز بنجاح' : 'Booking created successfully',
            );
            router.push(`/${userRole.toLowerCase()}/appointments`);
          } else {
            setFormError(res.error || (isAr ? 'فشل حفظ الحجز' : 'Failed to save booking'));
          }
        }
      } catch (err: any) {
        setFormError(err?.message || (isAr ? 'حدث خطأ غير متوقع' : 'Unexpected error occurred'));
      }
    });
  };

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const selectedTypeConfig = getAppointmentTypeConfig(selectedType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
            <Stethoscope className="size-7 text-primary" />
            {isEdit
              ? isAr
                ? 'تعديل بيانات الحجز'
                : 'Edit Booking'
              : isAr
                ? 'حجز موعد جديد'
                : 'New Appointment Booking'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isAr
              ? 'صفحة مخصصة لإدارة وتنسيق حجوزات العيادة مع المرفقات والتاريخ الطبي'
              : 'Dedicated workspace for scheduling clinic appointments with attachments and medical history'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(`/${userRole.toLowerCase()}/appointments`)}
          className="gap-1.5 text-xs"
        >
          <ArrowRight className="size-4 rtl:rotate-180" />
          <span>{isAr ? 'إلغاء والعودة' : 'Cancel & Back'}</span>
        </Button>
      </div>

      {formError && (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertCircle className="size-4" />
          <AlertTitle>{isAr ? 'تعذر إتمام الحجز' : 'Booking Error'}</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* ─── SECTION 1: PATIENT SELECTION & DETAILS ─────────────────────────── */}
      <Card className="shadow-xs border-2">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <User className="size-5 text-primary" />
            {isAr ? '1. اختيار المريض والبيانات الشخصية' : '1. Patient Selection & Information'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr
              ? 'ابحث عن مريض مسجل مسبقاً لعرض تاريخه الطبي وملخصه المالي، أو سجل مريضاً جديداً بالاسم الرباعي'
              : 'Search an existing patient to view history and balance, or register a new patient with full 4-part name'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {!isEdit && (
            <div className="flex items-center gap-2 border-b pb-3">
              <Button
                type="button"
                variant={patientMode === 'search' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPatientMode('search');
                  setFormError(null);
                }}
                className="gap-1.5 text-xs"
              >
                <Search className="size-3.5" />
                <span>{isAr ? 'بحث عن مريض مسجل' : 'Search Existing Patient'}</span>
              </Button>
              <Button
                type="button"
                variant={patientMode === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPatientMode('new');
                  setSelectedPatient(null);
                  setBookingSummary(null);
                  setFormError(null);
                }}
                className="gap-1.5 text-xs"
              >
                <UserPlus className="size-3.5" />
                <span>{isAr ? 'تسجيل مريض جديد' : 'Register New Patient'}</span>
              </Button>
            </div>
          )}

          {/* Search Existing Patient Mode */}
          {patientMode === 'search' && !selectedPatient && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute start-3 top-3 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث بالاسم الكامل أو رقم الهاتف أو المعرف...'
                      : 'Search by full name, phone number, or patient ID...'
                  }
                  className="ps-9 h-10 text-sm"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute end-3 top-3 size-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Live Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="rounded-lg border bg-card shadow-md divide-y max-h-56 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-start p-3 hover:bg-primary/5 transition-colors flex items-center justify-between gap-3 text-sm"
                    >
                      <div>
                        <span className="font-bold text-foreground block">{p.fullName}</span>
                        <span className="text-xs text-muted-foreground" dir="ltr">
                          {p.phone}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-2xs font-mono">
                        {p.gender === 'MALE' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.trim().length > 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground italic text-center py-2">
                  {isAr ? 'لم يتم العثور على مريض بهذا الاسم أو الرقم' : 'No patients found matching query'}
                </p>
              )}
            </div>
          )}

          {/* Selected Patient Summary Panel */}
          {selectedPatient && (
            <div>
              {isLoadingSummary ? (
                <div className="p-6 border rounded-lg bg-muted/20 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span>{isAr ? 'جارٍ تحميل التاريخ الطبي والملخص المالي...' : 'Loading patient history and balance...'}</span>
                </div>
              ) : bookingSummary ? (
                <PatientSummaryPanel
                  summary={bookingSummary}
                  onClearPatient={handleClearPatient}
                  locale={locale}
                />
              ) : (
                <div className="p-4 border rounded-lg flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-5 text-primary" />
                    <div>
                      <span className="font-bold text-sm block">{selectedPatient.fullName}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {selectedPatient.phone}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearPatient}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    {isAr ? 'تغيير' : 'Change'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* New Patient Registration Mode */}
          {patientMode === 'new' && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/10">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="newFullName" className="text-xs font-bold">
                    {isAr ? 'الاسم الرباعي الكامل للمريض' : 'Patient Full Four-Part Name'} *
                  </Label>
                  <span className="text-2xs font-mono text-muted-foreground">
                    {validateFourPartName(newFullName).isValid ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        {isAr ? 'اسم رباعي صالح' : 'Valid 4-part name'}
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        {validateFourPartName(newFullName).partsCount} / 4 {isAr ? 'مقاطع' : 'parts'}
                      </span>
                    )}
                  </span>
                </div>
                <Input
                  id="newFullName"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder={isAr ? 'أحمد محمد علي حسن' : 'Ahmed Mohamed Ali Hassan'}
                  className="h-9 text-sm"
                  required
                />
                <p className="text-2xs text-muted-foreground">
                  {isAr
                    ? 'يجب إدخال اسم المريض رباعياً على الأقل مع كتابة أربعة مقاطع مفصولة بمسافات'
                    : 'Must contain at least 4 distinct name parts separated by single spaces'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPhone" className="text-xs font-bold">
                    {isAr ? 'رقم الهاتف' : 'Phone Number'} *
                  </Label>
                  <Input
                    id="newPhone"
                    dir="ltr"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="01012345678"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newGender" className="text-xs font-bold">
                    {isAr ? 'الجنس' : 'Gender'} *
                  </Label>
                  <select
                    id="newGender"
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs"
                  >
                    <option value="MALE">{isAr ? 'ذكر' : 'Male'}</option>
                    <option value="FEMALE">{isAr ? 'أنثى' : 'Female'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newAge" className="text-xs font-bold">
                    {isAr ? 'العمر' : 'Age'} *
                  </Label>
                  <Input
                    id="newAge"
                    type="number"
                    min="0"
                    max="130"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="35"
                    className="h-9 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newDateOfBirth" className="text-xs font-bold">
                    {isAr ? 'تاريخ الميلاد' : 'Date of Birth'} ({isAr ? 'اختياري' : 'Optional'})
                  </Label>
                  <Input
                    id="newDateOfBirth"
                    type="date"
                    value={newDateOfBirth}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newAddress" className="text-xs font-bold">
                    {isAr ? 'العنوان' : 'Address'} ({isAr ? 'اختياري' : 'Optional'})
                  </Label>
                  <Input
                    id="newAddress"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={isAr ? 'القاهرة، مصر' : 'Cairo, Egypt'}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 2: APPOINTMENT TYPE SELECTION ───────────────────────────── */}
      <Card className="shadow-xs border-2">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Stethoscope className="size-5 text-primary" />
              {isAr ? '2. نوع الموعد الطبي والخدمة' : '2. Appointment Type Selection'}
            </CardTitle>
            <AppointmentTypeBadge type={selectedType} locale={locale} />
          </div>
          <CardDescription className="text-xs">
            {isAr
              ? 'اختر نوع الحجز من الأنواع الخمسة المميزة بألوانها الموحدة على مستوى النظام بالكامل'
              : 'Choose from the 5 color-coded appointment types with centralized system-wide color mapping'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {APPOINTMENT_TYPES_LIST.map((typeConfig) => {
              const isSelected = selectedType === typeConfig.id;
              return (
                <button
                  key={typeConfig.id}
                  type="button"
                  onClick={() => setSelectedType(typeConfig.id)}
                  className={cn(
                    'p-3.5 rounded-xl border text-start transition-all relative flex flex-col justify-between gap-2 shadow-2xs hover:shadow-xs',
                    typeConfig.bgTintClass,
                    isSelected ? typeConfig.activeRingClass : 'border-border/80 hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <AppointmentTypeBadge type={typeConfig.id} locale={locale} />
                    {isSelected && (
                      <span className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground mt-1">
                    {isAr ? typeConfig.arLabel : typeConfig.enLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 3: SCHEDULING DETAILS ─────────────────────────────────── */}
      <Card className="shadow-xs border-2">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            {isAr ? '3. الطبيب وتوقيت الحجز' : '3. Doctor & Scheduling Details'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr
              ? 'تحديد الطبيب وتاريخ الموعد والفترة الزمنية مع التحقق من توفر الطبيب'
              : 'Select doctor, clinic date, and time slot with real-time availability check'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Doctor Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="doctorId" className="text-xs font-bold">
                {isAr ? 'الطبيب المعالج' : 'Attending Doctor'} *
              </Label>
              <select
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinic Date */}
            <div className="space-y-1.5">
              <Label htmlFor="clinicDate" className="text-xs font-bold">
                {isAr ? 'تاريخ الموعد' : 'Clinic Date'} *
              </Label>
              <Input
                id="clinicDate"
                type="date"
                min={today}
                value={clinicDate}
                onChange={(e) => setClinicDate(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {isAr ? 'نوع الحضور' : 'Booking Source'} *
              </Label>
              <div className="grid grid-cols-2 gap-2 h-9">
                <Button
                  type="button"
                  variant={source === 'WALK_IN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSource('WALK_IN')}
                  className="text-xs h-full"
                >
                  {isAr ? 'بدون موعد (مباشر)' : 'Walk-in'}
                </Button>
                <Button
                  type="button"
                  variant={source === 'SCHEDULED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSource('SCHEDULED')}
                  className="text-xs h-full"
                >
                  {isAr ? 'موعد مسبق' : 'Scheduled'}
                </Button>
              </div>
            </div>
          </div>

          {/* Time Slot Picker for Scheduled */}
          {source === 'SCHEDULED' && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  {isAr ? 'اختر الفترة الزمنية المناسبة' : 'Select Time Slot'}
                </Label>
                {isLoadingSlots && (
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    {isAr ? 'جارٍ فحص التوفر...' : 'Checking availability...'}
                  </span>
                )}
              </div>

              {slotsData && !slotsData.isWorkingDay && (
                <Alert variant="warning" className="py-2 text-xs">
                  <AlertCircle className="size-3.5" />
                  <AlertDescription>
                    {slotsData.message || (isAr ? 'الطبيب في إجازة بهذا التاريخ' : 'Doctor off duty on this date')}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {(slotsData?.slots && slotsData.slots.length > 0 ? slotsData.slots : DEFAULT_SLOTS).map(
                  (slot: any, idx: number) => {
                    const isSelected = startTime === slot.start;
                    const isAvailable = slot.isAvailable !== false;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          setStartTime(slot.start);
                          setEndTime(slot.end);
                        }}
                        className={cn(
                          'p-2 rounded-lg text-xs font-mono border transition-all text-center',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                            : isAvailable
                              ? 'bg-background hover:bg-muted text-foreground'
                              : 'bg-muted/50 text-muted-foreground/40 cursor-not-allowed line-through',
                        )}
                      >
                        {slot.start}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-2xs text-muted-foreground">{isAr ? 'وقت البدء' : 'Start Time'}</span>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-2xs text-muted-foreground">{isAr ? 'وقت الانتهاء' : 'End Time'}</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 4: IMAGE ATTACHMENTS ──────────────────────────────────── */}
      <Card className="shadow-xs border-2">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <ImageIcon className="size-5 text-primary" />
              {isAr ? '4. مرفقات وصور الحجز' : '4. Image Attachments'}
            </CardTitle>
            <Badge variant="outline" className="text-2xs font-mono">
              {stagedAttachments.length} / 5 {isAr ? 'صور' : 'images'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {isAr
              ? 'يمكنك إرفاق صور الروشتات السابقة، نتائج التحاليل، أو الأشعة (JPEG, PNG, WebP - أقصى حد 5MB)'
              : 'Attach previous prescriptions, lab reports, or imaging (JPEG, PNG, WebP - max 5MB each)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />

          {/* Dropzone trigger */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:bg-primary/5 hover:border-primary/60 transition-all cursor-pointer space-y-2 group"
          >
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Upload className="size-5" />
            </div>
            <div className="text-xs sm:text-sm font-semibold text-foreground">
              {isAr ? 'اضغط لاختيار الصور أو اسحب الملفات هنا' : 'Click to select or drag & drop images here'}
            </div>
            <p className="text-2xs text-muted-foreground">
              {isAr
                ? 'الأنواع المدعومة: JPEG, PNG, WebP (الحد الأقصى 5 صور، 5 ميجابايت لكل صورة)'
                : 'Supported formats: JPEG, PNG, WebP (up to 5 images, max 5MB per file)'}
            </p>
          </div>

          {/* Staged Image Previews */}
          {stagedAttachments.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {stagedAttachments.map((att, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-lg border bg-muted/30 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-1.5 bg-card/95 border-t text-2xs truncate">
                    <p className="font-medium truncate text-foreground">{att.name}</p>
                    <p className="text-muted-foreground font-mono text-3xs">
                      {(att.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(idx)}
                    className="absolute top-1.5 end-1.5 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-85 hover:opacity-100 shadow-sm transition-opacity"
                    title={isAr ? 'حذف الصورة' : 'Remove image'}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── SECTION 5: FINANCIALS & FEES ─────────────────────────────────── */}
      <Card className="shadow-xs border-2">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            {isAr ? '5. الرسوم والبيانات المالية' : '5. Fees & Financial Details'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isAr
              ? 'تحديد رسوم الكشف، المسدد مقدماً (عربون)، أو تطبيق الإعفاء من الرسوم'
              : 'Set consultation fees, upfront deposit, or apply fee exemption'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <input
              type="checkbox"
              id="isExempt"
              checked={isExempt}
              onChange={(e) => setIsExempt(e.target.checked)}
              className="size-4 rounded text-primary focus:ring-primary"
            />
            <Label htmlFor="isExempt" className="text-xs font-bold cursor-pointer">
              {isAr ? 'إعفاء المريض من الرسوم (حالة خاصة / مجاني)' : 'Exempt patient from fees (Free / Special case)'}
            </Label>
          </div>

          {isExempt ? (
            <div className="space-y-1.5 p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-300">
              <Label htmlFor="exemptionReason" className="text-xs font-bold">
                {isAr ? 'سبب الإعفاء من الرسوم' : 'Reason for Fee Exemption'} *
              </Label>
              <select
                id="exemptionReason"
                value={exemptionReason}
                onChange={(e) => setExemptionReason(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs"
              >
                {exemptionPresets.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Fee */}
                <div className="space-y-1.5">
                  <Label htmlFor="totalAmount" className="text-xs font-bold">
                    {isAr ? 'قيمة الكشف / الخدمة (ج.م)' : 'Total Service Fee (EGP)'} *
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="h-9 text-sm font-mono"
                    required
                  />
                  <div className="flex gap-1 flex-wrap pt-1">
                    {COMMON_FEES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setTotalAmount(String(f))}
                        className="text-2xs px-1.5 py-0.5 rounded border bg-muted/40 hover:bg-muted font-mono"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paid Upfront */}
                <div className="space-y-1.5">
                  <Label htmlFor="paidAmount" className="text-xs font-bold">
                    {isAr ? 'المسدد مقدماً (عربون)' : 'Deposit / Advance Paid'}
                  </Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    min="0"
                    max={numTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="h-9 text-sm font-mono text-emerald-600 font-bold"
                  />
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setPaidAmount('0')}
                      className="text-2xs px-1.5 py-0.5 rounded border bg-muted/40 hover:bg-muted"
                    >
                      {isAr ? 'بدون عربون' : 'No deposit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(totalAmount)}
                      className="text-2xs px-1.5 py-0.5 rounded border bg-muted/40 hover:bg-muted"
                    >
                      {isAr ? 'سداد كامل' : 'Full payment'}
                    </button>
                  </div>
                </div>

                {/* Remaining Due */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">
                    {isAr ? 'المبلغ المتبقي للعيادة' : 'Remaining Balance Due'}
                  </Label>
                  <div
                    className={cn(
                      'h-9 rounded-md border flex items-center px-3 font-mono font-bold text-sm',
                      numRemaining > 0
                        ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200',
                    )}
                  >
                    {formatMoney(numRemaining)}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {numPaid > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="paymentMethod" className="text-xs font-bold">
                    {isAr ? 'طريقة تحصيل العربون / الدفعة' : 'Payment Method'}
                  </Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full sm:w-60 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-2xs"
                  >
                    <option value="CASH">{isAr ? 'نقدي (كاش)' : 'Cash'}</option>
                    <option value="CARD">{isAr ? 'بطاقة بنكية' : 'Card / POS'}</option>
                    <option value="WALLET">{isAr ? 'محفظة إلكترونية' : 'E-Wallet'}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="notes" className="text-xs font-bold">
              {isAr ? 'ملاحظات إضافية على الحجز' : 'Additional Booking Notes'}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'أي ملاحظات خاصة بالطبيب أو الاستقبال...' : 'Any special notes for doctor or reception...'}
              className="min-h-16 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 6: SUMMARY & ACTIONS ─────────────────────────────────── */}
      <Card className="shadow-sm border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground text-sm">
                {selectedPatient
                  ? selectedPatient.fullName
                  : newFullName.trim()
                    ? newFullName
                    : isAr
                      ? '(لم يتم تحديد مريض)'
                      : '(No patient selected)'}
              </span>
              <AppointmentTypeBadge type={selectedType} locale={locale} />
              <Badge variant="outline" className="text-2xs font-mono">
                {clinicDate} {source === 'SCHEDULED' && `• ${startTime}`}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isExempt
                ? isAr
                  ? 'معفي من الرسوم'
                  : 'Fee Exempt'
                : `${isAr ? 'الإجمالي:' : 'Total:'} ${formatMoney(numTotal)} | ${isAr ? 'المدفوع:' : 'Paid:'} ${formatMoney(numPaid)} | ${isAr ? 'المتبقي:' : 'Due:'} ${formatMoney(numRemaining)}`}
              {stagedAttachments.length > 0 &&
                ` • ${stagedAttachments.length} ${isAr ? 'مرفقات' : 'attachments'}`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => router.push(`/${userRole.toLowerCase()}/appointments`)}
              className="text-xs"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>

            <Button
              type="submit"
              size="default"
              disabled={isPending}
              className="gap-2 font-bold text-xs sm:text-sm px-6 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <FileCheck className="size-4" />
                  <span>
                    {isEdit
                      ? isAr
                        ? 'حفظ التعديلات'
                        : 'Save Changes'
                      : isAr
                        ? 'تأكيد وحفظ الحجز'
                        : 'Confirm & Save Booking'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
