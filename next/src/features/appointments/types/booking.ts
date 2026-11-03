import { z } from 'zod';
import { bookingSchema } from '../schemas/booking.schema';

export type BookingFormType = z.infer<ReturnType<typeof bookingSchema>>;

export interface PatientBasic {
  id: string;
  fullName?: string;
  name?: string;
  searchName?: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age?: number;
  dateOfBirth?: string | null;
  address?: string | null;
  chronicConditions?: string[];
  generalNotes?: string | null;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  totalVisits?: number;
  lastVisit?: string;
}

export type AppointmentTypeId =
  |"EXAMINATION" | "FOLLOW_UP" | "POST_OPERATIVE" | "LAB_TESTS_IMAGING" | "TEST_RESULTS_REVIEW" | "CONSULTATION"

export interface AppointmentTypeOption {
  id: AppointmentTypeId;
  label: string;
  dotColor: string;
  defaultFee: number;
}

export interface StagedAttachment {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
}

export interface DoctorOption {
  id: string;
  name: string;
  username?: string;
  specialty?: string;
}

export interface AvailableSlotItem {
  startTime: string;
  endTime: string;
  shiftIndex: number;
  isBooked: boolean;
  isPast: boolean;
  isAvailable: boolean;
  label?: string;
}

export interface AvailableSlotsResponse {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isWorkingDay: boolean;
  isPast: boolean;
  message?: string;
  slotDurationMinutes?: number;
  slots: AvailableSlotItem[];
  availableCount: number;
  bookedCount: number;
}
/**
 * البيانات المرسلة إلى الخادم (Backend API) عند إنشاء موعد حجز جديد
 * مسار الـ API: POST /api/v1/appointments
 */
export interface CreateAppointmentPayload {
  /** معرف المريض المسجل (مطلوب) */
  patientId: string;

  /** نوع الموعد / الكشف (مطلوب) */
  type:AppointmentTypeId

  /** موعد الكشف بالساعة (يقبل 24h مثل "16:30" أو 12h بالعربية مثل "04:30 م") */
  appointmentTime?: string;

  /** وقت بداية الموعد بنظام 24h مثل "16:30" */
  startTime?: string;

  /** تاريخ ووقت الموعد الكامل بصيغة ISO */
  scheduledAt?: string;

  /** نوع الحضور / الحجز (مسبق أم كشف مباشر) */
  source: 'WALK_IN' | 'SCHEDULED';

  /** تاريخ الحجز بصيغة YYYY-MM-DD (اختياري - الافتراضي اليوم الحالي) */
  clinicDate: string;

  /** سعر الكشف الإجمالي (يقبل fee أو totalAmount أو examinationFee) */
  totalAmount?: number;

  /** الجزء المدفوع مقدماً من سعر الكشف (عربون أو سداد كامل) */
  paidAmount?: number;



  /** تفعيل إعفاء المريض من رسوم الكشف (إذا كانت true، يتم تصفير السعر تلقائياً) */
  isExempt: boolean;

  /** سبب الإعفاء عند تفعيل isExempt */
  exemptionReason?: string;

  /** روابط صور الفحوصات أو الروشتات المرفوعة على Tigris Data */
  attachments?:
    | string[]
    | Array<{
        url: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
      }>;

  /** ملاحظات إضافية على الحجز */
  notes?: string;

  /** معرف الطبيب المعالج (اختياري - يعتمد الطبيب النشط تلقائياً إذا لم يُحدد) */
  doctorId: string;


}

// التوافق مع أي استيراد سابق للاسم القديم
export type AppointmentPayload = CreateAppointmentPayload;
