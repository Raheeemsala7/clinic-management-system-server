export type AppointmentTypeId =
  | 'EXAMINATION'
  | 'FOLLOW_UP'
  | 'POST_OPERATIVE'
  | 'LAB_TESTS_IMAGING'
  | 'TEST_RESULTS_REVIEW';

export interface AppointmentTypeConfig {
  id: AppointmentTypeId;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
  arLabel: string;
  enLabel: string;
  badgeClass: string;
  bgTintClass: string;
  textClass: string;
  borderClass: string;
  activeRingClass: string;
  dotColorClass: string;
}

export const APPOINTMENT_TYPES: Record<AppointmentTypeId, AppointmentTypeConfig> = {
  EXAMINATION: {
    id: 'EXAMINATION',
    color: 'blue',
    arLabel: 'كشف',
    enLabel: 'Examination',
    badgeClass:
      'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    bgTintClass: 'bg-blue-50/70 dark:bg-blue-950/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-700',
    activeRingClass: 'ring-2 ring-blue-500 border-blue-600 bg-blue-50/90 dark:bg-blue-950/60',
    dotColorClass: 'bg-blue-500',
  },
  FOLLOW_UP: {
    id: 'FOLLOW_UP',
    color: 'green',
    arLabel: 'إعادة',
    enLabel: 'Follow-up Visit',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    bgTintClass: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    activeRingClass: 'ring-2 ring-emerald-500 border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/60',
    dotColorClass: 'bg-emerald-500',
  },
  POST_OPERATIVE: {
    id: 'POST_OPERATIVE',
    color: 'purple',
    arLabel: 'متابعة عملية',
    enLabel: 'Post-operative Follow-up',
    badgeClass:
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    bgTintClass: 'bg-purple-50/70 dark:bg-purple-950/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-700',
    activeRingClass: 'ring-2 ring-purple-500 border-purple-600 bg-purple-50/90 dark:bg-purple-950/60',
    dotColorClass: 'bg-purple-500',
  },
  LAB_TESTS_IMAGING: {
    id: 'LAB_TESTS_IMAGING',
    color: 'orange',
    arLabel: 'تحليل و أشعة',
    enLabel: 'Lab Tests & Imaging',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    bgTintClass: 'bg-amber-50/70 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-300 dark:border-amber-700',
    activeRingClass: 'ring-2 ring-amber-500 border-amber-600 bg-amber-50/90 dark:bg-amber-950/60',
    dotColorClass: 'bg-amber-500',
  },
  TEST_RESULTS_REVIEW: {
    id: 'TEST_RESULTS_REVIEW',
    color: 'teal',
    arLabel: 'مراجعة فحوصات',
    enLabel: 'Test Results Review',
    badgeClass:
      'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
    bgTintClass: 'bg-teal-50/70 dark:bg-teal-950/30',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-300 dark:border-teal-700',
    activeRingClass: 'ring-2 ring-teal-500 border-teal-600 bg-teal-50/90 dark:bg-teal-950/60',
    dotColorClass: 'bg-teal-500',
  },
};

export const APPOINTMENT_TYPES_LIST: AppointmentTypeConfig[] = [
  APPOINTMENT_TYPES.EXAMINATION,
  APPOINTMENT_TYPES.FOLLOW_UP,
  APPOINTMENT_TYPES.POST_OPERATIVE,
  APPOINTMENT_TYPES.LAB_TESTS_IMAGING,
  APPOINTMENT_TYPES.TEST_RESULTS_REVIEW,
];

/**
 * Normalizes any appointment type string (including legacy 'CONSULTATION')
 * to one of the 5 canonical appointment type IDs.
 */
export function normalizeAppointmentType(type?: string | null): AppointmentTypeId {
  if (!type) return 'EXAMINATION';
  const upper = type.toUpperCase();
  if (upper === 'CONSULTATION' || upper === 'EXAMINATION') return 'EXAMINATION';
  if (upper === 'FOLLOW_UP') return 'FOLLOW_UP';
  if (upper === 'POST_OPERATIVE' || upper === 'POST_OP') return 'POST_OPERATIVE';
  if (upper === 'LAB_TESTS_IMAGING' || upper === 'LAB' || upper === 'IMAGING') return 'LAB_TESTS_IMAGING';
  if (upper === 'TEST_RESULTS_REVIEW' || upper === 'REVIEW') return 'TEST_RESULTS_REVIEW';
  return 'EXAMINATION';
}

export function getAppointmentTypeConfig(type?: string | null): AppointmentTypeConfig {
  const normalized = normalizeAppointmentType(type);
  return APPOINTMENT_TYPES[normalized];
}

export function getAppointmentTypeLabel(type?: string | null, locale: string = 'ar'): string {
  const config = getAppointmentTypeConfig(type);
  return locale === 'en' ? config.enLabel : config.arLabel;
}
