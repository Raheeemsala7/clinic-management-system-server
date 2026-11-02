import { AppointmentTypeOption, PatientBasic } from '../types/booking';

export const CHRONIC_DISEASES = [
  { id: 'diabetes', label: 'السكر' },
  { id: 'hypertension', label: 'الضغط' },
  { id: 'heart', label: 'القلب' },
  { id: 'asthma', label: 'الربو' },
  { id: 'kidney', label: 'الكلى' },
  { id: 'thyroid', label: 'الغدة الدرقية' },
  { id: 'other', label: 'أخرى' },
] as const;

export const APPOINTMENT_TYPES: AppointmentTypeOption[] = [
  { id: 'examination', label: 'كشف', dotColor: 'bg-[#1D4ED8]', defaultFee: 300 },
  { id: 'revisit', label: 'إعادة', dotColor: 'bg-emerald-500', defaultFee: 0 },
  { id: 'surgery_followup', label: 'متابعة عملية', dotColor: 'bg-purple-600', defaultFee: 0 },
  { id: 'lab_radiology', label: 'تحليل وأشعة', dotColor: 'bg-amber-400', defaultFee: 150 },
  { id: 'tests_review', label: 'مراجعة فحوصات', dotColor: 'bg-slate-400', defaultFee: 50 },
];

export const EXEMPTION_PRESETS = [
  'حالة إنسانية / غير مقتدر',
  'استشارة مجانية بعد كشف',
  'توصية وإعفاء من الطبيب',
  'طبيب زميل أو عائلة الطبيب',
  'تأمين / رعاية خاصة',
] as const;

export const SAMPLE_DOCTORS = [
  { id: 'doc-1', name: 'د. إسلام عبدالله كريمة', specialty: 'أخصائي أنف وأذن وحنجرة' },
];

export const SAMPLE_SLOTS = [
  { time: '04:00', label: '04:00 م', isAvailable: true },
  { time: '04:30', label: '04:30 م', isAvailable: true },
  { time: '05:00', label: '05:00 م', isAvailable: true },
  { time: '05:30', label: '05:30 م', isAvailable: false }, // محجوز
  { time: '06:00', label: '06:00 م', isAvailable: true },
  { time: '06:30', label: '06:30 م', isAvailable: true },
  { time: '07:00', label: '07:00 م', isAvailable: false }, // محجوز
  { time: '07:30', label: '07:30 م', isAvailable: true },
];

export const SAMPLE_PATIENTS: PatientBasic[] = [
  {
    id: 'p-1',
    name: 'محمد علاء أحمد علي',
    phone: '01012345678',
    age: 34,
    gender: 'MALE',
    lastVisit: '15/10/2026',
    totalVisits: 3,
  },
  {
    id: 'p-2',
    name: 'أحمد محمود إبراهيم حسن',
    phone: '01123456789',
    age: 42,
    gender: 'MALE',
    lastVisit: '01/09/2026',
    totalVisits: 1,
  },
  {
    id: 'p-3',
    name: 'سارة حسن علي السيد',
    phone: '01234567890',
    age: 28,
    gender: 'FEMALE',
    lastVisit: '20/08/2026',
    totalVisits: 2,
  },
];

