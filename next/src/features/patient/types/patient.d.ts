import { quickPatientSchema } from "../schema/patient.schema";


export interface PatientPayload {
    fullName: string
    phone: string
    gender: "MALE" | "FEMALE";
    age: number;
    chronicConditions: string[]
    address: string
}

type QuickPatientFormValues = z.infer<typeof quickPatientSchema>;
