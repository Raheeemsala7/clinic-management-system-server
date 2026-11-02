

export interface PatientPayload {
    fullName: string
    phone: string
    gender: "MALE" | "FEMALE";
    age: number;
    chronicConditions: string[]
    address: string
}