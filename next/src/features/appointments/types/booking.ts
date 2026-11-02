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
  | 'examination'
  | 'revisit'
  | 'surgery_followup'
  | 'lab_radiology'
  | 'tests_review';

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
