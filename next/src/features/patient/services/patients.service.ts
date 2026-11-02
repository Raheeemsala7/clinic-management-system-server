import { PatientBasic } from "@/features/appointments";
import { signOut } from "next-auth/react";

export async function searchPatients(
    query: string,
    signal?: AbortSignal,
): Promise<PatientBasic[]> {
    const params = new URLSearchParams({ q: query });

    const response = await fetch(
        `/api/patients/search?${params.toString()}`,
        {
            method: "GET",
            signal,
        },
    );

    // 1. فحص انتهاء الجلسة أو التوكين عبر كود HTTP 401
    if (response.status === 401) {
        if (typeof window !== "undefined") {
            await signOut({ callbackUrl: "/auth/login?expired=true" });
        }
        throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    }

    if (!response.ok) {
        throw new Error("Failed to search patients");
    }

    const data: ApiResponse<PatientBasic[]> = await response.json();

    // 2. فحص كود 401 أو رسالة انتهاء التوكين داخل الاستجابة
    if (
        data.code === 401 ||
        data.message === "Invalid or expired access token" ||
        data.message === "No token provided." ||
        data.message === "Unauthorized"
    ) {
        if (typeof window !== "undefined") {
            await signOut({ callbackUrl: "/auth/login?expired=true" });
        }
        throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");
    }

    if (!data.status) {
        throw new Error(data.message || "Failed to search patients");
    }

    if (!Array.isArray(data.payload)) {
        throw new Error("Invalid patients response");
    }

    return data.payload as PatientBasic[];
}
