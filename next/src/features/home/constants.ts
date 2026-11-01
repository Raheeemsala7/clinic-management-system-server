import {
  ClinicFacility,
  HeroStat,
  NavLinkItem,
  PatientReview,
  ServiceItem,
  TimelineMilestone,
} from './types';

/**
 * رقم واتساب العيادة المخصص للحجز والاستفسارات
 */
export const CLINIC_WHATSAPP_NUMBER = '201050792622';

/**
 * دالة لإنشاء رابط الواتساب المباشر مع رسالة مسبقة تدعم اللغتين
 */
export const getWhatsAppUrl = (message?: string, locale: string = 'ar'): string => {
  const defaultMsg =
    locale === 'en'
      ? 'Hello Dr. Eslam, I would like to book an appointment at the ENT clinic.'
      : 'مرحباً د. إسلام، أود حجز موعد كشف في عيادة الأنف والأذن والحنجرة.';
  const text = message ? encodeURIComponent(message) : encodeURIComponent(defaultMsg);
  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${text}`;
};

/**
 * روابط شريط التنقل العلوي
 */
export const NAV_LINKS: NavLinkItem[] = [
  { label: 'الرئيسية', href: '#hero' },
  { label: 'نبذة', href: '#about' },
  { label: 'المؤهلات', href: '#qualifications' },
  { label: 'الخدمات', href: '#services' },
  { label: 'العيادة', href: '#clinic' },
  { label: 'آراء المرضى', href: '#reviews' },
];

/**
 * مميزات سريعة في شاشة الهيرو
 */
export const HERO_STATS: HeroStat[] = [
  {
    title: 'مناظير',
    subtitle: 'أنف · أذن · حنجرة',
  },
  {
    title: 'جراحات دقيقة',
    subtitle: 'ميكروسكوبية وبالمناظير',
  },
  {
    title: 'تجميل وظيفي',
    subtitle: 'للأنف والأذن',
  },
];

/**
 * قائمة الخدمات الطبية التسع بنفس الترتيب والألوان والتصميم
 */
export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 's-01',
    number: '01',
    title: 'مناظير الأنف والجيوب الأنفية',
    description: 'تشخيص وعلاج مشاكل الجيوب والحاجز الأنفي بالمنظار.',
    theme: 'white',
    badgeColor: 'blue',
    linkColor: 'blue',
  },
  {
    id: 's-02',
    number: '02',
    title: 'جراحات الأذن الميكروسكوبية',
    description: 'جراحات دقيقة لتحسين السمع باستخدام الميكروسكوب.',
    theme: 'navy',
    badgeColor: 'yellow',
    linkColor: 'yellow',
  },
  {
    id: 's-03',
    number: '03',
    title: 'جراحات الأذن بالمنظار',
    description: 'تقنية حديثة بأقل تدخل جراحي ممكن.',
    theme: 'white',
    badgeColor: 'navy',
    linkColor: 'blue',
  },
  {
    id: 's-04',
    number: '04',
    title: 'استئصال اللوزتين واللحمية',
    description: 'بأحدث الطرق الجراحية للكبار والأطفال.',
    theme: 'navy',
    badgeColor: 'yellow',
    linkColor: 'yellow',
  },
  {
    id: 's-05',
    number: '05',
    title: 'مناظير الحنجرة والقصبة الهوائية',
    description: 'فحص دقيق لمشاكل الصوت والبلع والتنفس.',
    theme: 'white',
    badgeColor: 'blue',
    linkColor: 'blue',
  },
  {
    id: 's-06',
    number: '06',
    title: 'استخراج الأجسام الغريبة',
    description: 'إخراج الأجسام الغريبة بالمنظار بأمان.',
    theme: 'navy',
    badgeColor: 'yellow',
    linkColor: 'yellow',
  },
  {
    id: 's-07',
    number: '07',
    title: 'عمليات الشخير',
    description: 'تقييم أسباب الشخير وعلاجه جراحياً عند الحاجة.',
    theme: 'white',
    badgeColor: 'navy',
    linkColor: 'blue',
  },
  {
    id: 's-08',
    number: '08',
    title: 'تجميل الأنف الوظيفي',
    description: 'تحسين التنفس مع الحفاظ على الشكل الطبيعي.',
    theme: 'navy',
    badgeColor: 'yellow',
    linkColor: 'yellow',
  },
  {
    id: 's-09',
    number: '09',
    title: 'تجميل الأذن الخفاشية',
    description: 'تصحيح بروز الأذن للأطفال والكبار.',
    theme: 'white',
    badgeColor: 'blue',
    linkColor: 'blue',
  },
];

/**
 * المحطات التعليمية والمهنية للطبيب
 */
export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'm-1',
    year: '[السنة]',
    degree: '[بكالوريوس الطب والجراحة]',
    institution: '[الجامعة]',
  },
  {
    id: 'm-2',
    year: '[السنة]',
    degree: '[الماجستير / الدبلوم]',
    institution: '[الجهة]',
  },
  {
    id: 'm-3',
    year: '[السنة]',
    degree: '[الدكتوراه / الزمالة]',
    institution: '[الجهة]',
  },
  {
    id: 'm-4',
    year: '[السنة — الحاضر]',
    degree: '[الوظيفة الحالية]',
    institution: '[المستشفى / العيادة]',
    isCurrent: true,
  },
];

/**
 * أقسام ومرافق العيادة
 */
export const CLINIC_FACILITIES: ClinicFacility[] = [
  {
    id: 'c-main',
    title: '[صورة الواجهة / الاستقبال]',
    isFeatured: true,
  },
  {
    id: 'c-checkup',
    title: '[غرفة الكشف]',
  },
  {
    id: 'c-devices',
    title: '[الأجهزة]',
  },
  {
    id: 'c-endoscopy',
    title: '[المناظير]',
  },
  {
    id: 'c-waiting',
    title: '[صالة الانتظار]',
  },
];

/**
 * آراء المرضى وتقييماتهم
 */
export const PATIENT_REVIEWS: PatientReview[] = [
  {
    id: 'r-1',
    accent: 'yellow',
    rating: 5,
    text: '[اكتب هنا رأي المريض كما كتبه]',
    patientName: '[اسم المريض]',
  },
  {
    id: 'r-2',
    accent: 'blue',
    rating: 5,
    text: '[اكتب هنا رأي المريض كما كتبه]',
    patientName: '[اسم المريض]',
  },
  {
    id: 'r-3',
    accent: 'navy',
    rating: 5,
    text: '[اكتب هنا رأي المريض كما كتبه]',
    patientName: '[اسم المريض]',
  },
];

