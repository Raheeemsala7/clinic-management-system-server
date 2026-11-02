import { z } from "zod";
import { quickPatientSchema } from "../schema/patient.schema";

export interface PatientPayload {
    fullName: string;
    phone: string;
    gender: "MALE" | "FEMALE";
    age: number;
    chronicConditions: string[];
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  chronicConditions?: string[];
}

export type QuickPatientFormValues = z.infer<ReturnType<typeof quickPatientSchema>>;
