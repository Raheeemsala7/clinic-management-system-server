"use server"

import { getNextAuthToken } from "@/shared/lib/utils/auth.util";
import { PatientPayload } from "../types/patient";
import { RESPONSES } from "@/shared/constant/api.responses";
import { HEADERS } from "@/shared/constant/api.constant";

export async function createNewPatientAction({ fullName, address, age, chronicConditions, gender, phone }: PatientPayload): Promise<ApiResponse<PatientPayload>> {
    const token = await getNextAuthToken()

    if (!token?.accessToken) {
        return RESPONSES.unauthorized
    }
    const res = await fetch(`${process.env.API_URL}/patients`, {
        method: "POST",
        headers: {
            ...HEADERS.JsonBody,
            ...HEADERS.authorize(token.accessToken)
        },
        body: JSON.stringify({ fullName, address, age, chronicConditions, gender, phone })
    })

    const data: ApiResponse<PatientPayload> = await res.json()

    if (!data.status) {
        return {
            status: false,
            code: data.code || res.status,
            message: data.message || "فشل تسجيل المريض",
        }
    }

    return data
}
