import { z } from 'zod';

export const APPOINTMENT_TYPE_VALUES = [
  'examination',
  'revisit',
  'surgery_followup',
  'lab_radiology',
  'tests_review',
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bookingSchema = (t?: any) =>
  z
    .object({
      // 1. المريض
      patientId: z.string().min(1, t?.('patientRequired') || 'يرجى اختيار مريض أو تسجيل مريض جديد'),
      patientName: z.string().min(3, t?.('patientNameMin') || 'اسم المريض مطلوب'),
      patientPhone: z.string(),
      patientGender: z.string().optional(),
      patientAge: z.union([z.number(), z.string()]).optional(),
      hasChronicDisease: z.boolean(),
      chronicDiseases: z.array(z.string()),
      chronicNotes: z.string(),

      // 2. نوع الموعد
      appointmentType: z.enum(APPOINTMENT_TYPE_VALUES, {
        message: t?.('typeRequired') || 'نوع الموعد مطلوب',
      }),

      // 3. الطبيب والتوقيت
      doctorId: z.string().min(1, t?.('doctorRequired') || 'يرجى اختيار الطبيب المعالج'),
      appointmentDate: z.string().min(1, t?.('dateRequired') || 'تاريخ الموعد مطلوب'),
      appointmentTime: z.string().min(1, t?.('timeRequired') || 'ساعة الموعد مطلوبة'),
      attendanceType: z.enum(['direct', 'scheduled']),

      // 4. الرسوم والبيانات المالية
      examinationFee: z.number().min(0, t?.('feePositive') || 'سعر الكشف لا يمكن أن يكون سالباً'),
      paidAmount: z.number().min(0, t?.('paidPositive') || 'المدفوع لا يمكن أن يكون سالباً'),
      isExempt: z.boolean(),
      exemptionReason: z.string(),

      // 5. المرفقات والملاحظات
      attachments: z.array(z.any()).max(5, t?.('maxAttachments') || 'الحد الأقصى 5 صور'),
      notes: z.string(),
    })
    .refine(
      (data) => {
        if (data.isExempt) {
          return Boolean(data.exemptionReason && data.exemptionReason.trim().length > 0);
        }
        return true;
      },
      {
        message: t?.('exemptionReasonRequired') || 'يرجى تحديد سبب الإعفاء من الرسوم',
        path: ['exemptionReason'],
      }
    )
    .refine(
      (data) => {
        if (data.hasChronicDisease) {
          return data.chronicDiseases.length > 0 || (data.chronicNotes && data.chronicNotes.trim().length > 0);
        }
        return true;
      },
      {
        message: t?.('chronicDiseaseRequired') || 'يرجى تحديد المرض المزمن أو إدخال تفاصيل الحالة',
        path: ['chronicDiseases'],
      }
    );
