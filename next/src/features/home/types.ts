/**
 * أنواع البيانات الخاصة بالصفحة الرئيسية لعيادة د. إسلام عبدالله كريمة
 */

export type ServiceTheme = 'white' | 'navy';
export type BadgeColor = 'blue' | 'yellow' | 'navy';
export type LinkColor = 'blue' | 'yellow';

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  theme: ServiceTheme;
  badgeColor: BadgeColor;
  linkColor: LinkColor;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  degree: string;
  institution: string;
  isCurrent?: boolean;
}

export interface ClinicFacility {
  id: string;
  title: string;
  isFeatured?: boolean;
}

export interface PatientReview {
  id: string;
  accent: 'yellow' | 'blue' | 'navy';
  rating: number;
  text: string;
  patientName: string;
}

export interface HeroStat {
  title: string;
  subtitle: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
}

