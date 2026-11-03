'use server';

import { getNextAuthToken } from "@/shared/lib/utils/auth.util";
import { AppointmentPayload, CreateAppointmentPayload } from "../types/booking";
import { RESPONSES } from "@/shared/constant/api.responses";
import { HEADERS } from "@/shared/constant/api.constant";




export async function createQuickPatientAction(payload: CreateAppointmentPayload): Promise<ApiResponse<AppointmentPayload>> {
    const token = await getNextAuthToken()

    if (!token?.accessToken) {
        return RESPONSES.unauthorized
    }

    const res = await fetch(`${process.env.API_URL}/appointments`, {
        method: "POST",
        headers: {
            ...HEADERS.JsonBody,
            ...HEADERS.authorize(token.accessToken)
        },
        body: JSON.stringify(payload)
    })
    console.log(res);
    

    const data: ApiResponse<AppointmentPayload> = await res.json()

    console.log(data);
    

    if (!data.status) {
        return {
            status: false,
            code: 404,
            message: data.message,
        }
    }

     if (data.code === 401 || data.message === "Invalid or expired access token") {
      return {
        status: false,
        code: data.code,
        message: data.message || 'فشلت عملية البحث',
      };
    }    

    return data

}
