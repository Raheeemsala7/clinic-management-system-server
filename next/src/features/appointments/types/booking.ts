import { z } from 'zod';
import { bookingSchema } from '../schemas/booking.schema';

export type BookingFormType = z.infer<ReturnType<typeof bookingSchema>>;

export interface PatientBasic {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: 'male' | 'female';
  lastVisit?: string;
  totalVisits?: number;
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

